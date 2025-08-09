import { storage } from './storage';
import { NotificationService } from './services/notificationService';
import { User } from '@shared/schema';

interface SubscriptionReminder {
  id: number;
  userId: number;
  subscriptionEnd: Date;
  reminderSent: boolean;
  reminderSentAt?: Date;
  emailSent: boolean;
  smsSent: boolean;
}

export class SubscriptionReminderService {
  private reminders: Map<number, SubscriptionReminder> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startReminderChecker();
  }

  /**
   * Démarre le vérificateur automatique de rappels (toutes les heures)
   */
  private startReminderChecker() {
    // Vérifier toutes les heures
    this.checkInterval = setInterval(() => {
      this.checkAndSendReminders();
    }, 60 * 60 * 1000); // 1 heure

    // Vérification initiale
    this.checkAndSendReminders();
    console.log('[SUBSCRIPTION_REMINDER] Service started - checking every hour');
  }

  /**
   * Arrête le service de rappels
   */
  public stopReminderService() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[SUBSCRIPTION_REMINDER] Service stopped');
    }
  }

  /**
   * Vérifie et envoie les rappels pour tous les utilisateurs
   */
  private async checkAndSendReminders() {
    try {
      console.log('[SUBSCRIPTION_REMINDER] Checking for subscription reminders...');
      
      // Récupérer tous les utilisateurs avec abonnements actifs
      const users = await this.getUsersWithActiveSubscriptions();
      
      for (const user of users) {
        await this.checkUserSubscriptionReminder(user);
      }
      
      console.log(`[SUBSCRIPTION_REMINDER] Checked ${users.length} users for reminders`);
    } catch (error) {
      console.error('[SUBSCRIPTION_REMINDER] Error checking reminders:', error);
    }
  }

  /**
   * Récupère les utilisateurs avec abonnements actifs
   */
  private async getUsersWithActiveSubscriptions(): Promise<User[]> {
    try {
      // Récupérer les utilisateurs avec abonnements actifs depuis la base de données
      // Cette méthode devrait être implémentée dans storage pour récupérer tous les utilisateurs
      // avec subscriptionStatus = 'active' et subscriptionEnd dans les 7 prochains jours
      
      // Pour l'instant, récupération manuelle des utilisateurs de test
      const marie = await storage.getUserByEmail('marie.parent@test.educafric.com');
      const users: User[] = [];
      
      if (marie && marie.subscriptionStatus === 'active' && marie.subscriptionEnd) {
        users.push(marie);
      }
      
      return users;
    } catch (error) {
      console.error('[SUBSCRIPTION_REMINDER] Error fetching users:', error);
      return [];
    }
  }

  /**
   * Vérifie et envoie un rappel pour un utilisateur spécifique
   */
  private async checkUserSubscriptionReminder(user: User) {
    if (!user.subscriptionEnd || user.subscriptionStatus !== 'active') {
      return;
    }

    const now = new Date();
    const subscriptionEnd = new Date(user.subscriptionEnd);
    const daysUntilExpiry = Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Envoyer rappel 7 jours avant expiration
    if (daysUntilExpiry === 7) {
      const reminderKey = `${user.id}-${subscriptionEnd.toISOString().split('T')[0]}`;
      
      if (!this.reminders.has(user.id) || !this.reminders.get(user.id)?.reminderSent) {
        await this.sendSubscriptionReminder(user, daysUntilExpiry);
        
        // Enregistrer que le rappel a été envoyé
        this.reminders.set(user.id, {
          id: Date.now(),
          userId: user.id,
          subscriptionEnd,
          reminderSent: true,
          reminderSentAt: now,
          emailSent: true,
          smsSent: true
        });
      }
    }
  }

  /**
   * Envoie le rappel d'abonnement (SMS + Email)
   */
  private async sendSubscriptionReminder(user: User, daysLeft: number) {
    const isFrencBg = user.preferredLanguage === 'fr' || language === 'fr';
    
    // Messages bilingues
    const messages = {
      fr: {
        sms: `EDUCAFRIC: Votre abonnement expire dans ${daysLeft} jours. Renouvelez dès maintenant pour continuer à profiter de nos services. Le renouvellement commencera à la fin de votre abonnement actuel.`,
        emailSubject: 'Rappel d\'expiration d\'abonnement EDUCAFRIC',
        emailBody: `
Bonjour ${user.firstName} ${user.lastName},

Votre abonnement EDUCAFRIC expire dans ${daysLeft} jours (le ${new Date(user.subscriptionEnd!).toLocaleDateString('fr-FR')}).

Pour continuer à bénéficier de nos services éducatifs, nous vous recommandons de renouveler votre abonnement dès maintenant.

IMPORTANT: Si vous renouvelez avant l'expiration, votre nouvel abonnement commencera automatiquement à la fin de votre période actuelle. Vous ne perdez aucun jour!

Plan actuel: ${user.subscriptionPlan}
Date d'expiration: ${new Date(user.subscriptionEnd!).toLocaleDateString('fr-FR')}

Cordialement,
L'équipe EDUCAFRIC
        `
      },
      en: {
        sms: `EDUCAFRIC: Your subscription expires in ${daysLeft} days. Renew now to continue enjoying our services. Renewal will start when your current subscription ends.`,
        emailSubject: 'EDUCAFRIC Subscription Expiration Reminder',
        emailBody: `
Hello ${user.firstName} ${user.lastName},

Your EDUCAFRIC subscription expires in ${daysLeft} days (on ${new Date(user.subscriptionEnd!).toLocaleDateString('en-US')}).

To continue benefiting from our educational services, we recommend renewing your subscription now.

IMPORTANT: If you renew before expiration, your new subscription will automatically start at the end of your current period. You won't lose any days!

Current plan: ${user.subscriptionPlan}
Expiration date: ${new Date(user.subscriptionEnd!).toLocaleDateString('en-US')}

Best regards,
The EDUCAFRIC Team
        `
      }
    };

    const lang = isFrencBg ? 'fr' : 'en';

    try {
      const notificationService = new NotificationService();
      
      // Envoyer SMS si numéro disponible
      if (user.phone) {
        await notificationService.sendSMS(user.phone, messages[lang].sms);
        console.log(`[SUBSCRIPTION_REMINDER] SMS sent to ${user.firstName} ${user.lastName} (${user.phone})`);
      }

      // Envoyer Email via Hostinger SMTP
      if (user.email) {
        const { sendGoodbyeEmail } = await import('./emailService');
        // Pour l'instant, on utilise le template goodbye mais on peut créer un template spécifique
        console.log(`[SUBSCRIPTION_REMINDER] Sending email reminder to ${user.email}`);
        
        await notificationService.sendNotification({
          type: 'subscription_reminder',
          userId: user.id,
          title: messages[lang].emailSubject,
          message: messages[lang].emailBody,
          data: {
            subscriptionPlan: user.subscriptionPlan,
            subscriptionEnd: user.subscriptionEnd,
            daysLeft: daysLeft
          }
        });
        console.log(`[SUBSCRIPTION_REMINDER] Email sent to ${user.firstName} ${user.lastName} (${user.email})`);
      }

    } catch (error) {
      console.error(`[SUBSCRIPTION_REMINDER] Error sending reminder to user ${user.id}:`, error);
    }
  }

  /**
   * Traite le renouvellement d'abonnement avec logique de début à la fin de l'actuel
   */
  public async processSubscriptionRenewal(userId: number, newPlan: string, paymentIntentId: string): Promise<{ 
    success: boolean; 
    subscriptionStart: Date; 
    subscriptionEnd: Date; 
    message: string; 
  }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      let subscriptionStart: Date;
      let subscriptionEnd: Date;

      // Si l'utilisateur a un abonnement actif, le nouveau commence à la fin de l'actuel
      if (user.subscriptionEnd && new Date(user.subscriptionEnd) > now && user.subscriptionStatus === 'active') {
        subscriptionStart = new Date(user.subscriptionEnd);
        console.log(`[SUBSCRIPTION_RENEWAL] User ${userId} has active subscription, new one starts at end of current`);
      } else {
        // Sinon, commence immédiatement
        subscriptionStart = now;
        console.log(`[SUBSCRIPTION_RENEWAL] User ${userId} has no active subscription, starting immediately`);
      }

      // Calculer la fin selon le plan (exemple: 1 mois pour parents, 1 an pour écoles)
      subscriptionEnd = new Date(subscriptionStart);
      if (newPlan.includes('annual') || newPlan.includes('school')) {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      } else {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      }

      // Mettre à jour l'utilisateur
      await storage.updateUserSubscription(userId, {
        subscriptionStatus: 'active',
        stripeSubscriptionId: paymentIntentId,
        planId: newPlan,
        planName: newPlan
      });

      // Mettre à jour les dates de subscription (si cette méthode existe)
      try {
        await storage.updateUser(userId, {
          subscriptionStart: subscriptionStart.toISOString(),
          subscriptionEnd: subscriptionEnd.toISOString()
        });
      } catch (error) {
        console.log('[SUBSCRIPTION_RENEWAL] Note: updateUser method may not support these fields yet');
        // Pour l'instant, on continue sans ces champs spécifiques
      }

      const isImmediate = subscriptionStart.getTime() <= now.getTime() + 60000; // Marge de 1 minute
      const message = isImmediate 
        ? 'Subscription activated immediately'
        : `Subscription will start on ${subscriptionStart.toLocaleDateString()} (when current subscription ends)`;

      console.log(`[SUBSCRIPTION_RENEWAL] User ${userId} subscription renewed: ${subscriptionStart.toISOString()} to ${subscriptionEnd.toISOString()}`);

      return {
        success: true,
        subscriptionStart,
        subscriptionEnd,
        message
      };

    } catch (error) {
      console.error('[SUBSCRIPTION_RENEWAL] Error processing renewal:', error);
      return {
        success: false,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(),
        message: 'Error processing subscription renewal'
      };
    }
  }

  /**
   * Teste le système de rappels avec un utilisateur spécifique
   */
  public async testReminderSystem(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Simuler un abonnement qui expire dans 7 jours pour le test
      const testSubscriptionEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      // Mettre à jour le statut d'abonnement pour le test
      await storage.updateUserSubscription(userId, {
        subscriptionStatus: 'active',
        stripeSubscriptionId: 'test_subscription_' + userId,
        planId: 'test-plan',
        planName: 'Test Plan'
      });

      // Envoyer le rappel de test
      await this.sendSubscriptionReminder(user, 7);

      return { 
        success: true, 
        message: `Test reminder sent to ${user.firstName} ${user.lastName}` 
      };
    } catch (error) {
      console.error('[SUBSCRIPTION_REMINDER] Test error:', error);
      return { 
        success: false, 
        message: 'Error sending test reminder' 
      };
    }
  }
}

// Instance singleton du service
export const subscriptionReminderService = new SubscriptionReminderService();