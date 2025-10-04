import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPoints } from '../entities/user-points.entity';
import { PointTransaction } from '../entities/point-transaction.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(UserPoints)
    private userPointsRepo: Repository<UserPoints>,
    @InjectRepository(PointTransaction)
    private pointTransactionRepo: Repository<PointTransaction>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Règles de points par action
   */
  private readonly POINT_RULES = {
    SEND_MONEY: (amount: number) => Math.floor(amount * 0.001), // 0.1% en points
    RECEIVE_MONEY: (amount: number) => Math.floor(amount * 0.0005), // 0.05%
    REFERRAL: 5000,
    KYC_COMPLETED: 2000,
    FIRST_TRANSACTION: 1000,
    DAILY_LOGIN: 10,
    WEEKLY_STREAK: 100,
    MONTHLY_STREAK: 500,
    SOCIAL_SHARE: 50,
    REVIEW_APP: 200,
    BUY_AIRTIME: (amount: number) => Math.floor(amount * 0.002), // 0.2%
    PAY_BILL: (amount: number) => Math.floor(amount * 0.002),
  };

  /**
   * Niveaux de fidélité
   */
  private readonly LOYALTY_LEVELS = [
    { level: 'BRONZE', minPoints: 0, maxPoints: 10000, cashbackRate: 0.005, feeDiscount: 0 },
    { level: 'SILVER', minPoints: 10000, maxPoints: 50000, cashbackRate: 0.01, feeDiscount: 0.1 },
    { level: 'GOLD', minPoints: 50000, maxPoints: 200000, cashbackRate: 0.02, feeDiscount: 0.25 },
    { level: 'PLATINUM', minPoints: 200000, maxPoints: 1000000, cashbackRate: 0.03, feeDiscount: 0.5 },
    { level: 'DIAMOND', minPoints: 1000000, maxPoints: Infinity, cashbackRate: 0.05, feeDiscount: 1.0 },
  ];

  /**
   * Ajoute des points pour une action
   */
  async addPoints(
    userId: string,
    action: string,
    metadata?: any,
  ): Promise<{ points: number; newTotal: number; levelUp: boolean; newLevel?: string }> {
    // 1. Calculer les points
    const points = this.calculatePoints(action, metadata);

    if (points === 0) {
      return { points: 0, newTotal: 0, levelUp: false };
    }

    // 2. Récupérer ou créer le compte de points
    let userPoints = await this.userPointsRepo.findOne({ where: { userId } });
    
    if (!userPoints) {
      userPoints = this.userPointsRepo.create({
        userId,
        points: 0,
        level: 'BRONZE',
        totalPointsEarned: 0,
        totalPointsRedeemed: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
    }

    const oldTotal = userPoints.points;
    const newTotal = oldTotal + points;
    const oldLevel = this.getUserLevel(oldTotal);
    const newLevel = this.getUserLevel(newTotal);
    const levelUp = oldLevel.level !== newLevel.level;

    // 3. Mettre à jour
    userPoints.points = newTotal;
    userPoints.totalPointsEarned += points;
    userPoints.level = newLevel.level;
    userPoints.lastActivityDate = new Date();
    
    await this.userPointsRepo.save(userPoints);

    // 4. Enregistrer la transaction
    await this.pointTransactionRepo.save({
      userId,
      points,
      action,
      metadata,
      balanceAfter: newTotal,
    });

    // 5. Émettre des événements
    this.eventEmitter.emit('points.added', { userId, points, newTotal, action });
    
    if (levelUp) {
      this.eventEmitter.emit('level.up', {
        userId,
        oldLevel: oldLevel.level,
        newLevel: newLevel.level,
        benefits: {
          cashbackRate: newLevel.cashbackRate,
          feeDiscount: newLevel.feeDiscount,
        },
      });
    }

    return {
      points,
      newTotal,
      levelUp,
      newLevel: levelUp ? newLevel.level : undefined,
    };
  }

  /**
   * Récupère les points d'un utilisateur
   */
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    return await this.userPointsRepo.findOne({ where: { userId } });
  }

  /**
   * Récupère l'historique des points
   */
  async getPointHistory(userId: string, limit = 50): Promise<PointTransaction[]> {
    return await this.pointTransactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Calcule les points pour une action
   */
  private calculatePoints(action: string, metadata?: any): number {
    const rule = this.POINT_RULES[action];
    
    if (typeof rule === 'function') {
      return rule(metadata?.amount || 0);
    }
    
    return rule || 0;
  }

  /**
   * Détermine le niveau de l'utilisateur basé sur ses points totaux
   */
  private getUserLevel(points: number) {
    return this.LOYALTY_LEVELS.find(
      level => points >= level.minPoints && points < level.maxPoints
    ) || this.LOYALTY_LEVELS[0];
  }

  /**
   * Obtient les informations de niveau
   */
  getUserLevelInfo(points: number) {
    const currentLevel = this.getUserLevel(points);
    const currentIndex = this.LOYALTY_LEVELS.indexOf(currentLevel);
    const nextLevel = this.LOYALTY_LEVELS[currentIndex + 1];

    return {
      current: currentLevel,
      next: nextLevel,
      progress: nextLevel
        ? {
            current: points - currentLevel.minPoints,
            needed: nextLevel.minPoints - points,
            percentage: ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100,
          }
        : null,
    };
  }

  /**
   * Échange des points contre du cash
   */
  async redeemPoints(userId: string, points: number): Promise<{ cashAmount: number }> {
    const userPoints = await this.userPointsRepo.findOne({ where: { userId } });
    
    if (!userPoints || userPoints.points < points) {
      throw new Error('Points insuffisants');
    }

    // 1 point = 1 XOF
    const cashAmount = points;

    // Déduire les points
    userPoints.points -= points;
    userPoints.totalPointsRedeemed += points;
    await this.userPointsRepo.save(userPoints);

    // Enregistrer la transaction
    await this.pointTransactionRepo.save({
      userId,
      points: -points,
      action: 'REDEEM',
      metadata: { cashAmount },
      balanceAfter: userPoints.points,
    });

    // Émettre événement pour créditer le wallet
    this.eventEmitter.emit('wallet.credit', {
      userId,
      amount: cashAmount,
      source: 'points_redemption',
    });

    return { cashAmount };
  }

  /**
   * Récupère les statistiques des points
   */
  async getStats(userId: string) {
    const userPoints = await this.getUserPoints(userId);
    
    if (!userPoints) {
      return {
        points: 0,
        level: 'BRONZE',
        totalEarned: 0,
        totalRedeemed: 0,
        streak: 0,
      };
    }

    const levelInfo = this.getUserLevelInfo(userPoints.points);

    return {
      points: userPoints.points,
      level: userPoints.level,
      levelInfo,
      totalEarned: userPoints.totalPointsEarned,
      totalRedeemed: userPoints.totalPointsRedeemed,
      currentStreak: userPoints.currentStreak,
      longestStreak: userPoints.longestStreak,
    };
  }
}
