import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number; // 5-10%

  @Column({ type: 'int' })
  durationDays: number; // 7, 14, 30 jours

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalRepayment: number; // Montant + intérêts

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, APPROVED, DISBURSED, REPAYING, PAID, DEFAULTED

  @Column({ type: 'int', default: 0 })
  creditScore: number; // 0-100

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  scoringData: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
