import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Prediction } from '../entities/prediction.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { RecurringTransferPrediction } from '../dto/prediction.dto';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(
    @InjectRepository(Prediction)
    private predictionRepo: Repository<Prediction>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  /**
   * Prédit les prochaines transactions récurrentes d'un utilisateur
   */
  async predictRecurringTransfers(userId: string): Promise<RecurringTransferPrediction[]> {
    this.logger.log(`Analyzing recurring patterns for user ${userId}`);

    // 1. Récupérer les transactions des 6 derniers mois
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await this.transactionRepo.find({
      where: {
        // userId, // À adapter selon votre modèle
        createdAt: MoreThan(sixMonthsAgo),
      },
      order: { createdAt: 'DESC' },
    });

    // 2. Grouper par destinataire
    const byRecipient = this.groupByRecipient(transactions);

    // 3. Analyser les patterns pour chaque destinataire
    const predictions: RecurringTransferPrediction[] = [];

    for (const [recipientId, txs] of Object.entries(byRecipient)) {
      if (txs.length < 2) continue; // Au moins 2 transactions nécessaires

      const pattern = this.analyzePattern(txs);

      if (pattern.isRecurring) {
        const prediction: RecurringTransferPrediction = {
          recipientId,
          recipientName: txs[0].recipientName || 'Destinataire',
          recipientPhone: txs[0].recipientPhone || '',
          estimatedAmount: pattern.averageAmount,
          currency: txs[0].currency || 'XOF',
          estimatedDate: pattern.nextDate,
          confidence: pattern.confidence,
          frequency: pattern.frequency,
          lastTransactions: txs.slice(0, 5).map(t => ({
            date: t.createdAt,
            amount: Number(t.amount),
          })),
          reason: this.generateReason(pattern, txs[0].recipientName),
        };

        predictions.push(prediction);

        // Sauvegarder la prédiction
        await this.savePrediction(userId, prediction);
      }
    }

    // Trier par confiance décroissante
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyse le pattern de transactions pour détecter la récurrence
   */
  private analyzePattern(transactions: any[]): {
    isRecurring: boolean;
    frequency: string;
    averageAmount: number;
    nextDate: Date;
    confidence: number;
  } {
    if (transactions.length < 2) {
      return {
        isRecurring: false,
        frequency: 'UNKNOWN',
        averageAmount: 0,
        nextDate: new Date(),
        confidence: 0,
      };
    }

    // Calculer les intervalles entre transactions
    const intervals: number[] = [];
    for (let i = 0; i < transactions.length - 1; i++) {
      const days = this.daysBetween(
        new Date(transactions[i + 1].createdAt),
        new Date(transactions[i].createdAt)
      );
      intervals.push(days);
    }

    // Calculer l'intervalle moyen et la variance
    const avgInterval = this.average(intervals);
    const variance = this.calculateVariance(intervals);
    const cvInterval = variance > 0 ? Math.sqrt(variance) / avgInterval : 0; // Coefficient de variation

    // Déterminer la fréquence
    let frequency = 'IRREGULAR';
    if (avgInterval >= 6 && avgInterval <= 8) {
      frequency = 'WEEKLY';
    } else if (avgInterval >= 13 && avgInterval <= 16) {
      frequency = 'BIWEEKLY';
    } else if (avgInterval >= 28 && avgInterval <= 32) {
      frequency = 'MONTHLY';
    }

    // Calculer le montant moyen
    const amounts = transactions.map(t => Number(t.amount));
    const averageAmount = Math.round(this.average(amounts));

    // Calculer la variance des montants
    const amountVariance = this.calculateVariance(amounts);
    const cvAmount = amountVariance > 0 ? Math.sqrt(amountVariance) / averageAmount : 0;

    // Calculer la confiance
    let confidence = 50; // Base

    // Bonus pour nombre de transactions
    confidence += Math.min(transactions.length * 5, 20);

    // Bonus pour régularité de l'intervalle
    if (cvInterval < 0.15) confidence += 15;
    else if (cvInterval < 0.25) confidence += 10;
    else if (cvInterval < 0.35) confidence += 5;

    // Bonus pour régularité du montant
    if (cvAmount < 0.1) confidence += 15;
    else if (cvAmount < 0.2) confidence += 10;
    else if (cvAmount < 0.3) confidence += 5;

    // Considérer comme récurrent si confiance > 60%
    const isRecurring = confidence >= 60 && frequency !== 'IRREGULAR';

    // Prédire la prochaine date
    const lastDate = new Date(transactions[0].createdAt);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + Math.round(avgInterval));

    return {
      isRecurring,
      frequency,
      averageAmount,
      nextDate,
      confidence: Math.min(confidence, 95),
    };
  }

  /**
   * Groupe les transactions par destinataire
   */
  private groupByRecipient(transactions: any[]): Record<string, any[]> {
    return transactions.reduce((acc, tx) => {
      const recipientId = tx.recipientId || tx.recipientPhone || 'unknown';
      if (!acc[recipientId]) {
        acc[recipientId] = [];
      }
      acc[recipientId].push(tx);
      return acc;
    }, {} as Record<string, any[]>);
  }

  /**
   * Génère une phrase explicative pour la prédiction
   */
  private generateReason(pattern: any, recipientName?: string): string {
    const name = recipientName || 'ce destinataire';
    const freq = pattern.frequency === 'WEEKLY' ? 'chaque semaine' :
                 pattern.frequency === 'BIWEEKLY' ? 'toutes les 2 semaines' :
                 pattern.frequency === 'MONTHLY' ? 'chaque mois' : 'régulièrement';

    return `Vous envoyez généralement ${pattern.averageAmount.toLocaleString()} XOF à ${name} ${freq}`;
  }

  /**
   * Sauvegarde une prédiction dans la base de données
   */
  private async savePrediction(userId: string, prediction: RecurringTransferPrediction): Promise<void> {
    // Vérifier si une prédiction similaire existe déjà
    const existing = await this.predictionRepo.findOne({
      where: {
        userId,
        type: 'RECURRING_TRANSFER',
        status: 'ACTIVE',
      },
    });

    if (existing && 
        existing.data.recipientId === prediction.recipientId &&
        this.daysBetween(existing.predictedDate, prediction.estimatedDate) < 3) {
      // Mettre à jour la prédiction existante
      existing.data = prediction;
      existing.confidence = prediction.confidence;
      existing.predictedDate = prediction.estimatedDate;
      await this.predictionRepo.save(existing);
    } else {
      // Créer une nouvelle prédiction
      const newPrediction = this.predictionRepo.create({
        userId,
        type: 'RECURRING_TRANSFER',
        data: prediction,
        confidence: prediction.confidence,
        predictedDate: prediction.estimatedDate,
        status: 'ACTIVE',
      });
      await this.predictionRepo.save(newPrediction);
    }
  }

  /**
   * Récupère les prédictions actives d'un utilisateur
   */
  async getActivePredictions(userId: string): Promise<Prediction[]> {
    return await this.predictionRepo.find({
      where: {
        userId,
        status: 'ACTIVE',
      },
      order: { confidence: 'DESC' },
    });
  }

  /**
   * Marque une prédiction comme exécutée
   */
  async markAsExecuted(predictionId: string): Promise<void> {
    await this.predictionRepo.update(predictionId, {
      status: 'EXECUTED',
      executedAt: new Date(),
    });
  }

  /**
   * Marque une prédiction comme rejetée
   */
  async dismissPrediction(predictionId: string): Promise<void> {
    await this.predictionRepo.update(predictionId, {
      status: 'DISMISSED',
    });
  }

  // Utilitaires mathématiques
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const avg = this.average(numbers);
    const squaredDiffs = numbers.map(n => Math.pow(n - avg, 2));
    return this.average(squaredDiffs);
  }

  private daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  }
}
