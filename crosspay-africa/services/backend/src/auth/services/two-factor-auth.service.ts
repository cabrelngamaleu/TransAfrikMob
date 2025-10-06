import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

export interface TwoFactorSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

@Injectable()
export class TwoFactorAuthService {
  constructor(private readonly logger: CustomLoggerService) {}

  /**
   * Génère un secret 2FA pour un utilisateur
   */
  async generateSecret(userId: string, userEmail: string): Promise<TwoFactorSecret> {
    const secret = speakeasy.generateSecret({
      name: `CrossPay Africa (${userEmail})`,
      issuer: 'CrossPay Africa',
    });

    // Générer le QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Générer des codes de backup
    const backupCodes = this.generateBackupCodes();

    this.logger.log('2FA secret generated', 'TwoFactorAuth', { userId });

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Vérifie un code TOTP
   */
  verifyToken(secret: string, token: string): boolean {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Permet une fenêtre de 2 périodes (60 secondes)
    });

    return verified;
  }

  /**
   * Génère des codes de backup
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Vérifie un code de backup
   */
  verifyBackupCode(storedCodes: string[], providedCode: string): boolean {
    return storedCodes.includes(providedCode.toUpperCase());
  }

  /**
   * Envoie un code SMS (à implémenter avec Twilio ou Africa's Talking)
   */
  async sendSmsCode(phoneNumber: string, userId: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: Intégrer avec Twilio ou Africa's Talking
    this.logger.log('SMS 2FA code sent', 'TwoFactorAuth', {
      userId,
      phoneNumber: phoneNumber.substring(0, 5) + '***', // Masquer le numéro
    });

    // En développement, logger le code
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 SMS Code for ${phoneNumber}: ${code}`);
    }

    return code;
  }

  /**
   * Vérifie la validité d'un code SMS (avec expiration)
   */
  verifySmsCode(storedCode: string, providedCode: string, timestamp: Date): boolean {
    const now = new Date();
    const expirationTime = 5 * 60 * 1000; // 5 minutes

    // Vérifier l'expiration
    if (now.getTime() - timestamp.getTime() > expirationTime) {
      throw new UnauthorizedException('Le code a expiré. Veuillez en demander un nouveau.');
    }

    // Vérifier le code
    return storedCode === providedCode;
  }
}
