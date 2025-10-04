import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('crypto_wallets')
export class CryptoWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  walletAddress: string;

  @Column({ type: 'text' })
  encryptedPrivateKey: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  btcBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  ethBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  usdtBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
