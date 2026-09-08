import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EconomicEventHistory, EconomicEventAction } from './entities/economic-event-history.entity';

@Injectable()
export class EconomicCalendarAuditService {
    private readonly logger = new Logger(EconomicCalendarAuditService.name);

    constructor(
        @InjectRepository(EconomicEventHistory)
        private readonly historyRepo: Repository<EconomicEventHistory>,
    ) {}

    async recordAction(
        eventId: string,
        action: EconomicEventAction,
        changedBy: string,
        oldData?: Record<string, any> | null,
        newData?: Record<string, any> | null
    ): Promise<EconomicEventHistory> {
        try {
            const entry = this.historyRepo.create({
                eventId,
                action,
                changedBy: changedBy || 'ADMIN',
                oldData: oldData || null,
                newData: newData || null,
            });
            const saved = await this.historyRepo.save(entry);
            this.logger.log(`Audit recorded for event ${eventId}: ${action} by ${changedBy}`);
            return saved;
        } catch (err) {
            this.logger.error(`Failed to record audit for event ${eventId}: ${err.message}`);
            return null;
        }
    }

    async getEventHistory(eventId: string): Promise<EconomicEventHistory[]> {
        return this.historyRepo.find({
            where: { eventId },
            order: { createdAt: 'DESC' },
        });
    }
}
