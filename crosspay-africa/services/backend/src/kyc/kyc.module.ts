import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { KycVerification } from './entities/kyc-verification.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KycVerification]),
    UsersModule,
  ],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}