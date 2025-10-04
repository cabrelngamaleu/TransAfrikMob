import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('predictions')
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  type: string; // RECURRING_TRANSFER, RATE_ALERT, PATTERN_DETECTED

  @Column({ type: 'jsonb' })
  data: any; // Données de la prédiction

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  confidence: number; // 0-100

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, DISMISSED, EXECUTED

  @Column({ type: 'timestamp' })
  predictedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
