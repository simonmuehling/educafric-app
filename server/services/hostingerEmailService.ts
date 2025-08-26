import nodemailer from 'nodemailer';

// Educafric Contact Information and Social Media
const EDUCAFRIC_CONTACT = {
  email: 'contact@educafric.com',
  phone: '+237 699 123 456',
  address: 'Douala & Yaoundé, Cameroun',
  website: 'https://educafric.com',
  socialMedia: {
    facebook: 'https://facebook.com/educafriccom',
    twitter: 'https://twitter.com/educafric',
    instagram: 'https://instagram.com/educafric',
    linkedin: 'https://linkedin.com/company/educafric',
    youtube: 'https://youtube.com/@educafric'
  }
};

// Hostinger SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.HOSTINGER_EMAIL || 'simonpmuehling@gmail.com',
    pass: process.env.HOSTINGER_PASSWORD || process.env.EMAIL_PASSWORD
  }
});

// Bilingual Email Templates
interface EmailTemplate {
  subject: string;
  html: (data: any) => string;
}

interface BilingualTemplate {
  fr: EmailTemplate;
  en: EmailTemplate;
}

// Social Media Footer HTML
const getSocialMediaFooter = (language: 'fr' | 'en') => {
  const text = language === 'fr' ? 'Suivez-nous sur' : 'Follow us on';
  return `
    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">${text}:</p>
      <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
        <a href="${EDUCAFRIC_CONTACT.socialMedia.facebook}" style="text-decoration: none; color: #1877f2;">
          <img src="https://cdn-icons-png.flaticon.com/24/174/174848.png" alt="Facebook" style="width: 24px; height: 24px;">
        </a>
        <a href="${EDUCAFRIC_CONTACT.socialMedia.twitter}" style="text-decoration: none; color: #1da1f2;">
          <img src="https://cdn-icons-png.flaticon.com/24/174/174876.png" alt="Twitter" style="width: 24px; height: 24px;">
        </a>
        <a href="${EDUCAFRIC_CONTACT.socialMedia.instagram}" style="text-decoration: none; color: #e4405f;">
          <img src="https://cdn-icons-png.flaticon.com/24/174/174855.png" alt="Instagram" style="width: 24px; height: 24px;">
        </a>
        <a href="${EDUCAFRIC_CONTACT.socialMedia.linkedin}" style="text-decoration: none; color: #0077b5;">
          <img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" style="width: 24px; height: 24px;">
        </a>
        <a href="${EDUCAFRIC_CONTACT.socialMedia.youtube}" style="text-decoration: none; color: #ff0000;">
          <img src="https://cdn-icons-png.flaticon.com/24/174/174883.png" alt="YouTube" style="width: 24px; height: 24px;">
        </a>
      </div>
    </div>
  `;
};

// Contact Footer HTML
const getContactFooter = (language: 'fr' | 'en') => {
  const contactText = language === 'fr' ? 'Contactez-nous' : 'Contact us';
  const addressText = language === 'fr' ? 'Adresse' : 'Address';
  
  return `
    <div style="margin-top: 30px; padding: 20px; background-color: #1f2937; color: white; border-radius: 10px;">
      <h3 style="color: #f59e0b; margin-bottom: 15px;">${contactText}</h3>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${EDUCAFRIC_CONTACT.email}</p>
      <p style="margin: 5px 0;"><strong>Téléphone:</strong> ${EDUCAFRIC_CONTACT.phone}</p>
      <p style="margin: 5px 0;"><strong>${addressText}:</strong> ${EDUCAFRIC_CONTACT.address}</p>
      <p style="margin: 5px 0;"><strong>Web:</strong> <a href="${EDUCAFRIC_CONTACT.website}" style="color: #f59e0b;">${EDUCAFRIC_CONTACT.website}</a></p>
    </div>
  `;
};

// Base Email Template
const getBaseTemplate = (content: string, language: 'fr' | 'en') => `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EDUCAFRIC</title>
</head>
<body style="font-family: 'Nunito', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <img src="https://educafric.com/educafric-logo-128.png" alt="EDUCAFRIC" style="height: 60px; margin-bottom: 10px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">EDUCAFRIC</h1>
        <p style="color: #e5e7eb; margin: 5px 0 0 0; font-size: 14px;">${language === 'fr' ? 'Plateforme Éducative Africaine' : 'African Educational Platform'}</p>
    </div>

    <!-- Content -->
    ${content}

    <!-- Social Media -->
    ${getSocialMediaFooter(language)}

    <!-- Contact Footer -->
    ${getContactFooter(language)}

    <!-- Legal Footer -->
    <div style="text-align: center; margin-top: 30px; padding: 15px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        <p>© 2025 EDUCAFRIC. ${language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
        <p>${language === 'fr' ? 'Vous recevez cet email car vous êtes membre de la plateforme EDUCAFRIC.' : 'You are receiving this email because you are a member of the EDUCAFRIC platform.'}</p>
    </div>
</body>
</html>
`;

