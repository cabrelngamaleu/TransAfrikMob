import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoWallet } from './entities/crypto-wallet.entity';
import { CryptoTransaction } from './entities/crypto-transaction.entity';
import { CryptoService } from './services/crypto.service';
import { CryptoController } from './crypto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoWallet, CryptoTransaction])],
  controllers: [CryptoController],
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
