import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsController } from "./analytics.controller";
import { User } from "../users/entities/user.entity";
import { KycVerification } from "../kyc/entities/kyc-verification.entity";

@Module({
  imports: [TypeOrmModule.forFeature([KycVerification, User, KycVerification])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
