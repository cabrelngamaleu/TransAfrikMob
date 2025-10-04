export interface PaymentRequest {
  transactionId: string;
  amount: number;
  currency: string;
  recipientPhone: string;
  recipientName?: string;
  recipientCountry: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  providerTransactionId: string;
  status: PaymentStatus;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface PaymentStatusRequest {
  transactionId: string;
  providerTransactionId: string;
}

export interface IPaymentAdapter {
  /**
   * Nom de l'adaptateur
   */
  readonly name: string;

  /**
   * Envoyer un paiement via l'agrégateur
   */
  sendPayment(request: PaymentRequest): Promise<PaymentResponse>;

  /**
   * Vérifier le statut d'un paiement
   */
  checkStatus(request: PaymentStatusRequest): Promise<PaymentResponse>;

  /**
   * Vérifier si l'adaptateur prend en charge un pays spécifique
   */
  supportsCountry(countryCode: string): boolean;

  /**
   * Vérifier si l'adaptateur est configuré correctement
   */
  isConfigured(): boolean;
}