// 1. Welcome Email Templates
export const welcomeEmailTemplates: BilingualTemplate = {
  fr: {
    subject: '🎉 Bienvenue sur EDUCAFRIC - Votre plateforme éducative africaine !',
    html: (data: { userName: string; userType: string; schoolName?: string }) => getBaseTemplate(`
      <div style="padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Bienvenue ${data.userName} ! 🎓</h2>
        
        <p style="font-size: 16px; margin-bottom: 15px;">
          Nous sommes ravis de vous accueillir sur <strong>EDUCAFRIC</strong>, la plateforme éducative révolutionnaire pour l'Afrique !
        </p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #7c3aed; margin-top: 0;">🚀 Votre compte ${data.userType} est maintenant actif</h3>
          ${data.schoolName ? `<p><strong>École :</strong> ${data.schoolName}</p>` : ''}
          <p><strong>Type de compte :</strong> ${data.userType}</p>
        </div>

        <h3 style="color: #1f2937;">🌟 Découvrez vos fonctionnalités :</h3>
        <ul style="margin: 15px 0;">
          <li>📱 Tableau de bord personnalisé</li>
          <li>🔔 Notifications en temps réel</li>
          <li>📍 Géolocalisation de sécurité</li>
          <li>💬 Communication SMS & WhatsApp</li>
          <li>📊 Rapports académiques complets</li>
          <li>🌍 Interface bilingue (Français/Anglais)</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${EDUCAFRIC_CONTACT.website}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            🎯 Accéder à EDUCAFRIC
          </a>
        </div>

        <p style="font-style: italic; color: #6b7280;">
          Ensemble, révolutionnons l'éducation en Afrique ! 🌍✨
        </p>
      </div>
    `, 'fr')
  },
  en: {
    subject: '🎉 Welcome to EDUCAFRIC - Your African Educational Platform!',
    html: (data: { userName: string; userType: string; schoolName?: string }) => getBaseTemplate(`
      <div style="padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome ${data.userName}! 🎓</h2>
        
        <p style="font-size: 16px; margin-bottom: 15px;">
          We're thrilled to welcome you to <strong>EDUCAFRIC</strong>, the revolutionary educational platform for Africa!
        </p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #7c3aed; margin-top: 0;">🚀 Your ${data.userType} account is now active</h3>
          ${data.schoolName ? `<p><strong>School:</strong> ${data.schoolName}</p>` : ''}
          <p><strong>Account Type:</strong> ${data.userType}</p>
        </div>

        <h3 style="color: #1f2937;">🌟 Discover your features:</h3>
        <ul style="margin: 15px 0;">
          <li>📱 Personalized dashboard</li>
          <li>🔔 Real-time notifications</li>
          <li>📍 Safety geolocation</li>
          <li>💬 SMS & WhatsApp communication</li>
          <li>📊 Comprehensive academic reports</li>
          <li>🌍 Bilingual interface (French/English)</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${EDUCAFRIC_CONTACT.website}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            🎯 Access EDUCAFRIC
          </a>
        </div>

        <p style="font-style: italic; color: #6b7280;">
          Together, let's revolutionize education in Africa! 🌍✨
        </p>
      </div>
    `, 'en')
  }
};

