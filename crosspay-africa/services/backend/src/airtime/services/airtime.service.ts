import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AirtimeTransaction } from '../entities/airtime-transaction.entity';
import { Operator } from '../entities/operator.entity';
import { ReloadlyService } from './reloadly.service';
import { PointsService } from '../../gamification/services/points.service';
import { BuyAirtimeDto } from '../dto/buy-airtime.dto';

@Injectable()
export class AirtimeService {
  private readonly logger = new Logger(AirtimeService.name);

  constructor(
    @InjectRepository(AirtimeTransaction)
    private airtimeTransactionRepo: Repository<AirtimeTransaction>,
    @InjectRepository(Operator)
    private operatorRepo: Repository<Operator>,
    private reloadlyService: ReloadlyService,
    private pointsService: PointsService,
  ) {}

  /**
   * Achète du crédit téléphonique
   */
  async buyAirtime(userId: string, dto: BuyAirtimeDto): Promise<AirtimeTransaction> {
    this.logger.log(`User ${userId} buying ${dto.amount} ${dto.currency} airtime for ${dto.phoneNumber}`);

    try {
      // 1. Parser le numéro de téléphone
      const { countryCode, number } = this.reloadlyService.parsePhoneNumber(dto.phoneNumber);

      // 2. Détecter l'opérateur
      const operator = await this.reloadlyService.detectOperator(dto.phoneNumber, countryCode);

      if (!operator) {
        throw new BadRequestException('Impossible de détecter l\'opérateur pour ce numéro');
      }

      // 3. Créer la transaction (status PENDING)
      const transaction = this.airtimeTransactionRepo.create({
        userId,
        phoneNumber: dto.phoneNumber,
        amount: dto.amount,
        currency: dto.currency,
        operatorId: operator.operatorId.toString(),
        operatorName: operator.name,
        countryCode,
        status: 'PENDING',
        pointsEarned: 0,
      });

      await this.airtimeTransactionRepo.save(transaction);

      // 4. Effectuer l'achat via Reloadly
      try {
        const topupResult = await this.reloadlyService.topup({
          operatorId: operator.operatorId,
          amount: dto.amount,
          useLocalAmount: true,
          recipientPhone: {
            countryCode: countryCode,
            number: number,
          },
        });

        // 5. Mettre à jour la transaction avec le résultat
        transaction.status = 'SUCCESS';
        transaction.externalTransactionId = topupResult.transactionId.toString();
        transaction.metadata = {
          deliveredAmount: topupResult.deliveredAmount,
          deliveredCurrency: topupResult.deliveredAmountCurrencyCode,
          operatorTransactionId: topupResult.operatorTransactionId,
        };

        // 6. Attribuer des points (0.2% du montant)
        const pointsResult = await this.pointsService.addPoints(
          userId,
          'BUY_AIRTIME',
          { amount: dto.amount }
        );

        transaction.pointsEarned = pointsResult.points;

        await this.airtimeTransactionRepo.save(transaction);

        this.logger.log(
          `Airtime purchase successful. Transaction ${transaction.id}, Points earned: ${pointsResult.points}`
        );

        return transaction;
      } catch (error) {
        // En cas d'échec, marquer la transaction comme FAILED
        transaction.status = 'FAILED';
        transaction.errorMessage = error.message;
        await this.airtimeTransactionRepo.save(transaction);

        throw error;
      }
    } catch (error) {
      this.logger.error('Airtime purchase failed', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des achats d'airtime d'un utilisateur
   */
  async getUserTransactions(userId: string, limit = 50): Promise<AirtimeTransaction[]> {
    return await this.airtimeTransactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Récupère une transaction spécifique
   */
  async getTransaction(transactionId: string, userId: string): Promise<AirtimeTransaction> {
    const transaction = await this.airtimeTransactionRepo.findOne({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction non trouvée');
    }

    return transaction;
  }

  /**
   * Récupère les opérateurs disponibles pour un pays
   */
  async getOperatorsByCountry(countryCode: string): Promise<any[]> {
    try {
      const operators = await this.reloadlyService.getOperatorsByCountry(countryCode);
      
      return operators.map(op => ({
        id: op.operatorId,
        name: op.name,
        country: op.country.name,
        countryCode: op.country.isoName,
        logoUrl: op.logoUrls?.[0],
        denominationType: op.denominationType,
        fixedAmounts: op.fixedAmounts,
        minAmount: op.minAmount,
        maxAmount: op.maxAmount,
      }));
    } catch (error) {
      this.logger.error(`Failed to get operators for ${countryCode}`, error);
      return [];
    }
  }

  /**
   * Détecte l'opérateur pour un numéro de téléphone
   */
  async detectOperator(phoneNumber: string): Promise<any> {
    try {
      const { countryCode } = this.reloadlyService.parsePhoneNumber(phoneNumber);
      const operator = await this.reloadlyService.detectOperator(phoneNumber, countryCode);

      if (!operator) {
        throw new NotFoundException('Opérateur non trouvé pour ce numéro');
      }

      return {
        id: operator.operatorId,
        name: operator.name,
        country: operator.country.name,
        countryCode: operator.country.isoName,
        logoUrl: operator.logoUrls?.[0],
        denominationType: operator.denominationType,
        fixedAmounts: operator.fixedAmounts,
        minAmount: operator.minAmount,
        maxAmount: operator.maxAmount,
      };
    } catch (error) {
      this.logger.error(`Failed to detect operator for ${phoneNumber}`, error);
      throw new BadRequestException('Impossible de détecter l\'opérateur');
    }
  }

  /**
   * Récupère les statistiques des achats d'airtime
   */
  async getStats(userId: string): Promise<{
    totalTransactions: number;
    totalAmount: number;
    totalPointsEarned: number;
    successRate: number;
  }> {
    const transactions = await this.airtimeTransactionRepo.find({
      where: { userId },
    });

    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(t => t.status === 'SUCCESS');
    const totalAmount = successfulTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalPointsEarned = successfulTransactions.reduce((sum, t) => sum + t.pointsEarned, 0);
    const successRate = totalTransactions > 0 ? (successfulTransactions.length / totalTransactions) * 100 : 100;

    return {
      totalTransactions,
      totalAmount,
      totalPointsEarned,
      successRate,
    };
  }

  /**
   * Récupère les montants rapides populaires
   */
  getQuickAmounts(currency: string): number[] {
    const amounts = {
      XOF: [500, 1000, 2000, 5000, 10000],
      NGN: [100, 200, 500, 1000, 2000],
      GHS: [5, 10, 20, 50, 100],
      KES: [50, 100, 200, 500, 1000],
    };

    return amounts[currency] || amounts.XOF;
  }
}
