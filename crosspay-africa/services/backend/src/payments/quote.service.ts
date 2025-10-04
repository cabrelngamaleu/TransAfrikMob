import { Injectable, BadRequestException } from '@nestjs/common';
import { QuoteRequestDto } from './dto/quote.dto';

@Injectable()
export class QuoteService {
  detectCountryFromPhone(phone: string): string {
    const country = this.getCountryFromPhone(phone);
    if (!country) {
      throw new BadRequestException('Pays non pris en charge');
    }
    return country;
  }
  
  calculateExchangeRate(sourceCurrency: string, targetCurrency: string): number {
    return this.getExchangeRate(sourceCurrency, targetCurrency);
  }
  calculateQuote(quoteRequest: QuoteRequestDto) {
    const { recipientPhone, amount, sourceCurrency } = quoteRequest;
    
    // Déterminer le pays source à partir de la devise
    const sourceCountry = this.getCountryFromCurrency(sourceCurrency);
    if (!sourceCountry) {
      throw new BadRequestException('Pays source non pris en charge');
    }
    
    // Déterminer le pays cible à partir du numéro de téléphone
    const targetCountry = this.getCountryFromPhone(recipientPhone);
    if (!targetCountry) {
      throw new BadRequestException('Pays destinataire non pris en charge');
    }
    
    // Déterminer la devise cible
    const targetCurrency = this.getCurrencyFromCountry(targetCountry);
    
    // Calculer le taux de change
    const exchangeRate = this.getExchangeRate(sourceCurrency, targetCurrency);
    
    // Calculer les frais
    const fees = this.calculateFees(amount, sourceCountry, targetCountry);
    
    // Calculer le montant converti
    const convertedAmount = amount * exchangeRate;
    
    // Déterminer les rails disponibles
    const availableRails = this.getAvailableRails(sourceCountry, targetCountry);
    
    return {
      sourceCountry,
      targetCountry,
      sourceCurrency,
      targetCurrency,
      exchangeRate,
      amount,
      convertedAmount,
      fees,
      availableRails,
      estimatedDeliveryTime: '1-2 jours ouvrables',
    };
  }
  
  private getCountryFromCurrency(currency: string): string {
    const currencyMap = {
      'GHS': 'GH',
      'KES': 'KE',
      'NGN': 'NG',
      'UGX': 'UG',
      'XOF': 'SN',
      'ZAR': 'ZA',
    };
    
    return currencyMap[currency];
  }
  
  private getCountryFromPhone(phone: string): string {
    if (phone.startsWith('+233')) return 'GH';
    if (phone.startsWith('+254')) return 'KE';
    if (phone.startsWith('+234')) return 'NG';
    if (phone.startsWith('+256')) return 'UG';
    if (phone.startsWith('+221')) return 'SN';
    if (phone.startsWith('+27')) return 'ZA';
    
    return null;
  }
  
  private getCurrencyFromCountry(country: string): string {
    const countryMap = {
      'GH': 'GHS',
      'KE': 'KES',
      'NG': 'NGN',
      'UG': 'UGX',
      'SN': 'XOF',
      'ZA': 'ZAR',
    };
    
    return countryMap[country];
  }
  
  private getExchangeRate(sourceCurrency: string, targetCurrency: string): number {
    // Taux de change simulés
    const rates = {
      'GHS_NGN': 70.5,
      'KES_UGX': 32.8,
      'XOF_GHS': 0.065,
      'ZAR_KES': 7.2,
    };
    
    const key = `${sourceCurrency}_${targetCurrency}`;
    return rates[key] || 1.0;
  }
  
  calculateFees(amount: number, provider: string, targetCountry: string = 'NG') {
    // Frais simulés
    const transferFee = amount * 0.02; // 2% de frais de transfert
    const conversionFee = amount * 0.01; // 1% de frais de conversion
    const percentFee = amount * 0.015;
    const fixedFee = 5;
    const aggregatorFee = provider === 'Flutterwave' ? amount * 0.01 : amount * 0.005;
    
    return {
      transfer: transferFee,
      conversion: conversionFee,
      total: transferFee + conversionFee + percentFee + fixedFee + aggregatorFee,
      breakdown: {
        percentFee,
        fixedFee,
        aggregatorFee
      }
    };
  }
  
  private getAvailableRails(sourceCountry: string, targetCountry: string): string[] {
    // Rails disponibles simulés
    const rails = ['MFS Africa', 'Flutterwave'];
    
    if (sourceCountry === 'GH' && targetCountry === 'NG') {
      rails.push('MTN Mobile Money');
    }
    
    if (sourceCountry === 'KE' && targetCountry === 'UG') {
      rails.push('M-Pesa');
    }
    
    return rails;
  }
}