import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { AirtimeTransaction } from './entities/airtime-transaction.entity';
import { Operator } from './entities/operator.entity';

// Services
import { AirtimeService } from './services/airtime.service';
import { ReloadlyService } from './services/reloadly.service';

// Controllers
import { AirtimeController } from './airtime.controller';

// Import Gamification pour les points
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AirtimeTransaction, Operator]),
    ConfigModule,
    GamificationModule,
  ],
  controllers: [AirtimeController],
  providers: [AirtimeService, ReloadlyService],
  exports: [AirtimeService],
})
export class AirtimeModule {}
