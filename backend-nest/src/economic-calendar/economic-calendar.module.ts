import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EconomicEvent } from './entities/economic-event.entity';
import { EconomicEventHistory } from './entities/economic-event-history.entity';
import { TradeEntity } from '../mt5/trade.entity';
import { AccountEntity } from '../account/account.entity';
import { EconomicCalendarService } from './economic-calendar.service';
import { EconomicCalendarAuditService } from './economic-calendar-audit.service';
import { EconomicCalendarController } from './economic-calendar.controller';
import { AdminEconomicCalendarController } from './admin-economic-calendar.controller';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EconomicEvent,
            EconomicEventHistory,
            TradeEntity,
            AccountEntity
        ]),
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'dev_secret',
                signOptions: { expiresIn: '12h' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        EconomicCalendarService,
        EconomicCalendarAuditService,
        AdminAuthGuard,
        OptionalJwtAuthGuard
    ],
    controllers: [
        EconomicCalendarController,
        AdminEconomicCalendarController
    ],
    exports: [
        EconomicCalendarService,
        EconomicCalendarAuditService
    ],
})
export class EconomicCalendarModule {}
