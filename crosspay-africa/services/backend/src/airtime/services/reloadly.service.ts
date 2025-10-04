import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface ReloadlyOperator {
  operatorId: number;
  name: string;
  country: {
    isoName: string;
    name: string;
  };
  denominationType: string;
  fixedAmounts?: number[];
  minAmount?: number;
  maxAmount?: number;
  logoUrls: string[];
}

interface ReloadlyTopupRequest {
  operatorId: number;
  amount: number;
  useLocalAmount: boolean;
  recipientPhone: {
    countryCode: string;
    number: string;
  };
  senderPhone?: {
    countryCode: string;
    number: string;
  };
}

interface ReloadlyTopupResponse {
  transactionId: number;
  status: string;
  recipientPhone: string;
  deliveredAmount: number;
  deliveredAmountCurrencyCode: string;
  requestedAmount: number;
  requestedAmountCurrencyCode: string;
  operatorTransactionId?: string;
}

@Injectable()
export class ReloadlyService {
  private readonly logger = new Logger(ReloadlyService.name);
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private configService: ConfigService) {
    this.axiosInstance = axios.create({
      baseURL: this.configService.get('RELOADLY_API_URL', 'https://topups.reloadly.com'),
      timeout: 30000,
    });
  }

  /**
   * Obtient un token d'accès OAuth
   */
  private async getAccessToken(): Promise<string> {
    // Vérifier si le token actuel est encore valide
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        this.configService.get('RELOADLY_AUTH_URL', 'https://auth.reloadly.com/oauth/token'),
        {
          client_id: this.configService.get('RELOADLY_CLIENT_ID'),
          client_secret: this.configService.get('RELOADLY_CLIENT_SECRET'),
          grant_type: 'client_credentials',
          audience: 'https://topups.reloadly.com',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Le token expire généralement après 1 heure
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);

      this.logger.log('Reloadly access token obtained');
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get Reloadly access token', error);
      throw new HttpException(
        'Unable to authenticate with airtime provider',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Détecte automatiquement l'opérateur à partir d'un numéro de téléphone
   */
  async detectOperator(phoneNumber: string, countryCode: string): Promise<ReloadlyOperator | null> {
    try {
      const token = await this.getAccessToken();
      
      // Nettoyer le numéro (enlever + et espaces)
      const cleanNumber = phoneNumber.replace(/[\s+]/g, '');

      const response = await this.axiosInstance.get(
        `/operators/auto-detect/phone/${cleanNumber}/countries/${countryCode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/com.reloadly.topups-v1+json',
          },
        }
      );

      this.logger.log(`Operator detected: ${response.data.name}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to detect operator for ${phoneNumber}`, error);
      return null;
    }
  }

  /**
   * Récupère tous les opérateurs d'un pays
   */
  async getOperatorsByCountry(countryCode: string): Promise<ReloadlyOperator[]> {
    try {
      const token = await this.getAccessToken();

      const response = await this.axiosInstance.get(
        `/operators/countries/${countryCode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/com.reloadly.topups-v1+json',
          },
        }
      );

      this.logger.log(`Retrieved ${response.data.length} operators for ${countryCode}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get operators for ${countryCode}`, error);
      throw new HttpException(
        'Unable to retrieve operators',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Effectue un achat d'airtime
   */
  async topup(request: ReloadlyTopupRequest): Promise<ReloadlyTopupResponse> {
    try {
      const token = await this.getAccessToken();

      this.logger.log(`Initiating topup: ${request.amount} to ${request.recipientPhone.number}`);

      const response = await this.axiosInstance.post(
        '/topups',
        request,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/com.reloadly.topups-v1+json',
          },
        }
      );

      this.logger.log(`Topup successful: Transaction ID ${response.data.transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Topup failed', error.response?.data || error);
      
      if (error.response?.status === 400) {
        throw new HttpException(
          error.response.data.message || 'Invalid topup request',
          HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        'Airtime purchase failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Récupère le statut d'une transaction
   */
  async getTransactionStatus(transactionId: number): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await this.axiosInstance.get(
        `/topups/reports/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/com.reloadly.topups-v1+json',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get transaction status for ${transactionId}`, error);
      return null;
    }
  }

  /**
   * Récupère le solde du compte Reloadly
   */
  async getAccountBalance(): Promise<{ balance: number; currencyCode: string } | null> {
    try {
      const token = await this.getAccessToken();

      const response = await this.axiosInstance.get(
        '/accounts/balance',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/com.reloadly.topups-v1+json',
          },
        }
      );

      return {
        balance: response.data.balance,
        currencyCode: response.data.currencyCode,
      };
    } catch (error) {
      this.logger.error('Failed to get account balance', error);
      return null;
    }
  }

  /**
   * Parse un numéro de téléphone pour extraire le code pays
   */
  parsePhoneNumber(phoneNumber: string): { countryCode: string; number: string } {
    // Nettoyer le numéro
    const clean = phoneNumber.replace(/[\s-()]/g, '');

    // Détecter le code pays basé sur les préfixes communs en Afrique
    const patterns = [
      { prefix: '+237', country: 'CM' },  // Cameroun
      { prefix: '+234', country: 'NG' },  // Nigeria
      { prefix: '+233', country: 'GH' },  // Ghana
      { prefix: '+254', country: 'KE' },  // Kenya
      { prefix: '+225', country: 'CI' },  // Côte d'Ivoire
      { prefix: '+221', country: 'SN' },  // Sénégal
      { prefix: '+256', country: 'UG' },  // Ouganda
      { prefix: '+255', country: 'TZ' },  // Tanzanie
    ];

    for (const pattern of patterns) {
      if (clean.startsWith(pattern.prefix)) {
        return {
          countryCode: pattern.country,
          number: clean.substring(pattern.prefix.length),
        };
      }
    }

    // Par défaut, supposer Cameroun si pas de préfixe
    if (clean.startsWith('6')) {
      return { countryCode: 'CM', number: clean };
    }

    throw new Error('Invalid phone number format');
  }
}
