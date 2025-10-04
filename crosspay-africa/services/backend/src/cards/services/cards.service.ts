import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VirtualCard } from '../entities/virtual-card.entity';
import { CardTransaction } from '../entities/card-transaction.entity';
import { CreateCardDto, CardAction } from '../dto/card.dto';
import { StripeService } from './stripe.service';
import { PointsService } from '../../gamification/services/points.service';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    @InjectRepository(VirtualCard)
    private cardRepo: Repository<VirtualCard>,
    @InjectRepository(CardTransaction)
    private transactionRepo: Repository<CardTransaction>,
    private stripeService: StripeService,
    private pointsService: PointsService,
  ) {}

  /**
   * Créer une carte virtuelle
   */
  async createCard(userId: string, dto: CreateCardDto, userEmail: string): Promise<VirtualCard> {
    this.logger.log(`Creating virtual card for user ${userId}`);

    // 1. Vérifier si l'utilisateur a déjà une carte active
    const existingCard = await this.cardRepo.findOne({
      where: { userId, status: 'ACTIVE' },
    });

    if (existingCard) {
      throw new BadRequestException('Vous avez déjà une carte active');
    }

    try {
      // 2. Créer le cardholder dans Stripe
      const cardholder = await this.stripeService.createCardholder(
        userId,
        dto.cardholderName,
        userEmail
      );

      // 3. Créer la carte dans Stripe
      const stripeCard = await this.stripeService.createCard(
        cardholder.id,
        dto.spendingLimit,
        dto.currency
      );

      // 4. Enregistrer dans notre DB
      const card = this.cardRepo.create({
        userId,
        stripeCardId: stripeCard.id,
        cardholderName: dto.cardholderName,
        last4: stripeCard.last4,
        brand: stripeCard.brand.toUpperCase(),
        expMonth: stripeCard.exp_month,
        expYear: stripeCard.exp_year,
        status: 'ACTIVE',
        spendingLimit: dto.spendingLimit,
        currentSpending: 0,
        currency: dto.currency,
        metadata: {
          cardholderId: cardholder.id,
        },
      });

      await this.cardRepo.save(card);

      // 5. Attribuer des points pour la création de carte
      try {
        await this.pointsService.addPoints(userId, 'CREATE_VIRTUAL_CARD', {
          cardId: card.id,
        });
      } catch (error) {
        this.logger.error('Error awarding points:', error);
      }

      this.logger.log(`Virtual card created successfully: ${card.id}`);
      return card;
    } catch (error) {
      this.logger.error('Error creating virtual card:', error);
      throw error;
    }
  }

  /**
   * Récupérer les cartes d'un utilisateur
   */
  async getUserCards(userId: string): Promise<VirtualCard[]> {
    return await this.cardRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupérer une carte spécifique
   */
  async getCard(userId: string, cardId: string): Promise<VirtualCard> {
    const card = await this.cardRepo.findOne({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Carte introuvable');
    }

    return card;
  }

  /**
   * Récupérer les détails complets d'une carte (incluant numéro, CVV)
   */
  async getCardDetails(userId: string, cardId: string): Promise<{
    card: VirtualCard;
    number: string;
    cvc: string;
  }> {
    const card = await this.getCard(userId, cardId);

    if (card.status !== 'ACTIVE') {
      throw new BadRequestException('La carte n\'est pas active');
    }

    // Récupérer les détails sensibles depuis Stripe
    const stripeCard = await this.stripeService.getCardDetails(card.stripeCardId);

    return {
      card,
      number: stripeCard.number,
      cvc: stripeCard.cvc,
    };
  }

  /**
   * Gérer les actions sur la carte (geler, dégeler, annuler)
   */
  async performCardAction(
    userId: string,
    cardId: string,
    action: CardAction
  ): Promise<VirtualCard> {
    const card = await this.getCard(userId, cardId);

    switch (action) {
      case CardAction.FREEZE:
        if (card.status !== 'ACTIVE') {
          throw new BadRequestException('Seules les cartes actives peuvent être gelées');
        }
        await this.stripeService.freezeCard(card.stripeCardId);
        card.status = 'FROZEN';
        break;

      case CardAction.UNFREEZE:
        if (card.status !== 'FROZEN') {
          throw new BadRequestException('Seules les cartes gelées peuvent être dégelées');
        }
        await this.stripeService.unfreezeCard(card.stripeCardId);
        card.status = 'ACTIVE';
        break;

      case CardAction.CANCEL:
        if (card.status === 'CANCELLED') {
          throw new BadRequestException('La carte est déjà annulée');
        }
        await this.stripeService.cancelCard(card.stripeCardId);
        card.status = 'CANCELLED';
        break;
    }

    await this.cardRepo.save(card);
    return card;
  }

  /**
   * Mettre à jour la limite de dépenses
   */
  async updateSpendingLimit(
    userId: string,
    cardId: string,
    newLimit: number
  ): Promise<VirtualCard> {
    const card = await this.getCard(userId, cardId);

    if (card.status !== 'ACTIVE') {
      throw new BadRequestException('La carte doit être active');
    }

    await this.stripeService.updateSpendingLimit(card.stripeCardId, newLimit);
    card.spendingLimit = newLimit;
    await this.cardRepo.save(card);

    return card;
  }

  /**
   * Récupérer l'historique des transactions
   */
  async getTransactions(userId: string, cardId: string, limit: number = 20): Promise<CardTransaction[]> {
    const card = await this.getCard(userId, cardId);

    // Récupérer depuis notre DB
    const localTransactions = await this.transactionRepo.find({
      where: { cardId: card.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    // Si pas de transactions locales, synchroniser depuis Stripe
    if (localTransactions.length === 0) {
      await this.syncTransactionsFromStripe(card);
      return await this.transactionRepo.find({
        where: { cardId: card.id },
        order: { createdAt: 'DESC' },
        take: limit,
      });
    }

    return localTransactions;
  }

  /**
   * Synchroniser les transactions depuis Stripe
   */
  private async syncTransactionsFromStripe(card: VirtualCard): Promise<void> {
    this.logger.log(`Syncing transactions for card ${card.id}`);

    const stripeTransactions = await this.stripeService.listTransactions(card.stripeCardId);

    for (const stx of stripeTransactions) {
      // Vérifier si la transaction existe déjà
      const existing = await this.transactionRepo.findOne({
        where: { stripeAuthorizationId: stx.id },
      });

      if (!existing) {
        const transaction = this.transactionRepo.create({
          cardId: card.id,
          userId: card.userId,
          stripeAuthorizationId: stx.id,
          merchantName: stx.merchant_data?.name || 'Merchant',
          merchantCategory: stx.merchant_data?.category || null,
          amount: stx.amount / 100, // Stripe utilise les centimes
          currency: stx.currency.toUpperCase(),
          status: stx.status === 'approved' ? 'APPROVED' : 'DECLINED',
          cashback: this.calculateCashback(stx.amount / 100),
          metadata: {
            stripeData: stx,
          },
          createdAt: new Date(stx.created * 1000),
        });

        await this.transactionRepo.save(transaction);

        // Attribuer le cashback en points
        if (transaction.status === 'APPROVED' && transaction.cashback > 0) {
          try {
            await this.pointsService.addPoints(card.userId, 'CARD_CASHBACK', {
              transactionId: transaction.id,
              amount: transaction.amount,
              cashback: transaction.cashback,
            });
          } catch (error) {
            this.logger.error('Error awarding cashback:', error);
          }
        }
      }
    }

    // Mettre à jour les dépenses actuelles
    const totalSpent = await this.transactionRepo
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where('tx.cardId = :cardId', { cardId: card.id })
      .andWhere('tx.status = :status', { status: 'APPROVED' })
      .getRawOne();

    card.currentSpending = parseFloat(totalSpent.total) || 0;
    await this.cardRepo.save(card);
  }

  /**
   * Calculer le cashback (2% sur les achats)
   */
  private calculateCashback(amount: number): number {
    return Math.floor(amount * 0.02);
  }

  /**
   * Statistiques de la carte
   */
  async getCardStats(userId: string, cardId: string): Promise<{
    totalSpent: number;
    transactionCount: number;
    totalCashback: number;
    averageTransaction: number;
    remainingLimit: number;
  }> {
    const card = await this.getCard(userId, cardId);

    const transactions = await this.transactionRepo.find({
      where: { cardId: card.id, status: 'APPROVED' },
    });

    const totalSpent = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalCashback = transactions.reduce((sum, tx) => sum + Number(tx.cashback), 0);
    const transactionCount = transactions.length;
    const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;
    const remainingLimit = Number(card.spendingLimit) - totalSpent;

    return {
      totalSpent,
      transactionCount,
      totalCashback,
      averageTransaction,
      remainingLimit,
    };
  }

  /**
   * Ajouter la carte à Apple Pay / Google Pay
   */
  async addToWallet(
    userId: string,
    cardId: string,
    walletType: 'APPLE_PAY' | 'GOOGLE_PAY',
    deviceId: string
  ): Promise<{ success: boolean; message: string }> {
    const card = await this.getCard(userId, cardId);

    if (card.status !== 'ACTIVE') {
      throw new BadRequestException('La carte doit être active');
    }

    // Dans un vrai environnement, on utiliserait l'API Stripe pour tokeniser
    // et ajouter au wallet. Pour le MVP, on simule juste.
    this.logger.log(`Adding card ${cardId} to ${walletType} for device ${deviceId}`);

    // Sauvegarder l'info dans les metadata
    card.metadata = {
      ...card.metadata,
      wallets: {
        ...(card.metadata?.wallets || {}),
        [walletType]: {
          deviceId,
          addedAt: new Date(),
        },
      },
    };

    await this.cardRepo.save(card);

    return {
      success: true,
      message: `Carte ajoutée à ${walletType} avec succès`,
    };
  }
}
