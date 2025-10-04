import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  referrerId: string; // Celui qui parraine

  @Column()
  referredUserId: string; // Celui qui est parrainé

  @Column({ unique: true })
  referralCode: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, COMPLETED, REWARDED

  @Column({ type: 'int', default: 0 })
  rewardPoints: number;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  rewardedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
