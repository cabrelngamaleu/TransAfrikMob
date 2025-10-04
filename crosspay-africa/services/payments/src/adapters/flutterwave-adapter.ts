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
export class FlutterwaveAdapter implements IPaymentAdapter {
  private readonly logger = new Logger(FlutterwaveAdapter.name);
  readonly name = 'Flutterwave';
  
  private readonly publicKey: string;
  private readonly secretKey: string;
  private readonly encryptionKey: string;
  private readonly apiUrl: string;
  private readonly supportedCountries = ['NG', 'GH', 'KE', 'UG', 'ZA', 'TZ'];

  constructor(private configService: ConfigService) {
    this.publicKey = this.configService.get<string>('FLUTTERWAVE_PUBLIC_KEY');
    this.secretKey = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    this.encryptionKey = this.configService.get<string>('FLUTTERWAVE_ENCRYPTION_KEY');
    this.apiUrl = this.configService.get<string>('FLUTTERWAVE_API_URL');
  }

  async sendPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      this.logger.log(`Sending payment via Flutterwave: ${JSON.stringify(request)}`);
      
      // Préparer les données pour Flutterwave
      const payload = {
        tx_ref: request.transactionId,
        amount: request.amount,
        currency: request.currency,
        phone_number: request.recipientPhone,
        email: 'recipient@example.com', // Flutterwave nécessite un email
        fullname: request.recipientName || 'Recipient',
        country: request.recipientCountry,
        narration: request.description || 'CrossPay Africa Transfer',
        meta: request.metadata || {}
      };
      
      // Simuler un appel API à Flutterwave
      // Dans un environnement réel, nous ferions un appel HTTP
      /*
      const response = await axios.post(`${this.apiUrl}/transfers`, payload, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      });
      */
      
      // Simuler une réponse réussie
      const mockResponse = {
        status: 'success',
        message: 'Transfer initiated',
        data: {
          id: `fw-${Date.now()}`,
          reference: request.transactionId,
          status: 'NEW'
        }
      };
      
      return {
        providerTransactionId: mockResponse.data.id,
        status: PaymentStatus.PENDING,
        message: mockResponse.message,
        timestamp: new Date(),
        metadata: {
          provider: 'flutterwave',
          rawResponse: mockResponse.data
        }
      };
    } catch (error) {
      this.logger.error(`Error sending payment via Flutterwave: ${error.message}`);
      return {
        providerTransactionId: '',
        status: PaymentStatus.FAILED,
        message: `Payment failed: ${error.message}`,
        timestamp: new Date(),
        metadata: {
          provider: 'flutterwave',
          error: error.message
        }
      };
    }
  }

  async checkStatus(request: PaymentStatusRequest): Promise<PaymentResponse> {
    try {
      this.logger.log(`Checking payment status via Flutterwave: ${JSON.stringify(request)}`);
      
      // Simuler un appel API à Flutterwave
      // Dans un environnement réel, nous ferions un appel HTTP
      /*
      const response = await axios.get(`${this.apiUrl}/transfers/${request.providerTransactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      });
      */
      
      // Simuler une réponse réussie
      const mockResponse = {
        status: 'success',
        message: 'Transfer fetched',
        data: {
          id: request.providerTransactionId,
          reference: request.transactionId,
          status: 'SUCCESSFUL'
        }
      };
      
      // Mapper le statut Flutterwave vers notre enum
      let status: PaymentStatus;
      switch (mockResponse.data.status) {
        case 'SUCCESSFUL':
          status = PaymentStatus.COMPLETED;
          break;
        case 'FAILED':
          status = PaymentStatus.FAILED;
          break;
        case 'NEW':
        case 'PENDING':
          status = PaymentStatus.PENDING;
          break;
        default:
          status = PaymentStatus.PROCESSING;
      }
      
      return {
        providerTransactionId: mockResponse.data.id,
        status,
        message: mockResponse.message,
        timestamp: new Date(),
        metadata: {
          provider: 'flutterwave',
          rawResponse: mockResponse.data
        }
      };
    } catch (error) {
      this.logger.error(`Error checking payment status via Flutterwave: ${error.message}`);
      return {
        providerTransactionId: request.providerTransactionId,
        status: PaymentStatus.FAILED,
        message: `Status check failed: ${error.message}`,
        timestamp: new Date(),
        metadata: {
          provider: 'flutterwave',
          error: error.message
        }
      };
    }
  }

  supportsCountry(countryCode: string): boolean {
    return this.supportedCountries.includes(countryCode);
  }

  isConfigured(): boolean {
    return !!(this.publicKey && this.secretKey && this.encryptionKey && this.apiUrl);
  }
}