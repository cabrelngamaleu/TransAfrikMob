import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { UserInsight } from '../entities/user-insight.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { PatternInsight, AnomalyAlert } from '../dto/prediction.dto';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    @InjectRepository(UserInsight)
    private insightRepo: Repository<UserInsight>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  /**
   * Génère tous les insights pour un utilisateur
   */
  async generateInsights(userId: string): Promise<PatternInsight[]> {
    this.logger.log(`Generating insights for user ${userId}`);

    const insights: PatternInsight[] = [];

    // Récupérer les transactions des 3 derniers mois
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await this.transactionRepo.find({
      where: {
        createdAt: MoreThan(threeMonthsAgo),
      },
      order: { createdAt: 'DESC' },
    });

    if (transactions.length === 0) {
      return insights;
    }

    // Analyser différents patterns
    insights.push(...await this.analyzeSpendingPatterns(transactions));
    insights.push(...await this.analyzeSavingsOpportunities(transactions));
    insights.push(...await this.analyzeTimePatterns(transactions));
    insights.push(...await this.analyzeRecipientPatterns(transactions));

    // Sauvegarder les insights
    for (const insight of insights) {
      await this.saveInsight(userId, insight);
    }

    return insights;
  }

  /**
   * Analyse les patterns de dépenses
   */
  private async analyzeSpendingPatterns(transactions: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];

    // Calculer les dépenses par semaine
    const weeklySpending = this.groupByWeek(transactions);
    const avgWeeklySpending = this.average(Object.values(weeklySpending));

    // Semaines de forte dépense
    const highSpendingWeeks = Object.entries(weeklySpending)
      .filter(([_, amount]) => amount > avgWeeklySpending * 1.5)
      .length;

    if (highSpendingWeeks > 0) {
      insights.push({
        type: 'SPENDING_SPIKE',
        title: 'Pics de dépenses détectés',
        description: `Vous avez des pics de dépenses ${highSpendingWeeks} semaine(s) ce trimestre. Essayez de lisser vos dépenses pour mieux gérer votre budget.`,
        data: { avgWeekly: avgWeeklySpending, highWeeks: highSpendingWeeks },
        actionable: true,
      });
    }

    // Tendance de dépenses
    const trend = this.calculateTrend(Object.values(weeklySpending));
    if (trend > 15) {
      insights.push({
        type: 'SPENDING_INCREASE',
        title: 'Dépenses en hausse',
        description: `Vos dépenses ont augmenté de ${trend.toFixed(0)}% ce trimestre. Surveillez votre budget !`,
        data: { trendPercentage: trend },
        actionable: true,
      });
    } else if (trend < -15) {
      insights.push({
        type: 'SPENDING_DECREASE',
        title: '✅ Félicitations !',
        description: `Vous avez réduit vos dépenses de ${Math.abs(trend).toFixed(0)}% ce trimestre. Excellent travail !`,
        data: { trendPercentage: trend },
        actionable: false,
      });
    }

    return insights;
  }

  /**
   * Analyse les opportunités d'économies
   */
  private async analyzeSavingsOpportunities(transactions: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];

    // Round-up savings
    const totalTransactions = transactions.length;
    const avgRoundup = transactions.reduce((sum, tx) => {
      const amount = Number(tx.amount);
      const rounded = Math.ceil(amount / 1000) * 1000;
      return sum + (rounded - amount);
    }, 0);

    if (totalTransactions > 0) {
      const monthlyRoundup = (avgRoundup / totalTransactions) * 30; // Estimation mensuelle

      insights.push({
        type: 'ROUND_UP_SAVINGS',
        title: 'Économies potentielles',
        description: `En arrondissant chaque transaction au millier supérieur, vous pourriez économiser environ ${monthlyRoundup.toFixed(0)} XOF par mois.`,
        data: { potentialMonthly: monthlyRoundup },
        actionable: true,
        potentialSavings: monthlyRoundup,
      });
    }

    // Small frequent transactions
    const smallTransactions = transactions.filter(tx => Number(tx.amount) < 500);
    if (smallTransactions.length > 10) {
      const totalSmall = smallTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
      
      insights.push({
        type: 'SMALL_TRANSACTIONS',
        title: 'Optimisez vos micro-transactions',
        description: `Vous avez fait ${smallTransactions.length} petites transactions (< 500 XOF) pour un total de ${totalSmall.toFixed(0)} XOF. Regroupez-les pour économiser du temps !`,
        data: { count: smallTransactions.length, total: totalSmall },
        actionable: true,
      });
    }

    return insights;
  }

  /**
   * Analyse les patterns temporels
   */
  private async analyzeTimePatterns(transactions: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];

    // Analyser les jours de la semaine
    const byDayOfWeek: Record<number, number> = {};
    transactions.forEach(tx => {
      const day = new Date(tx.createdAt).getDay();
      byDayOfWeek[day] = (byDayOfWeek[day] || 0) + 1;
    });

    const mostActiveDay = Object.entries(byDayOfWeek)
      .sort(([, a], [, b]) => b - a)[0];

    if (mostActiveDay) {
      const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const dayName = dayNames[parseInt(mostActiveDay[0])];
      
      insights.push({
        type: 'ACTIVE_DAY',
        title: 'Votre jour le plus actif',
        description: `${dayName} est votre jour le plus actif avec ${mostActiveDay[1]} transactions.`,
        data: { day: dayName, count: mostActiveDay[1] },
        actionable: false,
      });
    }

    // Analyser les heures
    const byHour: Record<number, number> = {};
    transactions.forEach(tx => {
      const hour = new Date(tx.createdAt).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    });

    const peakHour = Object.entries(byHour)
      .sort(([, a], [, b]) => b - a)[0];

    if (peakHour && parseInt(peakHour[0]) >= 22) {
      insights.push({
        type: 'LATE_NIGHT_TRANSACTIONS',
        title: 'Transactions tardives',
        description: `Vous effectuez souvent des transactions après 22h. Planifiez-les en avance pour mieux gérer votre temps !`,
        data: { peakHour: peakHour[0] },
        actionable: true,
      });
    }

    return insights;
  }

  /**
   * Analyse les patterns de destinataires
   */
  private async analyzeRecipientPatterns(transactions: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];

    // Grouper par destinataire
    const byRecipient: Record<string, number> = {};
    transactions.forEach(tx => {
      const recipient = tx.recipientName || tx.recipientPhone || 'Inconnu';
      byRecipient[recipient] = (byRecipient[recipient] || 0) + Number(tx.amount);
    });

    // Top destinataire
    const topRecipient = Object.entries(byRecipient)
      .sort(([, a], [, b]) => b - a)[0];

    if (topRecipient && Object.keys(byRecipient).length > 1) {
      const totalSpent = Object.values(byRecipient).reduce((a, b) => a + b, 0);
      const percentage = (topRecipient[1] / totalSpent) * 100;

      insights.push({
        type: 'TOP_RECIPIENT',
        title: 'Destinataire principal',
        description: `${topRecipient[0]} représente ${percentage.toFixed(0)}% de vos transferts (${topRecipient[1].toFixed(0)} XOF).`,
        data: { recipient: topRecipient[0], amount: topRecipient[1], percentage },
        actionable: false,
      });
    }

    // Diversification
    const recipientCount = Object.keys(byRecipient).length;
    if (recipientCount === 1 && transactions.length > 5) {
      insights.push({
        type: 'SINGLE_RECIPIENT',
        title: 'Un seul destinataire',
        description: `Tous vos transferts vont vers ${Object.keys(byRecipient)[0]}. CrossPay vous permet d'envoyer à plusieurs destinataires facilement !`,
        data: { count: recipientCount },
        actionable: false,
      });
    }

    return insights;
  }

  /**
   * Détecte les anomalies dans les transactions
   */
  async detectAnomalies(userId: string, transaction: any): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];

    // Récupérer l'historique
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const historicalTransactions = await this.transactionRepo.find({
      where: {
        createdAt: MoreThan(threeMonthsAgo),
      },
    });

    if (historicalTransactions.length < 5) {
      return alerts; // Pas assez de données
    }

    // Calculer les statistiques historiques
    const amounts = historicalTransactions.map(tx => Number(tx.amount));
    const avgAmount = this.average(amounts);
    const stdDev = Math.sqrt(this.calculateVariance(amounts));

    // Montant inhabituel
    const txAmount = Number(transaction.amount);
    const zScore = (txAmount - avgAmount) / stdDev;

    if (Math.abs(zScore) > 2.5) {
      alerts.push({
        type: 'UNUSUAL_AMOUNT',
        severity: Math.abs(zScore) > 3 ? 'HIGH' : 'MEDIUM',
        message: `Ce montant (${txAmount} XOF) est ${zScore > 0 ? 'bien plus élevé' : 'bien plus faible'} que d'habitude.`,
        transactionId: transaction.id,
        timestamp: new Date(),
      });
    }

    // Nouveau destinataire
    const knownRecipients = new Set(
      historicalTransactions.map(tx => tx.recipientPhone || tx.recipientId)
    );
    const isNewRecipient = !knownRecipients.has(transaction.recipientPhone || transaction.recipientId);

    if (isNewRecipient && txAmount > avgAmount * 1.5) {
      alerts.push({
        type: 'NEW_RECIPIENT_LARGE_AMOUNT',
        severity: 'MEDIUM',
        message: `Premier transfert vers ce destinataire avec un montant élevé (${txAmount} XOF).`,
        transactionId: transaction.id,
        timestamp: new Date(),
      });
    }

    // Heure inhabituelle
    const hour = new Date(transaction.createdAt).getHours();
    if (hour >= 23 || hour < 6) {
      alerts.push({
        type: 'UNUSUAL_TIME',
        severity: 'LOW',
        message: `Transaction effectuée à une heure inhabituelle (${hour}h).`,
        transactionId: transaction.id,
        timestamp: new Date(),
      });
    }

    // Fréquence élevée
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = historicalTransactions.filter(
      tx => new Date(tx.createdAt) >= today
    );

    if (todayTransactions.length >= 5) {
      alerts.push({
        type: 'HIGH_FREQUENCY',
        severity: 'MEDIUM',
        message: `Vous avez effectué ${todayTransactions.length + 1} transactions aujourd'hui. Activité élevée détectée.`,
        timestamp: new Date(),
      });
    }

    return alerts;
  }

  /**
   * Sauvegarde un insight dans la base de données
   */
  private async saveInsight(userId: string, insight: PatternInsight): Promise<void> {
    // Vérifier si un insight similaire existe déjà
    const existing = await this.insightRepo.findOne({
      where: {
        userId,
        category: 'PATTERNS',
        title: insight.title,
      },
    });

    if (!existing) {
      const newInsight = this.insightRepo.create({
        userId,
        category: 'PATTERNS',
        title: insight.title,
        description: insight.description,
        metadata: insight.data,
        priority: insight.actionable ? 'WARNING' : 'INFO',
      });
      await this.insightRepo.save(newInsight);
    }
  }

  /**
   * Récupère tous les insights d'un utilisateur
   */
  async getUserInsights(userId: string): Promise<UserInsight[]> {
    return await this.insightRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  /**
   * Marque un insight comme lu
   */
  async markAsRead(insightId: string): Promise<void> {
    await this.insightRepo.update(insightId, { read: true });
  }

  // Utilitaires
  private groupByWeek(transactions: any[]): Record<string, number> {
    const byWeek: Record<string, number> = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      byWeek[weekKey] = (byWeek[weekKey] || 0) + Number(tx.amount);
    });

    return byWeek;
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const avg = this.average(numbers);
    return numbers.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / numbers.length;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const avgFirst = this.average(firstHalf);
    const avgSecond = this.average(secondHalf);
    
    if (avgFirst === 0) return 0;
    return ((avgSecond - avgFirst) / avgFirst) * 100;
  }
}
