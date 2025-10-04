import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillTransaction } from '../entities/bill-transaction.entity';
import { BillProvider } from '../entities/bill-provider.entity';
import { PayBillDto, BillType } from '../dto/pay-bill.dto';
import { PointsService } from '../../gamification/services/points.service';

@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);

  constructor(
    @InjectRepository(BillTransaction)
    private billTransactionRepo: Repository<BillTransaction>,
    @InjectRepository(BillProvider)
    private billProviderRepo: Repository<BillProvider>,
    private pointsService: PointsService,
  ) {}

  /**
   * Payer une facture
   */
  async payBill(userId: string, dto: PayBillDto): Promise<BillTransaction> {
    this.logger.log(`Processing bill payment for user ${userId}`);

    // 1. Vérifier le fournisseur
    const provider = await this.billProviderRepo.findOne({
      where: { id: dto.providerId, isActive: true },
    });

    if (!provider) {
      throw new NotFoundException('Fournisseur introuvable ou inactif');
    }

    // 2. Valider le montant
    if (provider.minAmount && dto.amount < Number(provider.minAmount)) {
      throw new BadRequestException(
        `Montant minimum : ${provider.minAmount} ${dto.currency}`
      );
    }

    if (provider.maxAmount && dto.amount > Number(provider.maxAmount)) {
      throw new BadRequestException(
        `Montant maximum : ${provider.maxAmount} ${dto.currency}`
      );
    }

    // 3. Créer la transaction
    const transaction = this.billTransactionRepo.create({
      userId,
      billType: dto.billType,
      providerId: provider.id,
      providerName: provider.name,
      accountNumber: dto.accountNumber,
      amount: dto.amount,
      currency: dto.currency,
      fee: this.calculateFee(dto.amount),
      status: 'PENDING',
    });

    await this.billTransactionRepo.save(transaction);

    // 4. Traiter le paiement (simulation pour MVP)
    try {
      // Dans un vrai environnement, on appellerait l'API du fournisseur
      // Pour le MVP, on simule un succès après 2 secondes
      await this.processBillPayment(transaction, provider);

      transaction.status = 'SUCCESS';
      transaction.completedAt = new Date();
      await this.billTransactionRepo.save(transaction);

      // 5. Attribuer des points (0.15%)
      try {
        await this.pointsService.addPoints(userId, 'PAY_BILL', {
          amount: dto.amount,
          billType: dto.billType,
        });
      } catch (error) {
        this.logger.error('Error awarding points:', error);
      }

      this.logger.log(`Bill payment successful: ${transaction.id}`);
      return transaction;
    } catch (error) {
      transaction.status = 'FAILED';
      transaction.failureReason = error.message;
      await this.billTransactionRepo.save(transaction);
      throw error;
    }
  }

  /**
   * Traiter le paiement avec le fournisseur
   */
  private async processBillPayment(
    transaction: BillTransaction,
    provider: BillProvider,
  ): Promise<void> {
    this.logger.log(`Processing payment with provider ${provider.code}`);

    // Simulation du temps de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Dans un vrai environnement, on appellerait l'API du fournisseur
    // Exemple avec une API fictive :
    /*
    const response = await axios.post(`${provider.apiUrl}/pay`, {
      accountNumber: transaction.accountNumber,
      amount: transaction.amount,
      currency: transaction.currency,
    });
    
    transaction.externalTransactionId = response.data.transactionId;
    */

    // Pour le MVP, on génère juste un ID fictif
    transaction.externalTransactionId = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Récupérer les fournisseurs par type
   */
  async getProviders(billType?: BillType, country?: string): Promise<BillProvider[]> {
    const query = this.billProviderRepo.createQueryBuilder('provider')
      .where('provider.isActive = :isActive', { isActive: true });

    if (billType) {
      query.andWhere('provider.billType = :billType', { billType });
    }

    if (country) {
      query.andWhere('provider.country = :country', { country });
    }

    return await query.orderBy('provider.name', 'ASC').getMany();
  }

  /**
   * Valider un numéro de compte
   */
  async validateAccount(providerId: string, accountNumber: string): Promise<{
    valid: boolean;
    customerName?: string;
    balance?: number;
  }> {
    this.logger.log(`Validating account ${accountNumber} for provider ${providerId}`);

    const provider = await this.billProviderRepo.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Fournisseur introuvable');
    }

    // Dans un vrai environnement, on appellerait l'API du fournisseur
    // Pour le MVP, validation basique
    if (accountNumber.length < 5) {
      return { valid: false };
    }

    // Simulation : tous les comptes sont valides
    return {
      valid: true,
      customerName: 'Client Example', // Serait retourné par l'API
      balance: Math.floor(Math.random() * 50000) + 10000, // Balance fictive
    };
  }

  /**
   * Historique des paiements
   */
  async getTransactionHistory(userId: string, limit: number = 20): Promise<BillTransaction[]> {
    return await this.billTransactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Statistiques de paiement
   */
  async getStats(userId: string): Promise<{
    totalPaid: number;
    transactionCount: number;
    byType: Record<string, number>;
    lastPayment: Date | null;
  }> {
    const transactions = await this.billTransactionRepo.find({
      where: { userId, status: 'SUCCESS' },
    });

    const totalPaid = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const transactionCount = transactions.length;

    const byType: Record<string, number> = {};
    transactions.forEach(tx => {
      byType[tx.billType] = (byType[tx.billType] || 0) + Number(tx.amount);
    });

    const lastPayment = transactions.length > 0
      ? transactions[transactions.length - 1].createdAt
      : null;

    return {
      totalPaid,
      transactionCount,
      byType,
      lastPayment,
    };
  }

  /**
   * Montants rapides par type de facture
   */
  getQuickAmounts(billType: BillType): number[] {
    const amounts: Record<BillType, number[]> = {
      ELECTRICITY: [5000, 10000, 20000, 50000, 100000],
      WATER: [2000, 5000, 10000, 20000, 50000],
      INTERNET: [10000, 15000, 20000, 30000, 50000],
      TV: [5000, 10000, 15000, 20000, 30000],
    };

    return amounts[billType] || [5000, 10000, 20000, 50000, 100000];
  }

  /**
   * Calculer les frais
   */
  private calculateFee(amount: number): number {
    // Frais de 1% avec minimum 100 XOF
    const fee = amount * 0.01;
    return Math.max(fee, 100);
  }

  /**
   * Récupérer les factures récurrentes suggérées par l'IA
   */
  async getRecurringBills(userId: string): Promise<any[]> {
    // Analyser l'historique pour détecter les factures récurrentes
    const transactions = await this.billTransactionRepo
      .createQueryBuilder('tx')
      .where('tx.userId = :userId', { userId })
      .andWhere('tx.status = :status', { status: 'SUCCESS' })
      .orderBy('tx.createdAt', 'DESC')
      .take(50)
      .getMany();

    // Grouper par providerId + accountNumber
    const groups: Record<string, BillTransaction[]> = {};
    transactions.forEach(tx => {
      const key = `${tx.providerId}-${tx.accountNumber}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(tx);
    });

    // Détecter les patterns récurrents (au moins 2 paiements)
    const recurring: any[] = [];
    for (const [key, txs] of Object.entries(groups)) {
      if (txs.length >= 2) {
        const avgAmount = txs.reduce((sum, tx) => sum + Number(tx.amount), 0) / txs.length;
        const lastPayment = txs[0].createdAt;
        const daysSinceLastPayment = Math.floor(
          (Date.now() - lastPayment.getTime()) / (1000 * 60 * 60 * 24)
        );

        recurring.push({
          providerId: txs[0].providerId,
          providerName: txs[0].providerName,
          billType: txs[0].billType,
          accountNumber: txs[0].accountNumber,
          avgAmount: Math.round(avgAmount),
          lastPayment,
          daysSinceLastPayment,
          frequency: txs.length,
          suggested: daysSinceLastPayment >= 25, // Suggérer si dernier paiement > 25 jours
        });
      }
    }

    return recurring.filter(r => r.suggested);
  }
}
