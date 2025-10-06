import { Controller, Post, Body, Get, Param, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { QuoteRequestDto, QuoteResponseDto } from "../dto/quote.dto";
import { QuoteService } from "../services/quote.service";
import { PaymentService } from "../services/payment.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly quoteService: QuoteService,
    private readonly paymentService: PaymentService
  ) {}

  @Post("quote")
  @ApiOperation({
    summary: "Obtenir un devis pour un paiement transfrontalier",
  })
  @ApiResponse({
    status: 201,
    description: "Devis généré avec succès",
    type: QuoteResponseDto,
  })
  async getQuote(
    @Body() quoteRequest: QuoteRequestDto
  ): Promise<QuoteResponseDto> {
    return this.quoteService.generateQuote(quoteRequest);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("send")
  @ApiOperation({ summary: "Envoyer un paiement transfrontalier" })
  @ApiResponse({ status: 201, description: "Paiement initié avec succès" })
  async sendPayment(@Body() paymentRequest: any) {
    const provider = paymentRequest.provider || "flutterwave";
    return this.paymentService.initiatePayment(provider, paymentRequest);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id")
  @ApiOperation({ summary: "Obtenir le statut d'un paiement" })
  @ApiResponse({
    status: 200,
    description: "Statut du paiement récupéré avec succès",
  })
  async getPaymentStatus(@Param("id") id: string) {
    return this.paymentService.getPaymentStatus(id);
  }
}
