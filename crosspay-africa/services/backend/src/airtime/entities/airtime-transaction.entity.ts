import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('airtime_transactions')
export class AirtimeTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  operatorId: string;

  @Column()
  operatorName: string;

  @Column()
  countryCode: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, SUCCESS, FAILED

  @Column({ nullable: true })
  externalTransactionId: string;

  @Column({ type: 'int', default: 0 })
  pointsEarned: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
