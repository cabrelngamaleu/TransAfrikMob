import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CryptoService } from './services/crypto.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('crypto')
@UseGuards(JwtAuthGuard)
export class CryptoController {
  constructor(private cryptoService: CryptoService) {}

  @Get('wallet')
  async getWallet(@Request() req) {
    const wallet = await this.cryptoService.getWallet(req.user.userId);
    return { wallet };
  }

  @Post('buy')
  async buyCrypto(@Request() req, @Body() body: { crypto: 'BTC' | 'ETH' | 'USDT'; fiatAmount: number }) {
    const transaction = await this.cryptoService.buyCrypto(req.user.userId, body.crypto, body.fiatAmount);
    return { success: true, transaction };
  }

  @Get('transactions')
  async getTransactions(@Request() req) {
    const transactions = await this.cryptoService.getTransactions(req.user.userId);
    return { transactions };
  }
}
