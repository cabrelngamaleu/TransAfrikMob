import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from '../entities/referral.entity';
import { PointsService } from './points.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    private referralRepo: Repository<Referral>,
    private pointsService: PointsService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Génère un code de parrainage unique pour un utilisateur
   */
  async generateReferralCode(userId: string): Promise<string> {
    // Générer un code unique : CROSS + 6 caractères aléatoires
    const code = 'CROSS' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Vérifier l'unicité
    const existing = await this.referralRepo.findOne({ where: { referralCode: code } });
    
    if (existing) {
      // Si le code existe déjà, régénérer
      return this.generateReferralCode(userId);
    }
    
    return code;
  }

  /**
   * Crée un nouveau parrainage
   */
  async createReferral(referrerId: string, referredUserId: string, code: string): Promise<Referral> {
    // Vérifier que le code existe et appartient au parrain
    const existingReferral = await this.referralRepo.findOne({
      where: { referralCode: code },
    });

    if (!existingReferral) {
      // Créer le parrainage
      const referral = this.referralRepo.create({
        referrerId,
        referredUserId,
        referralCode: code,
        status: 'PENDING',
        rewardPoints: 5000,
      });

      await this.referralRepo.save(referral);
      return referral;
    }

    throw new Error('Code de parrainage invalide');
  }

  /**
   * Marque un parrainage comme complété (quand le filleul fait sa première transaction)
   */
  async completeReferral(referredUserId: string): Promise<void> {
    const referral = await this.referralRepo.findOne({
      where: { referredUserId, status: 'PENDING' },
    });

    if (!referral) {
      return; // Pas de parrainage en attente
    }

    // Marquer comme complété
    referral.status = 'COMPLETED';
    referral.completedAt = new Date();
    await this.referralRepo.save(referral);

    // Récompenser le parrain ET le filleul
    await Promise.all([
      this.pointsService.addPoints(referral.referrerId, 'REFERRAL', {
        referredUserId,
      }),
      this.pointsService.addPoints(referredUserId, 'REFERRAL', {
        referrerId: referral.referrerId,
      }),
    ]);

    referral.status = 'REWARDED';
    referral.rewardedAt = new Date();
    await this.referralRepo.save(referral);

    // Émettre événement
    this.eventEmitter.emit('referral.completed', {
      referrerId: referral.referrerId,
      referredUserId,
      points: 5000,
    });
  }

  /**
   * Récupère les parrainages d'un utilisateur
   */
  async getUserReferrals(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalPointsEarned: number;
    referrals: Referral[];
  }> {
    const referrals = await this.referralRepo.find({
      where: { referrerId: userId },
      order: { createdAt: 'DESC' },
    });

    const completed = referrals.filter(r => r.status === 'REWARDED').length;
    const pending = referrals.filter(r => r.status === 'PENDING' || r.status === 'COMPLETED').length;
    const totalPoints = completed * 5000;

    return {
      totalReferrals: referrals.length,
      completedReferrals: completed,
      pendingReferrals: pending,
      totalPointsEarned: totalPoints,
      referrals,
    };
  }

  /**
   * Récupère ou crée le code de parrainage d'un utilisateur
   */
  async getOrCreateUserReferralCode(userId: string): Promise<string> {
    // Chercher un code existant
    const existingReferral = await this.referralRepo.findOne({
      where: { referrerId: userId },
    });

    if (existingReferral) {
      return existingReferral.referralCode;
    }

    // Générer un nouveau code
    return await this.generateReferralCode(userId);
  }
}
