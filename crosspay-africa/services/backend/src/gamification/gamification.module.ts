import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Entities
import { UserPoints } from './entities/user-points.entity';
import { PointTransaction } from './entities/point-transaction.entity';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { Referral } from './entities/referral.entity';

// Services
import { PointsService } from './services/points.service';
import { ReferralService } from './services/referral.service';

// Controllers
import { GamificationController } from './gamification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPoints,
      PointTransaction,
      Badge,
      UserBadge,
      Referral,
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [GamificationController],
  providers: [PointsService, ReferralService],
  exports: [PointsService, ReferralService],
})
export class GamificationModule {}
