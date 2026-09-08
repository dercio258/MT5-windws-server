import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AccountEntity } from './account.entity';
import { ColumnNumericTransformer } from '../common/transformers/numeric.transformer';

export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAWAL = 'withdrawal',
    ADJUSTMENT = 'adjustment',
    BONUS = 'bonus',
    FEE = 'fee'
}

@Entity('account_transactions')
export class AccountTransactionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ name: 'account_id' })
    accountId: string;

    @ManyToOne(() => AccountEntity, (account) => account.transactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'account_id' })
    account: AccountEntity;

    @Column({
        type: 'varchar',
        length: 20,
        default: TransactionType.DEPOSIT
    })
    type: TransactionType;

    @Column('decimal', { precision: 15, scale: 2, transformer: new ColumnNumericTransformer() })
    amount: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('decimal', { precision: 15, scale: 2, default: 0, name: 'balance_after', transformer: new ColumnNumericTransformer() })
    balanceAfter: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
