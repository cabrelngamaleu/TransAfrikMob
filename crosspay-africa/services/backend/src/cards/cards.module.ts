import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { VirtualCard } from './entities/virtual-card.entity';
import { CardTransaction } from './entities/card-transaction.entity';

// Services
import { CardsService } from './services/cards.service';
import { StripeService } from './services/stripe.service';

// Controllers
import { CardsController } from './cards.controller';

// Import gamification for points
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VirtualCard, CardTransaction]),
    ConfigModule,
    GamificationModule,
  ],
  controllers: [CardsController],
  providers: [CardsService, StripeService],
  exports: [CardsService],
})
export class CardsModule {}
