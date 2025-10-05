import { RefactoredNotificationService } from './refactoredNotificationService';
import { BulletinTemplateGenerator } from './notificationTemplates';
import { db } from '../db';
import { annualReportComprehensive } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export interface AnnualReportNotificationData {
  studentId: number;
  studentName: string;
  className: string;
  academicYear: string;
  annualAverage: number;
  annualRank: string;
  finalDecision: 'PASSE' | 'REDOUBLE' | 'RENVOYE';
  qrCode: string;
  downloadUrl: string;
  verificationUrl: string;
  trimesterData: {
    trimester1Average: number;
    trimester2Average: number;
    trimester3Average: number;
  };
}

export interface AnnualReportRecipient {
  id: string;
  name: string;
  email?: string;
  role: 'Parent' | 'Student';
  preferredLanguage: 'en' | 'fr';
  relationToStudent?: string;
}

export interface AnnualReportNotificationResult {
  success: boolean;
  recipientId: string;
  recipientName: string;
  channels: {
    email: { success: boolean; error?: string };
    pwa: { success: boolean; error?: string };
  };
  timestamp: string;
}

/**
 * Service spécialisé pour les notifications de rapports annuels aux élèves et parents
 * UNIQUEMENT Email et PWA/in-app (PAS DE SMS selon les exigences)
 */
export class AnnualReportNotifications {
  private notificationService: RefactoredNotificationService;
  private templateGenerator: BulletinTemplateGenerator;

  constructor() {
    this.notificationService = RefactoredNotificationService.getInstance();
    this.templateGenerator = new BulletinTemplateGenerator();
  }

  /**
   * Envoie une notification email de rapport annuel
   */
  private async sendAnnualReportEmail(
    reportData: AnnualReportNotificationData,
    recipient: AnnualReportRecipient,
    language: 'en' | 'fr'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!recipient.email) {
        throw new Error('No email address provided');
      }

      // Determine template type based on performance and decision
      const templateType = reportData.finalDecision === 'PASSE' && reportData.annualAverage >= 16 ? 'ANNUAL_REPORT_EXCELLENT' : 
                          reportData.finalDecision === 'REDOUBLE' ? 'ANNUAL_REPORT_NEEDS_IMPROVEMENT' : 
                          'ANNUAL_REPORT_AVAILABLE';

      const variables = {
        recipientName: recipient.name,
        studentName: reportData.studentName,
        className: reportData.className,
        academicYear: reportData.academicYear,
        annualAverage: reportData.annualAverage.toString(),
        annualRank: reportData.annualRank,
        finalDecision: reportData.finalDecision,
        trimester1Average: reportData.trimesterData.trimester1Average.toString(),
        trimester2Average: reportData.trimesterData.trimester2Average.toString(),
        trimester3Average: reportData.trimesterData.trimester3Average.toString(),
        downloadUrl: reportData.downloadUrl,
        verificationUrl: reportData.verificationUrl,
        qrCode: reportData.qrCode,
        schoolName: 'École Educafric',
        schoolContact: '+237657004011'
      };

      // Create email template specifically for annual reports
      const emailTemplate = this.generateAnnualReportEmailTemplate(
        templateType,
        variables,
        language
      );

      const notificationPayload = {
        type: 'email' as const,
        template: 'BULLETIN_AVAILABLE' as const,
        recipients: [{
          id: recipient.id,
          name: recipient.name,
          email: recipient.email!,
          role: recipient.role,
          preferredLanguage: recipient.preferredLanguage
        }],
        data: {
          subject: emailTemplate.subject,
          content: emailTemplate.html,
          studentName: reportData.studentName,
          academicYear: reportData.academicYear
        },
        priority: 'medium' as const,
        metadata: {
          reportType: 'annual_report',
          studentName: reportData.studentName,
          academicYear: reportData.academicYear
        }
      };

      const results = await this.notificationService.sendNotification(notificationPayload);
      const success = results.length > 0 && results[0].success;

