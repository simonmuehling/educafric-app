import { hostingerMailService } from './hostingerMailService';

interface SchoolWelcomeData {
  schoolName: string;
  adminName: string;
  adminEmail: string;
  subscriptionPlan: string;
  registrationDate: string;
}

class WelcomeEmailService {
  
  /**
   * CRITICAL: Send welcome email to new school subscribers via Hostinger SMTP
   * Called automatically when school registers/subscribes
   */
  async sendSchoolWelcomeEmail(schoolData: SchoolWelcomeData): Promise<boolean> {
    try {
      console.log(`[WELCOME_EMAIL] 🏫 Sending welcome email to new school: ${schoolData.schoolName}`);
      console.log(`[WELCOME_EMAIL] Admin: ${schoolData.adminName} <${schoolData.adminEmail}>`);
      console.log(`[WELCOME_EMAIL] Plan: ${schoolData.subscriptionPlan}`);

      const welcomeEmailHTML = this.generateSchoolWelcomeHTML(schoolData);
      const welcomeEmailText = this.generateSchoolWelcomeText(schoolData);

      const emailSent = await hostingerMailService.sendEmail({
        to: schoolData.adminEmail,
        subject: `🎉 Bienvenue dans EDUCAFRIC - ${schoolData.schoolName}`,
        html: welcomeEmailHTML,
        text: welcomeEmailText
      });

      if (emailSent) {
        console.log(`[WELCOME_EMAIL] ✅ Welcome email sent successfully to ${schoolData.adminEmail}`);
        
        // Send notification copy to admin for tracking
        await this.sendAdminNotification(schoolData);
        
        return true;
      } else {
        console.error(`[WELCOME_EMAIL] ❌ Failed to send welcome email to ${schoolData.adminEmail}`);
        return false;
      }

    } catch (error: any) {
      console.error(`[WELCOME_EMAIL] ❌ Error sending welcome email:`, error);
      return false;
    }
  }

