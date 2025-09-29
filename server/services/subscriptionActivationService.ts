import { storage } from '../storage';
import { subscriptionPlans } from './stripeService';
import { db } from '../db';
import { eq, or } from 'drizzle-orm';
import { users } from '../../shared/schemas/userSchema';

export interface SubscriptionActivationData {
  phoneNumber: string;
  planId: string;
  amount: number;
  currency: string;
  orderId: string;
  transactionId: string;
  paymentMethod: 'mtn_mobile_money';
}

export interface ActivationResult {
  success: boolean;
  message: string;
  userId?: number;
  error?: string;
}

export class SubscriptionActivationService {
  
  /**
   * Activer un abonnement après paiement MTN Mobile Money réussi
   */
  async activateSubscriptionFromMTNPayment(data: SubscriptionActivationData): Promise<ActivationResult> {
    try {
      console.log('[SUBSCRIPTION_ACTIVATION] 🚀 Starting subscription activation:', {
        phoneNumber: data.phoneNumber,
        planId: data.planId,
        amount: data.amount,
        orderId: data.orderId
      });

      // 1. Normaliser le numéro de téléphone pour la recherche
      const normalizedPhone = this.normalizePhoneNumber(data.phoneNumber);
      console.log('[SUBSCRIPTION_ACTIVATION] 📱 Normalized phone:', normalizedPhone);

      // 2. Trouver l'utilisateur par numéro de téléphone
      const user = await this.findUserByPhone(normalizedPhone);
      if (!user) {
        const errorMsg = `Aucun utilisateur trouvé avec le numéro ${data.phoneNumber}. Veuillez créer un compte d'abord.`;
        console.log(`[SUBSCRIPTION_ACTIVATION] ❌ ${errorMsg}`);
        return {
          success: false,
          message: errorMsg,
          error: 'USER_NOT_FOUND'
        };
      }

      console.log('[SUBSCRIPTION_ACTIVATION] 👤 User found:', {
        userId: user.id,
        email: user.email,
        role: user.role,
        currentPlan: user.subscriptionPlan,
        currentStatus: user.subscriptionStatus
      });

      // 3. Valider le plan d'abonnement
      const plan = subscriptionPlans.find(p => p.id === data.planId);
      if (!plan) {
        const errorMsg = `Plan d'abonnement invalide: ${data.planId}`;
        console.log(`[SUBSCRIPTION_ACTIVATION] ❌ ${errorMsg}`);
        return {
          success: false,
          message: errorMsg,
          error: 'INVALID_PLAN'
        };
      }

      // 4. Vérifier le montant du paiement
      if (data.amount !== plan.price) {
        const errorMsg = `Montant incorrect: attendu ${plan.price} ${data.currency}, reçu ${data.amount} ${data.currency}`;
        console.log(`[SUBSCRIPTION_ACTIVATION] ❌ ${errorMsg}`);
        return {
          success: false,
          message: errorMsg,
          error: 'AMOUNT_MISMATCH'
        };
      }

      // 5. Calculer les dates d'abonnement
      const subscriptionDates = this.calculateSubscriptionDates(plan.interval);

      // 6. Activer l'abonnement dans la base de données
      const activationResult = await this.updateUserSubscription(user.id, {
        planId: data.planId,
        status: 'active',
        startDate: subscriptionDates.startDate,
        endDate: subscriptionDates.endDate,
        paymentMethod: data.paymentMethod,
        orderId: data.orderId,
        transactionId: data.transactionId
      });

      if (!activationResult.success) {
        console.log('[SUBSCRIPTION_ACTIVATION] ❌ Database update failed:', activationResult.error);
        return activationResult;
      }

      console.log('[SUBSCRIPTION_ACTIVATION] ✅ Subscription activated successfully:', {
        userId: user.id,
        planId: data.planId,
        startDate: subscriptionDates.startDate,
        endDate: subscriptionDates.endDate
      });

      return {
        success: true,
        message: `Abonnement ${plan.name} activé avec succès pour ${user.email}`,
        userId: user.id
      };

    } catch (error: any) {
      console.error('[SUBSCRIPTION_ACTIVATION] ❌ Unexpected error:', error);
      return {
        success: false,
        message: 'Erreur interne lors de l\'activation de l\'abonnement',
        error: error.message
      };
    }
  }

