import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bill_transactions')
export class BillTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  billType: string; // ELECTRICITY, WATER, INTERNET, TV

  @Column()
  providerId: string;

  @Column()
  providerName: string;

  @Column()
  accountNumber: string; // Numéro de compte/contrat

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'XOF' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fee: number;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, PROCESSING, SUCCESS, FAILED

  @Column({ nullable: true })
  externalTransactionId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
