import cron from 'node-cron';
import { storage } from '../storage';
import { stripeService } from './stripeService';

export class SubscriptionManager {
  private isInitialized = false;
  
  // Initialiser la gestion automatique des abonnements
  init(): void {
    if (this.isInitialized) return;
    
    console.log('[SUBSCRIPTION_MANAGER] Initializing subscription management...');
    
    // Vérifier les abonnements expirés toutes les heures
    cron.schedule('0 * * * *', async () => {
      await this.checkExpiredSubscriptions();
    });
    
    // Envoyer des rappels d'expiration tous les jours à 9h
    cron.schedule('0 9 * * *', async () => {
      await this.sendExpirationReminders();
    });
    
    // Rapport hebdomadaire le lundi à 8h
    cron.schedule('0 8 * * 1', async () => {
      await this.generateWeeklyReport();
    });
    
    this.isInitialized = true;
    console.log('[SUBSCRIPTION_MANAGER] ✅ Subscription management initialized');
  }
  
  // Vérifier et traiter les abonnements expirés
  async checkExpiredSubscriptions(): Promise<void> {
    console.log('[SUBSCRIPTION_MANAGER] Checking for expired subscriptions...');
    
    try {
      const expiredUsers = await storage.getExpiredSubscriptions();
      
      for (const user of expiredUsers) {
        console.log(`[SUBSCRIPTION_MANAGER] Processing expired subscription for user ${user.id} (${user.email})`);
        
        // Vérifier avec Stripe si l'abonnement est vraiment expiré
        if (user.stripeCustomerId) {
          const stripeStatus = await stripeService.checkSubscriptionStatus(user.id);
          
          if (stripeStatus.isActive) {
            console.log(`[SUBSCRIPTION_MANAGER] ✅ Stripe subscription still active for user ${user.id}, skipping`);
            continue;
          }
        }
        
        // Désactiver l'abonnement
        await storage.updateUserSubscription(user.id, {
          subscriptionStatus: 'expired',
          stripeSubscriptionId: '',
          planId: '',
          planName: ''
        });
        
        // Envoyer notification d'expiration
        await this.sendExpirationNotification(user);
        
        console.log(`[SUBSCRIPTION_MANAGER] ✅ Subscription expired for user ${user.id}`);
      }
      
      console.log(`[SUBSCRIPTION_MANAGER] ✅ Processed ${expiredUsers.length} expired subscriptions`);
      
    } catch (error: any) {
      console.error('[SUBSCRIPTION_MANAGER] ❌ Error checking expired subscriptions:', error);
    }
  }
  
  // Envoyer des rappels d'expiration (7 jours et 1 jour avant)
  async sendExpirationReminders(): Promise<void> {
    console.log('[SUBSCRIPTION_MANAGER] Sending expiration reminders...');
    
    try {
      // Rappels 7 jours avant expiration
      const users7Days = await storage.getUsersExpiringInDays(7);
      for (const user of users7Days) {
        await this.sendReminderNotification(user, 7);
      }
      
      // Rappels 1 jour avant expiration
      const users1Day = await storage.getUsersExpiringInDays(1);
      for (const user of users1Day) {
        await this.sendReminderNotification(user, 1);
      }
      
      console.log(`[SUBSCRIPTION_MANAGER] ✅ Sent ${users7Days.length + users1Day.length} expiration reminders`);
      
    } catch (error: any) {
      console.error('[SUBSCRIPTION_MANAGER] ❌ Error sending reminders:', error);
    }
  }
  
