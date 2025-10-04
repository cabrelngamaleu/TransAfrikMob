import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_points')
export class UserPoints {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'bigint', default: 0 })
  points: number;

  @Column({ default: 'BRONZE' })
  level: string; // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND

  @Column({ type: 'bigint', default: 0 })
  totalPointsEarned: number;

  @Column({ type: 'bigint', default: 0 })
  totalPointsRedeemed: number;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @Column({ type: 'int', default: 0 })
  longestStreak: number;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
