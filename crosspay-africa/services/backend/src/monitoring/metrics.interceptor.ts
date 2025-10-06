import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { MetricsService } from "./metrics.service";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = context.switchToHttp().getResponse().statusCode;
          const duration = Date.now() - startTime;

          // Enregistrer les métriques
          this.metricsService.incrementHttpRequests(method, url, statusCode);
          this.metricsService.recordApiRequestDuration(method, url, duration);
        },
        error: () => {
          const statusCode = 500; // Erreur par défaut
          const duration = Date.now() - startTime;

          // Enregistrer les métriques en cas d'erreur
          this.metricsService.incrementHttpRequests(method, url, statusCode);
          this.metricsService.recordApiRequestDuration(method, url, duration);
        },
      })
    );
  }
}
