import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Badge } from './badge.entity';

@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  badgeId: string;

  @ManyToOne(() => Badge)
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;

  @Column({ type: 'timestamp' })
  earnedAt: Date;

  @Column({ default: false })
  displayed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
