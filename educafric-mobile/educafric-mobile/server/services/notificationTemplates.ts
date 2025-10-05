/**
 * EDUCAFRIC - Bilingual Notification Templates for Report Cards
 * 
 * Professional and contextual French/English templates for Email/SMS/WhatsApp
 * Designed for African educational systems with respectful, formal tone
 * 
 * Created: September 2025
 * Context: African Educational Technology Platform
 */

// ===== TEMPLATE VARIABLES INTERFACE =====
export interface TemplateVariables {
  studentName: string;
  className: string;
  term: string;
  academicYear: string;
  schoolName: string;
  parentName: string;
  schoolContact: string;
  downloadLink?: string;
  generalAverage?: number;
  classRank?: number;
  totalStudentsInClass?: number;
  teacherComments?: string;
  directorComments?: string;
  qrCode?: string;
}

// ===== EMAIL TEMPLATES =====
export const BULLETIN_EMAIL_TEMPLATES = {
  BULLETIN_NOTIFICATION: {
    fr: {
      subject: (variables: TemplateVariables) => 
        `Bulletin scolaire de ${variables.studentName} - ${variables.term} ${variables.academicYear}`,
      
      body: (variables: TemplateVariables) => `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bulletin Scolaire - ${variables.studentName}</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #2c3e50; 
                    margin: 0; 
                    padding: 0;
                    background-color: #f8f9fa;
                }
                .container { 
                    max-width: 650px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 10px; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 30px 20px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 24px; 
                    font-weight: 600;
                }
                .header p { 
                    margin: 10px 0 0 0; 
                    font-size: 16px; 
                    opacity: 0.9;
                }
                .content { 
                    padding: 30px; 
                }
                .greeting { 
                    font-size: 16px; 
                    margin-bottom: 20px; 
                    color: #2c3e50;
                }
                .student-info { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    border-left: 4px solid #667eea;
                }
                .student-info h3 { 
                    margin: 0 0 10px 0; 
                    color: #667eea; 
                    font-size: 18px;
                }
                .info-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 15px; 
                    margin-top: 10px;
                }
                .info-item { 
                    display: flex; 
                    flex-direction: column;
                }
                .info-label { 
                    font-weight: 600; 
                    color: #495057; 
                    font-size: 14px;
                }
                .info-value { 
                    color: #2c3e50; 
                    font-size: 16px;
                }
                .download-section { 
                    background: #e8f4f8; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    text-align: center;
                }
                .download-button { 
                    display: inline-block; 
                    background: #28a745; 
                    color: white; 
                    text-decoration: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-weight: 600; 
                    margin: 10px 0;
                }
                .contact-section { 
                    background: #fff3cd; 
                    padding: 15px; 
                    border-radius: 6px; 
                    margin: 20px 0; 
                    border-left: 4px solid #ffc107;
                }
                .footer { 
                    background: #2c3e50; 
                    color: white; 
                    text-align: center; 
                    padding: 25px; 
                    font-size: 14px;
                }
                .footer h4 { 
                    margin: 0 0 15px 0; 
                    color: #ecf0f1; 
                    font-size: 18px;
                }
                .footer p { 
                    margin: 5px 0; 
                    opacity: 0.8;
                }
                .signature { 
                    margin-top: 30px; 
                    padding-top: 20px; 
                    border-top: 2px solid #ecf0f1;
                }
                @media (max-width: 600px) {
                    .info-grid { grid-template-columns: 1fr; }
                    .container { margin: 0; border-radius: 0; }
                    .content { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 Bulletin Scolaire Disponible</h1>
                    <p>${variables.schoolName}</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        <p>Cher/Chère <strong>${variables.parentName}</strong>,</p>
                        <p>Nous avons l'honneur de vous informer que le bulletin scolaire de votre enfant est maintenant disponible sur la plateforme EDUCAFRIC.</p>
                    </div>
                    
                    <div class="student-info">
                        <h3>📚 Informations de l'Élève</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Nom de l'élève:</span>
                                <span class="info-value">${variables.studentName}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Classe:</span>
                                <span class="info-value">${variables.className}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Période:</span>
                                <span class="info-value">${variables.term}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Année Scolaire:</span>
                                <span class="info-value">${variables.academicYear}</span>
                            </div>
                        </div>
                        ${variables.generalAverage ? `
                        <div class="info-grid" style="margin-top: 15px;">
                            <div class="info-item">
                                <span class="info-label">Moyenne Générale:</span>
                                <span class="info-value">${variables.generalAverage}/20</span>
                            </div>
                            ${variables.classRank ? `
                            <div class="info-item">
                                <span class="info-label">Rang en Classe:</span>
                                <span class="info-value">${variables.classRank}/${variables.totalStudentsInClass}</span>
                            </div>
                            ` : ''}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="download-section">
                        <h3>📱 Consultation et Téléchargement</h3>
                        <p>Pour consulter et télécharger le bulletin complet :</p>
                        <ol style="text-align: left; max-width: 400px; margin: 15px auto;">
                            <li>Ouvrez l'application mobile EDUCAFRIC</li>
                            <li>Connectez-vous à votre compte parent</li>
                            <li>Accédez à la section "Bulletins"</li>
                            <li>Sélectionnez ${variables.studentName} - ${variables.term}</li>
                        </ol>
                        ${variables.downloadLink ? `
                        <a href="${variables.downloadLink}" class="download-button">
                            📄 Télécharger le Bulletin PDF
                        </a>
                        ` : ''}
                        ${variables.qrCode ? `
                        <div style="margin-top: 20px;">
                            <p><strong>🔍 Code de Vérification QR:</strong></p>
                            <p style="font-family: monospace; background: white; padding: 10px; border-radius: 4px; display: inline-block;">
                                ${variables.qrCode}
                            </p>
                            <p style="font-size: 12px; color: #6c757d;">
                                Ce code garantit l'authenticité du bulletin
                            </p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="contact-section">
                        <h4>💬 Questions ou Préoccupations ?</h4>
                        <p>N'hésitez pas à contacter l'administration de ${variables.schoolName} pour toute question concernant les résultats scolaires de votre enfant ou son parcours académique.</p>
                        <p><strong>Contact:</strong> ${variables.schoolContact}</p>
                        <p><em>Nous sommes là pour accompagner votre enfant vers la réussite scolaire.</em></p>
                    </div>
                </div>
                
                <div class="footer">
                    <h4>EDUCAFRIC</h4>
                    <p><strong>Technologie Éducative pour l'Afrique</strong></p>
                    <div class="signature">
                        <p>Cordialement,</p>
                        <p><strong>L'Équipe ${variables.schoolName}</strong></p>
                        <p style="margin-top: 15px;">
                            📧 ${variables.schoolContact}<br>
                            🌐 www.educafric.com<br>
                            📱 Application mobile disponible sur iOS et Android
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `
    },
    
    en: {
      subject: (variables: TemplateVariables) => 
        `School Report for ${variables.studentName} - ${variables.term} ${variables.academicYear}`,
      
      body: (variables: TemplateVariables) => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>School Report - ${variables.studentName}</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #2c3e50; 
                    margin: 0; 
                    padding: 0;
                    background-color: #f8f9fa;
                }
                .container { 
                    max-width: 650px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 10px; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 30px 20px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 24px; 
                    font-weight: 600;
                }
                .header p { 
                    margin: 10px 0 0 0; 
                    font-size: 16px; 
                    opacity: 0.9;
                }
                .content { 
                    padding: 30px; 
                }
                .greeting { 
                    font-size: 16px; 
                    margin-bottom: 20px; 
                    color: #2c3e50;
                }
                .student-info { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    border-left: 4px solid #667eea;
                }
                .student-info h3 { 
                    margin: 0 0 10px 0; 
                    color: #667eea; 
                    font-size: 18px;
                }
                .info-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 15px; 
                    margin-top: 10px;
                }
                .info-item { 
                    display: flex; 
                    flex-direction: column;
                }
                .info-label { 
                    font-weight: 600; 
                    color: #495057; 
                    font-size: 14px;
                }
                .info-value { 
                    color: #2c3e50; 
                    font-size: 16px;
                }
                .download-section { 
                    background: #e8f4f8; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    text-align: center;
                }
                .download-button { 
                    display: inline-block; 
                    background: #28a745; 
                    color: white; 
                    text-decoration: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-weight: 600; 
                    margin: 10px 0;
                }
                .contact-section { 
                    background: #fff3cd; 
                    padding: 15px; 
                    border-radius: 6px; 
                    margin: 20px 0; 
                    border-left: 4px solid #ffc107;
                }
                .footer { 
                    background: #2c3e50; 
                    color: white; 
                    text-align: center; 
                    padding: 25px; 
                    font-size: 14px;
                }
                .footer h4 { 
                    margin: 0 0 15px 0; 
                    color: #ecf0f1; 
                    font-size: 18px;
                }
                .footer p { 
                    margin: 5px 0; 
                    opacity: 0.8;
                }
                .signature { 
                    margin-top: 30px; 
                    padding-top: 20px; 
                    border-top: 2px solid #ecf0f1;
                }
                @media (max-width: 600px) {
                    .info-grid { grid-template-columns: 1fr; }
                    .container { margin: 0; border-radius: 0; }
                    .content { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 School Report Available</h1>
                    <p>${variables.schoolName}</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        <p>Dear <strong>Mr./Mrs. ${variables.parentName}</strong>,</p>
                        <p>We are pleased to inform you that your child's school report is now available on the EDUCAFRIC platform.</p>
                    </div>
                    
                    <div class="student-info">
                        <h3>📚 Student Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Student Name:</span>
                                <span class="info-value">${variables.studentName}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Class:</span>
                                <span class="info-value">${variables.className}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Term:</span>
                                <span class="info-value">${variables.term}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Academic Year:</span>
                                <span class="info-value">${variables.academicYear}</span>
                            </div>
                        </div>
                        ${variables.generalAverage ? `
                        <div class="info-grid" style="margin-top: 15px;">
                            <div class="info-item">
                                <span class="info-label">Overall Average:</span>
                                <span class="info-value">${variables.generalAverage}/20</span>
                            </div>
                            ${variables.classRank ? `
                            <div class="info-item">
                                <span class="info-label">Class Rank:</span>
                                <span class="info-value">${variables.classRank}/${variables.totalStudentsInClass}</span>
                            </div>
                            ` : ''}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="download-section">
                        <h3>📱 View and Download</h3>
                        <p>To view and download the complete report:</p>
                        <ol style="text-align: left; max-width: 400px; margin: 15px auto;">
                            <li>Open the EDUCAFRIC mobile application</li>
                            <li>Log in to your parent account</li>
                            <li>Navigate to "Reports" section</li>
                            <li>Select ${variables.studentName} - ${variables.term}</li>
                        </ol>
                        ${variables.downloadLink ? `
                        <a href="${variables.downloadLink}" class="download-button">
                            📄 Download PDF Report
                        </a>
                        ` : ''}
                        ${variables.qrCode ? `
                        <div style="margin-top: 20px;">
                            <p><strong>🔍 QR Verification Code:</strong></p>
                            <p style="font-family: monospace; background: white; padding: 10px; border-radius: 4px; display: inline-block;">
                                ${variables.qrCode}
                            </p>
                            <p style="font-size: 12px; color: #6c757d;">
                                This code ensures the authenticity of the report
                            </p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="contact-section">
                        <h4>💬 Questions or Concerns?</h4>
                        <p>Please feel free to contact ${variables.schoolName} administration for any questions regarding your child's academic results or educational journey.</p>
                        <p><strong>Contact:</strong> ${variables.schoolContact}</p>
                        <p><em>We are here to support your child's academic success.</em></p>
                    </div>
                </div>
                
                <div class="footer">
                    <h4>EDUCAFRIC</h4>
                    <p><strong>Educational Technology for Africa</strong></p>
                    <div class="signature">
                        <p>Best regards,</p>
                        <p><strong>${variables.schoolName} Team</strong></p>
                        <p style="margin-top: 15px;">
                            📧 ${variables.schoolContact}<br>
                            🌐 www.educafric.com<br>
                            📱 Mobile app available on iOS and Android
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `
    }
  }
};

// ===== SMS TEMPLATES =====
export const BULLETIN_SMS_TEMPLATES = {
  BULLETIN_NOTIFICATION: {
    fr: (variables: TemplateVariables) => 
      `📋 ${variables.schoolName}: Bulletin de ${variables.studentName} (${variables.className}) - ${variables.term} maintenant disponible sur EDUCAFRIC. ${variables.generalAverage ? `Moyenne: ${variables.generalAverage}/20. ` : ''}Consultez l'app mobile. Infos: ${variables.schoolContact}`,
    
    en: (variables: TemplateVariables) => 
      `📋 ${variables.schoolName}: Report for ${variables.studentName} (${variables.className}) - ${variables.term} now available on EDUCAFRIC. ${variables.generalAverage ? `Average: ${variables.generalAverage}/20. ` : ''}Check mobile app. Info: ${variables.schoolContact}`
  },
  
  BULLETIN_EXCELLENT: {
    fr: (variables: TemplateVariables) => 
      `🏆 Excellents résultats! ${variables.studentName}: ${variables.generalAverage}/20${variables.classRank ? `, Rang ${variables.classRank}` : ''}. Bulletin ${variables.term} sur EDUCAFRIC. Félicitations! ${variables.schoolContact}`,
    
    en: (variables: TemplateVariables) => 
      `🏆 Excellent results! ${variables.studentName}: ${variables.generalAverage}/20${variables.classRank ? `, Rank ${variables.classRank}` : ''}. ${variables.term} report on EDUCAFRIC. Congratulations! ${variables.schoolContact}`
  },
  
  BULLETIN_NEEDS_IMPROVEMENT: {
    fr: (variables: TemplateVariables) => 
      `📚 ${variables.studentName}: Bulletin ${variables.term} disponible. Moyenne: ${variables.generalAverage}/20. Soutien recommandé. Consultez EDUCAFRIC et contactez: ${variables.schoolContact}`,
    
    en: (variables: TemplateVariables) => 
      `📚 ${variables.studentName}: ${variables.term} report available. Average: ${variables.generalAverage}/20. Support recommended. Check EDUCAFRIC and contact: ${variables.schoolContact}`
  }
};

// ===== WHATSAPP TEMPLATES =====
export const BULLETIN_WHATSAPP_TEMPLATES = {
  BULLETIN_NOTIFICATION: {
    fr: (variables: TemplateVariables) => `
🎓 *${variables.schoolName}*
📋 *Bulletin Scolaire Disponible*

Cher(e) *${variables.parentName}*,

Le bulletin de votre enfant est maintenant prêt :
• *Élève:* ${variables.studentName}
• *Classe:* ${variables.className}
• *Période:* ${variables.term}
• *Année:* ${variables.academicYear}
${variables.generalAverage ? `• *Moyenne:* ${variables.generalAverage}/20` : ''}
${variables.classRank ? `• *Rang:* ${variables.classRank}/${variables.totalStudentsInClass}` : ''}

📱 *Comment consulter :*
1. Ouvrez l'app EDUCAFRIC
2. Section "Bulletins"  
3. Sélectionnez ${variables.studentName}

${variables.qrCode ? `🔍 *Code QR:* ${variables.qrCode}` : ''}

💬 Questions ? Contactez-nous : ${variables.schoolContact}

_Excellence éducative pour l'Afrique_ 🌍
    `.trim(),
    
    en: (variables: TemplateVariables) => `
🎓 *${variables.schoolName}*
📋 *School Report Available*

Dear *Mr./Mrs. ${variables.parentName}*,

Your child's report is now ready:
• *Student:* ${variables.studentName}
• *Class:* ${variables.className}
• *Term:* ${variables.term}
• *Academic Year:* ${variables.academicYear}
${variables.generalAverage ? `• *Average:* ${variables.generalAverage}/20` : ''}
${variables.classRank ? `• *Rank:* ${variables.classRank}/${variables.totalStudentsInClass}` : ''}

📱 *How to view:*
1. Open EDUCAFRIC app
2. Go to "Reports" section
3. Select ${variables.studentName}

${variables.qrCode ? `🔍 *QR Code:* ${variables.qrCode}` : ''}

💬 Questions? Contact us: ${variables.schoolContact}

_Educational excellence for Africa_ 🌍
    `.trim()
  }
};

// ===== TEMPLATE GENERATOR FUNCTIONS =====
export class BulletinTemplateGenerator {
  /**
   * Generate email template for bulletin notification
   */
  static generateEmailTemplate(
    variables: TemplateVariables, 
    language: 'fr' | 'en' = 'fr'
  ): { subject: string; body: string } {
    const template = BULLETIN_EMAIL_TEMPLATES.BULLETIN_NOTIFICATION[language];
    return {
      subject: template.subject(variables),
      body: template.body(variables)
    };
  }

  /**
   * Generate SMS template for bulletin notification
   */
  static generateSMSTemplate(
    variables: TemplateVariables, 
    templateType: 'BULLETIN_NOTIFICATION' | 'BULLETIN_EXCELLENT' | 'BULLETIN_NEEDS_IMPROVEMENT' = 'BULLETIN_NOTIFICATION',
    language: 'fr' | 'en' = 'fr'
  ): string {
    const template = BULLETIN_SMS_TEMPLATES[templateType][language];
    return template(variables);
  }

  /**
   * Generate WhatsApp template for bulletin notification
   */
  static generateWhatsAppTemplate(
    variables: TemplateVariables, 
    language: 'fr' | 'en' = 'fr'
  ): string {
    const template = BULLETIN_WHATSAPP_TEMPLATES.BULLETIN_NOTIFICATION[language];
    return template(variables);
  }

  /**
   * Auto-select template type based on average score
   */
  static selectSMSTemplateType(average?: number): 'BULLETIN_NOTIFICATION' | 'BULLETIN_EXCELLENT' | 'BULLETIN_NEEDS_IMPROVEMENT' {
    if (!average) return 'BULLETIN_NOTIFICATION';
    if (average >= 16) return 'BULLETIN_EXCELLENT';
    if (average < 10) return 'BULLETIN_NEEDS_IMPROVEMENT';
    return 'BULLETIN_NOTIFICATION';
  }

  /**
   * Validate template variables
   */
  static validateVariables(variables: TemplateVariables): { valid: boolean; missing: string[] } {
    const required = ['studentName', 'className', 'term', 'academicYear', 'schoolName', 'parentName', 'schoolContact'];
    const missing = required.filter(key => !variables[key as keyof TemplateVariables]);
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
}

// Export default template generator
export default BulletinTemplateGenerator;