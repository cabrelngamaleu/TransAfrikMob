import { LoggerService, Injectable } from '@nestjs/common';
import * as winston from 'winston';

export interface LogContext {
  userId?: string;
  transactionId?: string;
  requestId?: string;
  [key: string]: any;
}

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: {
        service: 'crosspay-backend',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        // Console pour développement
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              return `${timestamp} [${level}] ${context ? `[${context}]` : ''} ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
              }`;
            }),
          ),
        }),
        // Fichiers pour production
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });
  }

  log(message: string, context?: string, meta?: LogContext): void {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: LogContext): void {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(message: string, context?: string, meta?: LogContext): void {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: LogContext): void {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: LogContext): void {
    this.logger.verbose(message, { context, ...meta });
  }

  // Méthodes spécifiques au métier
  logTransaction(
    action: string,
    transactionId: string,
    userId: string,
    meta?: Record<string, any>,
  ): void {
    this.logger.info('Transaction', {
      context: 'Transaction',
      action,
      transactionId,
      userId,
      ...meta,
    });
  }

  logSecurityEvent(event: string, userId: string, meta?: Record<string, any>): void {
    this.logger.warn('Security Event', {
      context: 'Security',
      event,
      userId,
      ...meta,
    });
  }

  logPaymentEvent(
    provider: string,
    status: string,
    transactionId: string,
    meta?: Record<string, any>,
  ): void {
    this.logger.info('Payment Event', {
      context: 'Payment',
      provider,
      status,
      transactionId,
      ...meta,
    });
  }
}
