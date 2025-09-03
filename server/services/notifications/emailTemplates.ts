// ===== EMAIL TEMPLATES MODULE =====
// Extracted from huge notificationService.ts to prevent crashes

export const EMAIL_TEMPLATES = {
  GRADE_REPORT: {
    en: {
      subject: (childName: string) => `Grade Report for ${childName}`,
      body: (childName: string, grades: any[]) => `
        <h2>Grade Report for ${childName}</h2>
        <p>Dear Parent,</p>
        <p>Here is the latest grade report for your child.</p>
        <!-- Grades will be populated here -->
        <p>Best regards,<br>School Administration</p>
      `
    },
    fr: {
      subject: (childName: string) => `Bulletin de notes pour ${childName}`,
      body: (childName: string, grades: any[]) => `
        <h2>Bulletin de notes pour ${childName}</h2>
        <p>Cher Parent,</p>
        <p>Voici le dernier bulletin de notes de votre enfant.</p>
        <!-- Les notes seront affichées ici -->
        <p>Cordialement,<br>Administration Scolaire</p>
      `
    }
  },

  ATTENDANCE_SUMMARY: {
    en: {
      subject: (childName: string) => `Attendance Summary - ${childName}`,
      body: (childName: string, summary: any) => `
        <h2>Attendance Summary for ${childName}</h2>
        <p>Dear Parent,</p>
        <p>Here is the attendance summary for your child.</p>
        <p>Best regards,<br>School Administration</p>
      `
    },
    fr: {
      subject: (childName: string) => `Résumé de présence - ${childName}`,
      body: (childName: string, summary: any) => `
        <h2>Résumé de présence pour ${childName}</h2>
        <p>Cher Parent,</p>
        <p>Voici le résumé de présence de votre enfant.</p>
        <p>Cordialement,<br>Administration Scolaire</p>
      `
    }
  },

  BULLETIN_AVAILABLE: {
    en: {
      subject: (childName: string, period: string) => `📋 ${childName}'s ${period} Report Card Available`,
      body: (childName: string, period: string, average: number, rank: number, totalStudents: number, subjects: any[], qrCode: string) => `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .grades-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .grades-table th, .grades-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                .grades-table th { background-color: #f4f4f4; }
                .summary { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .qr-section { text-align: center; margin: 20px 0; padding: 20px; background: #e8f4f8; border-radius: 8px; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📋 ${period} Report Card</h1>
                <h2>${childName}</h2>
            </div>
            <div class="content">
                <div class="summary">
                    <h3>Academic Summary</h3>
                    <p><strong>Overall Average:</strong> ${average}/20</p>
                    <p><strong>Class Rank:</strong> ${rank} out of ${totalStudents} students</p>
                    <p><strong>Period:</strong> ${period}</p>
                </div>
                
                <h3>Subject Grades</h3>
                <table class="grades-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Grade</th>
                            <th>Coefficient</th>
                            <th>Teacher</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjects.map(subject => `
                        <tr>
                            <td>${subject.name}</td>
                            <td>${subject.grade}/20</td>
                            <td>${subject.coefficient}</td>
                            <td>${subject.teacher}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="qr-section">
                    <h3>🔍 QR Code Verification</h3>
                    <p>Scan this QR code to verify the authenticity of this report card:</p>
                    <div style="margin: 15px 0;">
                        <strong>Verification Code:</strong> ${qrCode}
                    </div>
                    <p><small>This report card is digitally signed and can be verified at: <br>
                    <a href="https://www.educafric.com/verify">www.educafric.com/verify</a></small></p>
                </div>
                
                <p>You can download the full PDF report card from the EDUCAFRIC mobile app.</p>
            </div>
            <div class="footer">
                <p>EDUCAFRIC Platform - African Educational Technology<br>
                📱 Download our app | 🌐 www.educafric.com</p>
            </div>
        </body>
        </html>
      `
    },
    fr: {
      subject: (childName: string, period: string) => `📋 Bulletin ${period} de ${childName} Disponible`,
      body: (childName: string, period: string, average: number, rank: number, totalStudents: number, subjects: any[], qrCode: string) => `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .grades-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .grades-table th, .grades-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                .grades-table th { background-color: #f4f4f4; }
                .summary { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .qr-section { text-align: center; margin: 20px 0; padding: 20px; background: #e8f4f8; border-radius: 8px; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📋 Bulletin ${period}</h1>
                <h2>${childName}</h2>
            </div>
            <div class="content">
                <div class="summary">
                    <h3>Résumé Académique</h3>
                    <p><strong>Moyenne Générale:</strong> ${average}/20</p>
                    <p><strong>Rang en Classe:</strong> ${rank} sur ${totalStudents} élèves</p>
                    <p><strong>Période:</strong> ${period}</p>
                </div>
                
                <h3>Notes par Matière</h3>
                <table class="grades-table">
                    <thead>
                        <tr>
                            <th>Matière</th>
                            <th>Note</th>
                            <th>Coefficient</th>
                            <th>Professeur</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjects.map(subject => `
                        <tr>
                            <td>${subject.name}</td>
                            <td>${subject.grade}/20</td>
                            <td>${subject.coefficient}</td>
                            <td>${subject.teacher}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="qr-section">
                    <h3>🔍 Code QR de Vérification</h3>
                    <p>Scannez ce code QR pour vérifier l'authenticité de ce bulletin:</p>
                    <div style="margin: 15px 0;">
                        <strong>Code de Vérification:</strong> ${qrCode}
                    </div>
                    <p><small>Ce bulletin est signé numériquement et peut être vérifié sur: <br>
                    <a href="https://www.educafric.com/verify">www.educafric.com/verify</a></small></p>
                </div>
                
                <p>Vous pouvez télécharger le bulletin PDF complet depuis l'application mobile EDUCAFRIC.</p>
            </div>
            <div class="footer">
                <p>Plateforme EDUCAFRIC - Technologie Éducative Africaine<br>
                📱 Téléchargez notre app | 🌐 www.educafric.com</p>
            </div>
        </body>
        </html>
      `
    }
  }
};