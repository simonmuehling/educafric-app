// Générateur de templates modulables EDUCAFRIC pour bulletins et rapports
// Système d'en-têtes dynamiques personnalisables par école

export interface SchoolInfo {
  schoolName: string;
  address: string;
  city: string;
  phoneNumber: string;
  email: string;
  logo?: string;
  directorName: string;
  academicYear: string;
}

export interface BulletinTemplateData {
  schoolInfo: SchoolInfo;
  student: {
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    gender: string;
    className: string;
    studentNumber: string;
  };
  period: string;
  subjects: Array<{
    name: string;
    grade: number;
    maxGrade: number;
    coefficient: number;
    comments?: string;
  }>;
  generalAverage: number;
  classRank: number;
  totalStudents: number;
  conduct: string;
  absences: number;
  teacherComments: string;
  directorComments: string;
}

export interface ReportTemplateData {
  schoolInfo: SchoolInfo;
  reportType: 'class' | 'student' | 'teacher' | 'subject' | 'attendance' | 'performance';
  filters: {
    className?: string;
    studentName?: string;
    teacherName?: string;
    subjectName?: string;
    period?: string;
    dateRange?: { start: string; end: string; };
  };
  data: any; // Données spécifiques au type de rapport
  generatedAt: string;
  generatedBy: string;
}

export class ModularTemplateGenerator {
  
  // Génération de l'en-tête standard EDUCAFRIC avec informations de l'école
  private generateEducafricHeader(schoolInfo: SchoolInfo, documentType: string, language: 'fr' | 'en' = 'fr'): string {
    const titles = {
      fr: {
        bulletin: 'BULLETIN DE NOTES',
        reportClass: 'RAPPORT DE CLASSE',
        reportStudent: 'RAPPORT ÉTUDIANT',
        reportTeacher: 'RAPPORT ENSEIGNANT',
        reportSubject: 'RAPPORT MATIÈRE',
        reportAttendance: 'RAPPORT PRÉSENCE',
        reportPerformance: 'RAPPORT PERFORMANCE'
      },
      en: {
        bulletin: 'REPORT CARD',
        reportClass: 'CLASS REPORT',
        reportStudent: 'STUDENT REPORT',
        reportTeacher: 'TEACHER REPORT',
        reportSubject: 'SUBJECT REPORT',
        reportAttendance: 'ATTENDANCE REPORT',
        reportPerformance: 'PERFORMANCE REPORT'
      }
    };

    const currentLang = language as 'fr' | 'en';
    const titleText = titles[currentLang][documentType as keyof typeof titles[typeof currentLang]] || documentType.toUpperCase();
    
    return `
      <div class="educafric-header">
        <div class="header-top">
          <div class="school-info">
            <h1 class="school-name">${schoolInfo.schoolName}</h1>
            <p class="school-address">${schoolInfo.address}, ${schoolInfo.city}</p>
            <p class="school-contact">Tél: ${schoolInfo.phoneNumber} | Email: ${schoolInfo.email}</p>
          </div>
          ${schoolInfo.logo ? `<div class="school-logo"><img src="${schoolInfo.logo}" alt="Logo École" /></div>` : ''}
        </div>
        <div class="document-title">
          <h2>${titleText}</h2>
          <p class="academic-year">${language === 'fr' ? 'Année Académique' : 'Academic Year'}: ${schoolInfo.academicYear}</p>
        </div>
        <div class="powered-by">
          <small>Powered by EDUCAFRIC - www.educafric.com</small>
        </div>
      </div>
    `;
  }

  // Styles CSS communs pour tous les documents
  private getCommonStyles(): string {
    return `
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.2;
          margin: 0;
          padding: 0;
          color: #000;
          background: white;
        }
        
        .document-container {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          background: white;
        }
        
        .educafric-header {
          border-bottom: 3px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .school-info {
          flex: 1;
        }
        
        .school-name {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 5px 0;
          text-transform: uppercase;
        }
        
        .school-address, .school-contact {
          font-size: 10px;
          margin: 2px 0;
          color: #333;
        }
        
        .school-logo img {
          max-height: 60px;
          max-width: 80px;
        }
        
        .document-title {
          text-align: center;
          margin: 10px 0;
        }
        
        .document-title h2 {
          font-size: 16px;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .academic-year {
          font-size: 12px;
          margin: 5px 0;
          font-weight: bold;
        }
        
        .powered-by {
          text-align: center;
          margin-top: 5px;
        }
        
        .powered-by small {
          font-size: 8px;
          color: #666;
          font-style: italic;
        }
        
        .content-section {
          margin: 15px 0;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
          font-size: 9px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 3px;
        }
        
        .info-label {
          font-weight: bold;
          min-width: 120px;
        }
        
        .info-value {
          border-bottom: 1px solid #000;
          flex: 1;
          padding-left: 5px;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 8px;
        }
        
        .data-table th,
        .data-table td {
          border: 1px solid #000;
          padding: 3px;
          text-align: center;
        }
        
        .data-table th {
          background: #f5f5f5;
          font-weight: bold;
          font-size: 7px;
        }
        
        .footer-section {
          margin-top: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          font-size: 9px;
        }
        
        .signature-box {
          text-align: center;
          border: 1px solid #000;
          padding: 5px;
          min-height: 40px;
        }
        
        .document-footer {
          text-align: center;
          font-size: 7px;
          margin-top: 10px;
          border-top: 1px solid #000;
          padding-top: 5px;
        }
        
        @media print {
          body { 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      </style>
    `;
  }

