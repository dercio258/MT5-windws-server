import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { ColumnNumericTransformer } from '../common/transformers/numeric.transformer';

@Entity('leaderboard_ranks')
export class LeaderboardRankEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ name: 'user_id', nullable: true })
    userId: string | null;

    @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity | null;

    @Index()
    @Column({ unique: true })
    username: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ default: 'USD', length: 10 })
    currency: string;

    @Index()
    @Column('int', { default: 1 })
    rank: number;

    @Column({ length: 30, default: 'BRONZE' })
    tier: string;

    @Column({ length: 50, default: 'BRONZE' })
    tierLevel: string;

    @Column('decimal', { precision: 5, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    winRate: number;

    @Column('int', { default: 0 })
    tradesCount: number;

    @Column('int', { default: 0 })
    streak: number;

    @Column('decimal', { precision: 8, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    profitFactor: number;

    @Column('decimal', { precision: 8, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    riskReward: number;

    @Column('decimal', { precision: 15, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    totalPnL: number;

    @Column('decimal', { precision: 6, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    compositeScore: number;

    @Column({ type: 'jsonb', nullable: true })
    scoreBreakdown: {
        wr: number;
        pf: number;
        rr: number;
        vol: number;
        cons: number;
        time?: number;
        pnl?: number;
    };

    @Column('text', { array: true, default: '{}' })
    badges: string[];

    @Column({ default: false })
    isBenchmark: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
