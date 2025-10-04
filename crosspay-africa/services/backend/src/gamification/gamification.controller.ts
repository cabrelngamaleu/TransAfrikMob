import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PointsService } from './services/points.service';
import { ReferralService } from './services/referral.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(
    private pointsService: PointsService,
    private referralService: ReferralService,
  ) {}

  /**
   * Récupère les points de l'utilisateur connecté
   */
  @Get('points')
  async getMyPoints(@Request() req) {
    return await this.pointsService.getUserPoints(req.user.userId);
  }

  /**
   * Récupère les statistiques complètes
   */
  @Get('stats')
  async getStats(@Request() req) {
    return await this.pointsService.getStats(req.user.userId);
  }

  /**
   * Récupère l'historique des points
   */
  @Get('points/history')
  async getPointHistory(@Request() req) {
    return await this.pointsService.getPointHistory(req.user.userId);
  }

  /**
   * Échange des points contre du cash
   */
  @Post('points/redeem')
  async redeemPoints(@Request() req, @Body('points') points: number) {
    return await this.pointsService.redeemPoints(req.user.userId, points);
  }

  /**
   * Récupère le code de parrainage de l'utilisateur
   */
  @Get('referral/code')
  async getMyReferralCode(@Request() req) {
    const code = await this.referralService.getOrCreateUserReferralCode(req.user.userId);
    return { code };
  }

  /**
   * Récupère les parrainages de l'utilisateur
   */
  @Get('referral/my-referrals')
  async getMyReferrals(@Request() req) {
    return await this.referralService.getUserReferrals(req.user.userId);
  }

  /**
   * Applique un code de parrainage (lors de l'inscription)
   */
  @Post('referral/apply')
  async applyReferralCode(@Request() req, @Body('code') code: string) {
    return await this.referralService.createReferral(req.user.userId, req.user.userId, code);
  }
}
