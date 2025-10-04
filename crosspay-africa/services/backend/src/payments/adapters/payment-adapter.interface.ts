export interface PaymentInitiationRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  reference: string;
  description?: string;
  callbackUrl?: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  transactionId?: string;
  providerReference?: string;
  status: string;
  message?: string;
  redirectUrl?: string;
}

export interface PaymentVerificationRequest {
  transactionId: string;
  providerReference?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  status: string;
  amount?: number;
  currency?: string;
  message?: string;
  providerReference?: string;
  paymentDate?: Date;
}

export interface PaymentAdapter {
  initiate(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;
  verify(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse>;
  getName(): string;
}