import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { PaymentsService, PaymentProvider } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuoteService } from './quote.service';
import { QuoteRequestDto } from './dto/quote.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly quoteService: QuoteService
  ) {}
  
  @Post('quote')
  @UseGuards(JwtAuthGuard)
  getQuote(@Body() quoteRequest: QuoteRequestDto) {
    return this.quoteService.calculateQuote(quoteRequest);
  }

  @Get('providers')
  @UseGuards(JwtAuthGuard)
  getProviders() {
    return this.paymentsService.getAvailableProviders();
  }

  @Post('initiate/:provider')
  @UseGuards(JwtAuthGuard)
  initiatePayment(
    @Param('provider') provider: PaymentProvider,
    @Body() paymentRequest: any,
  ) {
    return this.paymentsService.initiatePayment(provider, paymentRequest);
  }

  @Post('verify/:provider')
  @UseGuards(JwtAuthGuard)
  verifyPayment(
    @Param('provider') provider: PaymentProvider,
    @Body() verificationRequest: any,
  ) {
    return this.paymentsService.verifyPayment(provider, verificationRequest);
  }
}