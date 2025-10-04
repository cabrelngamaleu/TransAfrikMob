import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './services/cards.service';
import { CreateCardDto, UpdateCardLimitDto, CardActionDto, AddToWalletDto } from './dto/card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private cardsService: CardsService) {}

  /**
   * Créer une carte virtuelle
   */
  @Post()
  async createCard(@Request() req, @Body() dto: CreateCardDto) {
    const card = await this.cardsService.createCard(
      req.user.userId,
      dto,
      req.user.email
    );

    return {
      success: true,
      card: {
        id: card.id,
        cardholderName: card.cardholderName,
        last4: card.last4,
        brand: card.brand,
        expMonth: card.expMonth,
        expYear: card.expYear,
        status: card.status,
        spendingLimit: card.spendingLimit,
        currency: card.currency,
        createdAt: card.createdAt,
      },
      message: 'Carte virtuelle créée avec succès ! 🎉',
    };
  }

  /**
   * Liste des cartes de l'utilisateur
   */
  @Get()
  async getUserCards(@Request() req) {
    const cards = await this.cardsService.getUserCards(req.user.userId);
    return { cards };
  }

  /**
   * Détails d'une carte
   */
  @Get(':cardId')
  async getCard(@Request() req, @Param('cardId') cardId: string) {
    const card = await this.cardsService.getCard(req.user.userId, cardId);
    return { card };
  }

  /**
   * Récupérer les détails complets (numéro, CVV) - SENSIBLE
   */
  @Post(':cardId/reveal')
  async revealCardDetails(@Request() req, @Param('cardId') cardId: string) {
    const details = await this.cardsService.getCardDetails(req.user.userId, cardId);
    
    return {
      success: true,
      ...details,
    };
  }

  /**
   * Actions sur la carte (geler, dégeler, annuler)
   */
  @Post(':cardId/action')
  async performAction(
    @Request() req,
    @Param('cardId') cardId: string,
    @Body() dto: CardActionDto
  ) {
    const card = await this.cardsService.performCardAction(
      req.user.userId,
      cardId,
      dto.action
    );

    return {
      success: true,
      card,
      message: `Action ${dto.action} effectuée avec succès`,
    };
  }

  /**
   * Mettre à jour la limite de dépenses
   */
  @Put(':cardId/limit')
  async updateLimit(
    @Request() req,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateCardLimitDto
  ) {
    const card = await this.cardsService.updateSpendingLimit(
      req.user.userId,
      cardId,
      dto.spendingLimit
    );

    return {
      success: true,
      card,
      message: 'Limite mise à jour avec succès',
    };
  }

  /**
   * Historique des transactions
   */
  @Get(':cardId/transactions')
  async getTransactions(
    @Request() req,
    @Param('cardId') cardId: string,
    @Query('limit') limit?: number
  ) {
    const transactions = await this.cardsService.getTransactions(
      req.user.userId,
      cardId,
      limit ? parseInt(limit as any) : 20
    );

    return { transactions };
  }

  /**
   * Statistiques de la carte
   */
  @Get(':cardId/stats')
  async getStats(@Request() req, @Param('cardId') cardId: string) {
    const stats = await this.cardsService.getCardStats(req.user.userId, cardId);
    return { stats };
  }

  /**
   * Ajouter à Apple Pay / Google Pay
   */
  @Post(':cardId/wallet')
  async addToWallet(
    @Request() req,
    @Param('cardId') cardId: string,
    @Body() dto: AddToWalletDto
  ) {
    const result = await this.cardsService.addToWallet(
      req.user.userId,
      cardId,
      dto.walletType,
      dto.deviceId
    );

    return result;
  }
}
