import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { BillTransaction } from './entities/bill-transaction.entity';
import { BillProvider } from './entities/bill-provider.entity';

// Services
import { BillsService } from './services/bills.service';

// Controllers
import { BillsController } from './bills.controller';

// Import gamification for points
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillTransaction, BillProvider]),
    ConfigModule,
    GamificationModule,
  ],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}