// 2. Weekly Progress Report Templates
export const weeklyProgressTemplates: BilingualTemplate = {
  fr: {
    subject: '📊 Rapport Hebdomadaire - Progrès Académique',
    html: (data: { studentName: string; parentName: string; grades: any[]; attendance: number; week: string }) => getBaseTemplate(`
      <div style="padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">📊 Rapport Hebdomadaire</h2>
        
        <p style="font-size: 16px; margin-bottom: 15px;">
          Cher(e) ${data.parentName}, voici le rapport hebdomadaire de <strong>${data.studentName}</strong> pour la semaine du ${data.week}.
        </p>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #059669; margin-top: 0;">📈 Résumé de Performance</h3>
          <p><strong>Assiduité :</strong> ${data.attendance}%</p>
          <p><strong>Nombre de matières :</strong> ${data.grades.length}</p>
        </div>

        <h3 style="color: #1f2937;">📚 Détail des Notes :</h3>
        <div style="margin: 15px 0;">
          ${data.grades.map(grade => `
            <div style="background-color: #f8fafc; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 3px solid #3b82f6;">
              <p style="margin: 0;"><strong>${grade.subject}:</strong> ${grade.score}/20 - ${grade.comment}</p>
            </div>
          `).join('')}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${EDUCAFRIC_CONTACT.website}/parent-dashboard" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            📱 Voir le Tableau de Bord Complet
          </a>
        </div>
      </div>
    `, 'fr')
  },
  en: {
    subject: '📊 Weekly Report - Academic Progress',
    html: (data: { studentName: string; parentName: string; grades: any[]; attendance: number; week: string }) => getBaseTemplate(`
      <div style="padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">📊 Weekly Report</h2>
        
        <p style="font-size: 16px; margin-bottom: 15px;">
          Dear ${data.parentName}, here is <strong>${data.studentName}</strong>'s weekly report for the week of ${data.week}.
        </p>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #059669; margin-top: 0;">📈 Performance Summary</h3>
          <p><strong>Attendance:</strong> ${data.attendance}%</p>
          <p><strong>Number of subjects:</strong> ${data.grades.length}</p>
        </div>

        <h3 style="color: #1f2937;">📚 Grade Details:</h3>
        <div style="margin: 15px 0;">
          ${data.grades.map(grade => `
            <div style="background-color: #f8fafc; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 3px solid #3b82f6;">
              <p style="margin: 0;"><strong>${grade.subject}:</strong> ${grade.score}/20 - ${grade.comment}</p>
            </div>
          `).join('')}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${EDUCAFRIC_CONTACT.website}/parent-dashboard" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            📱 View Complete Dashboard
          </a>
        </div>
      </div>
    `, 'en')
  }
};

// 3. Geolocation Safety Alert Templates
export const geolocationAlertTemplates: BilingualTemplate = {
  fr: {
    subject: '🚨 Alerte de Sécurité - Géolocalisation',
    html: (data: { studentName: string; parentName: string; location: string; alertType: string; timestamp: string }) => getBaseTemplate(`
      <div style="padding: 20px;">
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
          <h2 style="color: #dc2626; margin-top: 0;">🚨 Alerte de Sécurité</h2>
          <p style="font-size: 16px; margin-bottom: 15px;">
            <strong>${data.studentName}</strong> - ${data.alertType}
          </p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📍 Détails de l'Alerte</h3>
          <p><strong>Étudiant(e) :</strong> ${data.studentName}</p>
          <p><strong>Type d'alerte :</strong> ${data.alertType}</p>
          <p><strong>Localisation :</strong> ${data.location}</p>
          <p><strong>Heure :</strong> ${data.timestamp}</p>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>💡 Action Recommandée :</strong> Vérifiez immédiatement la situation de votre enfant via l'application EDUCAFRIC ou contactez l'école.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${EDUCAFRIC_CONTACT.website}/geolocation-tracking" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            🔍 Localiser Maintenant
          </a>
        </div>
      </div>
    `, 'fr')
  },
  en: {
    subject: '🚨 Safety Alert - Geolocation',
    html: (data: { studentName: string; parentName: string; location: string; alertType: string; timestamp: string }) => getBaseTemplate(`
      <div style="padding: 20px;">
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
          <h2 style="color: #dc2626; margin-top: 0;">🚨 Safety Alert</h2>
          <p style="font-size: 16px; margin-bottom: 15px;">
            <strong>${data.studentName}</strong> - ${data.alertType}
          </p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📍 Alert Details</h3>
          <p><strong>Student:</strong> ${data.studentName}</p>
          <p><strong>Alert type:</strong> ${data.alertType}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Time:</strong> ${data.timestamp}</p>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>💡 Recommended Action:</strong> Check your child's situation immediately via the EDUCAFRIC app or contact the school.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${EDUCAFRIC_CONTACT.website}/geolocation-tracking" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            🔍 Locate Now
          </a>
        </div>
      </div>
    `, 'en')
  }
};

