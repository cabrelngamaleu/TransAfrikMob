import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { QuoteRequestDto, QuoteResponseDto } from '../dto/quote.dto';

@Injectable()
export class QuoteService {
  // Simuler une table de rails de paiement par pays
  private countryRails = {
    'KE': [
      { id: 'mfs-africa', name: 'MFS Africa', estimatedDelivery: '1-2 minutes', fee: 3 },
      { id: 'flutterwave', name: 'Flutterwave', estimatedDelivery: '5-10 minutes', fee: 2.5 }
    ],
    'GH': [
      { id: 'mfs-africa', name: 'MFS Africa', estimatedDelivery: '1-2 minutes', fee: 3 },
      { id: 'flutterwave', name: 'Flutterwave', estimatedDelivery: '5-10 minutes', fee: 2.5 }
    ],
    'NG': [
      { id: 'flutterwave', name: 'Flutterwave', estimatedDelivery: '1-2 minutes', fee: 2 },
      { id: 'beyonic', name: 'Beyonic', estimatedDelivery: '10-30 minutes', fee: 1.5 }
    ],
    'SN': [
      { id: 'mfs-africa', name: 'MFS Africa', estimatedDelivery: '1-2 minutes', fee: 3 },
      { id: 'beyonic', name: 'Beyonic', estimatedDelivery: '10-30 minutes', fee: 1.5 }
    ],
    'CI': [
      { id: 'mfs-africa', name: 'MFS Africa', estimatedDelivery: '1-2 minutes', fee: 3 },
      { id: 'flutterwave', name: 'Flutterwave', estimatedDelivery: '5-10 minutes', fee: 2.5 }
    ],
    'default': [
      { id: 'mfs-africa', name: 'MFS Africa', estimatedDelivery: '1-2 minutes', fee: 3 }
    ]
  };

  // Simuler une table de devises par pays
  private countryCurrencies = {
    'KE': 'KES',
    'GH': 'GHS',
    'NG': 'NGN',
    'SN': 'XOF',
    'CI': 'XOF',
    'default': 'USD'
  };

  // Simuler une table de taux de change
  private exchangeRates = {
    'XOF_KES': 0.16,
    'XOF_GHS': 0.12,
    'XOF_NGN': 7.5,
    'XOF_USD': 0.0016,
    'EUR_KES': 120,
    'EUR_GHS': 13,
    'EUR_NGN': 500,
    'EUR_XOF': 655,
    'EUR_USD': 1.05,
    'default': 1
  };

  // Détecter le pays à partir du numéro de téléphone
  private detectCountryFromPhone(phone: string): string {
    const countryPrefixes = {
      '+254': 'KE', // Kenya
      '+233': 'GH', // Ghana
      '+234': 'NG', // Nigeria
      '+221': 'SN', // Sénégal
      '+225': 'CI', // Côte d'Ivoire
    };

    for (const [prefix, country] of Object.entries(countryPrefixes)) {
      if (phone.startsWith(prefix)) {
        return country;
      }
    }

    return 'default';
  }

  // Calculer le taux de change
  private getExchangeRate(sourceCurrency: string, destinationCurrency: string): number {
    const key = `${sourceCurrency}_${destinationCurrency}`;
    return this.exchangeRates[key] || this.exchangeRates.default;
  }

  // Calculer les frais
  private calculateFees(amount: number, rail: any): { fixedFee: number; percentageFee: number; aggregatorFee: number; totalFee: number } {
    const fixedFee = 2; // Frais fixe
    const percentageFee = amount * 0.02; // 2% du montant
    const aggregatorFee = rail.fee; // Frais de l'agrégateur

    return {
      fixedFee,
      percentageFee,
      aggregatorFee,
      totalFee: fixedFee + percentageFee + aggregatorFee
    };
  }

  // Générer un devis
  async generateQuote(quoteRequest: QuoteRequestDto): Promise<QuoteResponseDto> {
    // Détecter le pays du destinataire
    const recipientCountry = this.detectCountryFromPhone(quoteRequest.recipientPhone);
    
    // Obtenir la devise du destinataire
    const destinationCurrency = this.countryCurrencies[recipientCountry] || this.countryCurrencies.default;
    
    // Obtenir les rails disponibles pour ce pays
    const availableRails = this.countryRails[recipientCountry] || this.countryRails.default;
    
    // Obtenir le taux de change
    const exchangeRate = this.getExchangeRate(quoteRequest.sourceCurrency, destinationCurrency);
    
    // Calculer le montant de destination
    const destinationAmount = quoteRequest.amount * exchangeRate;
    
    // Calculer les frais (utiliser le premier rail pour l'exemple)
    const fees = this.calculateFees(quoteRequest.amount, availableRails[0]);
    
    // Créer la réponse
    const response: QuoteResponseDto = {
      quoteId: uuidv4(),
      recipientCountry,
      destinationCurrency,
      sourceAmount: quoteRequest.amount,
      destinationAmount,
      exchangeRate,
      totalFees: fees.totalFee,
      feeBreakdown: {
        fixedFee: fees.fixedFee,
        percentageFee: fees.percentageFee,
        aggregatorFee: fees.aggregatorFee
      },
      availableRails,
      expiresIn: 300 // 5 minutes
    };
    
    return response;
  }
}