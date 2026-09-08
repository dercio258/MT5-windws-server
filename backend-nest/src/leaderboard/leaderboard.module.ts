import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LeaderboardRankEntity } from './leaderboard-rank.entity';
import { AccountEntity } from '../account/account.entity';
import { TradeEntity } from '../mt5/trade.entity';
import { UserEntity } from '../users/user.entity';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            LeaderboardRankEntity,
            AccountEntity,
            TradeEntity,
            UserEntity,
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
    controllers: [LeaderboardController],
    providers: [LeaderboardService, OptionalJwtAuthGuard],
    exports: [LeaderboardService],
})
export class LeaderboardModule {}
