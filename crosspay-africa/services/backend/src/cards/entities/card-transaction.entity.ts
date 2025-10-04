import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('card_transactions')
export class CardTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cardId: string;

  @Column()
  userId: string;

  @Column()
  stripeAuthorizationId: string;

  @Column()
  merchantName: string;

  @Column({ nullable: true })
  merchantCategory: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ default: 'APPROVED' })
  status: string; // APPROVED, DECLINED, PENDING

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cashback: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}