// 4. Assignment Notification Templates
export const assignmentNotificationTemplates: BilingualTemplate = {
  fr: {
    subject: '📝 Nouveau Devoir Assigné',
    html: (data: { studentName: string; parentName: string; assignment: string; subject: string; dueDate: string; teacherName: string }) => getBaseTemplate(`
      <div style="padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">📝 Nouveau Devoir</h2>
        
        <p style="font-size: 16px; margin-bottom: 15px;">
          Cher(e) ${data.parentName}, un nouveau devoir a été assigné à <strong>${data.studentName}</strong>.
        </p>

        <div style="background-color: #eff6ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1d4ed8; margin-top: 0;">📚 Détails du Devoir</h3>
          <p><strong>Matière :</strong> ${data.subject}</p>
          <p><strong>Professeur :</strong> ${data.teacherName}</p>
          <p><strong>Devoir :</strong> ${data.assignment}</p>
          <p><strong>Date limite :</strong> ${data.dueDate}</p>
        </div>

        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #0c4a6e;">
            <strong>💡 Conseil :</strong> Aidez votre enfant à planifier son travail pour respecter la date limite.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${EDUCAFRIC_CONTACT.website}/homework-tracker" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            📋 Voir Tous les Devoirs
          </a>
        </div>
      </div>
    `, 'fr')
  },
  en: {
    subject: '📝 New Assignment Posted',
    html: (data: { studentName: string; parentName: string; assignment: string; subject: string; dueDate: string; teacherName: string }) => getBaseTemplate(`
      <div style="padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">📝 New Assignment</h2>
        
        <p style="font-size: 16px; margin-bottom: 15px;">
          Dear ${data.parentName}, a new assignment has been posted for <strong>${data.studentName}</strong>.
        </p>

        <div style="background-color: #eff6ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1d4ed8; margin-top: 0;">📚 Assignment Details</h3>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Teacher:</strong> ${data.teacherName}</p>
          <p><strong>Assignment:</strong> ${data.assignment}</p>
          <p><strong>Due Date:</strong> ${data.dueDate}</p>
        </div>

        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #0c4a6e;">
            <strong>💡 Tip:</strong> Help your child plan their work to meet the deadline.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${EDUCAFRIC_CONTACT.website}/homework-tracker" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            📋 View All Assignments
          </a>
        </div>
      </div>
    `, 'en')
  }
};

// 5. Subscription & Payment Templates
export const subscriptionEmailTemplates: BilingualTemplate = {
  fr: {
    subject: '💳 Confirmation de Paiement EDUCAFRIC',
    html: (data: { userName: string; amount: string; plan: string; invoiceNumber: string; renewalDate: string }) => getBaseTemplate(`
      <div style="padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">💳 Paiement Confirmé</h2>
        
        <p style="font-size: 16px; margin-bottom: 15px;">
          Merci ${data.userName} ! Votre paiement a été traité avec succès.
        </p>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #059669; margin-top: 0;">✅ Détails du Paiement</h3>
          <p><strong>Montant :</strong> ${data.amount} FCFA</p>
          <p><strong>Plan :</strong> ${data.plan}</p>
          <p><strong>N° Facture :</strong> ${data.invoiceNumber}</p>
          <p><strong>Renouvellement :</strong> ${data.renewalDate}</p>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>🎉 Félicitations !</strong> Vous avez maintenant accès à toutes les fonctionnalités premium d'EDUCAFRIC.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${EDUCAFRIC_CONTACT.website}/subscription-status" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            🎯 Accéder aux Fonctionnalités Premium
          </a>
        </div>
      </div>
    `, 'fr')
  },
  en: {
    subject: '💳 EDUCAFRIC Payment Confirmation',
    html: (data: { userName: string; amount: string; plan: string; invoiceNumber: string; renewalDate: string }) => getBaseTemplate(`
      <div style="padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">💳 Payment Confirmed</h2>
        
        <p style="font-size: 16px; margin-bottom: 15px;">
          Thank you ${data.userName}! Your payment has been processed successfully.
        </p>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #059669; margin-top: 0;">✅ Payment Details</h3>
          <p><strong>Amount:</strong> ${data.amount} FCFA</p>
          <p><strong>Plan:</strong> ${data.plan}</p>
          <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
          <p><strong>Renewal:</strong> ${data.renewalDate}</p>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>🎉 Congratulations!</strong> You now have access to all EDUCAFRIC premium features.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${EDUCAFRIC_CONTACT.website}/subscription-status" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            🎯 Access Premium Features
          </a>
        </div>
      </div>
    `, 'en')
  }
};

