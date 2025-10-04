import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrangeMoneyAdapter } from './adapters/orange-money.adapter';
import { MtnMobileMoneyAdapter } from './adapters/mtn-mobile-money.adapter';
import { 
  PaymentAdapter, 
  PaymentInitiationRequest, 
  PaymentInitiationResponse, 
  PaymentVerificationRequest, 
  PaymentVerificationResponse 
} from './adapters/payment-adapter.interface';
import { PointsService } from '../gamification/services/points.service';
import { ReferralService } from '../gamification/services/referral.service';

export enum PaymentProvider {
  ORANGE_MONEY = 'orange_money',
  MTN_MOBILE_MONEY = 'mtn_mobile_money',
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private adapters: Map<string, PaymentAdapter> = new Map();

  constructor(
    private orangeMoneyAdapter: OrangeMoneyAdapter,
    private mtnMobileMoneyAdapter: MtnMobileMoneyAdapter,
    private pointsService: PointsService,
    private referralService: ReferralService,
  ) {
    this.adapters.set(PaymentProvider.ORANGE_MONEY, orangeMoneyAdapter);
    this.adapters.set(PaymentProvider.MTN_MOBILE_MONEY, mtnMobileMoneyAdapter);
  }

  getAvailableProviders(): { id: string; name: string }[] {
    const providers = [];
    this.adapters.forEach((adapter, key) => {
      providers.push({
        id: key,
        name: adapter.getName(),
      });
    });
    return providers;
  }

  async initiatePayment(
    provider: PaymentProvider,
    request: PaymentInitiationRequest,
  ): Promise<PaymentInitiationResponse> {
    const adapter = this.getAdapter(provider);
    this.logger.log(`Initiating payment with provider: ${provider}`);
    return adapter.initiate(request);
  }

  async verifyPayment(
    provider: PaymentProvider,
    request: PaymentVerificationRequest,
  ): Promise<PaymentVerificationResponse> {
    const adapter = this.getAdapter(provider);
    this.logger.log(`Verifying payment with provider: ${provider}`);
    const response = await adapter.verify(request);

    // Si le paiement est réussi, attribuer des points 🎉
    if (response.status === 'success' && request.userId) {
      try {
        // Points pour l'envoi d'argent
        const pointsResult = await this.pointsService.addPoints(
          request.userId,
          'SEND_MONEY',
          { amount: request.amount }
        );

        this.logger.log(
          `Points awarded: ${pointsResult.points} points to user ${request.userId}`
        );

        // Vérifier si c'est la première transaction (pour le parrainage)
        if (request.metadata?.isFirstTransaction) {
          await this.referralService.completeReferral(request.userId);
          this.logger.log(`Referral completed for user ${request.userId}`);
        }

        // Ajouter les points gagnés dans la réponse
        response.pointsEarned = pointsResult.points;
        response.levelUp = pointsResult.levelUp;
        if (pointsResult.levelUp) {
          response.newLevel = pointsResult.newLevel;
        }
      } catch (error) {
        // Ne pas échouer la transaction si l'attribution de points échoue
        this.logger.error('Error awarding points:', error);
      }
    }

    return response;
  }

  private getAdapter(provider: PaymentProvider): PaymentAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new NotFoundException(`Payment provider ${provider} not found`);
    }
    return adapter;
  }
}