import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Loan } from '../entities/loan.entity';

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

  constructor(
    @InjectRepository(Loan)
    private loanRepo: Repository<Loan>,
  ) {}

  /**
   * Calculer le credit score basé sur l'historique
   */
  async calculateCreditScore(userId: string): Promise<number> {
    let score = 50; // Base

    // Points pour historique de prêts remboursés à temps
    const paidLoans = await this.loanRepo.count({
      where: { userId, status: 'PAID' },
    });
    score += Math.min(paidLoans * 10, 30); // +10 par prêt, max +30

    // Pénalité pour défauts de paiement
    const defaultedLoans = await this.loanRepo.count({
      where: { userId, status: 'DEFAULTED' },
    });
    score -= defaultedLoans * 20; // -20 par défaut

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Demander un prêt
   */
  async requestLoan(
    userId: string,
    amount: number,
    durationDays: number
  ): Promise<Loan> {
    // Vérifier qu'il n'y a pas de prêt actif
    const activeLoan = await this.loanRepo.findOne({
      where: {
        userId,
        status: MoreThan('PENDING') as any,
      },
    });

    if (activeLoan && activeLoan.status !== 'PAID') {
      throw new BadRequestException('Vous avez déjà un prêt actif');
    }

    // Calculer le score
    const creditScore = await this.calculateCreditScore(userId);

    // Taux d'intérêt basé sur le score
    let interestRate = 10; // 10% par défaut
    if (creditScore >= 80) interestRate = 5;
    else if (creditScore >= 60) interestRate = 7;

    const interest = amount * (interestRate / 100);
    const totalRepayment = amount + interest;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);

    const loan = this.loanRepo.create({
      userId,
      amount,
      interestRate,
      durationDays,
      totalRepayment,
      status: creditScore >= 60 ? 'APPROVED' : 'PENDING',
      creditScore,
      dueDate,
      scoringData: { creditScore },
    });

    await this.loanRepo.save(loan);
    this.logger.log(`Loan requested: ${loan.id} - Score: ${creditScore}`);
    return loan;
  }

  /**
   * Rembourser un prêt
   */
  async repayLoan(userId: string, loanId: string, amount: number): Promise<Loan> {
    const loan = await this.loanRepo.findOne({
      where: { id: loanId, userId },
    });

    if (!loan) {
      throw new BadRequestException('Prêt introuvable');
    }

    loan.amountPaid = Number(loan.amountPaid) + amount;

    if (loan.amountPaid >= loan.totalRepayment) {
      loan.status = 'PAID';
    }

    await this.loanRepo.save(loan);
    return loan;
  }

  /**
   * Historique des prêts
   */
  async getUserLoans(userId: string): Promise<Loan[]> {
    return await this.loanRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
