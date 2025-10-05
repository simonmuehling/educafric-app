import { 
  getAuth, 
  PhoneAuthProvider,
  signInWithPhoneNumber,
  ConfirmationResult,
  multiFactor,
  PhoneMultiFactorGenerator,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
// Firebase auth import simplified for development

// Initialize Firestore
let db: any = null;
let auth: any = null;

try {
  db = getFirestore();
  auth = getAuth();
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export interface Firebase2FAConfig {
  userId: number;
  phoneNumber: string;
  verificationId?: string;
  isEnabled: boolean;
  backupCodes: string[];
  lastVerified?: Date;
}

export class FirebaseAuth2FA {
  // Simplified implementation without reCAPTCHA
  private confirmationResult: ConfirmationResult | null = null;

  /**
   * Initialize phone authentication (simplified without reCAPTCHA)
   */
  private async initializePhoneAuth(): Promise<void> {
    console.log('[Firebase 2FA] Phone authentication initialized (no reCAPTCHA)');
  }

  /**
   * Send SMS verification code using simplified Firebase Phone Auth
   * Note: This is a simplified version without reCAPTCHA for development
   */
  public async sendSMSVerification(phoneNumber: string): Promise<{ 
    success: boolean; 
    verificationId?: string; 
    error?: string 
  }> {
    try {
      if (!auth || !auth.currentUser) {
        throw new Error('User must be authenticated first');
      }

      // Initialize phone auth
      await this.initializePhoneAuth();

      // Format phone number for international use
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      console.log('[Firebase 2FA] Sending SMS to:', formattedPhone);

      // Note: In production, you would need proper reCAPTCHA implementation
      // This is a simplified version for development
      console.warn('[Firebase 2FA] Simplified SMS sending - reCAPTCHA disabled for development');

      return {
        success: false,
        error: 'SMS verification temporarily disabled - reCAPTCHA removed for development'
      };

    } catch (error: any) {
      console.error('[Firebase 2FA] SMS send failed:', error);
      
      let errorMessage = 'Failed to send SMS verification';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Verify SMS code
   */
  public async verifySMSCode(code: string): Promise<{ 
    success: boolean; 
    credential?: any; 
    error?: string 
  }> {
    try {
      if (!this.confirmationResult) {
        throw new Error('No SMS verification in progress');
      }

      const result = await this.confirmationResult.confirm(code);
      console.log('[Firebase 2FA] SMS verification successful:', result);

      return {
        success: true,
        credential: result
      };

    } catch (error: any) {
      console.error('[Firebase 2FA] SMS verification failed:', error);
      
      let errorMessage = 'Invalid verification code';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please try again';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Verification code expired. Please request a new one';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Enable 2FA for user
   */
  public async enable2FA(userId: number, phoneNumber: string): Promise<{
    success: boolean;
    backupCodes?: string[];
    error?: string;
  }> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Store 2FA configuration
      const config: Firebase2FAConfig = {
        userId,
        phoneNumber,
        isEnabled: true,
        backupCodes,
        lastVerified: new Date()
      };

      await setDoc(doc(db, 'user2FA', userId.toString()), {
        ...config,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('[Firebase 2FA] 2FA enabled for user:', userId);

      return {
        success: true,
        backupCodes
      };

    } catch (error: any) {
      console.error('[Firebase 2FA] Failed to enable 2FA:', error);
      return {
        success: false,
        error: 'Failed to enable 2FA'
      };
    }
  }

  /**
   * Disable 2FA for user
   */
  public async disable2FA(userId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      await updateDoc(doc(db, 'user2FA', userId.toString()), {
        isEnabled: false,
        updatedAt: serverTimestamp()
      });

      console.log('[Firebase 2FA] 2FA disabled for user:', userId);

      return { success: true };

    } catch (error: any) {
      console.error('[Firebase 2FA] Failed to disable 2FA:', error);
      return {
        success: false,
        error: 'Failed to disable 2FA'
      };
    }
  }

  /**
   * Get 2FA configuration for user
   */
  public async get2FAConfig(userId: number): Promise<Firebase2FAConfig | null> {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return null;
      }

      const docRef = doc(db, 'user2FA', userId.toString());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          userId: data.userId,
          phoneNumber: data.phoneNumber,
          verificationId: data.verificationId,
          isEnabled: data.isEnabled || false,
          backupCodes: data.backupCodes || [],
          lastVerified: data.lastVerified?.toDate()
        };
      }

      return null;

    } catch (error) {
      console.error('[Firebase 2FA] Failed to get 2FA config:', error);
      return null;
    }
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  public async verifyBackupCode(userId: number, code: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const config = await this.get2FAConfig(userId);
      if (!config || !config.isEnabled) {
        return {
          success: false,
          error: '2FA not enabled'
        };
      }

      const codeIndex = config.backupCodes.indexOf(code.toUpperCase());
      if (codeIndex === -1) {
        return {
          success: false,
          error: 'Invalid backup code'
        };
      }

      // Remove used backup code
      const updatedCodes = config.backupCodes.filter((c, index) => index !== codeIndex);
      
      if (db) {
        await updateDoc(doc(db, 'user2FA', userId.toString()), {
          backupCodes: updatedCodes,
          lastVerified: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      console.log('[Firebase 2FA] Backup code verified for user:', userId);

      return { success: true };

    } catch (error) {
      console.error('[Firebase 2FA] Backup code verification failed:', error);
      return {
        success: false,
        error: 'Backup code verification failed'
      };
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.confirmationResult = null;
    console.log('[Firebase 2FA] Resources cleaned up');
  }
}

// Export singleton instance
export const firebaseAuth2FA = new FirebaseAuth2FA();