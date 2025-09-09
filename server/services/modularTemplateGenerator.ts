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
  // Informations officielles Cameroun
  regionalDelegation: string; // ex: "DU CENTRE"
  departmentalDelegation: string; // ex: "DU MFOUNDI"
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
    photo?: string; // URL de la photo de l'élève
    isRepeater?: boolean;
    enrollment?: number;
  };
  period: string;
  termNumber?: string; // T1, T2, T3
  subjects: Array<{
    name: string;
    grade?: number; // Pour compatibilité
    maxGrade?: number; // Pour compatibilité  
    coefficient: number;
    comments?: string;
    teacherName?: string; // Nom de l'enseignant de la matière
    // Nouvelles colonnes format camerounais
    t1Grade?: number;
    t2Grade?: number;
    t3Grade?: number;
    total?: number;
    position?: number;
    averageMark?: number;
    remark?: string;
    // ✅ NOUVEAUX CHAMPS POUR MOYENNES ANNUELLES (selon JSON fourni)
    t1?: number;
    t2?: number;
    t3?: number;
    avgAnnual?: number; // Moyenne annuelle de la matière
    coef?: number; // Alias pour coefficient
    teacher?: string; // Alias pour teacherName
  }>;
  generalAverage: number;
  classRank: number;
  totalStudents: number;
  conduct: string;
  conductGrade: number; // Note de conduite sur 20
  absences: number;
  verificationCode?: string; // Code de vérification unique
  // Nouvelles données performance académique
  firstTermAverage?: number;
  secondTermAverage?: number;
  thirdTermAverage?: number;
  annualAverage?: number;
  annualPosition?: number;
  totalEnrolment?: number;
  appreciation?: string;
  // Nouvelles données discipline
  punishment?: string;
  sanctions?: string;
  finalRemark?: string;
  classPerformance?: string;
  highestAvg?: number;
  lowestAvg?: number;
  councilDecision?: string;
  // ✅ NOUVEAUX CHAMPS T3 SELON JSON FOURNI
  summary?: {
    avgT3?: number;
    rankT3?: string;
    avgAnnual?: number;
    rankAnnual?: string;
    conduct?: {
      score: number;
      label: string;
    };
    absences?: {
      justified: number;
      unjustified: number;
    };
  };
  decision?: {
    council?: string; // "Admis en 5ème" ou "Redouble"
    mention?: string; // "Bien", "Très Bien", etc.
    observationsTeacher?: string;
    observationsDirector?: string;
  };
  signatures?: {
    homeroomTeacher?: string;
    director?: string;
  };
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

  // ✅ FONCTION POUR DÉTERMINER LE TRIMESTRE DEPUIS LA PÉRIODE
  private getCurrentTermFromPeriod(period: string): string {
    if (period.includes('1er') || period.includes('Premier') || period.includes('T1')) {
      return 'T1';
    } else if (period.includes('2ème') || period.includes('Deuxième') || period.includes('Second') || period.includes('T2')) {
      return 'T2';
    } else if (period.includes('3ème') || period.includes('Troisième') || period.includes('T3')) {
      return 'T3';
    }
    return 'T1'; // Default
  }

  // Génération de l'en-tête officiel camerounais avec informations de l'école
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
        <div class="official-header">
          <div class="cameroon-header">
            <div class="official-left">
              <p class="republic"><strong>RÉPUBLIQUE DU CAMEROUN</strong></p>
              <p class="motto"><em>Paix - Travail - Patrie</em></p>
              <p class="ministry"><strong>MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES</strong></p>
              <p class="delegation"><strong>DÉLÉGATION RÉGIONALE ${schoolInfo.regionalDelegation}</strong></p>
              <p class="delegation"><strong>DÉLÉGATION DÉPARTEMENTALE ${schoolInfo.departmentalDelegation}</strong></p>
            </div>
            <div class="logos-section">
              <div class="logo-placeholder">
                ${schoolInfo.logo ? `<img src="${schoolInfo.logo}" alt="Logo École" class="school-logo-img" />` : '<div class="logo-box">LOGO<br>ÉCOLE</div>'}
              </div>
            </div>
          </div>
        </div>
        
        <div class="school-info-section">
          <div class="school-details">
            <h2 class="school-name">${schoolInfo.schoolName}</h2>
            <p class="school-contact">Tél: ${schoolInfo.phoneNumber}</p>
            <p class="school-address">${schoolInfo.address}</p>
          </div>
        </div>
        
        <div class="document-title-section">
          <h2 class="document-title">${titleText}</h2>
        </div>
        
        <div class="period-section">
          <p class="academic-period">${language === 'fr' ? 'Période' : 'Period'}: ${schoolInfo.academicYear}</p>
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
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .official-header {
          margin-bottom: 10px;
        }
        
        .cameroon-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        
        .official-left {
          flex: 1;
        }
        
        .republic {
          font-size: 12px;
          font-weight: bold;
          margin: 0 0 2px 0;
          text-align: left;
        }
        
        .motto {
          font-size: 10px;
          margin: 0 0 5px 0;
          text-align: left;
        }
        
        .ministry {
          font-size: 10px;
          font-weight: bold;
          margin: 0 0 2px 0;
          text-align: left;
        }
        
        .delegation {
          font-size: 9px;
          font-weight: bold;
          margin: 0 0 1px 0;
          text-align: left;
        }
        
        .logos-section {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        
        .logo-placeholder {
          text-align: center;
        }
        
        .school-logo-img {
          max-height: 50px;
          max-width: 60px;
          border: 1px solid #000;
        }
        
        .logo-box {
          width: 60px;
          height: 50px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          text-align: center;
          line-height: 1.1;
        }
        
        .school-info-section {
          text-align: center;
          margin-bottom: 10px;
        }
        
        .school-name {
          font-size: 14px;
          font-weight: bold;
          margin: 0 0 3px 0;
        }
        
        .school-contact, .school-address {
          font-size: 9px;
          margin: 1px 0;
        }
        
        .document-title-section {
          text-align: center;
          margin: 15px 0 10px 0;
        }
        
        .document-title {
          font-size: 16px;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .period-section {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .academic-period {
          font-size: 11px;
          margin: 0;
          font-weight: bold;
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
        
        .student-header-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          align-items: flex-start;
        }
        
        .student-info-left {
          flex: 1;
          font-size: 9px;
        }
        
        .student-photo-section {
          margin-left: 20px;
        }
        
        .student-photo {
          width: 80px;
          height: 100px;
          border: 1px solid #000;
          object-fit: cover;
        }
        
        .photo-placeholder {
          width: 80px;
          height: 100px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          background: #f9f9f9;
        }
        
        .period-info {
          text-align: center;
          margin-bottom: 15px;
          font-size: 10px;
        }
        
        .subjects-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 8px;
        }
        
        .subjects-table th,
        .subjects-table td {
          border: 1px solid #000;
          padding: 3px;
          text-align: center;
        }
        
        .subjects-table th {
          background: white;
          font-weight: bold;
          font-size: 7px;
        }
        
        .summary-section {
          text-align: center;
          margin: 10px 0;
          font-size: 10px;
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
        
        .comments-section {
          margin: 20px 0;
          font-size: 9px;
        }
        
        .comments-section h4 {
          font-size: 9px;
          font-weight: bold;
          margin: 10px 0 5px 0;
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
          padding: 10px;
          min-height: 80px;
        }
        
        .verification-section {
          margin-top: 15px;
          display: flex;
          justify-content: space-between;
          font-size: 8px;
          border-top: 1px solid #000;
          padding-top: 10px;
        }
        
        .verification-left {
          flex: 1;
        }
        
        .verification-right {
          width: 100px;
          text-align: center;
        }
        
        .qr-placeholder {
          border: 1px solid #000;
          padding: 10px;
          height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          font-size: 7px;
        }

        .qr-code-section {
          text-align: center;
          padding: 5px;
        }

        .qr-code-img {
          max-width: 80px;
          max-height: 80px;
          border: 1px solid #000;
        }

        .student-info-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .student-info-right {
          flex: 1;
          font-size: 9px;
        }
        
        .document-footer {
          text-align: center;
          font-size: 8px;
          margin-top: 15px;
          padding-top: 5px;
          font-weight: bold;
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

  // Génération de bulletin modulable avec gestion correcte des trimestres
  generateBulletinTemplate(data: BulletinTemplateData, language: 'fr' | 'en' = 'fr'): string {
    const header = this.generateEducafricHeader(data.schoolInfo, 'bulletin', language);
    const styles = this.getCommonStyles();
    
    // ✅ DÉTERMINER LE TRIMESTRE ACTUEL depuis la période
    const currentTerm = this.getCurrentTermFromPeriod(data.period);
    console.log('[TEMPLATE] 🎯 Trimestre détecté:', currentTerm, 'depuis période:', data.period);
    
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
          
          <div class="student-header-section">
            <div class="student-info-left">
              <div class="info-row">
                <span class="info-label">Élève:</span>
                <span class="info-value">${data.student.firstName} ${data.student.lastName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Classe:</span>
                <span class="info-value">${data.student.className}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Matricule:</span>
                <span class="info-value">${data.student.studentNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Né(e) le:</span>
                <span class="info-value">${data.student.birthDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Sexe:</span>
                <span class="info-value">${data.student.gender}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Lieu de naissance:</span>
                <span class="info-value">${data.student.birthPlace}</span>
              </div>
            </div>
            <div class="student-photo-section">
              ${data.student.photo ? 
                `<img src="${data.student.photo}" alt="Photo élève" class="student-photo" />` : 
                '<div class="photo-placeholder">PHOTO</div>'
              }
            </div>
          </div>
          
          <div class="period-info">
            <p><strong>Période: ${data.period}</strong></p>
          </div>

          <div class="content-section">
            <h3>${t.subjects}</h3>
            <table class="subjects-table">
              <thead>
                <tr>
                  <th>Matière</th>
                  ${currentTerm === 'T3' ? '<th>T1</th><th>T2</th><th>T3</th><th>Moy.Ann</th>' : '<th>Note/20</th>'}
                  <th>Coef</th>
                  <th>Points</th>
                  <th>Enseignant</th>
                  <th>Appréciation</th>
                </tr>
              </thead>
              <tbody>
                ${data.subjects.map(subject => {
                  // ✅ AFFICHAGE CONDITIONNEL SELON LE TRIMESTRE
                  const coefficient = subject.coefficient || subject.coef || 1;
                  const teacherName = subject.teacherName || subject.teacher || 'Non assigné';
                  const remark = subject.comments || subject.remark || '';
                  
                  if (currentTerm === 'T3' && (subject.t1 !== undefined || subject.t2 !== undefined || subject.t3 !== undefined)) {
                    // FORMAT T3 AVEC MOYENNES ANNUELLES
                    const t1 = subject.t1 || 0;
                    const t2 = subject.t2 || 0;
                    const t3 = subject.t3 || subject.grade || 0;
                    const avgAnnual = subject.avgAnnual || ((t1 + t2 + t3) / 3);
                    const points = (avgAnnual * coefficient).toFixed(1);
                    
                    return `
                      <tr>
                        <td style="text-align: left; font-weight: bold;">${subject.name}</td>
                        <td>${t1.toFixed(1)}</td>
                        <td>${t2.toFixed(1)}</td>
                        <td>${t3.toFixed(1)}</td>
                        <td><strong>${avgAnnual.toFixed(1)}</strong></td>
                        <td>${coefficient}</td>
                        <td>${points}</td>
                        <td style="text-align: left; font-size: 7px;">${teacherName}</td>
                        <td style="text-align: left; font-size: 6px;">${remark}</td>
                      </tr>
                    `;
                  } else {
                    // FORMAT T1/T2 CLASSIQUE
                    const gradeValue = subject.grade || 0;
                    const points = (gradeValue * coefficient).toFixed(1);
                    
                    return `
                      <tr>
                        <td style="text-align: left; font-weight: bold;">${subject.name}</td>
                        <td>${gradeValue}</td>
                        <td>${coefficient}</td>
                        <td>${points}</td>
                        <td style="text-align: left; font-size: 7px;">${teacherName}</td>
                        <td style="text-align: left; font-size: 6px;">${remark}</td>
                      </tr>
                    `;
                  }
                }).join('')}
              </tbody>
            </table>
            
            <div class="summary-section">
              ${currentTerm === 'T3' && data.summary ? `
                <p><strong>Moyenne T3: ${data.summary.avgT3 || data.generalAverage}/20 &nbsp;&nbsp;&nbsp;&nbsp; Rang T3: ${data.summary.rankT3 || data.classRank + '/' + data.totalStudents}</strong></p>
                <p><strong>Moyenne Annuelle: ${data.summary.avgAnnual || data.annualAverage}/20 &nbsp;&nbsp;&nbsp;&nbsp; Rang Annuel: ${data.summary.rankAnnual || data.annualPosition + '/' + data.totalStudents}</strong></p>
                <p><strong>Conduite: ${data.summary.conduct?.score || data.conductGrade}/20 (${data.summary.conduct?.label || data.conduct})</strong></p>
                <p><strong>Absences: ${data.summary.absences?.justified || 0} justifiées, ${data.summary.absences?.unjustified || 0} injustifiées</strong></p>
              ` : `
                <p><strong>Moyenne: ${data.generalAverage}/20 &nbsp;&nbsp;&nbsp;&nbsp; Rang: ${data.classRank}/${data.totalStudents} &nbsp;&nbsp;&nbsp;&nbsp; Conduite: ${data.conductGrade}/20 (${data.conduct})</strong></p>
              `}
            </div>
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
            ${currentTerm === 'T3' && data.decision ? `
              <h3>DÉCISION DU CONSEIL DE CLASSE</h3>
              <div class="decision-section">
                <div class="info-row">
                  <span class="info-label"><strong>Décision:</strong></span>
                  <span class="info-value"><strong style="color: ${data.decision.council?.includes('Admis') ? '#2563eb' : '#dc2626'};">${data.decision.council || 'À déterminer'}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label"><strong>Mention:</strong></span>
                  <span class="info-value"><strong>${data.decision.mention || 'Passable'}</strong></span>
                </div>
              </div>
            ` : `
            `}
          </div>

          <div class="comments-section">
            <!-- Sections PROCÈS-VERBAL et DÉCISION DE LA DIRECTION supprimées -->
          </div>

          <div class="footer-section">
            <div class="signature-box">
              <strong>Le Professeur Principal</strong><br>
              <div style="height: 40px;"></div>
              <div style="border-top: 1px solid #000; padding-top: 5px;">
                <strong>${data.signatures?.homeroomTeacher || 'Mme Diallo Fatou Marie'}</strong>
              </div>
            </div>
            <div class="signature-box">
              <strong>Le Directeur</strong><br>
              <div style="height: 40px;"></div>
              <div style="border-top: 1px solid #000; padding-top: 5px;">
                <strong>${data.signatures?.director || data.schoolInfo.directorName}</strong>
              </div>
            </div>
          </div>

          ${data.verificationCode ? `
          <div class="verification-section">
            <div class="verification-left">
              <p><strong>Code: ${data.verificationCode}</strong></p>
              <p><strong>Authentification: www.educafric.com/verify</strong></p>
              <p>Ce bulletin est authentifié par signature numérique EDUCAFRIC</p>
              <p><strong>Code de vérification: ${data.verificationCode}</strong></p>
            </div>
            <div class="verification-right">
              <div class="qr-code-section">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`https://www.educafric.com/verify?code=${data.verificationCode}`)}" alt="QR Code" class="qr-code-img" />
                <p style="font-size: 7px; margin-top: 3px;"><strong>Vérifier:<br>educafric.com</strong></p>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="document-footer">
            <p><strong>${data.schoolInfo.schoolName} - ${data.schoolInfo.address} - Tel: ${data.schoolInfo.phoneNumber}</strong></p>
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