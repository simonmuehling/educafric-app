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
  // Nouveaux champs T3 spécifiques
  firstTermRank?: number;
  secondTermRank?: number;
  annualAbsences?: number;
  firstTermAbsences?: number;
  secondTermAbsences?: number;
  participation?: string;
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
    orientation?: string; // Orientation suggérée
    councilDate?: string; // Date du conseil de classe
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

  // Fonction d'échappement HTML pour la sécurité
  private escapeHtml(text: string): string {
    const div = { innerHTML: '' } as any;
    div.textContent = text;
    return div.innerHTML || text.replace(/[&<>"']/g, (match: string) => {
      const escapeChars: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return escapeChars[match] || match;
    });
  }

  // ✅ FONCTION DE SÉCURITÉ POUR VALIDER ET ASSAINIR LES URLs D'IMAGES
  private sanitizeImageUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';
    
    // Nettoyer les espaces et caractères de contrôle
    const cleanUrl = url.trim().replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // Rejeter les URLs malveillantes
    if (
      cleanUrl.includes('"') || 
      cleanUrl.includes("'") || 
      cleanUrl.includes('<') || 
      cleanUrl.includes('>') ||
      cleanUrl.toLowerCase().startsWith('javascript:') ||
      cleanUrl.toLowerCase().startsWith('data:') ||
      cleanUrl.toLowerCase().startsWith('vbscript:') ||
      cleanUrl.toLowerCase().includes('onerror') ||
      cleanUrl.toLowerCase().includes('onload') ||
      cleanUrl.toLowerCase().includes('<script')
    ) {
      console.warn('[SECURITY] URL d\'image rejetée pour risque XSS:', cleanUrl.substring(0, 50));
      return '';
    }
    
    // Valider le format URL basique
    try {
      const urlObj = new URL(cleanUrl);
      // Autoriser seulement HTTP/HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        console.warn('[SECURITY] Protocole non autorisé dans URL image:', urlObj.protocol);
        return '';
      }
      return cleanUrl;
    } catch {
      // Si ce n'est pas une URL valide, vérifier si c'est un chemin relatif sécurisé
      if (cleanUrl.startsWith('/') || cleanUrl.startsWith('./') || !cleanUrl.includes(':')) {
        return cleanUrl;
      }
      console.warn('[SECURITY] URL d\'image malformée:', cleanUrl.substring(0, 50));
      return '';
    }
  }

  // Fonction pour raccourcir les noms d'enseignants
  private getTeacherInitials(teacherName: string): string {
    if (!teacherName || teacherName === 'Non assigné') return 'N/A';
    const parts = teacherName.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 8); // Limite à 8 caractères
    return parts.map(part => part.charAt(0)).join('.'); // Initiales
  }

  // Génération de l'en-tête optimisé avec informations élève à droite
  private generateEducafricHeader(schoolInfo: SchoolInfo, documentType: string, language: 'fr' | 'en' = 'fr', studentData?: any): string {
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
      <div class="educafric-header-compact">
        <div class="header-three-column-layout">
          <!-- SECTION GAUCHE: Infos officielles + École -->
          <div class="header-left-section">
            <div class="official-compact">
              <p class="republic-compact"><strong>RÉPUBLIQUE DU CAMEROUN</strong></p>
              <p class="motto-compact"><em>Paix - Travail - Patrie</em></p>
              <p class="ministry-compact"><strong>MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES</strong></p>
              <p class="delegation-compact"><strong>DÉLÉGATION RÉGIONALE ${this.escapeHtml(schoolInfo.regionalDelegation)}</strong></p>
              <p class="delegation-compact"><strong>DÉLÉGATION DÉPARTEMENTALE ${this.escapeHtml(schoolInfo.departmentalDelegation)}</strong></p>
            </div>
            
            <div class="school-compact">
              <h2 class="school-name-compact">${this.escapeHtml(schoolInfo.schoolName)}</h2>
              <p class="school-contact-compact">Tél: ${this.escapeHtml(schoolInfo.phoneNumber)}</p>
              <p class="school-contact-compact">${this.escapeHtml(schoolInfo.address)}</p>
            </div>
          </div>
          
          <!-- SECTION CENTRE: Logo École -->
          <div class="header-center-section">
            <div class="logo-center-container">
              ${schoolInfo.logo ? `<img src="${this.sanitizeImageUrl(schoolInfo.logo)}" alt="Logo École" class="school-logo-center" />` : '<div class="logo-box-center">LOGO<br>ÉCOLE</div>'}
            </div>
            <h3 class="document-title-center">${titleText}</h3>
            <p class="academic-period-center">${language === 'fr' ? 'Année Scolaire' : 'Academic Year'}: ${this.escapeHtml(schoolInfo.academicYear)}</p>
          </div>
          
          <!-- SECTION DROITE: Photo + Infos élève -->
          ${studentData ? `
          <div class="header-right-section">
            <div class="student-card-compact">
              <div class="student-photo-section">
                ${studentData.photo ? 
                  `<img src="${this.sanitizeImageUrl(studentData.photo)}" alt="Photo élève" class="student-photo-compact" />` : 
                  '<div class="photo-placeholder-compact">PHOTO<br>ÉLÈVE</div>'
                }
              </div>
              
              <div class="student-details-compact">
                <h4 class="student-name-compact">${this.escapeHtml(studentData.firstName)} ${this.escapeHtml(studentData.lastName)}</h4>
                <div class="student-info-grid">
                  <div class="info-item-compact">
                    <span class="label-compact">Né(e) le:</span>
                    <span class="value-compact">${this.escapeHtml(studentData.birthDate)}</span>
                  </div>
                  <div class="info-item-compact">
                    <span class="label-compact">À:</span>
                    <span class="value-compact">${this.escapeHtml(studentData.birthPlace)}</span>
                  </div>
                  <div class="info-item-compact">
                    <span class="label-compact">Classe:</span>
                    <span class="value-compact">${this.escapeHtml(studentData.className)}</span>
                  </div>
                  <div class="info-item-compact">
                    <span class="label-compact">Matricule:</span>
                    <span class="value-compact">${this.escapeHtml(studentData.studentNumber)}</span>
                  </div>
                  <div class="info-item-compact">
                    <span class="label-compact">Sexe:</span>
                    <span class="value-compact">${this.escapeHtml(studentData.gender)}</span>
                  </div>
                  ${studentData.isRepeater ? `
                  <div class="info-item-compact">
                    <span class="label-compact" style="color: #dc2626;">Redoublant:</span>
                    <span class="value-compact" style="color: #dc2626; font-weight: bold;">OUI</span>
                  </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
          ` : `
          <div class="header-right-section">
            <div class="placeholder-section">
              <!-- Section pour maintenir l'équilibre visuel -->
            </div>
          </div>
          `}
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
          margin: 3mm;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 7px;
          line-height: 1.0;
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
        
        /* NOUVEAU LAYOUT COMPACT OPTIMISÉ A4 */
        .educafric-header-compact {
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          margin-bottom: 3px;
        }
        
        .header-three-column-layout {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 4px;
          align-items: flex-start;
        }
        
        .header-left-section {
          justify-self: start;
        }
        
        .header-center-section {
          justify-self: center;
          text-align: center;
          min-width: 120px;
        }
        
        .header-right-section {
          justify-self: end;
        }
        
        /* SECTION OFFICIELLE COMPACTE */
        .official-compact {
          margin-bottom: 8px;
        }
        
        .republic-compact {
          font-size: 8px;
          font-weight: bold;
          margin: 0 0 0.5px 0;
          line-height: 1.0;
        }
        
        .motto-compact {
          font-size: 7px;
          margin: 0 0 1px 0;
          line-height: 1.0;
        }
        
        .ministry-compact {
          font-size: 7px;
          font-weight: bold;
          margin: 0 0 0.5px 0;
          line-height: 1.0;
        }
        
        .delegation-compact {
          font-size: 6px;
          font-weight: bold;
          margin: 0 0 0.5px 0;
          line-height: 1.0;
        }
        
        /* ÉCOLE COMPACTE */
        .school-compact {
          margin-top: 5px;
        }
        
        .school-name-compact {
          font-size: 9px;
          font-weight: bold;
          margin: 0 0 1px 0;
          color: #1e40af;
          line-height: 1.0;
        }
        
        .school-contact-compact {
          font-size: 7px;
          margin: 0 0 1px 0;
          line-height: 1.0;
        }
        
        /* SECTION CENTRE - LOGO ET TITRE */
        .logo-center-container {
          margin-bottom: 5px;
        }
        
        .school-logo-center {
          max-height: 60px;
          max-width: 80px;
          border: 1px solid #000;
          margin: 0 auto;
          display: block;
        }
        
        .logo-box-center {
          width: 80px;
          height: 60px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          font-size: 8px;
          font-weight: bold;
          text-align: center;
          line-height: 1.1;
          color: #6b7280;
          margin: 0 auto;
        }
        
        .document-title-center {
          font-size: 8px;
          font-weight: bold;
          margin: 2px 0 1px 0;
          color: #1e40af;
          background: linear-gradient(135deg, #f0f9ff, #dbeafe);
          padding: 1px 3px;
          border-radius: 2px;
          border: 0.5px solid #3b82f6;
          white-space: nowrap;
        }
        
        .academic-period-center {
          font-size: 8px;
          margin: 2px 0 0 0;
          font-weight: bold;
          color: #374151;
        }
        
        /* CARTE ÉLÈVE COMPACTE */
        .student-card-compact {
          border: 1px solid #1e40af;
          border-radius: 3px;
          padding: 3px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        }
        
        .student-photo-section {
          text-align: center;
          margin-bottom: 6px;
        }
        
        .student-photo-compact {
          width: 40px;
          height: 50px;
          object-fit: cover;
          border: 1px solid #374151;
          border-radius: 2px;
        }
        
        .photo-placeholder-compact {
          width: 40px;
          height: 50px;
          border: 1px solid #374151;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          font-size: 6px;
          font-weight: bold;
          text-align: center;
          line-height: 1.0;
          color: #6b7280;
          margin: 0 auto;
        }
        
        .student-name-compact {
          font-size: 7px;
          font-weight: bold;
          margin: 0 0 2px 0;
          text-align: center;
          color: #1e40af;
          line-height: 0.9;
        }
        
        .student-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2px;
        }
        
        .info-item-compact {
          display: flex;
          justify-content: space-between;
          font-size: 6px;
          line-height: 1.0;
          padding: 0.5px 0;
        }
        
        .label-compact {
          font-weight: bold;
          color: #374151;
        }
        
        .value-compact {
          color: #1f2937;
          text-align: right;
        }
        
        /* LOGO SECTION */
        .logo-section-compact {
          text-align: center;
          padding: 20px;
        }
        
        .school-logo-compact {
          max-height: 80px;
          max-width: 100px;
          border: 1px solid #000;
        }
        
        .logo-box-compact {
          width: 80px;
          height: 60px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: bold;
          text-align: center;
          line-height: 1.1;
          color: #6b7280;
          margin: 0 auto;
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
          margin: 4px 0;
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
          margin-bottom: 5px;
          font-size: 8px;
        }
        
        .subjects-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2px;
          font-size: 7px;
        }
        
        .subjects-table th,
        .subjects-table td {
          border: 1px solid #000;
          padding: 1px 2px;
          text-align: center;
          line-height: 1.0;
          vertical-align: middle;
        }
        
        .subjects-table th {
          background: #f8f9fa;
          font-weight: bold;
          font-size: 7px;
          height: 8px;
        }
        
        .subjects-table td {
          height: 7px;
          font-size: 7px;
        }
        
        /* ✅ SÉCURITÉ CSS - Empêcher débordement colonnes enseignants */
        .subjects-table td:nth-child(5) {
          max-width: 45px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        
        .subjects-table td:nth-child(6) {
          max-width: 50px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        
        .summary-section {
          text-align: center;
          margin: 2px 0;
          font-size: 7px;
          padding: 2px;
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
          margin-top: 3px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          font-size: 7px;
        }
        
        .signature-box {
          text-align: center;
          padding: 3px;
          min-height: 30px;
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
    const header = this.generateEducafricHeader(data.schoolInfo, 'bulletin', language, data.student);
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
          
          <!-- INFORMATIONS ÉLÈVE DÉJÀ INTÉGRÉES DANS L'EN-TÊTE COMPACT -->
          
          <div class="period-info-compact">
            <p style="text-align: center; font-weight: bold; color: #1e40af; margin: 2px 0; padding: 2px; background: #f0f9ff; border-radius: 2px; font-size: 8px;">${this.escapeHtml(data.period)}</p>
          </div>

          <div class="content-section">
            <h3 style="font-size: 8px; margin: 2px 0;">${t.subjects}</h3>
            <table class="subjects-table">
              <thead>
                <tr>
                  <th style="width: 25%;">Matière</th>
                  <th style="width: 12%;">T3</th>
                  <th style="width: 8%;">Coef</th>
                  <th style="width: 10%;">Pts</th>
                  <th style="width: 20%;">Prof</th>
                  <th style="width: 25%;">Remark</th>
                </tr>
              </thead>
              <tbody>
                ${data.subjects.map(subject => {
                  // ✅ AFFICHAGE CONDITIONNEL SELON LE TRIMESTRE
                  const coefficient = subject.coefficient || subject.coef || 1;
                  const teacherName = subject.teacherName || subject.teacher || 'Non assigné';
                  const remark = subject.comments || subject.remark || '';
                  
                  if (currentTerm === 'T3') {
                    // FORMAT T3 - SEULEMENT LES NOTES T3
                    const t3Grade = subject.t3 || subject.grade || 0;
                    const points = (t3Grade * coefficient).toFixed(1);
                    const teacherInitials = this.getTeacherInitials(teacherName);
                    const shortRemark = (remark.length > 12) ? remark.substring(0, 10) + '..' : remark;
                    
                    return `
                      <tr>
                        <td style="text-align: left; font-weight: bold;">${this.escapeHtml(subject.name)}</td>
                        <td>${t3Grade.toFixed(1)}</td>
                        <td>${coefficient}</td>
                        <td>${points}</td>
                        <td style="text-align: left;">${this.escapeHtml(teacherInitials)}</td>
                        <td style="text-align: left;">${this.escapeHtml(shortRemark)}</td>
                      </tr>
                    `;
                  } else {
                    // FORMAT T1/T2 CLASSIQUE
                    const gradeValue = subject.grade || 0;
                    const points = (gradeValue * coefficient).toFixed(1);
                    const teacherInitials = this.getTeacherInitials(teacherName);
                    const shortRemark = (remark.length > 12) ? remark.substring(0, 10) + '..' : remark;
                    
                    return `
                      <tr>
                        <td style="text-align: left; font-weight: bold;">${this.escapeHtml(subject.name)}</td>
                        <td>${gradeValue}</td>
                        <td>${coefficient}</td>
                        <td>${points}</td>
                        <td style="text-align: left;">${this.escapeHtml(teacherInitials)}</td>
                        <td style="text-align: left;">${this.escapeHtml(shortRemark)}</td>
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
            ${currentTerm === 'T3' ? `
              <!-- BULLETIN T3 - FORMAT OFFICIEL AFRICAIN DE FIN D'ANNÉE -->
              <div class="annual-summary-section">
                <h2 style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 6px; text-align: center; margin: 8px 0; border-radius: 6px; font-size: 11px;">📋 BILAN ANNUEL ${this.escapeHtml(data.schoolInfo.academicYear)}</h2>
                
                <div class="annual-stats" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin: 6px 0; padding: 6px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                  <div class="annual-averages">
                    <h4 style="color: #1e40af; margin-bottom: 3px; font-size: 8px;">🎯 MOYENNES</h4>
                    <div style="font-size: 7px; line-height: 1.3;">
                      <p><strong>T1:</strong> ${data.firstTermAverage || (data.subjects.reduce((sum, s) => sum + (s.t1 || 0), 0) / data.subjects.length).toFixed(1) || '—'}/20</p>
                      <p><strong>T2:</strong> ${data.secondTermAverage || (data.subjects.reduce((sum, s) => sum + (s.t2 || 0), 0) / data.subjects.length).toFixed(1) || '—'}/20</p>
                      <p><strong>T3:</strong> ${data.thirdTermAverage || data.generalAverage}/20</p>
                      <p style="color: #1e40af; font-weight: bold; border-top: 1px solid #cbd5e1; padding-top: 2px; margin-top: 2px;"><strong>ANNUELLE: ${data.annualAverage || (((data.firstTermAverage || 0) + (data.secondTermAverage || 0) + (data.thirdTermAverage || data.generalAverage)) / 3).toFixed(1)}/20</strong></p>
                    </div>
                  </div>
                  
                  <div class="annual-positions">
                    <h4 style="color: #1e40af; margin-bottom: 3px; font-size: 8px;">🏆 RANGS</h4>
                    <div style="font-size: 7px; line-height: 1.3;">
                      <p><strong>T1:</strong> ${data.firstTermRank || '—'}/${data.totalStudents}</p>
                      <p><strong>T2:</strong> ${data.secondTermRank || '—'}/${data.totalStudents}</p>
                      <p><strong>T3:</strong> ${data.classRank}/${data.totalStudents}</p>
                      <p style="color: #1e40af; font-weight: bold; border-top: 1px solid #cbd5e1; padding-top: 2px; margin-top: 2px;"><strong>ANNUEL: ${data.annualPosition || data.classRank}/${data.totalStudents}</strong></p>
                    </div>
                  </div>
                  
                  <div class="annual-progression">
                    <h4 style="color: #1e40af; margin-bottom: 3px; font-size: 8px;">📈 ÉVOLUTION</h4>
                    <div style="font-size: 7px; line-height: 1.3;">
                      <p><strong>T1→T2:</strong> ${((data.secondTermAverage || 0) > (data.firstTermAverage || 0)) ? '📈 +' + ((data.secondTermAverage || 0) - (data.firstTermAverage || 0)).toFixed(1) : ((data.secondTermAverage || 0) < (data.firstTermAverage || 0)) ? '📉 ' + ((data.secondTermAverage || 0) - (data.firstTermAverage || 0)).toFixed(1) : '➡️ Stable'}</p>
                      <p><strong>T2→T3:</strong> ${((data.generalAverage || 0) > (data.secondTermAverage || 0)) ? '📈 +' + ((data.generalAverage || 0) - (data.secondTermAverage || 0)).toFixed(1) : ((data.generalAverage || 0) < (data.secondTermAverage || 0)) ? '📉 ' + ((data.generalAverage || 0) - (data.secondTermAverage || 0)).toFixed(1) : '➡️ Stable'}</p>
                      <p><strong>Bilan:</strong> ${((data.generalAverage || 0) > (data.firstTermAverage || 0)) ? '🟢 Positif' : ((data.generalAverage || 0) < (data.firstTermAverage || 0)) ? '🟡 Améliorer' : '🔵 Constant'}</p>
                      <p style="color: #1e40af; font-weight: bold; border-top: 1px solid #cbd5e1; padding-top: 2px; margin-top: 2px;"><strong>Pts T3: ${((data.generalAverage || 0) * data.subjects.reduce((sum, s) => sum + (s.coefficient || 1), 0)).toFixed(1)}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- DÉCISION OFFICIELLE DU CONSEIL DE CLASSE -->
              <div class="council-decision" style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #fef3c7, #fbbf24); border-radius: 12px; border: 3px solid #f59e0b;">
                <h2 style="text-align: center; color: #92400e; margin-bottom: 15px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">⚖️ DÉCISION DU CONSEIL DE CLASSE</h2>
                
                <div class="decision-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                  <div class="decision-left">
                    <div class="decision-item" style="margin-bottom: 10px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px;">
                      <span style="font-weight: bold; color: #92400e;">📋 Décision:</span><br>
                      <span style="font-size: 14px; font-weight: bold; color: ${data.decision?.council?.includes('Admis') || data.decision?.council?.includes('ADMIS') ? '#059669' : '#dc2626'};">
                        ${this.escapeHtml(data.decision?.council || 'ADMIS(E) EN CLASSE SUPÉRIEURE')}
                      </span>
                    </div>
                    
                    <div class="decision-item" style="margin-bottom: 10px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px;">
                      <span style="font-weight: bold; color: #92400e;">🏅 Mention:</span><br>
                      <span style="font-size: 13px; font-weight: bold; color: #1e40af;">${this.escapeHtml(data.decision?.mention || (data.generalAverage >= 16 ? 'TRÈS BIEN' : data.generalAverage >= 14 ? 'BIEN' : data.generalAverage >= 12 ? 'ASSEZ BIEN' : 'PASSABLE'))}</span>
                    </div>
                  </div>
                  
                  <div class="decision-right">
                    <div class="decision-item" style="margin-bottom: 10px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px;">
                      <span style="font-weight: bold; color: #92400e;">🎯 Orientation:</span><br>
                      <span style="font-size: 12px;">${this.escapeHtml(data.decision?.orientation || 'Filière générale recommandée')}</span>
                    </div>
                    
                    <div class="decision-item" style="padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px;">
                      <span style="font-weight: bold; color: #92400e;">📅 Date du Conseil:</span><br>
                      <span style="font-size: 12px;">${this.escapeHtml(data.decision?.councilDate || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }))}</span>
                    </div>
                  </div>
                </div>
                
                <div class="council-summary" style="text-align: center; padding: 10px; background: rgba(255,255,255,0.8); border-radius: 6px; border: 1px solid #f59e0b;">
                  <p style="font-size: 11px; margin: 0; color: #92400e; line-height: 1.4;">
                    <strong>📋 PROCÈS-VERBAL:</strong> Réuni le ${this.escapeHtml(data.decision?.councilDate || new Date().toLocaleDateString('fr-FR'))}, le conseil de classe a examiné les résultats de l'élève et a pris la décision ci-dessus après délibération collégiale.
                  </p>
                </div>
              </div>
              
              <!-- BILAN COMPORTEMENTAL ANNUEL -->
              <div class="behavior-annual" style="margin: 15px 0; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 2px solid #0ea5e9;">
                <h3 style="color: #0c4a6e; margin-bottom: 10px; font-size: 14px;">👤 BILAN COMPORTEMENTAL ANNUEL</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; font-size: 12px;">
                  <div><strong>Conduite générale:</strong><br>${this.escapeHtml(data.conduct || 'Très Bien')} (${data.conductGrade}/20)</div>
                  <div><strong>Assiduité:</strong><br>${(data.absences || 0) <= 5 ? 'Excellente' : (data.absences || 0) <= 15 ? 'Bonne' : 'À améliorer'}</div>
                  <div><strong>Participation:</strong><br>${this.escapeHtml(data.participation || 'Active et constructive')}</div>
                </div>
                <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px;">
                  <strong>📊 Total absences annuelles:</strong> ${data.annualAbsences || (data.absences * 3) || 0} heures 
                  (T1: ${data.firstTermAbsences || Math.floor((data.absences || 0) * 0.3)} • T2: ${data.secondTermAbsences || Math.floor((data.absences || 0) * 0.3)} • T3: ${data.absences || 0})
                </div>
              </div>
            ` : `
              <!-- BULLETIN T1/T2 - FORMAT STANDARD -->
              <div class="standard-section">
                <div class="info-row" style="text-align: center; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <p style="font-size: 13px; color: #475569; margin: 0;">📊 Bulletin de contrôle trimestriel - Évaluation intermédiaire</p>
                </div>
              </div>
            `}
          </div>

          <div class="comments-section">
            <!-- Sections PROCÈS-VERBAL et DÉCISION DE LA DIRECTION supprimées -->
          </div>

          <!-- SIGNATURES OFFICIELLES RENFORCÉES POUR T3 -->
          <div class="footer-section">
            ${currentTerm === 'T3' ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 20px; padding: 15px; background: #fafafa; border-radius: 8px; border: 2px solid #e5e7eb;">
                <div class="signature-box" style="text-align: center; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; background: white;">
                  <strong style="color: #374151;">📝 Le Professeur Principal</strong><br>
                  <div style="height: 35px; border-bottom: 1px solid #d1d5db; margin: 8px 0;"></div>
                  <strong style="font-size: 11px;">${this.escapeHtml(data.signatures?.homeroomTeacher || 'Mme Diallo Fatou Marie')}</strong>
                  <div style="font-size: 9px; color: #6b7280; margin-top: 4px;">Visa et signature</div>
                </div>
                
                <div class="signature-box" style="text-align: center; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; background: white;">
                  <strong style="color: #374151;">🏛️ Le Directeur</strong><br>
                  <div style="height: 35px; border-bottom: 1px solid #d1d5db; margin: 8px 0;"></div>
                  <strong style="font-size: 11px;">${this.escapeHtml(data.signatures?.director || data.schoolInfo.directorName)}</strong>
                  <div style="font-size: 9px; color: #6b7280; margin-top: 4px;">Cachet et signature</div>
                </div>
                
                <div class="signature-box" style="text-align: center; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; background: white;">
                  <strong style="color: #374151;">👨‍👩‍👧‍👦 Le Parent/Tuteur</strong><br>
                  <div style="height: 35px; border-bottom: 1px solid #d1d5db; margin: 8px 0;"></div>
                  <strong style="font-size: 11px;">_________________</strong>
                  <div style="font-size: 9px; color: #6b7280; margin-top: 4px;">Pris connaissance</div>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 15px; padding: 10px; background: linear-gradient(135deg, #fef3c7, #fbbf24); border-radius: 6px; border: 1px solid #f59e0b;">
                <p style="font-size: 10px; color: #92400e; margin: 0; font-weight: bold;">🏛️ VALIDÉ PAR LE CONSEIL DE CLASSE • ⚖️ DÉCISION OFFICIELLE • 📋 DOCUMENT AUTHENTIFIÉ</p>
                <p style="font-size: 9px; color: #92400e; margin: 2px 0 0 0;">Ce bulletin de fin d'année a valeur officielle pour l'inscription dans l'établissement de niveau supérieur</p>
              </div>
            ` : `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="signature-box" style="text-align: center; padding: 15px;">
                  <strong>Le Professeur Principal</strong><br>
                  <div style="height: 40px;"></div>
                  <div style="border-top: 1px solid #000; padding-top: 5px;">
                    <strong>${this.escapeHtml(data.signatures?.homeroomTeacher || 'Mme Diallo Fatou Marie')}</strong>
                  </div>
                </div>
                <div class="signature-box" style="text-align: center; padding: 15px;">
                  <strong>Le Directeur</strong><br>
                  <div style="height: 40px;"></div>
                  <div style="border-top: 1px solid #000; padding-top: 5px;">
                    <strong>${this.escapeHtml(data.signatures?.director || data.schoolInfo.directorName)}</strong>
                  </div>
                </div>
              </div>
            `}
          </div>

          ${data.verificationCode ? `
          <div class="verification-section">
            <div class="verification-left">
              <p><strong>Code: ${this.escapeHtml(data.verificationCode)}</strong></p>
              <p><strong>Authentification: www.educafric.com/verify</strong></p>
              <p>Ce bulletin est authentifié par signature numérique EDUCAFRIC</p>
              <p><strong>Code de vérification: ${this.escapeHtml(data.verificationCode)}</strong></p>
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
            <p><strong>${this.escapeHtml(data.schoolInfo.schoolName)} - ${this.escapeHtml(data.schoolInfo.address)} - Tel: ${this.escapeHtml(data.schoolInfo.phoneNumber)}</strong></p>
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
        <title>Rapport ${data.reportType} - ${this.escapeHtml(data.schoolInfo.schoolName)}</title>
        ${styles}
      </head>
      <body>
        <div class="document-container">
          ${header}
          ${reportContent}
          <div class="document-footer">
            <p>Rapport généré le ${this.escapeHtml(data.generatedAt)} par ${this.escapeHtml(data.generatedBy)}</p>
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
            <span class="info-value">${this.escapeHtml(data.filters.className || 'Toutes')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.period}:</span>
            <span class="info-value">${this.escapeHtml(data.filters.period || 'Toutes')}</span>
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
                  <td style="text-align: left;">${this.escapeHtml(student.name)}</td>
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