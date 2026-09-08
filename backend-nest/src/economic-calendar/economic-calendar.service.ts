import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThanOrEqual } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EconomicEvent, EconomicEventStatus, EconomicEventImpact, EconomicEventCategory } from './entities/economic-event.entity';
import { EconomicEventAction } from './entities/economic-event-history.entity';
import { EconomicCalendarAuditService } from './economic-calendar-audit.service';
import { CreateEconomicEventDto } from './dto/create-economic-event.dto';
import { UpdateEconomicEventDto } from './dto/update-economic-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { TradeEntity } from '../mt5/trade.entity';
import { AccountEntity } from '../account/account.entity';

@Injectable()
export class EconomicCalendarService {
    private readonly logger = new Logger(EconomicCalendarService.name);

    constructor(
        @InjectRepository(EconomicEvent)
        private readonly eventRepo: Repository<EconomicEvent>,
        @InjectRepository(TradeEntity)
        private readonly tradeRepo: Repository<TradeEntity>,
        @InjectRepository(AccountEntity)
        private readonly accountRepo: Repository<AccountEntity>,
        private readonly auditService: EconomicCalendarAuditService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: any
    ) {}

    // ==========================================
    // PUBLIC & USER QUERIES
    // ==========================================

    async getEvents(query: QueryEventsDto, userId?: string, accountId?: string) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 50));
        const skip = (page - 1) * limit;

        const qb = this.eventRepo.createQueryBuilder('event');

        // Date Range
        if (query.from && query.to) {
            const fromDate = new Date(query.from);
            const toDate = new Date(query.to);
            if (query.to.length <= 10) {
                toDate.setHours(23, 59, 59, 999);
            }
            qb.andWhere('event.eventDate BETWEEN :from AND :to', {
                from: fromDate.toISOString(),
                to: toDate.toISOString()
            });
        } else if (query.from) {
            qb.andWhere('event.eventDate >= :from', { from: new Date(query.from).toISOString() });
        } else if (query.to) {
            const toDate = new Date(query.to);
            if (query.to.length <= 10) toDate.setHours(23, 59, 59, 999);
            qb.andWhere('event.eventDate <= :to', { to: toDate.toISOString() });
        } else {
            // Default window: 7 days ago to 14 days ahead
            const pastWeek = new Date();
            pastWeek.setDate(pastWeek.getDate() - 7);
            pastWeek.setHours(0, 0, 0, 0);

            const futureTwoWeeks = new Date();
            futureTwoWeeks.setDate(futureTwoWeeks.getDate() + 14);
            futureTwoWeeks.setHours(23, 59, 59, 999);

            qb.andWhere('event.eventDate BETWEEN :from AND :to', {
                from: pastWeek.toISOString(),
                to: futureTwoWeeks.toISOString()
            });
        }

        // Filters
        if (query.currency) {
            qb.andWhere('event.currency = :currency', { currency: query.currency.trim().toUpperCase() });
        }
        if (query.country) {
            qb.andWhere('LOWER(event.country) LIKE LOWER(:country)', { country: `%${query.country.trim()}%` });
        }
        if (query.impact) {
            qb.andWhere('event.impact = :impact', { impact: query.impact });
        }
        if (query.category) {
            qb.andWhere('event.category = :category', { category: query.category });
        }
        if (query.status) {
            qb.andWhere('event.status = :status', { status: query.status });
        }
        if (query.search) {
            const term = `%${query.search.trim().toLowerCase()}%`;
            qb.andWhere('(LOWER(event.title) LIKE :term OR LOWER(event.currency) LIKE :term OR LOWER(event.country) LIKE :term)', { term });
        }

        // Ordering: Closest date first, then highest impact
        qb.orderBy('event.eventDate', 'ASC');
        qb.addOrderBy(`CASE 
            WHEN event.impact = 'HIGH' THEN 1 
            WHEN event.impact = 'MEDIUM' THEN 2 
            ELSE 3 
        END`, 'ASC');

        qb.skip(skip).take(limit);

        const [events, total] = await qb.getManyAndCount();
        const totalPages = Math.ceil(total / limit);

        // Dynamic Trade Correlation & Account PnL overlay
        const correlation = await this.resolveTradeCorrelation(userId, accountId || query.accountId);

        const enrichedData = events.map(evt => {
            const curr = (evt.currency || '').toUpperCase();
            const isRelevant = correlation.relevantCurrencies.includes(curr);
            return {
                id: evt.id,
                title: evt.title,
                country: evt.country,
                currency: curr,
                category: evt.category,
                impact: evt.impact,
                eventDate: evt.eventDate,
                time: evt.eventDate ? evt.eventDate.toISOString().replace('T', ' ').substring(0, 19) : null,
                previous: evt.previous,
                forecast: evt.forecast,
                actual: evt.actual,
                unit: evt.unit,
                status: evt.status,
                description: evt.description,
                source: evt.source,
                isAccountRelevant: isRelevant,
                relevanceReason: isRelevant ? `Moeda ${curr} operada nesta conta` : null
            };
        });

        return {
            data: enrichedData,
            pagination: {
                page,
                limit,
                total,
                totalPages
            },
            accountInfo: correlation.accountInfo,
            dailyAccountTrades: correlation.dailyAccountTrades
        };
    }

    async getTodayEvents(userId?: string, accountId?: string) {
        const cacheKey = `calendar:today:${userId || 'anon'}:${accountId || 'all'}`;
        try {
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) return cached;
        } catch (_) {}

        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);

        const query: QueryEventsDto = {
            from: startOfDay.toISOString(),
            to: endOfDay.toISOString(),
            limit: 100
        };

        const result = await this.getEvents(query, userId, accountId);

        try {
            await this.cacheManager.set(cacheKey, result, 120000); // 2 min cache
        } catch (_) {}

        return result;
    }

    async getUpcomingEvents(limit = 10) {
        const now = new Date();
        const events = await this.eventRepo.find({
            where: {
                eventDate: MoreThanOrEqual(now),
                status: EconomicEventStatus.SCHEDULED
            },
            order: {
                eventDate: 'ASC'
            },
            take: Math.min(50, limit)
        });

        return {
            data: events,
            total: events.length
        };
    }

    async getEventById(id: string, includeHistory = false) {
        const event = await this.eventRepo.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Evento econômico com ID ${id} não encontrado`);
        }

        let history = [];
        if (includeHistory) {
            history = await this.auditService.getEventHistory(id);
        }

        return {
            ...event,
            history
        };
    }

    // ==========================================
    // ADMIN CRUD & STATE TRANSITIONS
    // ==========================================

    async createEvent(dto: CreateEconomicEventDto, adminEmail?: string) {
        const currency = dto.currency ? dto.currency.trim().toUpperCase() : 'USD';
        const eventDate = new Date(dto.eventDate);

        if (isNaN(eventDate.getTime())) {
            throw new BadRequestException('Data do evento inválida');
        }

        // Duplicate check advisory
        const possibleDuplicate = await this.eventRepo.findOne({
            where: {
                title: dto.title.trim(),
                currency,
                eventDate
            }
        });

        if (possibleDuplicate) {
            this.logger.warn(`Potential duplicate event: "${dto.title}" (${currency}) at ${eventDate.toISOString()}`);
        }

        const newEvent = this.eventRepo.create({
            title: dto.title.trim(),
            currency,
            country: dto.country ? dto.country.trim() : null,
            eventDate,
            impact: dto.impact || EconomicEventImpact.MEDIUM,
            category: dto.category || EconomicEventCategory.OTHER,
            status: dto.status || EconomicEventStatus.SCHEDULED,
            actual: dto.actual ? dto.actual.trim() : null,
            forecast: dto.forecast ? dto.forecast.trim() : null,
            previous: dto.previous ? dto.previous.trim() : null,
            unit: dto.unit ? dto.unit.trim() : null,
            description: dto.description ? dto.description.trim() : null,
            source: 'MANUAL'
        });

        const saved = await this.eventRepo.save(newEvent);

        await this.auditService.recordAction(
            saved.id,
            EconomicEventAction.CREATED,
            adminEmail || 'ADMIN',
            null,
            saved
        );

        await this.invalidateCalendarCaches();
        return saved;
    }

    async updateEvent(id: string, dto: UpdateEconomicEventDto, adminEmail?: string) {
        const event = await this.eventRepo.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Evento econômico com ID ${id} não encontrado`);
        }

        const oldData = { ...event };

        if (dto.title !== undefined) event.title = dto.title.trim();
        if (dto.currency !== undefined) event.currency = dto.currency.trim().toUpperCase();
        if (dto.country !== undefined) event.country = dto.country ? dto.country.trim() : null;
        if (dto.eventDate !== undefined) {
            const parsed = new Date(dto.eventDate);
            if (isNaN(parsed.getTime())) throw new BadRequestException('Data do evento inválida');
            event.eventDate = parsed;
        }
        if (dto.impact !== undefined) event.impact = dto.impact;
        if (dto.category !== undefined) event.category = dto.category;
        if (dto.status !== undefined) event.status = dto.status;
        if (dto.actual !== undefined) event.actual = dto.actual ? dto.actual.trim() : null;
        if (dto.forecast !== undefined) event.forecast = dto.forecast ? dto.forecast.trim() : null;
        if (dto.previous !== undefined) event.previous = dto.previous ? dto.previous.trim() : null;
        if (dto.unit !== undefined) event.unit = dto.unit ? dto.unit.trim() : null;
        if (dto.description !== undefined) event.description = dto.description ? dto.description.trim() : null;

        const updated = await this.eventRepo.save(event);

        await this.auditService.recordAction(
            id,
            EconomicEventAction.UPDATED,
            adminEmail || 'ADMIN',
            oldData,
            updated
        );

        await this.invalidateCalendarCaches();
        return updated;
    }

    async completeEvent(id: string, actual: string, adminEmail?: string) {
        const event = await this.eventRepo.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Evento econômico com ID ${id} não encontrado`);
        }

        if (event.status === EconomicEventStatus.CANCELLED) {
            throw new BadRequestException('Não é possível completar um evento que foi cancelado');
        }

        const oldData = { ...event };
        event.actual = actual ? actual.trim() : event.actual;
        event.status = EconomicEventStatus.COMPLETED;

        const saved = await this.eventRepo.save(event);

        await this.auditService.recordAction(
            id,
            EconomicEventAction.COMPLETED,
            adminEmail || 'ADMIN',
            oldData,
            saved
        );

        await this.invalidateCalendarCaches();
        return saved;
    }

    async cancelEvent(id: string, adminEmail?: string) {
        const event = await this.eventRepo.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Evento econômico com ID ${id} não encontrado`);
        }

        const oldData = { ...event };
        event.status = EconomicEventStatus.CANCELLED;
        const saved = await this.eventRepo.save(event);

        await this.auditService.recordAction(
            id,
            EconomicEventAction.CANCELLED,
            adminEmail || 'ADMIN',
            oldData,
            saved
        );

        await this.invalidateCalendarCaches();
        return saved;
    }

    async postponeEvent(id: string, newEventDate: string, adminEmail?: string) {
        const event = await this.eventRepo.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Evento econômico com ID ${id} não encontrado`);
        }

        const parsedDate = new Date(newEventDate);
        if (isNaN(parsedDate.getTime())) {
            throw new BadRequestException('Nova data/hora do evento é inválida');
        }

        const oldData = { ...event };
        event.eventDate = parsedDate;
        event.status = EconomicEventStatus.POSTPONED;

        const saved = await this.eventRepo.save(event);

        await this.auditService.recordAction(
            id,
            EconomicEventAction.POSTPONED,
            adminEmail || 'ADMIN',
            oldData,
            saved
        );

        await this.invalidateCalendarCaches();
        return saved;
    }

    async duplicateEvent(id: string, adminEmail?: string) {
        const source = await this.eventRepo.findOne({ where: { id } });
        if (!source) {
            throw new NotFoundException(`Evento econômico com ID ${id} não encontrado`);
        }

        const clone = this.eventRepo.create({
            title: source.title,
            currency: source.currency,
            country: source.country,
            eventDate: source.eventDate,
            category: source.category,
            impact: source.impact,
            status: EconomicEventStatus.SCHEDULED,
            forecast: source.forecast,
            previous: source.actual || source.previous, // Previous becomes last actual
            actual: null,
            unit: source.unit,
            description: source.description,
            source: 'MANUAL'
        });

        const saved = await this.eventRepo.save(clone);

        await this.auditService.recordAction(
            saved.id,
            EconomicEventAction.CREATED,
            adminEmail || 'ADMIN',
            null,
            { duplicatedFrom: id, ...saved }
        );

        await this.invalidateCalendarCaches();
        return saved;
    }

    async deleteEvent(id: string, adminEmail?: string) {
        const event = await this.eventRepo.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Evento econômico com ID ${id} não encontrado`);
        }

        await this.auditService.recordAction(
            id,
            EconomicEventAction.DELETED,
            adminEmail || 'ADMIN',
            event,
            null
        );

        await this.eventRepo.delete(id);
        await this.invalidateCalendarCaches();
        return { success: true, message: 'Evento excluído com sucesso' };
    }

    // ==========================================
    // TRADE CORRELATION HELPER
    // ==========================================

    private async resolveTradeCorrelation(userId?: string, accountId?: string) {
        let accountInfo: any = null;
        const dailyAccountTrades: Record<string, { count: number, pnl: number }> = {};
        const relevantCurrenciesSet = new Set<string>(['USD']); // Default base

        if (!userId) {
            return {
                relevantCurrencies: Array.from(relevantCurrenciesSet),
                accountInfo: null,
                dailyAccountTrades: {}
            };
        }

        try {
            let targetAccounts: AccountEntity[] = [];
            if (accountId && accountId !== 'all') {
                const acc = await this.accountRepo.findOne({ where: { id: accountId, userId, isArchived: false } });
                if (acc) targetAccounts = [acc];
            }
            if (targetAccounts.length === 0) {
                targetAccounts = await this.accountRepo.find({ where: { userId, isArchived: false } });
            }

            if (targetAccounts.length > 0) {
                const isSingleAccount = targetAccounts.length === 1 && accountId !== 'all';
                const mainAcc = targetAccounts[0];

                targetAccounts.forEach(a => {
                    if (a.currency) relevantCurrenciesSet.add(a.currency.toUpperCase());
                });

                const accountIds = targetAccounts.map(a => a.id);
                const trades = await this.tradeRepo.find({
                    where: {
                        accountId: In(accountIds),
                        status: 'CLOSED'
                    },
                    select: ['id', 'accountId', 'symbol', 'profit', 'commission', 'swap', 'closeTime']
                });

                const symbolsSet = new Set<string>();
                const knownCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'XAU', 'BTC', 'ETH'];

                for (const t of trades) {
                    if (t.symbol) {
                        const sym = t.symbol.toUpperCase();
                        symbolsSet.add(sym);
                        for (const c of knownCurrencies) {
                            if (sym.includes(c)) {
                                relevantCurrenciesSet.add(c === 'XAU' ? 'USD' : c);
                            }
                        }
                    }

                    if (t.closeTime) {
                        const dateKey = new Date(t.closeTime).toISOString().split('T')[0];
                        if (!dailyAccountTrades[dateKey]) {
                            dailyAccountTrades[dateKey] = { count: 0, pnl: 0 };
                        }
                        const netPnl = Number(t.profit || 0) + Number(t.commission || 0) + Number(t.swap || 0);
                        dailyAccountTrades[dateKey].count += 1;
                        dailyAccountTrades[dateKey].pnl = Number((dailyAccountTrades[dateKey].pnl + netPnl).toFixed(2));
                    }
                }

                accountInfo = {
                    id: isSingleAccount ? mainAcc.id : 'all',
                    name: isSingleAccount ? mainAcc.name : 'Todas as Contas (Consolidado)',
                    broker: isSingleAccount ? mainAcc.broker : 'Multi-Corretora',
                    type: isSingleAccount ? mainAcc.type : 'CONSOLIDATED',
                    currency: isSingleAccount ? mainAcc.currency : 'USD',
                    relevantCurrencies: Array.from(relevantCurrenciesSet),
                    tradedSymbols: Array.from(symbolsSet).slice(0, 10)
                };
            }
        } catch (err) {
            this.logger.warn(`Failed to resolve trade correlation: ${err.message}`);
        }

        return {
            relevantCurrencies: Array.from(relevantCurrenciesSet),
            accountInfo,
            dailyAccountTrades
        };
    }

    // ==========================================
    // BACKWARD COMPATIBILITY (LEGACY ALIAS)
    // ==========================================

    async getEconomicCalendarLegacy(userId?: string, accountId?: string) {
        const query: QueryEventsDto = { limit: 100 };
        const result = await this.getEvents(query, userId, accountId);
        return {
            events: result.data,
            accountInfo: result.accountInfo,
            dailyAccountTrades: result.dailyAccountTrades
        };
    }

    // ==========================================
    // CACHE INVALIDATION
    // ==========================================

    private async invalidateCalendarCaches() {
        try {
            const store = (this.cacheManager as any)?.store;
            if (store && typeof store.keys === 'function') {
                const keys = await store.keys('calendar:*');
                for (const key of keys) {
                    await this.cacheManager.del(key);
                }
            } else if (store?.getClient && typeof store.getClient === 'function') {
                const redis = store.getClient();
                if (typeof redis.keys === 'function') {
                    const keys = await redis.keys('*calendar:*');
                    for (const key of keys) {
                        await this.cacheManager.del(key);
                    }
                }
            }
        } catch (err) {
            this.logger.warn(`Cache invalidation warning: ${err.message}`);
        }
    }
}
