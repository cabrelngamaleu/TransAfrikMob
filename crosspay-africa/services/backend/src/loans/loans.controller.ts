import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LoansService } from './services/loans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Get('credit-score')
  async getCreditScore(@Request() req) {
    const score = await this.loansService.calculateCreditScore(req.user.userId);
    return { creditScore: score };
  }

  @Post('request')
  async requestLoan(@Request() req, @Body() body: { amount: number; durationDays: number }) {
    const loan = await this.loansService.requestLoan(req.user.userId, body.amount, body.durationDays);
    return { success: true, loan };
  }

  @Post('repay')
  async repayLoan(@Request() req, @Body() body: { loanId: string; amount: number }) {
    const loan = await this.loansService.repayLoan(req.user.userId, body.loanId, body.amount);
    return { success: true, loan };
  }

  @Get('history')
  async getHistory(@Request() req) {
    const loans = await this.loansService.getUserLoans(req.user.userId);
    return { loans };
  }
}
