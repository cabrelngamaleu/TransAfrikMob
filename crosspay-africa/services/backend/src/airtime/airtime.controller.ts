import { Controller, Post, Get, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { AirtimeService } from './services/airtime.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BuyAirtimeDto } from './dto/buy-airtime.dto';

@Controller('airtime')
@UseGuards(JwtAuthGuard)
export class AirtimeController {
  constructor(private airtimeService: AirtimeService) {}

  /**
   * Achète du crédit téléphonique
   */
  @Post('buy')
  async buyAirtime(@Request() req, @Body() dto: BuyAirtimeDto) {
    const transaction = await this.airtimeService.buyAirtime(req.user.userId, dto);
    
    return {
      success: true,
      message: 'Crédit acheté avec succès !',
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        phoneNumber: transaction.phoneNumber,
        operator: transaction.operatorName,
        pointsEarned: transaction.pointsEarned,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    };
  }

  /**
   * Détecte l'opérateur pour un numéro de téléphone
   */
  @Get('detect-operator')
  async detectOperator(@Query('phoneNumber') phoneNumber: string) {
    const operator = await this.airtimeService.detectOperator(phoneNumber);
    return operator;
  }

  /**
   * Récupère les opérateurs disponibles pour un pays
   */
  @Get('operators/:countryCode')
  async getOperators(@Param('countryCode') countryCode: string) {
    const operators = await this.airtimeService.getOperatorsByCountry(countryCode);
    return { operators };
  }

  /**
   * Récupère l'historique des achats
   */
  @Get('history')
  async getHistory(@Request() req) {
    const transactions = await this.airtimeService.getUserTransactions(req.user.userId);
    return {
      transactions: transactions.map(t => ({
        id: t.id,
        phoneNumber: t.phoneNumber,
        amount: t.amount,
        currency: t.currency,
        operator: t.operatorName,
        status: t.status,
        pointsEarned: t.pointsEarned,
        createdAt: t.createdAt,
      })),
    };
  }

  /**
   * Récupère une transaction spécifique
   */
  @Get('transaction/:id')
  async getTransaction(@Request() req, @Param('id') id: string) {
    const transaction = await this.airtimeService.getTransaction(id, req.user.userId);
    return { transaction };
  }

  /**
   * Récupère les statistiques
   */
  @Get('stats')
  async getStats(@Request() req) {
    const stats = await this.airtimeService.getStats(req.user.userId);
    return stats;
  }

  /**
   * Récupère les montants rapides suggérés
   */
  @Get('quick-amounts')
  async getQuickAmounts(@Query('currency') currency: string = 'XOF') {
    const amounts = this.airtimeService.getQuickAmounts(currency);
    return { amounts };
  }
}
