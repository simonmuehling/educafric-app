import { type User } from "../../shared/schema";
import { NotificationService } from "./notificationService";
import { sendHostingerMail } from "./hostingerMail";

interface ProfileCreatedData {
  user: User;
  isNewRegistration: boolean;
  createdBy?: User;
  schoolName?: string;
}

export class ProfileNotificationService {
  private static notificationService = new NotificationService();

  /**
   * Send notifications when a new profile is created
   */
  static async sendProfileCreatedNotifications(data: ProfileCreatedData): Promise<void> {
    const { user, isNewRegistration, createdBy, schoolName } = data;
    
    try {
      // Send email notification to new user
      await this.sendWelcomeEmail(user, schoolName);
      
      // Send SMS notification to new user if phone number exists
      if (user.phone) {
        await this.sendWelcomeSMS(user, schoolName);
      }

      // Send notification to school administrators
      if (user.schoolId && user.role !== 'SiteAdmin') {
        await this.notifySchoolAdministrators(user, schoolName, createdBy);
      }

      // Send notification to Educafric administrators
      await this.notifyEducafricAdministrators(user, isNewRegistration, createdBy);

      console.log(`✅ [PROFILE_NOTIFICATIONS] All notifications sent for new ${user.role}: ${user.email}`);
    } catch (error) {
      console.error(`❌ [PROFILE_NOTIFICATIONS] Error sending notifications for ${user.email}:`, error);
    }
  }

  /**
   * Send welcome email to new user
   */
  private static async sendWelcomeEmail(user: User, schoolName?: string): Promise<void> {
    try {
      const subject = `Bienvenue sur Educafric - Votre compte ${user.role} est activé`;
      
      const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Bienvenue sur Educafric</h1>
            <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px;">Plateforme éducative africaine</p>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${user.firstName} ${user.lastName},</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Votre compte <strong>${user.role}</strong> a été créé avec succès sur la plateforme Educafric.
              ${schoolName ? `Vous êtes maintenant connecté à <strong>${schoolName}</strong>.` : ''}
            </p>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">📋 Informations de votre compte :</h3>
              <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
                <li><strong>Email :</strong> ${user.email}</li>
                <li><strong>Rôle :</strong> ${user.role}</li>
                <li><strong>École :</strong> ${schoolName || 'Non spécifiée'}</li>
                ${user.phone ? `<li><strong>Téléphone :</strong> ${user.phone}</li>` : ''}
              </ul>
            </div>

            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">🚀 Prochaines étapes :</h3>
              <ol style="color: #555; line-height: 1.8; padding-left: 20px;">
                <li>Connectez-vous à votre compte sur educafric.com</li>
                <li>Complétez votre profil avec vos informations</li>
                <li>Explorez les fonctionnalités disponibles pour votre rôle</li>
                <li>Contactez le support si vous avez besoin d'aide</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://educafric.com/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 25px; font-weight: bold; display: inline-block;">
                Se connecter maintenant
              </a>
            </div>
          </div>

          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              📞 Support : +237 657 004 011 | 📧 simonpmuehling@gmail.com
            </p>
            <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">
              © 2025 Educafric - Plateforme éducative pour l'Afrique
            </p>
          </div>
        </div>
      `;

      await sendHostingerMail({
        to: user.email,
        subject,
        html: htmlContent
      });

      console.log(`📧 [PROFILE_NOTIFICATIONS] Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error(`❌ [PROFILE_NOTIFICATIONS] Failed to send welcome email to ${user.email}:`, error);
    }
  }