  /**
   * Normaliser le numéro de téléphone pour la recherche
   */
  private normalizePhoneNumber(phoneNumber: string): string[] {
    // Nettoyer le numéro
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Générer les variantes possibles pour la recherche
    const variants = [];
    
    if (cleaned.startsWith('+237')) {
      variants.push(cleaned); // +237672128559
      variants.push(cleaned.substring(4)); // 672128559
    } else if (cleaned.startsWith('237')) {
      variants.push(`+${cleaned}`); // +237672128559
      variants.push(cleaned.substring(3)); // 672128559
    } else if (cleaned.length === 9 && cleaned.startsWith('6')) {
      variants.push(cleaned); // 672128559
      variants.push(`237${cleaned}`); // 237672128559
      variants.push(`+237${cleaned}`); // +237672128559
    }
    
    console.log('[SUBSCRIPTION_ACTIVATION] 📱 Phone variants for search:', variants);
    return variants;
  }

  /**
   * Trouver un utilisateur par numéro de téléphone
   */
  private async findUserByPhone(phoneVariants: string[]): Promise<any> {
    // Chercher l'utilisateur avec toutes les variantes possibles
    for (const phoneVariant of phoneVariants) {
      const foundUsers = await db
        .select()
        .from(users)
        .where(eq(users.phone, phoneVariant))
        .limit(1);
      
      if (foundUsers.length > 0) {
        console.log(`[SUBSCRIPTION_ACTIVATION] 👤 User found with phone variant: ${phoneVariant}`);
        return foundUsers[0];
      }

      // Chercher aussi dans whatsappNumber
      const foundWhatsAppUsers = await db
        .select()
        .from(users)
        .where(eq(users.whatsappNumber, phoneVariant))
        .limit(1);
      
      if (foundWhatsAppUsers.length > 0) {
        console.log(`[SUBSCRIPTION_ACTIVATION] 👤 User found with WhatsApp variant: ${phoneVariant}`);
        return foundWhatsAppUsers[0];
      }
    }
    
    return null;
  }

  /**
   * Calculer les dates de début et fin d'abonnement
   */
  private calculateSubscriptionDates(interval: string): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = now.toISOString();
    
    let endDate: Date;
    switch (interval) {
      case 'month':
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        break;
      case 'quarter':
        endDate = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
        break;
      case 'semester':
        endDate = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
        break;
      case 'year':
        endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        break;
      default:
        // Par défaut 1 mois
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
    
    return {
      startDate,
      endDate: endDate.toISOString()
    };
  }

  /**
   * Mettre à jour l'abonnement de l'utilisateur dans la base
   */
  private async updateUserSubscription(userId: number, subscriptionData: {
    planId: string;
    status: string;
    startDate: string;
    endDate: string;
    paymentMethod: string;
    orderId: string;
    transactionId: string;
  }): Promise<ActivationResult> {
    try {
      // Mettre à jour l'utilisateur avec les nouvelles données d'abonnement
      const updateResult = await db
        .update(users)
        .set({
          subscriptionPlan: subscriptionData.planId as any,
          subscriptionStatus: subscriptionData.status as any,
          subscriptionStart: subscriptionData.startDate as any,
          subscriptionEnd: subscriptionData.endDate as any,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      if (updateResult.length === 0) {
        return {
          success: false,
          message: 'Échec de la mise à jour de l\'abonnement',
          error: 'UPDATE_FAILED'
        };
      }

      console.log('[SUBSCRIPTION_ACTIVATION] ✅ User subscription updated in database');
      
      // Créer un enregistrement de paiement pour l'historique
      await this.logPaymentRecord(userId, subscriptionData);

      return {
        success: true,
        message: 'Abonnement mis à jour avec succès',
        userId
      };

    } catch (error: any) {
      console.error('[SUBSCRIPTION_ACTIVATION] ❌ Database update error:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour de la base de données',
        error: error.message
      };
    }
  }

  /**
   * Enregistrer le paiement pour l'historique
   */
  private async logPaymentRecord(userId: number, subscriptionData: any): Promise<void> {
    try {
      console.log('[SUBSCRIPTION_ACTIVATION] 💰 Logging payment record:', {
        userId,
        planId: subscriptionData.planId,
        paymentMethod: subscriptionData.paymentMethod,
        orderId: subscriptionData.orderId
      });
      
      // TODO: Ajouter ici l'enregistrement dans une table de paiements si nécessaire
      // Pour l'instant, on log simplement l'information
      
    } catch (error: any) {
      console.error('[SUBSCRIPTION_ACTIVATION] ⚠️ Failed to log payment record:', error);
      // Ne pas faire échouer l'activation si l'enregistrement du log échoue
    }
  }
}

// Export singleton instance
export const subscriptionActivationService = new SubscriptionActivationService();