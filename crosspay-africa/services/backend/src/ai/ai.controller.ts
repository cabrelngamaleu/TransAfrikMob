import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { PredictionService } from './services/prediction.service';
import { InsightsService } from './services/insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private predictionService: PredictionService,
    private insightsService: InsightsService,
  ) {}

  /**
   * Récupère les suggestions de transactions récurrentes
   */
  @Get('suggestions')
  async getSuggestions(@Request() req) {
    const predictions = await this.predictionService.predictRecurringTransfers(req.user.userId);
    
    return {
      suggestions: predictions.map(p => ({
        id: p.recipientId,
        type: 'RECURRING_TRANSFER',
        recipient: {
          id: p.recipientId,
          name: p.recipientName,
          phone: p.recipientPhone,
        },
        amount: p.estimatedAmount,
        currency: p.currency,
        estimatedDate: p.estimatedDate,
        confidence: p.confidence,
        frequency: p.frequency,
        reason: p.reason,
        lastTransactions: p.lastTransactions,
      })),
    };
  }

  /**
   * Récupère les prédictions actives
   */
  @Get('predictions')
  async getPredictions(@Request() req) {
    const predictions = await this.predictionService.getActivePredictions(req.user.userId);
    return { predictions };
  }

  /**
   * Marque une prédiction comme exécutée
   */
  @Post('predictions/:id/execute')
  async executePrediction(@Param('id') id: string) {
    await this.predictionService.markAsExecuted(id);
    return { success: true, message: 'Prédiction marquée comme exécutée' };
  }

  /**
   * Rejette une prédiction
   */
  @Post('predictions/:id/dismiss')
  async dismissPrediction(@Param('id') id: string) {
    await this.predictionService.dismissPrediction(id);
    return { success: true, message: 'Prédiction rejetée' };
  }

  /**
   * Génère les insights pour l'utilisateur
   */
  @Post('insights/generate')
  async generateInsights(@Request() req) {
    const insights = await this.insightsService.generateInsights(req.user.userId);
    return { insights, count: insights.length };
  }

  /**
   * Récupère les insights de l'utilisateur
   */
  @Get('insights')
  async getInsights(@Request() req) {
    const insights = await this.insightsService.getUserInsights(req.user.userId);
    return {
      insights: insights.map(i => ({
        id: i.id,
        category: i.category,
        title: i.title,
        description: i.description,
        priority: i.priority,
        read: i.read,
        createdAt: i.createdAt,
        metadata: i.metadata,
      })),
    };
  }

  /**
   * Marque un insight comme lu
   */
  @Post('insights/:id/read')
  async markInsightAsRead(@Param('id') id: string) {
    await this.insightsService.markAsRead(id);
    return { success: true };
  }

  /**
   * Récupère un résumé intelligent
   */
  @Get('summary')
  async getSmartSummary(@Request() req) {
    const [predictions, insights] = await Promise.all([
      this.predictionService.predictRecurringTransfers(req.user.userId),
      this.insightsService.getUserInsights(req.user.userId),
    ]);

    const unreadInsights = insights.filter(i => !i.read);
    const highConfidencePredictions = predictions.filter(p => p.confidence >= 70);

    return {
      summary: {
        pendingSuggestions: highConfidencePredictions.length,
        unreadInsights: unreadInsights.length,
        topSuggestion: highConfidencePredictions[0] || null,
        urgentInsights: insights
          .filter(i => i.priority === 'URGENT' && !i.read)
          .slice(0, 3),
      },
    };
  }
}
