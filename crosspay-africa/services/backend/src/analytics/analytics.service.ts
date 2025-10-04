import { VerificationStatus } from '../kyc/verification-status.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { KycVerification } from '../kyc/entities/kyc-verification.entity';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(KycVerification)
    private kycVerificationsRepository: Repository<KycVerification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(KycVerification)
    private kycRepository: Repository<KycVerification>,
  ) {}

  async getDashboardStats() {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sevenDaysAgo = subDays(today, 7);

    const [
      totalTransactions,
      totalUsers,
      totalTransactionAmount,
      transactionsLast30Days,
      transactionsLast7Days,
      newUsersLast30Days,
      pendingKycVerifications,
    ] = await Promise.all([
      this.kycVerificationsRepository.count(),
      this.usersRepository.count(),
      this.getTotalTransactionAmount(),
      this.kycVerificationsRepository.count({
        where: {
          createdAt: Between(thirtyDaysAgo, today),
        },
      }),
      this.kycVerificationsRepository.count({
        where: {
          createdAt: Between(sevenDaysAgo, today),
        },
      }),
      this.usersRepository.count({
        where: {
          createdAt: Between(thirtyDaysAgo, today),
        },
      }),
      this.kycRepository.count({
        where: {
          status: VerificationStatus.PENDING,
        },
      }),
    ]);

    return {
      totalTransactions,
      totalUsers,
      totalTransactionAmount,
      transactionsLast30Days,
      transactionsLast7Days,
      newUsersLast30Days,
      pendingKycVerifications,
    };
  }

  async getTotalTransactionAmount() {
    const transactions = await this.kycVerificationsRepository.find({
      where: {
        status: VerificationStatus.COMPLETED,
      },
    });

    return transactions.reduce((sum, t) => sum + Number(t.verificationAmount || 0), 0);
  }

  async getTransactionsByDay(days = 7) {
    const today = new Date();
    const startDate = subDays(today, days - 1);
    
    const result = [];
    
    // Get all transactions for the period
    const transactions = await this.kycVerificationsRepository.find({
      where: {
        createdAt: Between(startOfDay(startDate), endOfDay(today)),
      },
      select: ['createdAt', 'verificationAmount', 'status'],
    });
    
    // Group by day
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const dayFormatted = format(date, 'yyyy-MM-dd');
      
      const dayTransactions = transactions.filter(
        t => t.createdAt >= dayStart && t.createdAt <= dayEnd
      );
      
      const successfulTransactions = dayTransactions.filter(t => t.status === VerificationStatus.COMPLETED);
      const totalAmount = successfulTransactions.reduce((sum, t) => sum + Number(t.verificationAmount || 0), 0);
      
      result.unshift({
        date: dayFormatted,
        count: dayTransactions.length,
        amount: totalAmount,
      });
    }
    
    return result;
  }

  async getTransactionsByStatus() {
    const statuses = Object.values(VerificationStatus);
    const result = [];
    
    for (const status of statuses) {
      const count = await this.kycVerificationsRepository.count({
        where: { status },
      });
      
      result.push({
        status,
        count,
      });
    }
    
    return result;
  }

  async getUserGrowth(months = 6) {
    const today = new Date();
    const result = [];
    
    for (let i = 0; i < months; i++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const newUsers = await this.usersRepository.count({
        where: {
          createdAt: Between(monthStart, monthEnd),
        },
      });
      
      result.push({
        month: format(monthStart, 'yyyy-MM'),
        newUsers,
      });
    }
    
    return result.reverse();
  }

  async getKycStatusDistribution() {
    const statuses = Object.values(VerificationStatus);
    const result = [];
    
    for (const status of statuses) {
      const count = await this.kycRepository.count({
        where: { status },
      });
      
      result.push({
        status,
        count,
      });
    }
    
    return result;
  }

  async getKycVerificationStats() {
    const [pending, inProgress, completed, rejected] = await Promise.all([
      this.kycRepository.count({ where: { status: VerificationStatus.PENDING } }),
      this.kycRepository.count({ where: { status: VerificationStatus.IN_PROGRESS } }),
      this.kycRepository.count({ where: { status: VerificationStatus.COMPLETED } }),
      this.kycRepository.count({ where: { status: VerificationStatus.REJECTED } }),
    ]);

    return {
      pending,
      inProgress,
      completed,
      rejected,
      total: pending + inProgress + completed + rejected,
    };
  }
}