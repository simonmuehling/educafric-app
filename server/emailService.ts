import nodemailer from 'nodemailer';

// Configuration du service email Hostinger
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER || 'noreply@educafric.com',
    pass: process.env.EMAIL_PASSWORD || ''
  },
  tls: {
    rejectUnauthorized: false // Permet les certificats auto-signés
  }
});

interface GoodbyeEmailData {
  userEmail: string;
  userName: string;
  userType: 'teacher' | 'student' | 'parent' | 'freelancer' | 'commercial' | 'siteadmin';
  language: 'fr' | 'en';
}

const goodbyeEmailTemplates = {
  fr: {
    subject: "Au revoir de l'équipe EDUCAFRIC",
    html: (userData: GoodbyeEmailData) => `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Au revoir de EDUCAFRIC</title>
        <style>
          body { font-family: 'Nunito', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f7f9fc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .message { font-size: 16px; margin-bottom: 25px; }
          .highlight { background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef; }
          .footer p { margin: 5px 0; font-size: 14px; color: #666; }
          .logo { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 EDUCAFRIC</div>
            <h1>Au revoir ${userData.userName}</h1>
          </div>
          
          <div class="content">
            <div class="message">
              <p>Cher(e) ${userData.userName},</p>
              
              <p>Nous avons bien reçu votre demande de suppression de compte EDUCAFRIC. Votre compte ${userData.userType} a été définitivement supprimé de notre plateforme.</p>
              
              <div class="highlight">
                <h3>🌟 Merci pour votre confiance</h3>
                <p>Nous espérons que EDUCAFRIC vous a été utile pendant votre parcours éducatif. Votre participation a contribué à l'amélioration de l'éducation en Afrique.</p>
              </div>
              
              <p><strong>Ce qui a été supprimé :</strong></p>
              <ul>
                <li>✅ Toutes vos données personnelles</li>
                <li>✅ Votre historique de connexion</li>
                <li>✅ Vos préférences et paramètres</li>
                <li>✅ Tous les fichiers associés à votre compte</li>
              </ul>
              
              <p><strong>Vous souhaitez revenir ?</strong></p>
              <p>Vous êtes toujours le(la) bienvenu(e) pour créer un nouveau compte sur EDUCAFRIC à tout moment. Notre plateforme continue d'évoluer pour mieux servir la communauté éducative africaine.</p>
              
              <p>Si vous avez des questions ou des préoccupations, n'hésitez pas à contacter notre équipe support à <a href="mailto:support@educafric.com">support@educafric.com</a>.</p>
              
              <p>Nous vous souhaitons beaucoup de succès dans vos futurs projets éducatifs !</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe EDUCAFRIC</strong><br>
              <em>Révolutionner l'éducation en Afrique</em></p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>EDUCAFRIC - Plateforme Éducative Africaine</strong></p>
            <p>Email: support@educafric.com | Web: www.educafric.com</p>
            <p>&copy; 2025 EDUCAFRIC. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  en: {
    subject: "Goodbye from the EDUCAFRIC team",
    html: (userData: GoodbyeEmailData) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Goodbye from EDUCAFRIC</title>
        <style>
          body { font-family: 'Nunito', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f7f9fc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .message { font-size: 16px; margin-bottom: 25px; }
          .highlight { background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef; }
          .footer p { margin: 5px 0; font-size: 14px; color: #666; }
          .logo { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 EDUCAFRIC</div>
            <h1>Goodbye ${userData.userName}</h1>
          </div>
          
          <div class="content">
            <div class="message">
              <p>Dear ${userData.userName},</p>
              
              <p>We have received your request to delete your EDUCAFRIC account. Your ${userData.userType} account has been permanently removed from our platform.</p>
              
              <div class="highlight">
                <h3>🌟 Thank you for your trust</h3>
                <p>We hope EDUCAFRIC was helpful during your educational journey. Your participation has contributed to improving education in Africa.</p>
              </div>
              
              <p><strong>What has been deleted:</strong></p>
              <ul>
                <li>✅ All your personal data</li>
                <li>✅ Your login history</li>
                <li>✅ Your preferences and settings</li>
                <li>✅ All files associated with your account</li>
              </ul>
              
              <p><strong>Want to come back?</strong></p>
              <p>You are always welcome to create a new account on EDUCAFRIC at any time. Our platform continues to evolve to better serve the African educational community.</p>
              
              <p>If you have any questions or concerns, please feel free to contact our support team at <a href="mailto:support@educafric.com">support@educafric.com</a>.</p>
              
              <p>We wish you much success in your future educational projects!</p>
              
              <p>Best regards,<br>
              <strong>The EDUCAFRIC Team</strong><br>
              <em>Revolutionizing Education in Africa</em></p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>EDUCAFRIC - African Educational Platform</strong></p>
            <p>Email: support@educafric.com | Web: www.educafric.com</p>
            <p>&copy; 2025 EDUCAFRIC. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

export async function sendGoodbyeEmail(userData: GoodbyeEmailData): Promise<boolean> {
  try {
    const template = goodbyeEmailTemplates[userData.language] || goodbyeEmailTemplates.fr;
    
    const mailOptions = {
      from: `"EDUCAFRIC Platform" <noreply@educafric.com>`,
      to: userData.userEmail,
      subject: template.subject,
      html: template.html(userData)
    };

    console.log(`[EMAIL_SERVICE] Sending goodbye email to ${userData.userEmail} (${userData.language})`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL_SERVICE] ✅ Goodbye email sent successfully: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error('[EMAIL_SERVICE] ❌ Error sending goodbye email:', error);
    return false;
  }
}

// Fonction de test de la configuration email
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('[EMAIL_SERVICE] ✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('[EMAIL_SERVICE] ❌ Email configuration error:', error);
    return false;
  }
}