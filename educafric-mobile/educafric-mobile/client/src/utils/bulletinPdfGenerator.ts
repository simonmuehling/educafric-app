import jsPDF from 'jspdf';

interface Student {
  id: number;
  name: string;
  class: string;
  photoUrl?: string;
  birthDate?: string;
  studentId?: string;
  nationality?: string;
  parentName?: string;
}

interface Subject {
  name: string;
  grade: number;
  coefficient: number;
  teacher: string;
  comment?: string;
}

interface SchoolBranding {
  schoolName: string;
  logoUrl?: string;
  directorSignatureUrl?: string;
  principalSignatureUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  footerText?: string;
  useWatermark?: boolean;
  watermarkText?: string;
  // Nouveaux champs officiels camerounais
  regionaleMinisterielle?: string;
  delegationDepartementale?: string;
  boitePostale?: string;
  arrondissement?: string;
}

interface DigitalSignature {
  signerName: string;
  signerRole: string;
  signedAt: string;
  digitalSignatureHash: string;
  verificationCode: string;
  signatureImageUrl?: string;
}

interface BulletinData {
  student: Student;
  subjects: Subject[];
  period: string;
  academicYear: string;
  generalAverage: number;
  classRank: number;
  totalStudents: number;
  conductGrade?: number;  // Note de conduite sur 20
  conduct?: string;       // Appréciation textuelle de conduite
  teacherComments?: string;
  directorComments?: string;
  verificationCode?: string;
  schoolBranding?: SchoolBranding;
  signatures?: DigitalSignature[];
}

