import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../users/enums/role.enum";

@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("dashboard")
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get("transactions-by-day")
  getTransactionsByDay(@Query("days", ParseIntPipe) days = 30) {
    return this.analyticsService.getTransactionsByDay(days);
  }

  @Get("transactions-by-status")
  getTransactionsByStatus() {
    return this.analyticsService.getTransactionsByStatus();
  }

  @Get("user-growth")
  getUserGrowth(@Query("months", ParseIntPipe) months = 6) {
    return this.analyticsService.getUserGrowth(months);
  }

  @Get("kyc-status-distribution")
  getKycStatusDistribution() {
    return this.analyticsService.getKycStatusDistribution();
  }
}
