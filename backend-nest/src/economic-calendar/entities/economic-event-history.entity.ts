import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum EconomicEventAction {
    CREATED = 'CREATED',
    UPDATED = 'UPDATED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    POSTPONED = 'POSTPONED',
    DELETED = 'DELETED',
}

@Entity('economic_event_history')
export class EconomicEventHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'uuid', name: 'event_id' })
    eventId: string;

    @Column({
        type: 'varchar',
        length: 30
    })
    action: EconomicEventAction;

    @Column({ type: 'varchar', length: 150, nullable: true, name: 'changed_by' })
    changedBy: string | null;

    @Column({ type: 'jsonb', nullable: true, name: 'old_data' })
    oldData: Record<string, any> | null;

    @Column({ type: 'jsonb', nullable: true, name: 'new_data' })
    newData: Record<string, any> | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
