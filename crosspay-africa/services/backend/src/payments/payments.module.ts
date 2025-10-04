import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrangeMoneyAdapter } from './adapters/orange-money.adapter';
import { MtnMobileMoneyAdapter } from './adapters/mtn-mobile-money.adapter';
import { ConfigModule } from '@nestjs/config';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [ConfigModule, GamificationModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, OrangeMoneyAdapter, MtnMobileMoneyAdapter],
  exports: [PaymentsService],
})
export class PaymentsModule {}