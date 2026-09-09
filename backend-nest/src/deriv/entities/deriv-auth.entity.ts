import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/user.entity';

@Entity('deriv_auth')
export class DerivAuthEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column({ name: 'account_id' })
    accountId: string; // The Deriv account ID (e.g., CR12345)

    @Column({ type: 'text' })
    encryptedToken: string;

    @Column({ nullable: true })
    currency: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any; // Store extra info like scopes, account type, etc.

    @Column({ name: 'account_entity_id', nullable: true })
    accountEntityId: string; // Links directly to AccountEntity.id

    @Column({ type: 'timestamp', nullable: true, name: 'last_sync_at' })
    lastSyncAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