      console.log(`[ANNUAL_REPORT_EMAIL] ✅ Email sent to ${recipient.name} (${recipient.email})`);
      return { success };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
      console.error(`[ANNUAL_REPORT_EMAIL] ❌ Failed to send email to ${recipient.name}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Envoie une notification PWA/in-app de rapport annuel
   */
  private async sendAnnualReportPWANotification(
    reportData: AnnualReportNotificationData,
    recipient: AnnualReportRecipient,
    language: 'en' | 'fr'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const title = language === 'fr' 
        ? `Rapport annuel disponible - ${reportData.studentName}`
        : `Annual report available - ${reportData.studentName}`;

      const body = language === 'fr'
        ? `Moyenne annuelle: ${reportData.annualAverage}/20 - Décision: ${reportData.finalDecision} - ${reportData.academicYear}`
        : `Annual average: ${reportData.annualAverage}/20 - Decision: ${reportData.finalDecision} - ${reportData.academicYear}`;

      const notificationPayload = {
        type: 'push' as const,
        template: 'BULLETIN_AVAILABLE' as const,
        recipients: [{
          id: recipient.id,
          name: recipient.name,
          email: recipient.email,
          role: recipient.role,
          preferredLanguage: recipient.preferredLanguage
        }],
        data: {
          title,
          body,
          icon: '/icons/annual-report-icon.png',
          url: reportData.downloadUrl
        },
        priority: 'medium' as const,
        metadata: {
          reportType: 'annual_report',
          studentName: reportData.studentName,
          academicYear: reportData.academicYear
        }
      };

      const results = await this.notificationService.sendNotification(notificationPayload);
      const success = results.length > 0 && results[0].success;

      console.log(`[ANNUAL_REPORT_PWA] ✅ PWA notification sent to ${recipient.name}`);
      return { success };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown PWA error';
      console.error(`[ANNUAL_REPORT_PWA] ❌ Failed to send PWA notification to ${recipient.name}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Envoie des notifications de rapport annuel à plusieurs destinataires
   */
  async sendAnnualReportNotifications(
    reportData: AnnualReportNotificationData,
    recipients: AnnualReportRecipient[],
    channels: ('email' | 'pwa')[] = ['email', 'pwa']
  ): Promise<AnnualReportNotificationResult[]> {
    const results: AnnualReportNotificationResult[] = [];

    console.log(`[ANNUAL_REPORT_NOTIFICATIONS] 📧 Sending to ${recipients.length} recipients via channels: ${channels.join(', ')}`);

    for (const recipient of recipients) {
      const result: AnnualReportNotificationResult = {
        success: true,
        recipientId: recipient.id,
        recipientName: recipient.name,
        channels: {
          email: { success: false },
          pwa: { success: false }
        },
        timestamp: new Date().toISOString()
      };

      // Send email notification if requested and email available
      if (channels.includes('email') && recipient.email) {
        const emailResult = await this.sendAnnualReportEmail(
          reportData,
          recipient,
          recipient.preferredLanguage
        );
        result.channels.email = emailResult;
      }

      // Send PWA notification if requested
      if (channels.includes('pwa')) {
        const pwaResult = await this.sendAnnualReportPWANotification(
          reportData,
          recipient,
          recipient.preferredLanguage
        );
        result.channels.pwa = pwaResult;
      }

      // Determine overall success
      const emailSuccess = !channels.includes('email') || result.channels.email.success;
      const pwaSuccess = !channels.includes('pwa') || result.channels.pwa.success;
      result.success = emailSuccess && pwaSuccess;

      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[ANNUAL_REPORT_NOTIFICATIONS] ✅ ${successCount}/${results.length} notifications sent successfully`);

    return results;
  }

  /**
   * Génère le template d'email pour les rapports annuels
   */
  private generateAnnualReportEmailTemplate(
    templateType: string,
    variables: any,
    language: 'en' | 'fr'
  ): { subject: string; html: string; text?: string } {
    const isExcellent = templateType === 'ANNUAL_REPORT_EXCELLENT';
    const needsImprovement = templateType === 'ANNUAL_REPORT_NEEDS_IMPROVEMENT';

    const templates = {
      fr: {
        subject: isExcellent 
          ? `🎉 Excellent rapport annuel - ${variables.studentName}`
          : needsImprovement
          ? `📚 Rapport annuel - Accompagnement nécessaire - ${variables.studentName}`
          : `📋 Rapport annuel disponible - ${variables.studentName}`,
        
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">📋 Rapport Annuel ${variables.academicYear}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">École Educafric - Cameroun</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <p>Bonjour <strong>${variables.recipientName}</strong>,</p>
              
              <p>Le rapport annuel de <strong>${variables.studentName}</strong> (${variables.className}) pour l'année scolaire ${variables.academicYear} est maintenant disponible.</p>
              
              <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #4f46e5;">📊 Résumé Annuel</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Moyenne Annuelle:</strong> ${variables.annualAverage}/20</li>
                  <li><strong>Rang Annuel:</strong> ${variables.annualRank}</li>
                  <li><strong>Décision Finale:</strong> <span style="color: ${variables.finalDecision === 'PASSE' ? '#10b981' : '#ef4444'}; font-weight: bold;">${variables.finalDecision}</span></li>
                </ul>
                
                <h4 style="color: #4f46e5;">Progression Trimestrielle</h4>
                <ul style="list-style: none; padding: 0;">
                  <li>Trimestre 1: ${variables.trimester1Average}/20</li>
                  <li>Trimestre 2: ${variables.trimester2Average}/20</li>
                  <li>Trimestre 3: ${variables.trimester3Average}/20</li>
                </ul>
              </div>
              
              ${isExcellent ? `
                <div style="background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #15803d;"><strong>🎉 Félicitations !</strong> Excellente performance annuelle. Continuez ainsi !</p>
                </div>
              ` : needsImprovement ? `
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e;"><strong>📚 Accompagnement recommandé</strong> - Un suivi personnalisé permettra d'améliorer les résultats.</p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${variables.downloadUrl}" style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">📥 Télécharger le Rapport</a>
              </div>
              
              <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                  <strong>Vérification:</strong> ${variables.qrCode}<br>
                  <strong>Contact école:</strong> ${variables.schoolContact}<br>
                  <strong>Lien de vérification:</strong> <a href="${variables.verificationUrl}" style="color: #4f46e5;">${variables.verificationUrl}</a>
                </p>
              </div>
              
              <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
                Cordialement,<br>
                <strong>${variables.schoolName}</strong>
              </p>
            </div>
          </div>
        `,
        
        text: `
Rapport Annuel ${variables.academicYear} - ${variables.studentName}

Bonjour ${variables.recipientName},

Le rapport annuel de ${variables.studentName} (${variables.className}) pour l'année scolaire ${variables.academicYear} est maintenant disponible.

RÉSUMÉ ANNUEL:
- Moyenne Annuelle: ${variables.annualAverage}/20
- Rang Annuel: ${variables.annualRank}
- Décision Finale: ${variables.finalDecision}

PROGRESSION TRIMESTRIELLE:
- Trimestre 1: ${variables.trimester1Average}/20
- Trimestre 2: ${variables.trimester2Average}/20
- Trimestre 3: ${variables.trimester3Average}/20

Télécharger: ${variables.downloadUrl}
Vérification: ${variables.verificationUrl}

Contact: ${variables.schoolContact}

${variables.schoolName}
        `
      },
      
      en: {
        subject: isExcellent 
          ? `🎉 Excellent Annual Report - ${variables.studentName}`
          : needsImprovement
          ? `📚 Annual Report - Support Needed - ${variables.studentName}`
          : `📋 Annual Report Available - ${variables.studentName}`,
        
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">📋 Annual Report ${variables.academicYear}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Educafric School - Cameroon</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <p>Hello <strong>${variables.recipientName}</strong>,</p>
              
              <p>The annual report for <strong>${variables.studentName}</strong> (${variables.className}) for the academic year ${variables.academicYear} is now available.</p>
              
              <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #4f46e5;">📊 Annual Summary</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Annual Average:</strong> ${variables.annualAverage}/20</li>
                  <li><strong>Annual Rank:</strong> ${variables.annualRank}</li>
                  <li><strong>Final Decision:</strong> <span style="color: ${variables.finalDecision === 'PASSE' ? '#10b981' : '#ef4444'}; font-weight: bold;">${variables.finalDecision}</span></li>
                </ul>
                
                <h4 style="color: #4f46e5;">Term Progression</h4>
                <ul style="list-style: none; padding: 0;">
                  <li>Term 1: ${variables.trimester1Average}/20</li>
                  <li>Term 2: ${variables.trimester2Average}/20</li>
                  <li>Term 3: ${variables.trimester3Average}/20</li>
                </ul>
              </div>
              
              ${isExcellent ? `
                <div style="background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #15803d;"><strong>🎉 Congratulations!</strong> Excellent annual performance. Keep it up!</p>
                </div>
              ` : needsImprovement ? `
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e;"><strong>📚 Support recommended</strong> - Personalized support will help improve results.</p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${variables.downloadUrl}" style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">📥 Download Report</a>
              </div>
              
              <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                  <strong>Verification:</strong> ${variables.qrCode}<br>
                  <strong>School contact:</strong> ${variables.schoolContact}<br>
                  <strong>Verification link:</strong> <a href="${variables.verificationUrl}" style="color: #4f46e5;">${variables.verificationUrl}</a>
                </p>
              </div>
              
              <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
                Best regards,<br>
                <strong>${variables.schoolName}</strong>
              </p>
            </div>
          </div>
        `,
        
        text: `
Annual Report ${variables.academicYear} - ${variables.studentName}

Hello ${variables.recipientName},

The annual report for ${variables.studentName} (${variables.className}) for the academic year ${variables.academicYear} is now available.

ANNUAL SUMMARY:
- Annual Average: ${variables.annualAverage}/20
- Annual Rank: ${variables.annualRank}
- Final Decision: ${variables.finalDecision}

TERM PROGRESSION:
- Term 1: ${variables.trimester1Average}/20
- Term 2: ${variables.trimester2Average}/20
- Term 3: ${variables.trimester3Average}/20

Download: ${variables.downloadUrl}
Verification: ${variables.verificationUrl}

Contact: ${variables.schoolContact}

${variables.schoolName}
        `
      }
    };

    return templates[language];
  }

  /**
   * Met à jour le statut des notifications dans la base de données
   */
  async updateAnnualReportNotificationStatus(
    reportId: number,
    notificationResults: AnnualReportNotificationResult[]
  ): Promise<void> {
    try {
      const perRecipient: any = {};
      let totalNotificationsSent = 0;
      let totalNotificationsFailed = 0;
      let emailSuccessCount = 0;
      let emailFailedCount = 0;
      const failedRecipients: string[] = [];

      for (const result of notificationResults) {
        perRecipient[result.recipientId] = {
          email: result.channels.email,
          pwa: result.channels.pwa,
          lastUpdated: result.timestamp,
          totalAttempts: 1
        };

        if (result.channels.email.success) {
          emailSuccessCount++;
          totalNotificationsSent++;
        } else if (result.channels.email.error) {
          emailFailedCount++;
          totalNotificationsFailed++;
        }

        if (!result.success) {
          failedRecipients.push(result.recipientName);
        }
      }

      const notificationsSent = {
        perRecipient,
        summary: {
          totalRecipients: notificationResults.length,
          emailSuccessCount,
          smsSuccessCount: 0, // Not used for annual reports
          whatsappSuccessCount: 0, // Not used for annual reports
          emailFailedCount,
          smsFailedCount: 0,
          whatsappFailedCount: 0,
          failedRecipients,
          lastUpdated: new Date().toISOString(),
          totalNotificationsSent,
          totalNotificationsFailed,
          overallSuccessRate: totalNotificationsSent > 0 ? (totalNotificationsSent / (totalNotificationsSent + totalNotificationsFailed)) * 100 : 0
        },
        legacy: {
          sms: false,
          email: emailSuccessCount > 0,
          whatsapp: false
        }
      };

      await db.update(annualReportComprehensive)
        .set({
          lastNotifiedAt: new Date(),
          notificationMeta: notificationsSent as any
        })
        .where(eq(annualReportComprehensive.id, reportId));

      console.log(`[ANNUAL_REPORT_NOTIFICATIONS] ✅ Notification status updated for report ${reportId}`);

    } catch (error) {
      console.error(`[ANNUAL_REPORT_NOTIFICATIONS] ❌ Failed to update notification status:`, error);
    }
  }
}

export default AnnualReportNotifications;