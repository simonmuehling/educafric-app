import nodemailer from 'nodemailer';

interface HostingerMailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

class HostingerMailService {
  private transporter: nodemailer.Transporter;
  private config: HostingerMailConfig;

  constructor() {
    // PERMANENT HOSTINGER SMTP CONFIGURATION - DO NOT CHANGE
    this.config = {
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true, // SSL/TLS for port 465
      auth: {
        user: 'no-reply@educafric.com',
        pass: 'Douala12-educonnect12'
      }
    };

    this.transporter = nodemailer.createTransport(this.config);
    console.log('[HOSTINGER_MAIL] Service initialized');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Test connection first
      console.log('[HOSTINGER_MAIL] Testing SMTP connection...');
      const connectionTest = await this.verifyConnection();
      if (!connectionTest) {
        console.error('[HOSTINGER_MAIL] ❌ SMTP connection failed');
        return false;
      }

      const mailOptions = {
        from: `"EDUCAFRIC Platform" <${options.from || 'no-reply@educafric.com'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      console.log(`[HOSTINGER_MAIL] 📧 Attempting to send email...`);
      console.log(`[HOSTINGER_MAIL] From: ${mailOptions.from}`);
      console.log(`[HOSTINGER_MAIL] To: ${options.to}`);
      console.log(`[HOSTINGER_MAIL] Subject: ${options.subject}`);
      console.log(`[HOSTINGER_MAIL] SMTP: ${this.config.host}:${this.config.port} (SSL: ${this.config.secure})`);
      
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`[HOSTINGER_MAIL] ✅ Email sent successfully!`);
      console.log(`[HOSTINGER_MAIL] Message ID: ${result.messageId}`);
      console.log(`[HOSTINGER_MAIL] Accepted: ${JSON.stringify(result.accepted)}`);
      console.log(`[HOSTINGER_MAIL] Rejected: ${JSON.stringify(result.rejected)}`);
      console.log(`[HOSTINGER_MAIL] Response: ${result.response}`);
      
      return true;

    } catch (error: any) {
      console.error('[HOSTINGER_MAIL] ❌ Failed to send email:', error);
      console.error('[HOSTINGER_MAIL] Error code:', error.code);
      console.error('[HOSTINGER_MAIL] Error message:', error.message);
      if (error.response) {
        console.error('[HOSTINGER_MAIL] SMTP Response:', error.response);
      }
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      console.log('[HOSTINGER_MAIL] Verifying SMTP connection...');
      console.log(`[HOSTINGER_MAIL] Host: ${this.config.host}:${this.config.port}`);
      console.log(`[HOSTINGER_MAIL] User: ${this.config.auth.user}`);
      console.log(`[HOSTINGER_MAIL] Secure: ${this.config.secure}`);
      
      await this.transporter.verify();
      console.log('[HOSTINGER_MAIL] ✅ SMTP connection verified successfully');
      return true;
    } catch (error: any) {
      console.error('[HOSTINGER_MAIL] ❌ SMTP connection verification failed:', error);
      console.error('[HOSTINGER_MAIL] Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      return false;
    }
  }

  async sendSystemReport(reportData: any): Promise<boolean> {
    const html = this.generateSystemReportHTML(reportData);
    const text = this.generateSystemReportText(reportData);

    return await this.sendEmail({
      to: 'simonpmuehling@gmail.com',
      subject: `📊 EDUCAFRIC System Report - ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}`,
      html,
      text
    });
  }

  /**
   * Send commercial login alert email
   */
  async sendCommercialLoginAlert(commercialData: {
    name: string;
    email: string;
    loginTime: string;
    ip: string;
    schoolId?: number;
  }): Promise<boolean> {
    try {
      console.log(`[HOSTINGER_MAIL] Sending commercial login alert for ${commercialData.name}`);
      
      const success = await this.sendEmail({
        to: 'simonpmuehling@gmail.com', // Email du destinataire pour les alertes
        subject: `🔔 ALERTE: Connexion Commercial - ${commercialData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0079F2; border-bottom: 2px solid #0079F2; padding-bottom: 10px;">
              🔔 Alerte Connexion Commercial
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Détails de la connexion :</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">👤 Nom :</td>
                  <td style="padding: 8px 0; color: #333;">${commercialData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">📧 Email :</td>
                  <td style="padding: 8px 0; color: #333;">${commercialData.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">🕐 Heure :</td>
                  <td style="padding: 8px 0; color: #333;">${commercialData.loginTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">🌐 IP :</td>
                  <td style="padding: 8px 0; color: #333;">${commercialData.ip}</td>
                </tr>
                ${commercialData.schoolId ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">🏫 École ID :</td>
                  <td style="padding: 8px 0; color: #333;">${commercialData.schoolId}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #0079F2;">
              <p style="margin: 0; color: #0277bd;">
                <strong>📊 Action automatique :</strong> Cette alerte est générée automatiquement à chaque connexion d'un utilisateur commercial sur la plateforme EDUCAFRIC.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <footer style="text-align: center; color: #666; font-size: 12px;">
              <p>EDUCAFRIC Platform - Système d'Alertes Automatiques</p>
              <p>📧 support: info@educafric.com | ☎️ +237 656 200 472</p>
            </footer>
          </div>
        `,
        text: `ALERTE CONNEXION COMMERCIAL

Nom: ${commercialData.name}
Email: ${commercialData.email}  
Heure: ${commercialData.loginTime}
IP: ${commercialData.ip}
${commercialData.schoolId ? `École ID: ${commercialData.schoolId}` : ''}

Cette alerte est générée automatiquement à chaque connexion commerciale.

EDUCAFRIC Platform
support: info@educafric.com | +237 656 200 472`
      });

      console.log(`[HOSTINGER_MAIL] Commercial login alert sent: ${success ? '✅' : '❌'}`);
      return success;
    } catch (error) {
      console.error('[HOSTINGER_MAIL] Error sending commercial login alert:', error);
      return false;
    }
  }

  // Grade report email
  async sendGradeReport(studentName: string, parentEmail: string, grades: any[], school: string): Promise<boolean> {
    const html = this.generateGradeReportHTML(studentName, grades, school);
    const text = this.generateGradeReportText(studentName, grades, school);

    return await this.sendEmail({
      to: parentEmail,
      subject: `📊 Bulletin de Notes - ${studentName} | EDUCAFRIC`,
      html,
      text
    });
  }

  // Attendance alert email
  async sendAttendanceAlert(studentName: string, parentEmail: string, status: string, date: string, school: string): Promise<boolean> {
    const html = this.generateAttendanceAlertHTML(studentName, status, date, school);
    const text = this.generateAttendanceAlertText(studentName, status, date, school);

    return await this.sendEmail({
      to: parentEmail,
      subject: `🔔 Alerte Présence - ${studentName} | EDUCAFRIC`,
      html,
      text
    });
  }

  // School announcement email
  async sendSchoolAnnouncement(recipients: string[], title: string, content: string, school: string): Promise<boolean> {
    const html = this.generateAnnouncementHTML(title, content, school);
    const text = this.generateAnnouncementText(title, content, school);

    const promises = recipients.map(email => 
      this.sendEmail({
        to: email,
        subject: `📢 Annonce École - ${title} | EDUCAFRIC`,
        html,
        text
      })
    );

    const results = await Promise.all(promises);
    return results.every(result => result);
  }

  private generateSystemReportHTML(data: any): string {
    const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' });
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f7fa; }
            .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 30px; }
            .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .metric-card { background: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #667eea; }
            .metric-value { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
            .metric-label { font-size: 14px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.5px; }
            .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
            .status-online { background-color: #27ae60; }
            .section { margin: 30px 0; }
            .section h3 { color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px; }
            .alert { padding: 15px; border-radius: 8px; margin: 10px 0; }
            .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .footer { background: #34495e; color: white; padding: 20px; text-align: center; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 EDUCAFRIC System Report</h1>
                <p>Automated System Health & Performance Report</p>
                <p><strong>${timestamp}</strong></p>
            </div>
            
            <div class="content">
                <div class="section">
                    <h3>🏥 System Health Status</h3>
                    <div class="alert alert-success">
                        <span class="status-indicator status-online"></span>
                        <strong>System Operational</strong> - All core services running normally
                    </div>
                </div>

                <div class="section">
                    <h3>📈 Key Metrics</h3>
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div class="metric-value">${data.totalUsers || 'N/A'}</div>
                            <div class="metric-label">Total Users</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${data.activeSchools || 'N/A'}</div>
                            <div class="metric-label">Active Schools</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${data.dailyLogins || 'N/A'}</div>
                            <div class="metric-label">Daily Logins</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${data.systemUptime || '99.9%'}</div>
                            <div class="metric-label">System Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p>EDUCAFRIC Platform Monitoring • Generated automatically at ${timestamp}</p>
                <p>Contact: support@educafric.com | +237600000000</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateSystemReportText(data: any): string {
    const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' });
    
    return `
📊 EDUCAFRIC SYSTEM REPORT
${timestamp}

🏥 SYSTEM HEALTH STATUS
✅ System Operational - All core services running normally

📈 KEY METRICS
- Total Users: ${data.totalUsers || 'N/A'}
- Active Schools: ${data.activeSchools || 'N/A'}
- Daily Logins: ${data.dailyLogins || 'N/A'}
- System Uptime: ${data.systemUptime || '99.9%'}

---
EDUCAFRIC Platform Monitoring
Generated automatically at ${timestamp}
Contact: support@educafric.com | +237600000000
    `;
  }

  private generateGradeReportHTML(studentName: string, grades: any[], school: string): string {
    const gradesHTML = grades.map(grade => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${grade.subject}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold; color: ${grade.grade >= 10 ? '#27ae60' : '#e74c3c'};">${grade.grade}/20</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${grade.coefficient}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${grade.comment || '-'}</td>
      </tr>
    `).join('');

    const average = grades.reduce((sum, g) => sum + (g.grade * g.coefficient), 0) / grades.reduce((sum, g) => sum + g.coefficient, 0);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f7fa; }
            .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f8f9fa; padding: 15px; text-align: left; font-weight: 600; }
            .average { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Bulletin de Notes</h1>
                <h2>${studentName}</h2>
                <p>${school}</p>
            </div>
            <div class="content">
                <table>
                    <thead>
                        <tr>
                            <th>Matière</th>
                            <th>Note</th>
                            <th>Coefficient</th>
                            <th>Appréciation</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gradesHTML}
                    </tbody>
                </table>
                <div class="average">
                    <h3>Moyenne Générale: ${average.toFixed(2)}/20</h3>
                </div>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateGradeReportText(studentName: string, grades: any[], school: string): string {
    const gradesText = grades.map(g => `${g.subject}: ${g.grade}/20 (coef. ${g.coefficient})`).join('\n');
    const average = grades.reduce((sum, g) => sum + (g.grade * g.coefficient), 0) / grades.reduce((sum, g) => sum + g.coefficient, 0);
    
    return `
📊 BULLETIN DE NOTES
${studentName} - ${school}

${gradesText}

Moyenne Générale: ${average.toFixed(2)}/20

---
EDUCAFRIC Platform
    `;
  }

  private generateAttendanceAlertHTML(studentName: string, status: string, date: string, school: string): string {
    const statusColor = status === 'absent' ? '#e74c3c' : status === 'late' ? '#f39c12' : '#27ae60';
    const statusIcon = status === 'absent' ? '❌' : status === 'late' ? '⏰' : '✅';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f7fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .status-badge { background: ${statusColor}; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${statusIcon} Alerte Présence</h1>
                <h2>${studentName}</h2>
            </div>
            <div class="content">
                <p><strong>École:</strong> ${school}</p>
                <p><strong>Date:</strong> ${date}</p>
                <div class="status-badge">
                    Statut: ${status.toUpperCase()}
                </div>
                <p>Veuillez contacter l'école si nécessaire.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateAttendanceAlertText(studentName: string, status: string, date: string, school: string): string {
    return `
🔔 ALERTE PRÉSENCE
${studentName} - ${school}

Date: ${date}
Statut: ${status.toUpperCase()}

Veuillez contacter l'école si nécessaire.

---
EDUCAFRIC Platform
    `;
  }

  private generateAnnouncementHTML(title: string, content: string, school: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f7fa; }
            .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; line-height: 1.6; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📢 ${title}</h1>
                <p>${school}</p>
            </div>
            <div class="content">
                <div style="white-space: pre-line;">${content}</div>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateAnnouncementText(title: string, content: string, school: string): string {
    return `
📢 ANNONCE ÉCOLE
${title}
${school}

${content}

---
EDUCAFRIC Platform
    `;
  }
}

export const hostingerMailService = new HostingerMailService();