  // Génération de bulletin modulable
  generateBulletinTemplate(data: BulletinTemplateData, language: 'fr' | 'en' = 'fr'): string {
    const header = this.generateEducafricHeader(data.schoolInfo, 'bulletin', language);
    const styles = this.getCommonStyles();
    
    const labels = {
      fr: {
        studentInfo: 'INFORMATIONS ÉLÈVE',
        name: 'Nom et Prénoms',
        birthDate: 'Date de Naissance',
        birthPlace: 'Lieu de Naissance',
        gender: 'Sexe',
        class: 'Classe',
        number: 'Matricule',
        period: 'Période',
        subjects: 'MATIÈRES',
        subject: 'Matière',
        grade: 'Note',
        coeff: 'Coeff',
        comments: 'Observations',
        average: 'Moyenne Générale',
        rank: 'Rang',
        total: 'sur',
        conduct: 'Conduite',
        absences: 'Absences',
        teacherComments: 'Observations du Professeur Principal',
        directorComments: 'Observations du Directeur',
        signatures: 'SIGNATURES',
        teacher: 'Professeur Principal',
        director: 'Directeur'
      },
      en: {
        studentInfo: 'STUDENT INFORMATION',
        name: 'Name and Surname',
        birthDate: 'Birth Date',
        birthPlace: 'Birth Place',
        gender: 'Gender',
        class: 'Class',
        number: 'Student Number',
        period: 'Period',
        subjects: 'SUBJECTS',
        subject: 'Subject',
        grade: 'Grade',
        coeff: 'Coeff',
        comments: 'Comments',
        average: 'General Average',
        rank: 'Rank',
        total: 'out of',
        conduct: 'Conduct',
        absences: 'Absences',
        teacherComments: 'Class Teacher Comments',
        directorComments: 'Director Comments',
        signatures: 'SIGNATURES',
        teacher: 'Class Teacher',
        director: 'Director'
      }
    };

    const t = labels[language];

    return `
      <!DOCTYPE html>
      <html lang="${language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulletin EDUCAFRIC - ${data.student.firstName} ${data.student.lastName}</title>
        ${styles}
      </head>
      <body>
        <div class="document-container">
          ${header}
          
          <div class="content-section">
            <h3>${t.studentInfo}</h3>
            <div class="info-grid">
              <div>
                <div class="info-row">
                  <span class="info-label">${t.name}:</span>
                  <span class="info-value">${data.student.firstName} ${data.student.lastName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">${t.birthDate}:</span>
                  <span class="info-value">${data.student.birthDate}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">${t.birthPlace}:</span>
                  <span class="info-value">${data.student.birthPlace}</span>
                </div>
              </div>
              <div>
                <div class="info-row">
                  <span class="info-label">${t.gender}:</span>
                  <span class="info-value">${data.student.gender}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">${t.class}:</span>
                  <span class="info-value">${data.student.className}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">${t.number}:</span>
                  <span class="info-value">${data.student.studentNumber}</span>
                </div>
              </div>
            </div>
            <div class="info-row">
              <span class="info-label">${t.period}:</span>
              <span class="info-value">${data.period}</span>
            </div>
          </div>

          <div class="content-section">
            <h3>${t.subjects}</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>${t.subject}</th>
                  <th>${t.grade}</th>
                  <th>${t.coeff}</th>
                  <th>${t.comments}</th>
                </tr>
              </thead>
              <tbody>
                ${data.subjects.map(subject => `
                  <tr>
                    <td style="text-align: left; font-weight: bold;">${subject.name}</td>
                    <td>${subject.grade}/${subject.maxGrade}</td>
                    <td>${subject.coefficient}</td>
                    <td style="text-align: left;">${subject.comments || ''}</td>
                  </tr>
                `).join('')}
                <tr style="background: #f5f5f5; font-weight: bold;">
                  <td>${t.average}</td>
                  <td>${data.generalAverage}/20</td>
                  <td colspan="2">${t.rank}: ${data.classRank}/${data.totalStudents}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="content-section">
            <div class="info-grid">
              <div>
                <div class="info-row">
                  <span class="info-label">${t.conduct}:</span>
                  <span class="info-value">${data.conduct}</span>
                </div>
              </div>
              <div>
                <div class="info-row">
                  <span class="info-label">${t.absences}:</span>
                  <span class="info-value">${data.absences}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="content-section">
            <div class="info-row">
              <span class="info-label">${t.teacherComments}:</span>
              <span class="info-value">${data.teacherComments}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t.directorComments}:</span>
              <span class="info-value">${data.directorComments}</span>
            </div>
          </div>

          <div class="footer-section">
            <div class="signature-box">
              <strong>${t.teacher}</strong><br>
              <div style="height: 30px;"></div>
              <div style="border-top: 1px solid #000; padding-top: 2px;">Signature</div>
            </div>
            <div class="signature-box">
              <strong>${t.director}</strong><br>
              <div style="height: 30px;"></div>
              <div style="border-top: 1px solid #000; padding-top: 2px;">Signature</div>
            </div>
          </div>

          <div class="document-footer">
            <p>Document généré le ${new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')} par EDUCAFRIC</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Génération de rapport modulable
  generateReportTemplate(data: ReportTemplateData, language: 'fr' | 'en' = 'fr'): string {
    const header = this.generateEducafricHeader(data.schoolInfo, `report${data.reportType.charAt(0).toUpperCase() + data.reportType.slice(1)}`, language);
    const styles = this.getCommonStyles();
    
    const reportContent = this.generateReportContent(data, language);
    
    return `
      <!DOCTYPE html>
      <html lang="${language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapport ${data.reportType} - ${data.schoolInfo.schoolName}</title>
        ${styles}
      </head>
      <body>
        <div class="document-container">
          ${header}
          ${reportContent}
          <div class="document-footer">
            <p>Rapport généré le ${data.generatedAt} par ${data.generatedBy}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateReportContent(data: ReportTemplateData, language: 'fr' | 'en'): string {
    // Contenu spécifique selon le type de rapport
    switch (data.reportType) {
      case 'class':
        return this.generateClassReportContent(data, language);
      case 'student':
        return this.generateStudentReportContent(data, language);
      case 'teacher':
        return this.generateTeacherReportContent(data, language);
      case 'subject':
        return this.generateSubjectReportContent(data, language);
      case 'attendance':
        return this.generateAttendanceReportContent(data, language);
      case 'performance':
        return this.generatePerformanceReportContent(data, language);
      default:
        return '<div class="content-section"><p>Type de rapport non supporté</p></div>';
    }
  }

  private generateClassReportContent(data: ReportTemplateData, language: 'fr' | 'en'): string {
    const labels = {
      fr: {
        filters: 'FILTRES APPLIQUÉS',
        className: 'Classe',
        period: 'Période',
        summary: 'RÉSUMÉ DE CLASSE',
        totalStudents: 'Nombre total d\'élèves',
        averageGrade: 'Moyenne de classe',
        attendance: 'Taux de présence',
        details: 'DÉTAILS PAR ÉLÈVE'
      },
      en: {
        filters: 'APPLIED FILTERS',
        className: 'Class',
        period: 'Period',
        summary: 'CLASS SUMMARY',
        totalStudents: 'Total number of students',
        averageGrade: 'Class average',
        attendance: 'Attendance rate',
        details: 'STUDENT DETAILS'
      }
    };

    const t = labels[language];

    return `
      <div class="content-section">
        <h3>${t.filters}</h3>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">${t.className}:</span>
            <span class="info-value">${data.filters.className || 'Toutes'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.period}:</span>
            <span class="info-value">${data.filters.period || 'Toutes'}</span>
          </div>
        </div>
      </div>

      <div class="content-section">
        <h3>${t.summary}</h3>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">${t.totalStudents}:</span>
            <span class="info-value">${data.data.totalStudents || 0}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.averageGrade}:</span>
            <span class="info-value">${data.data.averageGrade || 0}/20</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.attendance}:</span>
            <span class="info-value">${data.data.attendanceRate || 0}%</span>
          </div>
        </div>
      </div>

      ${data.data.students ? `
        <div class="content-section">
          <h3>${t.details}</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Moyenne</th>
                <th>Rang</th>
                <th>Présence</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.students.map((student: any, index: number) => `
                <tr>
                  <td style="text-align: left;">${student.name}</td>
                  <td>${student.average}/20</td>
                  <td>${index + 1}</td>
                  <td>${student.attendance}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;
  }

  private generateStudentReportContent(data: ReportTemplateData, language: 'fr' | 'en'): string {
    // Implémentation similaire pour rapport étudiant
    return `<div class="content-section"><p>Rapport étudiant - Implémentation en cours</p></div>`;
  }

  private generateTeacherReportContent(data: ReportTemplateData, language: 'fr' | 'en'): string {
    // Implémentation similaire pour rapport enseignant
    return `<div class="content-section"><p>Rapport enseignant - Implémentation en cours</p></div>`;
  }

  private generateSubjectReportContent(data: ReportTemplateData, language: 'fr' | 'en'): string {
    // Implémentation similaire pour rapport matière
    return `<div class="content-section"><p>Rapport matière - Implémentation en cours</p></div>`;
  }

  private generateAttendanceReportContent(data: ReportTemplateData, language: 'fr' | 'en'): string {
    // Implémentation similaire pour rapport présence
    return `<div class="content-section"><p>Rapport présence - Implémentation en cours</p></div>`;
  }

  private generatePerformanceReportContent(data: ReportTemplateData, language: 'fr' | 'en'): string {
    // Implémentation similaire pour rapport performance
    return `<div class="content-section"><p>Rapport performance - Implémentation en cours</p></div>`;
  }
}

export const modularTemplateGenerator = new ModularTemplateGenerator();