// Email Sending Functions
export async function sendWelcomeEmail(userData: { 
  userEmail: string; 
  userName: string; 
  userType: string; 
  language: 'fr' | 'en';
  schoolName?: string;
}): Promise<boolean> {
  try {
    const template = welcomeEmailTemplates[userData.language] || welcomeEmailTemplates.fr;
    
    const mailOptions = {
      from: `"EDUCAFRIC Platform" <${process.env.HOSTINGER_EMAIL || 'simonpmuehling@gmail.com'}>`,
      to: userData.userEmail,
      subject: template.subject,
      html: template.html(userData)
    };

    console.log(`[HOSTINGER_EMAIL] Sending welcome email to ${userData.userEmail} (${userData.language})`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[HOSTINGER_EMAIL] ✅ Welcome email sent successfully: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error('[HOSTINGER_EMAIL] ❌ Error sending welcome email:', error);
    return false;
  }
}

export async function sendWeeklyProgressReport(data: {
  parentEmail: string;
  parentName: string;
  studentName: string;
  grades: any[];
  attendance: number;
  week: string;
  language: 'fr' | 'en';
}): Promise<boolean> {
  try {
    const template = weeklyProgressTemplates[data.language] || weeklyProgressTemplates.fr;
    
    const mailOptions = {
      from: `"EDUCAFRIC Platform" <${process.env.HOSTINGER_EMAIL || 'simonpmuehling@gmail.com'}>`,
      to: data.parentEmail,
      subject: template.subject,
      html: template.html(data)
    };

    console.log(`[HOSTINGER_EMAIL] Sending weekly progress report to ${data.parentEmail} (${data.language})`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[HOSTINGER_EMAIL] ✅ Weekly progress report sent successfully: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error('[HOSTINGER_EMAIL] ❌ Error sending weekly progress report:', error);
    return false;
  }
}

export async function sendGeolocationAlert(data: {
  parentEmail: string;
  parentName: string;
  studentName: string;
  location: string;
  alertType: string;
  timestamp: string;
  language: 'fr' | 'en';
}): Promise<boolean> {
  try {
    const template = geolocationAlertTemplates[data.language] || geolocationAlertTemplates.fr;
    
    const mailOptions = {
      from: `"EDUCAFRIC Platform" <${process.env.HOSTINGER_EMAIL || 'simonpmuehling@gmail.com'}>`,
      to: data.parentEmail,
      subject: template.subject,
      html: template.html(data)
    };

    console.log(`[HOSTINGER_EMAIL] Sending geolocation alert to ${data.parentEmail} (${data.language})`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[HOSTINGER_EMAIL] ✅ Geolocation alert sent successfully: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error('[HOSTINGER_EMAIL] ❌ Error sending geolocation alert:', error);
    return false;
  }
}

export async function sendAssignmentNotification(data: {
  parentEmail: string;
  parentName: string;
  studentName: string;
  assignment: string;
  subject: string;
  dueDate: string;
  teacherName: string;
  language: 'fr' | 'en';
}): Promise<boolean> {
  try {
    const template = assignmentNotificationTemplates[data.language] || assignmentNotificationTemplates.fr;
    
    const mailOptions = {
      from: `"EDUCAFRIC Platform" <${process.env.HOSTINGER_EMAIL || 'simonpmuehling@gmail.com'}>`,
      to: data.parentEmail,
      subject: template.subject,
      html: template.html(data)
    };

    console.log(`[HOSTINGER_EMAIL] Sending assignment notification to ${data.parentEmail} (${data.language})`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[HOSTINGER_EMAIL] ✅ Assignment notification sent successfully: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error('[HOSTINGER_EMAIL] ❌ Error sending assignment notification:', error);
    return false;
  }
}

export async function sendSubscriptionConfirmation(data: {
  userEmail: string;
  userName: string;
  amount: string;
  plan: string;
  invoiceNumber: string;
  renewalDate: string;
  language: 'fr' | 'en';
}): Promise<boolean> {
  try {
    const template = subscriptionEmailTemplates[data.language] || subscriptionEmailTemplates.fr;
    
    const mailOptions = {
      from: `"EDUCAFRIC Platform" <${process.env.HOSTINGER_EMAIL || 'simonpmuehling@gmail.com'}>`,
      to: data.userEmail,
      subject: template.subject,
      html: template.html(data)
    };

    console.log(`[HOSTINGER_EMAIL] Sending subscription confirmation to ${data.userEmail} (${data.language})`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[HOSTINGER_EMAIL] ✅ Subscription confirmation sent successfully: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error('[HOSTINGER_EMAIL] ❌ Error sending subscription confirmation:', error);
    return false;
  }
}

// Test Email Configuration
export async function testHostingerEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('[HOSTINGER_EMAIL] ✅ Hostinger email configuration is valid');
    return true;
  } catch (error) {
    console.error('[HOSTINGER_EMAIL] ❌ Hostinger email configuration error:', error);
    return false;
  }
}