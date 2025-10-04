import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  PaymentAdapter,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
} from './payment-adapter.interface';

@Injectable()
export class MtnMobileMoneyAdapter implements PaymentAdapter {
  private readonly logger = new Logger(MtnMobileMoneyAdapter.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly apiUser: string;
  private readonly apiSecret: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('MTN_MOMO_API_URL');
    this.apiKey = this.configService.get<string>('MTN_MOMO_API_KEY');
    this.apiUser = this.configService.get<string>('MTN_MOMO_API_USER');
    this.apiSecret = this.configService.get<string>('MTN_MOMO_API_SECRET');
  }

  getName(): string {
    return 'MTN Mobile Money';
  }

  async initiate(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    try {
      this.logger.log(`Initiating MTN Mobile Money payment for ${request.amount} ${request.currency}`);

      // Simulation d'une requête à l'API MTN Mobile Money
      // Dans une implémentation réelle, vous feriez un appel à l'API MTN Mobile Money
      const response = await this.simulateApiCall({
        amount: request.amount,
        currency: request.currency,
        phoneNumber: request.phoneNumber,
        reference: request.reference,
        description: request.description || 'Paiement CrossPay',
        callbackUrl: request.callbackUrl,
      });

      return {
        success: true,
        transactionId: response.data.transactionId,
        providerReference: response.data.providerReference,
        status: 'pending',
        message: 'Paiement initié avec succès. Veuillez confirmer sur votre téléphone.',
      };
    } catch (error) {
      this.logger.error('Erreur lors de l\'initiation du paiement MTN Mobile Money', error);
      return {
        success: false,
        status: 'failed',
        message: error.response?.data?.message || 'Erreur lors de l\'initiation du paiement',
      };
    }
  }

  async verify(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      this.logger.log(`Vérification du paiement MTN Mobile Money: ${request.transactionId}`);

      // Simulation d'une requête à l'API MTN Mobile Money pour vérifier le statut
      // Dans une implémentation réelle, vous feriez un appel à l'API MTN Mobile Money
      const response = await this.simulateVerificationApiCall({
        transactionId: request.transactionId,
        providerReference: request.providerReference,
      });

      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
        message: 'Vérification réussie',
        providerReference: response.data.providerReference,
        paymentDate: new Date(response.data.paymentDate),
      };
    } catch (error) {
      this.logger.error('Erreur lors de la vérification du paiement MTN Mobile Money', error);
      return {
        success: false,
        status: 'error',
        message: error.response?.data?.message || 'Erreur lors de la vérification du paiement',
      };
    }
  }

  // Méthode de simulation pour le développement
  private async simulateApiCall(data: any): Promise<any> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simuler une réponse réussie
    return {
      data: {
        transactionId: `MTN-${Date.now()}`,
        providerReference: `MTN-REF-${Math.floor(Math.random() * 1000000)}`,
        status: 'pending',
      },
    };
  }

  // Méthode de simulation pour le développement
  private async simulateVerificationApiCall(data: any): Promise<any> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simuler une réponse réussie (80% de chance) ou échouée (20% de chance)
    const isSuccessful = Math.random() > 0.2;

    return {
      data: {
        status: isSuccessful ? 'completed' : 'failed',
        amount: 10000,
        currency: 'XAF',
        providerReference: data.providerReference || `MTN-REF-${Math.floor(Math.random() * 1000000)}`,
        paymentDate: new Date().toISOString(),
      },
    };
  }
}