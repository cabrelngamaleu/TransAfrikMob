import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoWallet } from '../entities/crypto-wallet.entity';
import { CryptoTransaction } from '../entities/crypto-transaction.entity';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);

  constructor(
    @InjectRepository(CryptoWallet)
    private walletRepo: Repository<CryptoWallet>,
    @InjectRepository(CryptoTransaction)
    private transactionRepo: Repository<CryptoTransaction>,
  ) {}

  /**
   * Créer un wallet crypto
   */
  async createWallet(userId: string): Promise<CryptoWallet> {
    // Génération simplifiée pour MVP
    const walletAddress = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const privateKey = `ENCRYPTED_${Math.random().toString(36).substring(2)}`;

    const wallet = this.walletRepo.create({
      userId,
      walletAddress,
      encryptedPrivateKey: privateKey,
    });

    await this.walletRepo.save(wallet);
    this.logger.log(`Crypto wallet created for user ${userId}`);
    return wallet;
  }

  /**
   * Acheter de la crypto
   */
  async buyCrypto(
    userId: string,
    crypto: 'BTC' | 'ETH' | 'USDT',
    fiatAmount: number
  ): Promise<CryptoTransaction> {
    // Prix simulés (dans un vrai environnement, utiliser une API comme CoinGecko)
    const prices = { BTC: 30000000, ETH: 2000000, USDT: 655 }; // en XOF
    const cryptoAmount = fiatAmount / prices[crypto];

    const transaction = this.transactionRepo.create({
      userId,
      type: 'BUY',
      cryptoCurrency: crypto,
      amount: cryptoAmount,
      fiatAmount,
      fiatCurrency: 'XOF',
      status: 'COMPLETED',
    });

    await this.transactionRepo.save(transaction);

    // Mettre à jour le solde
    const wallet = await this.walletRepo.findOne({ where: { userId } });
    if (wallet) {
      if (crypto === 'BTC') wallet.btcBalance = Number(wallet.btcBalance) + cryptoAmount;
      if (crypto === 'ETH') wallet.ethBalance = Number(wallet.ethBalance) + cryptoAmount;
      if (crypto === 'USDT') wallet.usdtBalance = Number(wallet.usdtBalance) + cryptoAmount;
      await this.walletRepo.save(wallet);
    }

    return transaction;
  }

  /**
   * Récupérer le wallet
   */
  async getWallet(userId: string): Promise<CryptoWallet> {
    let wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) {
      wallet = await this.createWallet(userId);
    }
    return wallet;
  }

  /**
   * Historique des transactions crypto
   */
  async getTransactions(userId: string): Promise<CryptoTransaction[]> {
    return await this.transactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
