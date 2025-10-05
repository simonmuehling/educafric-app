// Two-Factor Authentication Service for Educafric
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
// Dynamic import for VonageService to avoid circular dependency

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

interface TwoFactorVerification {
  isValid: boolean;
  backupCodeUsed?: boolean;
  remainingBackupCodes?: number;
}

export class TwoFactorService {
  constructor() {
    // VonageService will be dynamically imported when needed
  }

  // Generate 2FA secret and QR code for setup
  async generateSetup(userEmail: string, serviceName: string = 'Educafric'): Promise<TwoFactorSetup> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: userEmail,
      issuer: serviceName,
      length: 32
    });

    // Generate QR code URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    // Generate 10 backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32 || '',
      qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32 || ''
    };
  }

  // Verify TOTP token or backup code
  verifyToken(secret: string, token: string, backupCodes: string[] = []): TwoFactorVerification {
    // First try TOTP verification
    const totpValid = speakeasy.totp.verify({
      secret,
      token,
      window: 2, // Allow 2 time steps (60 seconds) tolerance
      encoding: 'base32'
    });

    if (totpValid) {
      return { isValid: true };
    }

    // If TOTP fails, try backup codes
    const backupCodeIndex = backupCodes.indexOf(token);
    if (backupCodeIndex !== -1) {
      // Remove used backup code
      const updatedBackupCodes = backupCodes.filter((_, index) => index !== backupCodeIndex);
      
      return {
        isValid: true,
        backupCodeUsed: true,
        remainingBackupCodes: updatedBackupCodes.length
      };
    }

    return { isValid: false };
  }

  // Generate SMS code for 2FA
  generateSMSCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send SMS 2FA code optimized for African networks
  async sendSMSCode(phoneNumber: string, code: string, language: 'en' | 'fr' = 'en'): Promise<boolean> {
    const messages = {
      en: `Educafric Security Code: ${code}\n\nValid for 5 minutes. Do not share this code.`,
      fr: `Code Sécurité Educafric: ${code}\n\nValide 5 minutes. Ne partagez pas ce code.`
    };

    try {
      // Dynamic import to avoid circular dependency
      const notificationModule = await import('./notificationService');
      const vonageService = new notificationModule.VonageService();
      await vonageService.sendSMS(phoneNumber, messages[language], language);
      console.log(`[2FA_SMS] Code sent to ${phoneNumber} in ${language}`);
      return true;
    } catch (error) {
      console.error(`[2FA_SMS] Failed to send code to ${phoneNumber}:`, error);
      return false;
    }
  }

  // Generate secure backup codes
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }

  // Generate recovery codes for account recovery
  generateRecoveryCodes(count: number = 5): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 12-character recovery code
      const code = crypto.randomBytes(6).toString('hex').toUpperCase();
      codes.push(`REC-${code}`);
    }
    
    return codes;
  }

  // Validate backup code format
  isValidBackupCodeFormat(code: string): boolean {
    return /^[A-F0-9]{8}$/.test(code.toUpperCase());
  }

  // Validate recovery code format
  isValidRecoveryCodeFormat(code: string): boolean {
    return /^REC-[A-F0-9]{12}$/.test(code.toUpperCase());
  }

  // Generate time-based temporary codes for SMS 2FA
  generateTemporaryCode(secret: string, timeStep: number = 30): string {
    return speakeasy.totp({
      secret,
      step: timeStep,
      encoding: 'base32'
    });
  }

  // Verify temporary SMS code with time window
  verifyTemporaryCode(secret: string, token: string, timeWindow: number = 300): boolean {
    // Allow 5-minute window for SMS codes
    const steps = Math.floor(timeWindow / 30);
    
    return speakeasy.totp.verify({
      secret,
      token,
      window: steps,
      encoding: 'base32'
    });
  }

  // Check if 2FA setup is complete
  isSetupComplete(secret: string, backupCodes: string[]): boolean {
    return !!(secret && backupCodes && backupCodes.length >= 8);
  }

  // Generate 2FA status summary
  getTwoFactorStatus(user: any): {
    enabled: boolean;
    setupComplete: boolean;
    backupCodesRemaining: number;
    lastUsed?: Date;
    methods: string[];
  } {
    const backupCodes = user.twoFactorBackupCodes || [];
    
    return {
      enabled: user.twoFactorEnabled || false,
      setupComplete: !!(user.twoFactorSecret && backupCodes.length > 0),
      backupCodesRemaining: backupCodes.length,
      lastUsed: user.twoFactorVerifiedAt ? new Date(user.twoFactorVerifiedAt) : undefined,
      methods: this.getAvailableMethods(user)
    };
  }

  // Get available 2FA methods for user
  private getAvailableMethods(user: any): string[] {
    const methods: string[] = [];
    
    if (user.twoFactorSecret) {
      methods.push('authenticator');
    }
    
    if (user.phone) {
      methods.push('sms');
    }
    
    if (user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0) {
      methods.push('backup_codes');
    }
    
    return methods;
  }

  // Format backup codes for display
  formatBackupCodesForDisplay(codes: string[]): string {
    return codes.map((code, index) => `${index + 1}. ${code}`).join('\n');
  }

  // Validate phone number for SMS 2FA
  isValidPhoneNumber(phone: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  // Get 2FA setup instructions in multiple languages
  getSetupInstructions(language: 'en' | 'fr' = 'en'): {
    title: string;
    steps: string[];
    backupCodeWarning: string;
  } {
    const instructions = {
      en: {
        title: 'Set Up Two-Factor Authentication',
        steps: [
          '1. Install an authenticator app (Google Authenticator, Authy, etc.)',
          '2. Scan the QR code with your authenticator app',
          '3. Enter the 6-digit code from your app to verify setup',
          '4. Save your backup codes in a secure location',
          '5. Your account is now protected with 2FA'
        ],
        backupCodeWarning: 'Store backup codes securely. They can be used to access your account if you lose your authenticator device.'
      },
      fr: {
        title: 'Configurer l\'Authentification à Deux Facteurs',
        steps: [
          '1. Installez une app d\'authentification (Google Authenticator, Authy, etc.)',
          '2. Scannez le code QR avec votre app d\'authentification',
          '3. Entrez le code à 6 chiffres de votre app pour vérifier la configuration',
          '4. Sauvegardez vos codes de récupération en lieu sûr',
          '5. Votre compte est maintenant protégé par 2FA'
        ],
        backupCodeWarning: 'Conservez les codes de récupération en sécurité. Ils permettent d\'accéder à votre compte si vous perdez votre appareil d\'authentification.'
      }
    };

    return instructions[language];
  }
}

export const twoFactorService = new TwoFactorService();