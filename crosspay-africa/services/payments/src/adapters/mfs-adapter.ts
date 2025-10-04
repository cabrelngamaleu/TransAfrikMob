import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { 
  IPaymentAdapter, 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus, 
  PaymentStatusRequest 
} from './payment-adapter.interface';

@Injectable()
export class MfsAdapter implements IPaymentAdapter {
  private readonly logger = new Logger(MfsAdapter.name);
  readonly name = 'MFS Africa';
  
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly apiUrl: string;
  private readonly supportedCountries = ['KE', 'GH', 'SN', 'CI', 'UG', 'TZ', 'RW'];

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MFS_API_KEY');
    this.apiSecret = this.configService.get<string>('MFS_API_SECRET');
    this.apiUrl = this.configService.get<string>('MFS_API_URL');
  }

  async sendPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      this.logger.log(`Sending payment via MFS Africa: ${JSON.stringify(request)}`);
      
      // Vérifier l'idempotence - ne pas renvoyer la même transaction
      // TODO: Implémenter la vérification d'idempotence avec Redis ou BDD
      
      // Préparer les données pour MFS Africa
      const payload = {
        reference: request.transactionId,
        amount: request.amount,
        currency: request.currency,
        destination: {
          type: 'mobile',
          country: request.recipientCountry,
          number: request.recipientPhone
        },
        metadata: request.metadata || {}
      };
      
      // Simuler un appel API à MFS Africa
      // Dans un environnement réel, nous ferions un appel HTTP
      /*
      const response = await axios.post(`${this.apiUrl}/transfers`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-MFS-Idempotency-Key': request.transactionId
        }
      });
      */
      
      // Simuler une réponse réussie
      const mockResponse = {
        id: `mfs-${Date.now()}`,
        status: 'pending',
        message: 'Payment initiated successfully'
      };
      
      return {
        providerTransactionId: mockResponse.id,
        status: PaymentStatus.PENDING,
        message: mockResponse.message,
        timestamp: new Date(),
        metadata: {
          provider: 'mfs-africa',
          rawResponse: mockResponse
        }
      };
    } catch (error) {
      this.logger.error(`Error sending payment via MFS Africa: ${error.message}`);
      return {
        providerTransactionId: '',
        status: PaymentStatus.FAILED,
        message: `Payment failed: ${error.message}`,
        timestamp: new Date(),
        metadata: {
          provider: 'mfs-africa',
          error: error.message
        }
      };
    }
  }

  async checkStatus(request: PaymentStatusRequest): Promise<PaymentResponse> {
    try {
      this.logger.log(`Checking payment status via MFS Africa: ${JSON.stringify(request)}`);
      
      // Simuler un appel API à MFS Africa
      // Dans un environnement réel, nous ferions un appel HTTP
      /*
      const response = await axios.get(`${this.apiUrl}/transfers/${request.providerTransactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      */
      
      // Simuler une réponse réussie
      const mockResponse = {
        id: request.providerTransactionId,
        status: 'completed',
        message: 'Payment completed successfully'
      };
      
      return {
        providerTransactionId: mockResponse.id,
        status: PaymentStatus.COMPLETED,
        message: mockResponse.message,
        timestamp: new Date(),
        metadata: {
          provider: 'mfs-africa',
          rawResponse: mockResponse
        }
      };
    } catch (error) {
      this.logger.error(`Error checking payment status via MFS Africa: ${error.message}`);
      return {
        providerTransactionId: request.providerTransactionId,
        status: PaymentStatus.FAILED,
        message: `Status check failed: ${error.message}`,
        timestamp: new Date(),
        metadata: {
          provider: 'mfs-africa',
          error: error.message
        }
      };
    }
  }

  supportsCountry(countryCode: string): boolean {
    return this.supportedCountries.includes(countryCode);
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret && this.apiUrl);
  }
}