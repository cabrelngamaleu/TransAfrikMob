import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { OrangeMoneyAdapter } from "./adapters/orange-money.adapter";
import { MtnMobileMoneyAdapter } from "./adapters/mtn-mobile-money.adapter";
import {
  PaymentAdapter,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
} from "./adapters/payment-adapter.interface";

export enum PaymentProvider {
  ORANGE_MONEY = "orange_money",
  MTN_MOBILE_MONEY = "mtn_mobile_money",
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private adapters: Map<string, PaymentAdapter> = new Map();

  constructor(
    private orangeMoneyAdapter: OrangeMoneyAdapter,
    private mtnMobileMoneyAdapter: MtnMobileMoneyAdapter
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
    request: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    const adapter = this.getAdapter(provider);
    this.logger.log(`Initiating payment with provider: ${provider}`);
    return adapter.initiate(request);
  }

  async verifyPayment(
    provider: PaymentProvider,
    request: PaymentVerificationRequest
  ): Promise<PaymentVerificationResponse> {
    const adapter = this.getAdapter(provider);
    this.logger.log(`Verifying payment with provider: ${provider}`);
    return adapter.verify(request);
  }

  private getAdapter(provider: PaymentProvider): PaymentAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new NotFoundException(`Payment provider ${provider} not found`);
    }
    return adapter;
  }
}
