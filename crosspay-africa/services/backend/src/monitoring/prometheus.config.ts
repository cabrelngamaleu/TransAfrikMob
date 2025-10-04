import { Injectable } from '@nestjs/common';
import { PrometheusOptions } from '@willsoto/nestjs-prometheus';
import { Registry } from 'prom-client';

@Injectable()
export class PrometheusConfigService {
  createPrometheusOptions(): PrometheusOptions {
    return {
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
      defaultLabels: {
        app: 'crosspay-africa-backend',
      },
    };
  }
}