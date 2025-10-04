import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('virtual_cards')
export class VirtualCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  stripeCardId: string; // ID Stripe de la carte

  @Column()
  cardholderName: string;

  @Column()
  last4: string; // 4 derniers chiffres

  @Column()
  brand: string; // VISA, MASTERCARD

  @Column({ type: 'int' })
  expMonth: number;

  @Column({ type: 'int' })
  expYear: number;

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, FROZEN, CANCELLED

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  spendingLimit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentSpending: number;

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