  // Envoyer notification d'expiration
  private async sendExpirationNotification(user: any): Promise<void> {
    console.log(`[SUBSCRIPTION_MANAGER] Sending expiration notification to ${user.email}`);
    
    try {
      const message = user.preferredLanguage === 'fr' ? {
        subject: '🚨 EDUCAFRIC - Votre abonnement a expiré',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Votre abonnement EDUCAFRIC a expiré</h2>
            <p>Bonjour ${user.firstName},</p>
            <p>Votre abonnement EDUCAFRIC a expiré. Pour continuer à bénéficier de toutes nos fonctionnalités premium, veuillez renouveler votre abonnement.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/subscribe" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                🚀 RENOUVELER MON ABONNEMENT
              </a>
            </div>
            <p><strong>Avantages de l'abonnement premium :</strong></p>
            <ul>
              <li>✅ Suivi GPS en temps réel</li>
              <li>✅ Notifications SMS/WhatsApp</li>
              <li>✅ Rapports détaillés</li>
              <li>✅ Support prioritaire</li>
            </ul>
            <p>L'équipe EDUCAFRIC</p>
          </div>
        `
      } : {
        subject: '🚨 EDUCAFRIC - Your subscription has expired',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Your EDUCAFRIC subscription has expired</h2>
            <p>Hello ${user.firstName},</p>
            <p>Your EDUCAFRIC subscription has expired. To continue enjoying all our premium features, please renew your subscription.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/subscribe" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                🚀 RENEW MY SUBSCRIPTION
              </a>
            </div>
            <p><strong>Premium subscription benefits:</strong></p>
            <ul>
              <li>✅ Real-time GPS tracking</li>
              <li>✅ SMS/WhatsApp notifications</li>
              <li>✅ Detailed reports</li>
              <li>✅ Priority support</li>
            </ul>
            <p>The EDUCAFRIC team</p>
          </div>
        `
      };
      
      // TODO: Intégrer avec le service email existant
      console.log(`[SUBSCRIPTION_MANAGER] ✅ Expiration notification prepared for ${user.email}`);
      
    } catch (error: any) {
      console.error(`[SUBSCRIPTION_MANAGER] ❌ Error sending expiration notification:`, error);
    }
  }
  
  // Envoyer rappel d'expiration
  private async sendReminderNotification(user: any, daysLeft: number): Promise<void> {
    console.log(`[SUBSCRIPTION_MANAGER] Sending ${daysLeft}-day reminder to ${user.email}`);
    
    try {
      const message = user.preferredLanguage === 'fr' ? {
        subject: `⏰ EDUCAFRIC - Votre abonnement expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Votre abonnement expire bientôt</h2>
            <p>Bonjour ${user.firstName},</p>
            <p>Votre abonnement EDUCAFRIC expire dans <strong>${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong>.</p>
            <p>Pour éviter toute interruption de service, nous vous recommandons de renouveler dès maintenant.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/subscribe" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                🔄 RENOUVELER MAINTENANT
              </a>
            </div>
            <p>Merci de votre fidélité,<br>L'équipe EDUCAFRIC</p>
          </div>
        `
      } : {
        subject: `⏰ EDUCAFRIC - Your subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Your subscription expires soon</h2>
            <p>Hello ${user.firstName},</p>
            <p>Your EDUCAFRIC subscription expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.</p>
            <p>To avoid any service interruption, we recommend renewing now.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/subscribe" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                🔄 RENEW NOW
              </a>
            </div>
            <p>Thank you for your loyalty,<br>The EDUCAFRIC team</p>
          </div>
        `
      };
      
      // TODO: Intégrer avec le service email existant
      console.log(`[SUBSCRIPTION_MANAGER] ✅ ${daysLeft}-day reminder prepared for ${user.email}`);
      
    } catch (error: any) {
      console.error(`[SUBSCRIPTION_MANAGER] ❌ Error sending reminder:`, error);
    }
  }
  
