import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { CustomLoggerService } from '../logger/custom-logger.service';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(private readonly customLogger: CustomLoggerService) {
    super();
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Rate limiting par utilisateur si authentifié, sinon par IP
    const userId = req.user?.id;
    const ip = req.ip || req.connection.remoteAddress;
    
    if (userId) {
      return `user:${userId}`;
    }
    
    return `ip:${ip}`;
  }

  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const tracker = await this.getTracker(request);
    
    // Logger l'événement de rate limiting
    this.customLogger.logSecurityEvent('rate_limit_exceeded', request.user?.id || 'anonymous', {
      tracker,
      path: request.url,
      method: request.method,
      ip: request.ip,
    });

    throw new ThrottlerException('Trop de requêtes. Veuillez réessayer plus tard.');
  }
}
