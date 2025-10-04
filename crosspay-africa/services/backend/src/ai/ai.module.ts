import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Prediction } from './entities/prediction.entity';
import { UserInsight } from './entities/user-insight.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

// Services
import { PredictionService } from './services/prediction.service';
import { InsightsService } from './services/insights.service';

// Controllers
import { AIController } from './ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction, UserInsight, Transaction]),
  ],
  controllers: [AIController],
  providers: [PredictionService, InsightsService],
  exports: [PredictionService, InsightsService],
})
export class AIModule {}
