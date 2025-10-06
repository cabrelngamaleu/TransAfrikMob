import { Injectable } from "@nestjs/common";
import { Counter, Gauge, Histogram } from "prom-client";
import { InjectMetric } from "@willsoto/nestjs-prometheus";

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric("http_requests_total")
    private readonly httpRequestsCounter: Counter<string>,

    @InjectMetric("transaction_amount_total")
    private readonly transactionAmountCounter: Counter<string>,

    @InjectMetric("active_users")
    private readonly activeUsersGauge: Gauge<string>,

    @InjectMetric("api_request_duration_seconds")
    private readonly apiRequestDurationHistogram: Histogram<string>
  ) {}

  // HTTP Requests
  incrementHttpRequests(
    method: string,
    endpoint: string,
    statusCode: number
  ): void {
    this.httpRequestsCounter.inc({
      method,
      endpoint,
      statusCode: statusCode.toString(),
    });
  }

  // Transaction Metrics
  recordTransactionAmount(
    amount: number,
    currency: string,
    status: string
  ): void {
    this.transactionAmountCounter.inc({ currency, status }, amount);
  }

  // User Metrics
  setActiveUsers(count: number): void {
    this.activeUsersGauge.set(count);
  }

  // API Performance
  recordApiRequestDuration(
    method: string,
    endpoint: string,
    durationMs: number
  ): void {
    this.apiRequestDurationHistogram.observe(
      { method, endpoint },
      durationMs / 1000 // Convert to seconds
    );
  }
}