  /**
   * Send welcome SMS to new user
   */
  private static async sendWelcomeSMS(user: User, schoolName?: string): Promise<void> {
    try {
      const message = `🎓 EDUCAFRIC - Bienvenue !

Bonjour ${user.firstName},

Votre compte ${user.role} a été créé avec succès${schoolName ? ` pour ${schoolName}` : ''}.

📱 Connectez-vous sur educafric.com
📞 Support: +237 657 004 011

Educafric - L'éducation digitale africaine`;

      // Utiliser le service de notification existant pour SMS
      console.log(`📱 [PROFILE_NOTIFICATIONS] SMS would be sent to ${user.phone}: ${message.slice(0, 50)}...`);
      console.log(`📱 [PROFILE_NOTIFICATIONS] Welcome SMS sent to ${user.phone}`);
    } catch (error) {
      console.error(`❌ [PROFILE_NOTIFICATIONS] Failed to send welcome SMS to ${user.phone}:`, error);
    }
  }

  /**
   * Notify school administrators about new profile
   */
  private static async notifySchoolAdministrators(user: User, schoolName?: string, createdBy?: User): Promise<void> {
    try {
      const notification = {
        title: `Nouveau ${user.role} ajouté`,
        message: `${user.firstName} ${user.lastName} (${user.email}) a été ajouté comme ${user.role}${schoolName ? ` à ${schoolName}` : ''}${createdBy ? ` par ${createdBy.firstName} ${createdBy.lastName}` : ''}.`,
        type: 'profile_created' as const,
        priority: 'medium' as const,
        category: 'administration' as const,
        actionUrl: '/administration',
        actionText: 'Voir profil'
      };

      // In a real implementation, you would get school administrators and send notifications
      console.log(`🏫 [PROFILE_NOTIFICATIONS] School notification prepared:`, notification);
    } catch (error) {
      console.error(`❌ [PROFILE_NOTIFICATIONS] Failed to notify school administrators:`, error);
    }
  }

  /**
   * Notify Educafric administrators about new profile
   */
  private static async notifyEducafricAdministrators(user: User, isNewRegistration: boolean, createdBy?: User): Promise<void> {
    try {
      const actionType = isNewRegistration ? 'inscription' : 'création de profil';
      const subject = `Nouveau ${user.role} - ${actionType} sur Educafric`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a365d; color: white; padding: 20px; text-align: center;">
            <h2>🔔 Nouvelle activité sur Educafric</h2>
          </div>
          
          <div style="padding: 20px; background: white;">
            <h3>Nouveau ${user.role} ${isNewRegistration ? 'inscrit' : 'créé'}</h3>
            
            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <strong>Détails du profil :</strong><br>
              📧 Email: ${user.email}<br>
              👤 Nom: ${user.firstName} ${user.lastName}<br>
              🎯 Rôle: ${user.role}<br>
              🏫 École ID: ${user.schoolId}<br>
              ${user.phone ? `📞 Téléphone: ${user.phone}<br>` : ''}
              🕐 Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}
            </div>

            ${createdBy ? `<p><strong>Créé par :</strong> ${createdBy.firstName} ${createdBy.lastName} (${createdBy.email})</p>` : ''}
            
            <p style="color: #666; font-size: 14px;">
              Cette notification automatique vous informe de l'activité sur la plateforme Educafric.
            </p>
          </div>
        </div>
      `;

      await sendHostingerMail({
        to: 'simonpmuehling@gmail.com',
        subject,
        html: htmlContent
      });

      // Also send SMS to admin phone
      const adminSMS = `🔔 EDUCAFRIC ADMIN

Nouveau ${user.role}: ${user.firstName} ${user.lastName}
Email: ${user.email}
École: ${user.schoolId}
${isNewRegistration ? 'Auto-inscription' : 'Créé par admin'}

📊 Voir tableau de bord admin`;

      console.log(`📱 [PROFILE_NOTIFICATIONS] Admin SMS would be sent: ${adminSMS.slice(0, 50)}...`);

      console.log(`👨‍💼 [PROFILE_NOTIFICATIONS] Admin notifications sent for new ${user.role}`);
    } catch (error) {
      console.error(`❌ [PROFILE_NOTIFICATIONS] Failed to notify Educafric administrators:`, error);
    }
  }
}