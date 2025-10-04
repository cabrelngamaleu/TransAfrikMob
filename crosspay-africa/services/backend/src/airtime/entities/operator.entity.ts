import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('operators')
export class Operator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  externalId: string; // ID Reloadly

  @Column()
  name: string;

  @Column()
  countryCode: string;

  @Column()
  countryName: string;

  @Column({ type: 'jsonb', nullable: true })
  denominations: any; // Fixed amounts ou min/max

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commission: number; // % de commission

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  logoUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
