import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { RecipientsModule } from './recipients/recipients.module';
import { PaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { GamificationModule } from './gamification/gamification.module';
import { AirtimeModule } from './airtime/airtime.module';
import { AIModule } from './ai/ai.module';
import { BillsModule } from './bills/bills.module';
import { CardsModule } from './cards/cards.module';
import { LoansModule } from './loans/loans.module';
import { CryptoModule } from './crypto/crypto.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: configService.get('DB_TYPE', 'postgres'),
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_DATABASE', 'crosspay'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('DB_SYNCHRONIZE', true),
        } as TypeOrmModuleOptions;
      },
    }),
    AuthModule,
    RecipientsModule,
    PaymentsModule,
    WebhooksModule,
    NotificationsModule,
    AnalyticsModule,
    MonitoringModule,
    GamificationModule,
    AirtimeModule,
    AIModule,
    BillsModule,
    CardsModule,
    LoansModule,
    CryptoModule,
  ],
})
export class AppModule {}