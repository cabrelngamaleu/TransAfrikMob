import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  iconUrl: string;

  @Column()
  rarity: string; // COMMON, RARE, EPIC, LEGENDARY

  @Column({ type: 'int', default: 0 })
  pointValue: number;

  @Column({ type: 'jsonb', nullable: true })
  requirements: any; // Conditions pour obtenir le badge

  @CreateDateColumn()
  createdAt: Date;
}