  private generateSchoolWelcomeHTML(data: SchoolWelcomeData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .highlight { background: #e7f3ff; padding: 15px; border-left: 4px solid #0079f2; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Bienvenue dans EDUCAFRIC !</h1>
            <p>Votre plateforme éducative digitale au Cameroun</p>
        </div>
        
        <div class="content">
            <h2>Félicitations ${data.adminName} !</h2>
            
            <p>Nous sommes ravis d'accueillir <strong>${data.schoolName}</strong> dans la famille EDUCAFRIC !</p>
            
            <div class="highlight">
                <h3>📋 Détails de votre abonnement :</h3>
                <ul>
                    <li><strong>École :</strong> ${data.schoolName}</li>
                    <li><strong>Plan :</strong> ${data.subscriptionPlan}</li>
                    <li><strong>Date d'inscription :</strong> ${data.registrationDate}</li>
                    <li><strong>Email administrateur :</strong> ${data.adminEmail}</li>
                </ul>
            </div>

            <h3>🚀 Premiers pas recommandés :</h3>
            <ol>
                <li><strong>Connectez-vous à votre tableau de bord</strong> avec vos identifiants</li>
                <li><strong>Configurez les informations de votre école</strong> (logo, coordonnées)</li>
                <li><strong>Ajoutez vos enseignants</strong> et créez leurs comptes</li>
                <li><strong>Créez les classes</strong> et inscrivez vos élèves</li>
                <li><strong>Invitez les parents</strong> à rejoindre la plateforme</li>
            </ol>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://educafric.com/login" class="button">🎯 Accéder à votre tableau de bord</a>
            </div>

            <h3>📞 Support et Assistance :</h3>
            <p>Notre équipe est là pour vous accompagner :</p>
            <ul>
                <li><strong>Email :</strong> info@educafric.com</li>
                <li><strong>Téléphone :</strong> +237 656 200 472</li>
                <li><strong>WhatsApp :</strong> +237 656 200 472</li>
                <li><strong>Support technique :</strong> Disponible 24h/7j</li>
            </ul>

            <div class="highlight">
                <h3>💡 Formation et Ressources :</h3>
                <p>Nous organisons des sessions de formation gratuites pour vous aider à maîtriser toutes les fonctionnalités. Contactez-nous pour programmer une session personnalisée pour votre équipe.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>EDUCAFRIC - Votre partenaire technologique éducatif</strong></p>
            <p>Plateforme de gestion scolaire bilingue pour l'Afrique</p>
            <p style="font-size: 12px;">© 2025 EDUCAFRIC. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateSchoolWelcomeText(data: SchoolWelcomeData): string {
    return `
🎉 BIENVENUE DANS EDUCAFRIC !

Félicitations ${data.adminName} !

Nous sommes ravis d'accueillir ${data.schoolName} dans la famille EDUCAFRIC !

📋 DÉTAILS DE VOTRE ABONNEMENT :
- École : ${data.schoolName}
- Plan : ${data.subscriptionPlan}
- Date d'inscription : ${data.registrationDate}
- Email administrateur : ${data.adminEmail}

🚀 PREMIERS PAS RECOMMANDÉS :
1. Connectez-vous à votre tableau de bord avec vos identifiants
2. Configurez les informations de votre école (logo, coordonnées)
3. Ajoutez vos enseignants et créez leurs comptes
4. Créez les classes et inscrivez vos élèves
5. Invitez les parents à rejoindre la plateforme

🎯 Accédez à votre tableau de bord : https://educafric.com/login

📞 SUPPORT ET ASSISTANCE :
- Email : info@educafric.com
- Téléphone : +237 656 200 472
- WhatsApp : +237 656 200 472
- Support technique : Disponible 24h/7j

💡 FORMATION ET RESSOURCES :
Nous organisons des sessions de formation gratuites pour vous aider à maîtriser toutes les fonctionnalités. Contactez-nous pour programmer une session personnalisée pour votre équipe.

EDUCAFRIC - Votre partenaire technologique éducatif
Plateforme de gestion scolaire bilingue pour l'Afrique
© 2025 EDUCAFRIC. Tous droits réservés.
`;
  }

  private async sendAdminNotification(schoolData: SchoolWelcomeData): Promise<void> {
    try {
      await hostingerMailService.sendEmail({
        to: 'simonpmuehling@gmail.com',
        subject: `🏫 Nouvelle école inscrite : ${schoolData.schoolName}`,
        html: `
          <h2>Nouvelle inscription école</h2>
          <p><strong>École :</strong> ${schoolData.schoolName}</p>
          <p><strong>Administrateur :</strong> ${schoolData.adminName}</p>
          <p><strong>Email :</strong> ${schoolData.adminEmail}</p>
          <p><strong>Plan :</strong> ${schoolData.subscriptionPlan}</p>
          <p><strong>Date :</strong> ${schoolData.registrationDate}</p>
          <p><strong>Email de bienvenue :</strong> ✅ Envoyé</p>
        `,
        text: `Nouvelle école inscrite: ${schoolData.schoolName} - Admin: ${schoolData.adminName} (${schoolData.adminEmail}) - Plan: ${schoolData.subscriptionPlan}`
      });
      
      console.log(`[WELCOME_EMAIL] 📬 Admin notification sent for ${schoolData.schoolName}`);
    } catch (error) {
      console.error(`[WELCOME_EMAIL] Failed to send admin notification:`, error);
    }
  }

  /**
   * Send welcome email to individual users (teachers, parents, etc.)
   */
  async sendUserWelcomeEmail(userData: {
    name: string;
    email: string;
    role: string;
    schoolName: string;
  }): Promise<boolean> {
    try {
      const emailSent = await hostingerMailService.sendEmail({
        to: userData.email,
        subject: `Bienvenue dans EDUCAFRIC - ${userData.schoolName}`,
        html: `
          <h2>Bienvenue ${userData.name} !</h2>
          <p>Votre compte <strong>${userData.role}</strong> a été créé pour l'école <strong>${userData.schoolName}</strong>.</p>
          <p>Connectez-vous à votre tableau de bord : <a href="https://educafric.com/login">https://educafric.com/login</a></p>
          <p>Support : info@educafric.com | +237 656 200 472</p>
        `,
        text: `Bienvenue ${userData.name} ! Votre compte ${userData.role} a été créé pour l'école ${userData.schoolName}. Connectez-vous : https://educafric.com/login`
      });

      console.log(`[WELCOME_EMAIL] User welcome email sent to ${userData.email}: ${emailSent ? '✅' : '❌'}`);
      return emailSent;
    } catch (error) {
      console.error(`[WELCOME_EMAIL] Error sending user welcome email:`, error);
      return false;
    }
  }
}

export const welcomeEmailService = new WelcomeEmailService();