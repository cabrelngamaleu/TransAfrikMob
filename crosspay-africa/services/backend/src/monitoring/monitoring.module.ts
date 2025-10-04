import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { PrometheusConfigService } from './prometheus.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from './metrics.interceptor';

@Module({
  imports: [
    PrometheusModule.registerAsync({
      useFactory: async (configService: PrometheusConfigService) => 
        configService.createPrometheusOptions(),
      inject: [PrometheusConfigService],
    }),
  ],
  providers: [
    PrometheusConfigService,
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    // Définition des métriques personnalisées
    ...makeCounterProviders([
      {
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'endpoint', 'statusCode'],
      },
      {
        name: 'transaction_amount_total',
        help: 'Total amount of transactions',
        labelNames: ['currency', 'status'],
      },
    ]),
    ...makeGaugeProviders([
      {
        name: 'active_users',
        help: 'Number of active users',
      },
    ]),
    ...makeHistogramProviders([
      {
        name: 'api_request_duration_seconds',
        help: 'Duration of API requests in seconds',
        labelNames: ['method', 'endpoint'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      },
    ]),
  ],
  exports: [MetricsService],
})
export class MonitoringModule {}

// Fonctions utilitaires pour créer les providers de métriques
function makeCounterProviders(counters) {
  return counters.map(counter => ({
    provide: `PROMETHEUS_COUNTER_${counter.name}`,
    useFactory: () => ({ name: counter.name, help: counter.help, labelNames: counter.labelNames }),
  }));
}

function makeGaugeProviders(gauges) {
  return gauges.map(gauge => ({
    provide: `PROMETHEUS_GAUGE_${gauge.name}`,
    useFactory: () => ({ name: gauge.name, help: gauge.help, labelNames: gauge.labelNames }),
  }));
}

function makeHistogramProviders(histograms) {
  return histograms.map(histogram => ({
    provide: `PROMETHEUS_HISTOGRAM_${histogram.name}`,
    useFactory: () => ({ name: histogram.name, help: histogram.help, labelNames: histogram.labelNames, buckets: histogram.buckets }),
  }));
}