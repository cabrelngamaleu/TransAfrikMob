import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bill_providers')
export class BillProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  billType: string; // ELECTRICITY, WATER, INTERNET, TV

  @Column()
  code: string; // Code unique du fournisseur

  @Column()
  name: string;

  @Column()
  country: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxAmount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