  // Générer rapport hebdomadaire
  async generateWeeklyReport(): Promise<void> {
    console.log('[SUBSCRIPTION_MANAGER] Generating weekly subscription report...');
    
    try {
      const stats = await storage.getSubscriptionStats();
      
      const report = {
        date: new Date().toISOString(),
        totalActiveSubscriptions: stats.active,
        totalExpiredSubscriptions: stats.expired,
        totalCancelledSubscriptions: stats.cancelled,
        revenue: {
          thisWeek: stats.revenueThisWeek,
          thisMonth: stats.revenueThisMonth,
          total: stats.totalRevenue
        },
        newSubscriptionsThisWeek: stats.newSubscriptionsThisWeek,
        expiringNextWeek: stats.expiringNextWeek
      };
      
      console.log('[SUBSCRIPTION_MANAGER] ✅ Weekly report generated:', report);
      
      // TODO: Envoyer le rapport par email aux administrateurs
      
    } catch (error: any) {
      console.error('[SUBSCRIPTION_MANAGER] ❌ Error generating weekly report:', error);
    }
  }
  
  // Traiter un nouveau paiement
  async processSuccessfulPayment(userId: number, planId: string, paymentIntentId: string): Promise<void> {
    console.log(`[SUBSCRIPTION_MANAGER] Processing successful payment for user ${userId}, plan ${planId}`);
    
    try {
      // Activer l'abonnement
      await stripeService.confirmPaymentAndActivateSubscription(paymentIntentId);
      
      // Envoyer email de confirmation
      await this.sendSubscriptionConfirmation(userId, planId);
      
      console.log(`[SUBSCRIPTION_MANAGER] ✅ Payment processed successfully for user ${userId}`);
      
    } catch (error: any) {
      console.error(`[SUBSCRIPTION_MANAGER] ❌ Error processing payment:`, error);
      throw error;
    }
  }
  
  // Envoyer confirmation d'abonnement
  private async sendSubscriptionConfirmation(userId: number, planId: string): Promise<void> {
    console.log(`[SUBSCRIPTION_MANAGER] Sending subscription confirmation for user ${userId}`);
    
    try {
      const user = await storage.getUserById(userId);
      const plan = await stripeService.checkSubscriptionStatus(userId);
      
      const message = user.preferredLanguage === 'fr' ? {
        subject: '🎉 EDUCAFRIC - Votre abonnement est activé !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Bienvenue dans EDUCAFRIC Premium !</h2>
            <p>Bonjour ${user.firstName},</p>
            <p>Félicitations ! Votre abonnement <strong>${plan.planName}</strong> est maintenant activé.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #166534; margin-top: 0;">🚀 Fonctionnalités débloquées :</h3>
              <ul style="color: #166534;">
                <li>✅ Géolocalisation GPS en temps réel</li>
                <li>✅ Notifications SMS et WhatsApp</li>
                <li>✅ Rapports avancés et analytics</li>
                <li>✅ Support prioritaire 24/7</li>
                <li>✅ Gestion des documents numériques</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                🎯 ACCÉDER À MON TABLEAU DE BORD
              </a>
            </div>
            <p>Merci de votre confiance,<br>L'équipe EDUCAFRIC</p>
          </div>
        `
      } : {
        subject: '🎉 EDUCAFRIC - Your subscription is active!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Welcome to EDUCAFRIC Premium!</h2>
            <p>Hello ${user.firstName},</p>
            <p>Congratulations! Your <strong>${plan.planName}</strong> subscription is now active.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #166534; margin-top: 0;">🚀 Unlocked features:</h3>
              <ul style="color: #166534;">
                <li>✅ Real-time GPS geolocation</li>
                <li>✅ SMS and WhatsApp notifications</li>
                <li>✅ Advanced reports and analytics</li>
                <li>✅ Priority 24/7 support</li>
                <li>✅ Digital document management</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                🎯 ACCESS MY DASHBOARD
              </a>
            </div>
            <p>Thank you for your trust,<br>The EDUCAFRIC team</p>
          </div>
        `
      };
      
      // TODO: Intégrer avec le service email existant
      console.log(`[SUBSCRIPTION_MANAGER] ✅ Subscription confirmation prepared for ${user.email}`);
      
    } catch (error: any) {
      console.error(`[SUBSCRIPTION_MANAGER] ❌ Error sending confirmation:`, error);
    }
  }
}

export const subscriptionManager = new SubscriptionManager();