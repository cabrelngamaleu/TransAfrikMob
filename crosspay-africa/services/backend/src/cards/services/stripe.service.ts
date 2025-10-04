import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripeApiKey: string;
  private readonly stripeApiUrl = 'https://api.stripe.com/v1';

  constructor(private configService: ConfigService) {
    this.stripeApiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
  }

  /**
   * Créer un cardholder Stripe Issuing
   */
  async createCardholder(userId: string, name: string, email: string): Promise<any> {
    this.logger.log(`Creating Stripe cardholder for user ${userId}`);

    try {
      const response = await axios.post(
        `${this.stripeApiUrl}/issuing/cardholders`,
        new URLSearchParams({
          name,
          email,
          type: 'individual',
          status: 'active',
          'billing[address][line1]': 'Douala',
          'billing[address][city]': 'Douala',
          'billing[address][country]': 'CM',
          'billing[address][postal_code]': '00237',
        }),
        {
          headers: {
            'Authorization': `Bearer ${this.stripeApiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error creating Stripe cardholder:', error.response?.data || error.message);
      throw new Error('Impossible de créer le cardholder');
    }
  }

  /**
   * Créer une carte virtuelle Stripe Issuing
   */
  async createCard(cardholderId: string, spendingLimit: number, currency: string): Promise<any> {
    this.logger.log(`Creating Stripe virtual card for cardholder ${cardholderId}`);

    try {
      const response = await axios.post(
        `${this.stripeApiUrl}/issuing/cards`,
        new URLSearchParams({
          cardholder: cardholderId,
          currency: currency.toLowerCase(),
          type: 'virtual',
          status: 'active',
          'spending_controls[spending_limits][0][amount]': spendingLimit.toString(),
          'spending_controls[spending_limits][0][interval]': 'monthly',
        }),
        {
          headers: {
            'Authorization': `Bearer ${this.stripeApiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error creating Stripe card:', error.response?.data || error.message);
      throw new Error('Impossible de créer la carte');
    }
  }

  /**
   * Récupérer les détails complets d'une carte (incluant PAN, CVV, etc.)
   */
  async getCardDetails(cardId: string): Promise<any> {
    this.logger.log(`Retrieving card details for ${cardId}`);

    try {
      const response = await axios.get(
        `${this.stripeApiUrl}/issuing/cards/${cardId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.stripeApiKey}`,
          },
          params: {
            expand: ['number', 'cvc'],
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error retrieving card details:', error.response?.data || error.message);
      throw new Error('Impossible de récupérer les détails de la carte');
    }
  }

  /**
   * Geler une carte
   */
  async freezeCard(cardId: string): Promise<any> {
    this.logger.log(`Freezing card ${cardId}`);

    try {
      const response = await axios.post(
        `${this.stripeApiUrl}/issuing/cards/${cardId}`,
        new URLSearchParams({
          status: 'inactive',
        }),
        {
          headers: {
            'Authorization': `Bearer ${this.stripeApiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error freezing card:', error.response?.data || error.message);
      throw new Error('Impossible de geler la carte');
    }
  }

  /**
   * Dégeler une carte
   */
  async unfreezeCard(cardId: string): Promise<any> {
    this.logger.log(`Unfreezing card ${cardId}`);

    try {
      const response = await axios.post(
        `${this.stripeApiUrl}/issuing/cards/${cardId}`,
        new URLSearchParams({
          status: 'active',
        }),
        {
          headers: {
            'Authorization': `Bearer ${this.stripeApiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error unfreezing card:', error.response?.data || error.message);
      throw new Error('Impossible de dégeler la carte');
    }
  }

  /**
   * Annuler une carte
   */
  async cancelCard(cardId: string): Promise<any> {
    this.logger.log(`Cancelling card ${cardId}`);

    try {
      const response = await axios.post(
        `${this.stripeApiUrl}/issuing/cards/${cardId}`,
        new URLSearchParams({
          status: 'canceled',
        }),
        {
          headers: {
            'Authorization': `Bearer ${this.stripeApiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error cancelling card:', error.response?.data || error.message);
      throw new Error('Impossible d\'annuler la carte');
    }
  }

  /**
   * Mettre à jour la limite de dépenses
   */
  async updateSpendingLimit(cardId: string, newLimit: number): Promise<any> {
    this.logger.log(`Updating spending limit for card ${cardId} to ${newLimit}`);

    try {
      const response = await axios.post(
        `${this.stripeApiUrl}/issuing/cards/${cardId}`,
        new URLSearchParams({
          'spending_controls[spending_limits][0][amount]': newLimit.toString(),
          'spending_controls[spending_limits][0][interval]': 'monthly',
        }),
        {
          headers: {
            'Authorization': `Bearer ${this.stripeApiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error updating spending limit:', error.response?.data || error.message);
      throw new Error('Impossible de mettre à jour la limite');
    }
  }

  /**
   * Lister les transactions d'une carte
   */
  async listTransactions(cardId: string, limit: number = 20): Promise<any[]> {
    this.logger.log(`Listing transactions for card ${cardId}`);

    try {
      const response = await axios.get(
        `${this.stripeApiUrl}/issuing/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${this.stripeApiKey}`,
          },
          params: {
            card: cardId,
            limit,
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      this.logger.error('Error listing transactions:', error.response?.data || error.message);
      return [];
    }
  }
}
