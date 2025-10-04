import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'int' })
  points: number;

  @Column()
  action: string; // SEND_MONEY, RECEIVE_MONEY, REFERRAL, KYC_COMPLETED, etc.

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'bigint' })
  balanceAfter: number;

  @CreateDateColumn()
  createdAt: Date;
}
