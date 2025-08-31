/**
 * SERVICE DE NOTIFICATIONS POUR ACTIVITÉS DE PAIEMENT
 * Créer des notifications dans le centre d'activité pour tous les événements de paiement
 */

import { storage } from '../storage';
import { subscriptionPlans } from './stripeService';

export class PaymentNotificationService {
  
  /**
   * Créer une notification de paiement réussi
   */
  static async createPaymentSuccessNotification(userId: number, planId: string, amount: number, currency: string) {
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      const planName = plan?.name || planId;
      
      await storage.createNotification(userId, {
        title: "💳 Paiement réussi !",
        message: `Votre paiement de ${amount.toLocaleString()} ${currency.toUpperCase()} pour ${planName} a été traité avec succès.`,
        type: "payment_success",
        category: "payment",
        data: {
          planId,
          planName,
          amount,
          currency,
          paymentDate: new Date().toISOString()
        },
        actionRequired: false,
        actionUrl: "/dashboard",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      });
      
      console.log(`[PAYMENT_NOTIFICATION] ✅ Payment success notification created for user ${userId}`);
    } catch (error) {
      console.error('[PAYMENT_NOTIFICATION] ❌ Error creating payment success notification:', error);
    }
  }

  /**
   * Créer une notification d'activation d'abonnement
   */
  static async createSubscriptionActivatedNotification(userId: number, planId: string, expiresAt?: Date) {
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      const planName = plan?.name || planId;
      const expirationText = expiresAt ? ` jusqu'au ${expiresAt.toLocaleDateString('fr-FR')}` : '';
      
      await storage.createNotification(userId, {
        title: "🎉 Abonnement activé !",
        message: `Votre abonnement ${planName} est maintenant actif${expirationText}. Profitez de toutes vos nouvelles fonctionnalités !`,
        type: "subscription_activated", 
        category: "subscription",
        data: {
          planId,
          planName,
          activatedAt: new Date().toISOString(),
          expiresAt: expiresAt?.toISOString()
        },
        actionRequired: false,
        actionUrl: "/dashboard",
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 jours
      });
      
      console.log(`[PAYMENT_NOTIFICATION] ✅ Subscription activation notification created for user ${userId}`);
    } catch (error) {
      console.error('[PAYMENT_NOTIFICATION] ❌ Error creating subscription activation notification:', error);
    }
  }

  /**
   * Créer une notification d'échec de paiement
   */
  static async createPaymentFailedNotification(userId: number, planId: string, reason?: string) {
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      const planName = plan?.name || planId;
      const reasonText = reason ? ` Raison: ${reason}` : '';
      
      await storage.createNotification(userId, {
        title: "⚠️ Paiement échoué",
        message: `Le paiement pour ${planName} n'a pas pu être traité.${reasonText} Veuillez réessayer ou contacter le support.`,
        type: "payment_failed",
        category: "payment", 
        data: {
          planId,
          planName,
          failureReason: reason,
          failedAt: new Date().toISOString()
        },
        actionRequired: true,
        actionUrl: "/subscribe",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      });
      
      console.log(`[PAYMENT_NOTIFICATION] ⚠️ Payment failed notification created for user ${userId}`);
    } catch (error) {
      console.error('[PAYMENT_NOTIFICATION] ❌ Error creating payment failed notification:', error);
    }
  }

  /**
   * Créer une notification d'expiration d'abonnement
   */
  static async createSubscriptionExpiredNotification(userId: number, planId: string) {
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      const planName = plan?.name || planId;
      
      await storage.createNotification(userId, {
        title: "⏰ Abonnement expiré",
        message: `Votre abonnement ${planName} a expiré. Renouvelez maintenant pour continuer à profiter de toutes les fonctionnalités premium.`,
        type: "subscription_expired",
        category: "subscription",
        data: {
          planId,
          planName,
          expiredAt: new Date().toISOString()
        },
        actionRequired: true,
        actionUrl: "/subscribe",
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 jours
      });
      
      console.log(`[PAYMENT_NOTIFICATION] ⏰ Subscription expired notification created for user ${userId}`);
    } catch (error) {
      console.error('[PAYMENT_NOTIFICATION] ❌ Error creating subscription expired notification:', error);
    }
  }

  /**
   * Créer une notification de rappel de renouvellement
   */
  static async createRenewalReminderNotification(userId: number, planId: string, daysUntilExpiry: number) {
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      const planName = plan?.name || planId;
      
      await storage.createNotification(userId, {
        title: `🔔 Renouvellement dans ${daysUntilExpiry} jour${daysUntilExpiry > 1 ? 's' : ''}`,
        message: `Votre abonnement ${planName} expire bientôt. Renouvelez maintenant pour éviter toute interruption de service.`,
        type: "subscription_renewal_reminder",
        category: "subscription",
        data: {
          planId,
          planName,
          daysUntilExpiry,
          reminderSentAt: new Date().toISOString()
        },
        actionRequired: true,
        actionUrl: "/subscribe",
        expiresAt: new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000)
      });
      
      console.log(`[PAYMENT_NOTIFICATION] 🔔 Renewal reminder notification created for user ${userId}`);
    } catch (error) {
      console.error('[PAYMENT_NOTIFICATION] ❌ Error creating renewal reminder notification:', error);
    }
  }

  /**
   * Marquer une notification comme lue
   */
  static async markNotificationAsRead(notificationId: number, userId: number) {
    try {
      await storage.markNotificationAsRead(notificationId, userId);
      console.log(`[PAYMENT_NOTIFICATION] ✅ Notification ${notificationId} marked as read for user ${userId}`);
    } catch (error) {
      console.error('[PAYMENT_NOTIFICATION] ❌ Error marking notification as read:', error);
    }
  }

  /**
   * Récupérer les notifications d'un utilisateur
   */
  static async getUserNotifications(userId: number, limit = 20, offset = 0) {
    try {
      return await storage.getUserNotifications(userId, limit, offset);
    } catch (error) {
      console.error('[PAYMENT_NOTIFICATION] ❌ Error fetching user notifications:', error);
      return [];
    }
  }

  /**
   * Créer une notification avec instructions de paiement manuel
   */
  static async createPaymentInstructionsNotification(
    userId: number, 
    planId: string, 
    paymentMethod: string,
    amount: number, 
    currency: string, 
    reference: string
  ) {
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      const planName = plan?.name || planId;
      const methodName = paymentMethod === 'orange_money' ? 'Orange Money' : 'Virement bancaire';
      
      await storage.createNotification(userId, {
        title: `📋 Instructions ${methodName}`,
        message: `Instructions de paiement reçues pour votre abonnement "${planName}" (${amount.toLocaleString()} ${currency.toUpperCase()}). Référence: ${reference}. Suivez les étapes indiquées et envoyez-nous la confirmation.`,
        type: "payment_instructions",
        category: "payment",
        data: {
          planId,
          planName,
          paymentMethod,
          amount,
          currency,
          reference,
          instructionsSentAt: new Date().toISOString()
        },
        actionRequired: true,
        actionUrl: "mailto:support@educafric.com",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      });
      
      console.log(`[PAYMENT_NOTIFICATION] 📋 Payment instructions notification created for user ${userId}`);
    } catch (error) {
      console.error('[PAYMENT_NOTIFICATION] ❌ Error creating payment instructions notification:', error);
    }
  }
}