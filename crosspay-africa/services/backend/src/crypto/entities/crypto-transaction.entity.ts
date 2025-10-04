import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('crypto_transactions')
export class CryptoTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  type: string; // BUY, SELL, SEND, RECEIVE, SWAP

  @Column()
  cryptoCurrency: string; // BTC, ETH, USDT

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fiatAmount: number;

  @Column({ default: 'XOF' })
  fiatCurrency: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, COMPLETED, FAILED

  @Column({ nullable: true })
  txHash: string;

  @Column({ nullable: true })
  toAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
