import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { BillsService } from './services/bills.service';
import { PayBillDto, GetProvidersDto, ValidateAccountDto, BillType } from './dto/pay-bill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillsController {
  constructor(private billsService: BillsService) {}

  /**
   * Payer une facture
   */
  @Post('pay')
  async payBill(@Request() req, @Body() dto: PayBillDto) {
    const transaction = await this.billsService.payBill(req.user.userId, dto);
    
    return {
      success: true,
      transaction: {
        id: transaction.id,
        billType: transaction.billType,
        provider: transaction.providerName,
        accountNumber: transaction.accountNumber,
        amount: transaction.amount,
        currency: transaction.currency,
        fee: transaction.fee,
        status: transaction.status,
        externalTransactionId: transaction.externalTransactionId,
        completedAt: transaction.completedAt,
      },
      message: 'Facture payée avec succès',
    };
  }

  /**
   * Liste des fournisseurs
   */
  @Get('providers')
  async getProviders(@Query('billType') billType?: BillType, @Query('country') country?: string) {
    const providers = await this.billsService.getProviders(billType, country);
    return { providers };
  }

  /**
   * Valider un numéro de compte
   */
  @Post('validate')
  async validateAccount(@Body() dto: ValidateAccountDto) {
    const validation = await this.billsService.validateAccount(
      dto.providerId,
      dto.accountNumber,
    );
    return validation;
  }

  /**
   * Historique des paiements
   */
  @Get('history')
  async getHistory(@Request() req, @Query('limit') limit?: number) {
    const transactions = await this.billsService.getTransactionHistory(
      req.user.userId,
      limit ? parseInt(limit as any) : 20,
    );
    return { transactions };
  }

  /**
   * Statistiques
   */
  @Get('stats')
  async getStats(@Request() req) {
    const stats = await this.billsService.getStats(req.user.userId);
    return { stats };
  }

  /**
   * Montants rapides
   */
  @Get('quick-amounts/:billType')
  async getQuickAmounts(@Param('billType') billType: BillType) {
    const amounts = this.billsService.getQuickAmounts(billType);
    return { amounts };
  }

  /**
   * Factures récurrentes suggérées
   */
  @Get('recurring')
  async getRecurringBills(@Request() req) {
    const bills = await this.billsService.getRecurringBills(req.user.userId);
    return { bills };
  }
}