export const generateBulletinPDF = async (data: BulletinData, language: 'fr' | 'en' = 'fr') => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf?.internal?.pageSize.getWidth();
  const pageHeight = pdf?.internal?.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Colors from school branding
  const primaryColor = data.schoolBranding?.primaryColor || '#1a365d';
  const secondaryColor = data.schoolBranding?.secondaryColor || '#2d3748';

  // Convert hex to RGB for jsPDF
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 26, g: 54, b: 93 };
  };

  const primaryRgb = hexToRgb(primaryColor);
  const secondaryRgb = hexToRgb(secondaryColor);

  // ===== CLEAN BLACK & WHITE HEADER =====
  const addProfessionalHeader = () => {
    // République du Cameroun - style classique
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('RÉPUBLIQUE DU CAMEROUN', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    
    // Devise du Cameroun
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Paix - Travail - Patrie', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;
    
    // Ministère
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;
    
    // Délégations avec encadré simple
    const regionaleText = data.schoolBranding?.regionaleMinisterielle || 'Délégation Régionale du Centre';
    const departementaleText = data.schoolBranding?.delegationDepartementale || 'Délégation Départementale du Mfoundi';
    const boitePostaleText = data.schoolBranding?.boitePostale || 'B.P. 8524 Yaoundé';
    
    pdf.setFontSize(11);
    pdf.text(regionaleText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    
    pdf.text(departementaleText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    
    pdf.setFontSize(10);
    pdf.text(boitePostaleText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    
    // Ligne de séparation simple
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
    yPosition += 8;
  };

  // Enhanced bilingual text labels for official transcripts
  const text = {
    fr: {
      title: 'BULLETIN SCOLAIRE',
      officialTranscript: 'RELEVÉ DE NOTES OFFICIEL',
      student: 'Nom de l\'élève',
      class: 'Classe',
      period: 'Période',
      birthDate: 'Date de naissance',
      studentId: 'N° Matricule',
      nationality: 'Nationalité',
      parentName: 'Nom du parent/tuteur',
      academicYear: 'Année Scolaire',
      subjects: 'Matières',
      subject: 'Matière',
      grade: 'Note',
      coefficient: 'Coeff.',
      points: 'Points',
      teacher: 'Enseignant',
      comment: 'Observation',
      generalAverage: 'Moyenne Générale',
      classRank: 'Rang',
      conduct: 'Conduite',
      conductGrade: 'Note de conduite',
      teacherComments: 'Observations des Enseignants',
      directorComments: 'Observations de la Direction',
      signatures: 'Signatures',
      director: 'Directeur',
      principalTeacher: 'Professeur Principal',
      verificationCode: 'Code de Vérification',
      authenticityNote: 'Ce bulletin est authentifié par signature numérique',
      digitalSignature: 'Signature Numérique'
    },
    en: {
      title: 'SCHOOL REPORT CARD',
      officialTranscript: 'OFFICIAL ACADEMIC TRANSCRIPT',
      student: 'Student Name',
      class: 'Class',
      period: 'Period',
      birthDate: 'Date of Birth',
      studentId: 'Student ID',
      nationality: 'Nationality',
      parentName: 'Parent/Guardian Name',
      academicYear: 'Academic Year',
      subjects: 'Subjects',
      subject: 'Subject',
      grade: 'Grade',
      coefficient: 'Coeff.',
      points: 'Points',
      teacher: 'Teacher',
      comment: 'Comment',
      generalAverage: 'General Average',
      classRank: 'Rank',
      conduct: 'Conduct',
      conductGrade: 'Conduct Grade',
      teacherComments: 'Teacher Comments',
      directorComments: 'Director Comments',
      signatures: 'Signatures',
      director: 'Director',
      principalTeacher: 'Principal Teacher',
      verificationCode: 'Verification Code',
      authenticityNote: 'This report card is authenticated by digital signature',
      digitalSignature: 'Digital Signature'
    }
  };

  const t = text[language];

  // Add watermark if enabled
  if (data.schoolBranding?.useWatermark && data.schoolBranding?.watermarkText) {
    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(50);
    pdf.text(data?.schoolBranding?.watermarkText, pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: 'center'
    });
  }

  // === MOBILE-OPTIMIZED SCHOOL ADMINISTRATIVE HEADER ===
  addProfessionalHeader();

  // === MOBILE-OPTIMIZED SCHOOL LOGO AND INFORMATION ===
  // School logo with mobile-friendly sizing
  if (data.schoolBranding?.logoUrl) {
    try {
      const logoImg = new Image();
      logoImg.src = data?.schoolBranding?.logoUrl;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });
      
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        const logoSize = 25; // Réduit pour mobile
        pdf.addImage(logoImg, 'PNG', margin, yPosition, logoSize, logoSize);
        console.log('[BULLETIN_LOGO] ✅ Logo école ajouté au bulletin (mobile-optimized)');
      } else {
        // Logo placeholder amélioré (mobile)
        const logoSize = 25;
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(1);
        pdf.rect(margin, yPosition, logoSize, logoSize);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('LOGO', margin + logoSize/2, yPosition + logoSize/2 - 2, { align: 'center' });
        pdf.text('ÉCOLE', margin + logoSize/2, yPosition + logoSize/2 + 4, { align: 'center' });
      }
    } catch (error) {
      console.error('Error loading school logo:', error);
      // Logo placeholder en cas d'erreur (mobile)
      const logoSize = 25;
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(1);
      pdf.rect(margin, yPosition, logoSize, logoSize);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('LOGO', margin + logoSize/2, yPosition + logoSize/2 - 2, { align: 'center' });
      pdf.text('ÉCOLE', margin + logoSize/2, yPosition + logoSize/2 + 4, { align: 'center' });
    }
  } else {
    // Logo placeholder par défaut (mobile)
    const logoSize = 25;
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(1);
    pdf.rect(margin, yPosition, logoSize, logoSize);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('LOGO', margin + logoSize/2, yPosition + logoSize/2 - 2, { align: 'center' });
    pdf.text('ÉCOLE', margin + logoSize/2, yPosition + logoSize/2 + 4, { align: 'center' });
  }

  // School name with mobile-optimized styling
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14); // Réduit pour mobile
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.schoolBranding?.schoolName || 'ÉTABLISSEMENT SCOLAIRE', pageWidth / 2, yPosition + 8, { align: 'center' });
  
  // Contact information (mobile-optimized)
  pdf.setFontSize(8); // Plus petit pour mobile
  pdf.setFont('helvetica', 'normal');
  const schoolContact = data.schoolBranding?.boitePostale || 'B.P. 8524 Yaoundé';
  pdf.text(schoolContact, pageWidth / 2, yPosition + 18, { align: 'center' });
  
  // National motto (mobile-optimized)
  pdf.setFontSize(9); // Plus petit pour mobile
  pdf.setFont('helvetica', 'italic');
  pdf.text('Paix - Travail - Patrie', pageWidth / 2, yPosition + 25, { align: 'center' });
  
  yPosition += 35;

  // === SIMPLE STUDENT PHOTO SECTION ===
  // Student photo with simple border
  let studentPhotoLoaded = false;
  if (data.student?.photoUrl) {
    try {
      const photoImg = new Image();
      photoImg.src = data.student.photoUrl;
      await new Promise((resolve) => {
        photoImg.onload = resolve;
        photoImg.onerror = resolve;
      });
      
      if (photoImg.complete) {
        const photoSize = 35;
        const photoX = pageWidth - margin - photoSize;
        
        // Simple black border for photo
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.rect(photoX - 2, yPosition - 2, photoSize + 4, photoSize + 4);
        pdf.addImage(photoImg, 'JPEG', photoX, yPosition, photoSize, photoSize);
        studentPhotoLoaded = true;
      }
    } catch (error) {
      console.error('Error loading student photo:', error);
    }
  }
  
  // Simple photo placeholder if no photo
  if (!studentPhotoLoaded) {
    const photoSize = 35;
    const photoX = pageWidth - margin - photoSize;
    
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(photoX - 2, yPosition - 2, photoSize + 4, photoSize + 4);
    
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text('PHOTO', photoX + photoSize/2, yPosition + photoSize/2 - 2, { align: 'center' });
    pdf.text('ÉLÈVE', photoX + photoSize/2, yPosition + photoSize/2 + 4, { align: 'center' });
  }
  
  yPosition += 45;

  yPosition += 45;

  // === SIMPLE DOCUMENT TITLE ===
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text(t.title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(t.officialTranscript, pageWidth / 2, yPosition, { align: 'center' });
  
  // Simple line under title
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(pageWidth / 2 - 40, yPosition + 3, pageWidth / 2 + 40, yPosition + 3);
  
  yPosition += 15;

  // === SIMPLE STUDENT INFORMATION ===
  // Simple rectangle border
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 40);
  
  // Student information - clean layout
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  
  const leftColX = margin + 5;
  const rightColX = pageWidth / 2 + 10;
  
  pdf.text(`${t.student}: ${data?.student?.name || 'N/A'}`, leftColX, yPosition + 8);
  pdf.text(`${t.class}: ${data?.student?.class || 'N/A'}`, leftColX, yPosition + 16);
  pdf.text(`${t.period}: ${data.period || 'N/A'}`, leftColX, yPosition + 24);
  pdf.text(`${t.academicYear}: ${data.academicYear || 'N/A'}`, leftColX, yPosition + 32);
  
  // Right column with additional info
  if (data.student?.birthDate) {
    pdf.text(`${t.birthDate}: ${data.student.birthDate}`, rightColX, yPosition + 8);
  }
  if (data.student?.studentId) {
    pdf.text(`${t.studentId}: ${data.student.studentId}`, rightColX, yPosition + 16);
  }
  if (data.student?.nationality) {
    pdf.text(`${t.nationality}: ${data.student.nationality}`, rightColX, yPosition + 24);
  }
  if (data.student?.parentName) {
    pdf.text(`${t.parentName}: ${data.student.parentName}`, rightColX, yPosition + 32);
  }
  
  yPosition += 50;

  // === SIMPLE GRADES TABLE ===
  // Simple table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  const colWidths = [60, 25, 20, 25, 40, 45];
  const headers = [t.subject, t.grade, t.coefficient, t.points, t.teacher, t.comment];
  let xPos = margin + 2;

  headers.forEach((header, index) => {
    pdf.text(header, xPos, yPosition + 6);
    xPos += colWidths[index];
  });

  yPosition += 8;

  // === SUBJECTS DATA WITH MODERN STYLING ===
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  // Add alternating row colors for better readability

  data?.subjects?.forEach((subject, index) => {
    const rowHeight = 8;
    
    if (yPosition + rowHeight > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    xPos = margin + 2;
    
    // All text in black, simple formatting
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    pdf.text(subject.name, xPos, yPosition + 6);
    xPos += colWidths[0];
    
    pdf.text(subject.grade.toString(), xPos, yPosition + 6);
    xPos += colWidths[1];
    
    pdf.text(subject.coefficient.toString(), xPos, yPosition + 6);
    xPos += colWidths[2];
    
    const points = (subject.grade * subject.coefficient).toFixed(1);
    pdf.text(points, xPos, yPosition + 6);
    xPos += colWidths[3];
    
    pdf.text(subject.teacher, xPos, yPosition + 6);
    xPos += colWidths[4];
    
    if (subject.comment) {
      const comment = pdf.splitTextToSize(subject.comment, colWidths[5] - 2);
      comment.forEach((line: string, lineIndex: number) => {
        pdf.text(line, xPos, yPosition + 6 + (lineIndex * 4));
      });
    }

    yPosition += rowHeight;
  });

  yPosition += 10;

  // === SIMPLE SUMMARY SECTION ===
  yPosition += 10;
  
  // Simple summary with black text
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);

  pdf.text(`${t.generalAverage}: ${data?.generalAverage?.toFixed(2)}/20`, margin, yPosition);
  pdf.text(`${t.classRank}: ${data.classRank}/${data.totalStudents}`, pageWidth - margin - 60, yPosition);

  yPosition += 12;

  // Section conduite si disponible
  if (data.conductGrade !== undefined || data.conduct) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    
    let conductText = t.conduct + ': ';
    if (data.conductGrade !== undefined) {
      conductText += `${data.conductGrade}/20`;
    }
    if (data.conduct) {
      conductText += data.conductGrade !== undefined ? ` (${data.conduct})` : data.conduct;
    }
    
    pdf.text(conductText, margin, yPosition);
    yPosition += 12;
  }

  yPosition += 8;

  // Comments sections
  if (data.teacherComments) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(t.teacherComments, margin, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    const splitText = pdf.splitTextToSize(data.teacherComments, pageWidth - 2 * margin);
    pdf.text(splitText, margin, yPosition);
    yPosition += (Array.isArray(splitText) ? splitText.length : 0) * 5 + 10;
  }

  if (data.directorComments) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(t.directorComments, margin, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    const splitText = pdf.splitTextToSize(data.directorComments, pageWidth - 2 * margin);
    pdf.text(splitText, margin, yPosition);
    yPosition += (Array.isArray(splitText) ? splitText.length : 0) * 5 + 10;
  }

  // Signatures section
  if (data.signatures && Array.isArray(data.signatures) && data.signatures.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.text(t.signatures, margin, yPosition);
    yPosition += 15;

    const signatureWidth = (pageWidth - 3 * margin) / 2;
    let signatureX = margin;

    for (const signature of data.signatures) {
      // Signature box
      pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.rect(signatureX, yPosition, signatureWidth, 40);

      // Signature image if available
      if (signature.signatureImageUrl) {
        try {
          const sigImg = new Image();
          sigImg.src = signature.signatureImageUrl;
          await new Promise((resolve) => {
            sigImg.onload = resolve;
            sigImg.onerror = resolve;
          });
          
          if (sigImg.complete) {
            pdf.addImage(sigImg, 'PNG', signatureX + 5, yPosition + 5, signatureWidth - 10, 20);
          }
        } catch (error) {
          console.error('Error loading signature image:', error);
        }
      }

      // Signature details
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      pdf.text(signature.signerName, signatureX + 2, yPosition + 32);
      pdf.text(
        signature.signerRole === 'director' ? t.director : t.principalTeacher,
        signatureX + 2,
        yPosition + 37
      );

      signatureX += signatureWidth + margin;
    }

    yPosition += 50;
  }

  // Document authenticity note - Professional without QR code
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.text(t.authenticityNote, margin, yPosition);
  yPosition += 8;

  // Verification information - Professional format
  if (data.verificationCode) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`${t.verificationCode}: ${data.verificationCode}`, margin, yPosition);
    yPosition += 6;
  }

  // Digital signature hash if available
  if (data.signatures?.[0]?.digitalSignatureHash) {
    const hashDisplay = data.signatures[0].digitalSignatureHash.substring(0, 16);
    pdf.text(`Signature numérique: ${hashDisplay}...`, margin, yPosition);
    yPosition += 6;
  }

  // Verification website
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Authentification: www.educafric.com', margin, yPosition);
  yPosition += 10;

  // Footer
  if (data.schoolBranding?.footerText) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      data?.schoolBranding?.footerText,
      pageWidth / 2,
      pageHeight - margin,
      { align: 'center' }
    );
  }

  return pdf;
};

export const downloadBulletinPDF = async (data: BulletinData, language: 'fr' | 'en' = 'fr') => {
  const pdf = await generateBulletinPDF(data, language);
  const fileName = `bulletin-${data?.student?.name.replace(/\s+/g, '_')}-${data.period}-${data.academicYear}.pdf`;
  pdf.save(fileName);
};