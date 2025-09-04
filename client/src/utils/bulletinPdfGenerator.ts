import jsPDF from 'jspdf';
import QRCode from 'qrcode';

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
  teacherComments?: string;
  directorComments?: string;
  qrCode?: string;
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

  // ===== MODERN HEADER DESIGN =====
  const addModernHeader = () => {
    // Gradient background for header
    pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    // République du Cameroun avec style moderne
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('RÉPUBLIQUE DU CAMEROUN', pageWidth / 2, 15, { align: 'center' });
    
    // Ministère avec style élégant
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES', pageWidth / 2, 25, { align: 'center' });
    
    // Badge avec délégations
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(15, 32, pageWidth - 30, 15, 3, 3, 'F');
    
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    const regionaleText = data.schoolBranding?.regionaleMinisterielle || 'Délégation Régionale du Centre';
    const departementaleText = data.schoolBranding?.delegationDepartementale || 'Délégation Départementale du Mfoundi';
    const boitePostaleText = data.schoolBranding?.boitePostale || 'B.P. 8524 Yaoundé';
    
    pdf.text(`${regionaleText} • ${departementaleText}`, pageWidth / 2, 38, { align: 'center' });
    pdf.text(boitePostaleText, pageWidth / 2, 43, { align: 'center' });
    
    yPosition = 60;
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
      teacherComments: 'Observations des Enseignants',
      directorComments: 'Observations de la Direction',
      signatures: 'Signatures',
      director: 'Directeur',
      principalTeacher: 'Professeur Principal',
      verificationCode: 'Code de Vérification',
      qrCode: 'Code QR',
      authenticityNote: 'Ce bulletin est authentifié par signature numérique et code QR',
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
      teacherComments: 'Teacher Comments',
      directorComments: 'Director Comments',
      signatures: 'Signatures',
      director: 'Director',
      principalTeacher: 'Principal Teacher',
      verificationCode: 'Verification Code',
      qrCode: 'QR Code',
      authenticityNote: 'This report card is authenticated by digital signature and QR code',
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

  // === MODERN PROFESSIONAL HEADER ===
  addModernHeader();

  // === MODERN SCHOOL SECTION ===
  // Elegant school information card
  pdf.setFillColor(248, 250, 252); // Light gray background
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 5, 5, 'F');
  
  // School logo on left
  if (data.schoolBranding?.logoUrl) {
    try {
      const logoImg = new Image();
      logoImg.src = data?.schoolBranding?.logoUrl;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });
      
      if (logoImg.complete) {
        const logoSize = 25;
        pdf.addImage(logoImg, 'PNG', margin + 5, yPosition + 5, logoSize, logoSize);
      }
    } catch (error) {
      console.error('Error loading school logo:', error);
    }
  }

  // School name with modern typography
  pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.schoolBranding?.schoolName || 'ÉCOLE SECONDAIRE', pageWidth / 2, yPosition + 15, { align: 'center' });
  
  // National motto in elegant style
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'italic');
  pdf.text('« Paix - Travail - Patrie »', pageWidth / 2, yPosition + 25, { align: 'center' });
  
  yPosition += 40;

  // === MODERN STUDENT SECTION ===
  // Professional student information card
  const studentCardHeight = 45;
  
  // Gradient background for student card
  pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, studentCardHeight, 8, 8, 'F');
  
  // Student photo with modern styling
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
        const photoX = pageWidth - margin - photoSize - 8;
        
        // White circular background for photo
        pdf.setFillColor(255, 255, 255);
        pdf.circle(photoX + photoSize/2, yPosition + studentCardHeight/2, photoSize/2 + 2, 'F');
        
        // Add photo with rounded border effect
        pdf.addImage(photoImg, 'JPEG', photoX, yPosition + (studentCardHeight - photoSize)/2, photoSize, photoSize);
        studentPhotoLoaded = true;
      }
    } catch (error) {
      console.error('Error loading student photo:', error);
    }
  }
  
  // Modern photo placeholder if no photo
  if (!studentPhotoLoaded) {
    const photoSize = 35;
    const photoX = pageWidth - margin - photoSize - 8;
    
    // White circular background
    pdf.setFillColor(255, 255, 255);
    pdf.circle(photoX + photoSize/2, yPosition + studentCardHeight/2, photoSize/2 + 2, 'F');
    
    // Placeholder icon
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.circle(photoX + photoSize/2, yPosition + studentCardHeight/2, photoSize/2, 'D');
    
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('PHOTO', photoX + photoSize/2, yPosition + studentCardHeight/2 - 2, { align: 'center' });
    pdf.text('ÉLÈVE', photoX + photoSize/2, yPosition + studentCardHeight/2 + 4, { align: 'center' });
  }
  
  yPosition += studentCardHeight + 10;

  yPosition += 45;

  // === MODERN DOCUMENT TITLE ===
  // Decorative title section with professional styling
  pdf.setFillColor(250, 250, 250);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 5, 5, 'F');
  
  // Title with modern typography
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.text(t.title, pageWidth / 2, yPosition + 12, { align: 'center' });
  
  // Subtitle
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(t.officialTranscript, pageWidth / 2, yPosition + 20, { align: 'center' });
  
  // Decorative line under title
  pdf.setLineWidth(2);
  pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.line(pageWidth / 2 - 40, yPosition + 23, pageWidth / 2 + 40, yPosition + 23);
  
  yPosition += 35;

  // === MODERN STUDENT INFORMATION CARDS ===
  const cardHeight = 50;
  
  // Student info card with modern design
  pdf.setFillColor(245, 248, 252); // Light blue background
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, cardHeight, 6, 6, 'F');
  
  // Add accent border
  pdf.setLineWidth(2);
  pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.line(margin, yPosition, margin, yPosition + cardHeight);
  
  // Student name with prominent styling
  pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data?.student?.name || 'N/A', margin + 10, yPosition + 12);
  
  // Two-column layout for details
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const leftColX = margin + 10;
  const rightColX = pageWidth / 2 + 5;
  
  // Left column
  pdf.text(`${t.class}: ${data?.student?.class || 'N/A'}`, leftColX, yPosition + 22);
  pdf.text(`${t.period}: ${data.period || 'N/A'}`, leftColX, yPosition + 30);
  pdf.text(`${t.academicYear}: ${data.academicYear || 'N/A'}`, leftColX, yPosition + 38);
  
  // Right column with additional info
  if (data.student?.birthDate) {
    pdf.text(`${t.birthDate}: ${data.student.birthDate}`, rightColX, yPosition + 22);
  }
  if (data.student?.studentId) {
    pdf.text(`${t.studentId}: ${data.student.studentId}`, rightColX, yPosition + 30);
  }
  if (data.student?.nationality) {
    pdf.text(`${t.nationality}: ${data.student.nationality}`, rightColX, yPosition + 38);
  }
  
  yPosition += cardHeight + 15;

  // === MODERN GRADES TABLE ===
  // Professional table header with gradient effect
  pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 12, 3, 3, 'F');
  
  // Table title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t.gradesTable || 'RÉSULTATS ACADÉMIQUES', pageWidth / 2, yPosition + 8, { align: 'center' });
  
  yPosition += 18;
  
  // Column headers with modern styling
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');
  
  pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  const colWidths = [60, 25, 20, 25, 40, 45];
  const headers = [t.subject, t.grade, t.coefficient, t.points, t.teacher, t.comment];
  let xPos = margin + 3;

  headers.forEach((header, index) => {
    pdf.text(header, xPos, yPosition + 7);
    xPos += colWidths[index];
  });

  yPosition += 12;

  // === SUBJECTS DATA WITH MODERN STYLING ===
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  // Add alternating row colors for better readability

  data?.subjects?.forEach((subject, index) => {
    const rowHeight = 12;
    
    if (yPosition + rowHeight > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    // Alternating row background for modern table look
    if (index % 2 === 0) {
      pdf.setFillColor(252, 253, 254);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 1, 1, 'F');
    }

    xPos = margin + 3;
    
    // Subject name with better spacing
    pdf.setFont('helvetica', 'bold');
    pdf.text(subject.name, xPos, yPosition + 8);
    xPos += colWidths[0];
    
    // Grade with color coding
    pdf.setFont('helvetica', 'bold');
    const grade = subject.grade;
    if (grade >= 16) {
      pdf.setTextColor(34, 197, 94); // Green for excellent
    } else if (grade >= 14) {
      pdf.setTextColor(59, 130, 246); // Blue for good
    } else if (grade >= 10) {
      pdf.setTextColor(251, 146, 60); // Orange for average
    } else {
      pdf.setTextColor(239, 68, 68); // Red for poor
    }
    pdf.text(grade.toString(), xPos, yPosition + 8);
    pdf.setTextColor(0, 0, 0); // Reset color
    xPos += colWidths[1];
    
    // Coefficient
    pdf.setFont('helvetica', 'normal');
    pdf.text(subject.coefficient.toString(), xPos, yPosition + 8);
    xPos += colWidths[2];
    
    // Points calculation
    const points = (grade * subject.coefficient).toFixed(2);
    pdf.setFont('helvetica', 'bold');
    pdf.text(points, xPos, yPosition + 8);
    xPos += colWidths[3];
    
    // Teacher name
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(subject.teacher, xPos, yPosition + 8);
    xPos += colWidths[4];
    
    // Comment with better formatting
    if (subject.comment) {
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      const comment = pdf.splitTextToSize(subject.comment, colWidths[5] - 2);
      comment.forEach((line: string, lineIndex: number) => {
        pdf.text(line, xPos, yPosition + 6 + (lineIndex * 3));
      });
      pdf.setFontSize(10);
    }

    pdf.setTextColor(0, 0, 0); // Reset color
    yPosition += rowHeight;
  });

  yPosition += 10;

  // === MODERN SUMMARY SECTION ===
  yPosition += 10;
  
  // Summary card with modern styling
  pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 25, 5, 5, 'F');
  
  // Average and rank with prominent display
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  
  pdf.text(`${t.generalAverage}: ${data?.generalAverage?.toFixed(2)}/20`, margin + 10, yPosition + 12);
  pdf.text(`${t.classRank}: ${data.classRank}/${data.totalStudents}`, pageWidth - margin - 80, yPosition + 12);
  
  // Performance indicator
  const average = data?.generalAverage || 0;
  let performanceText = '';
  if (average >= 16) performanceText = language === 'fr' ? 'EXCELLENT' : 'EXCELLENT';
  else if (average >= 14) performanceText = language === 'fr' ? 'TRÈS BIEN' : 'VERY GOOD';
  else if (average >= 12) performanceText = language === 'fr' ? 'BIEN' : 'GOOD';
  else if (average >= 10) performanceText = language === 'fr' ? 'ASSEZ BIEN' : 'SATISFACTORY';
  else performanceText = language === 'fr' ? 'À AMÉLIORER' : 'NEEDS IMPROVEMENT';
  
  pdf.setFontSize(10);
  pdf.text(performanceText, pageWidth / 2, yPosition + 20, { align: 'center' });

  yPosition += 35;

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

  // QR Code and verification
  if (data.qrCode || data.verificationCode) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.text(t.authenticityNote, margin, yPosition);
    yPosition += 10;

    // Generate QR code
    if (data.verificationCode) {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(
          `EDUCAFRIC_BULLETIN_${data?.student?.id}_${data.verificationCode}`,
          { width: 100, margin: 1 }
        );
        
        pdf.addImage(qrCodeDataUrl, 'PNG', margin, yPosition, 25, 25);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(`${t.verificationCode}: ${data.verificationCode}`, margin + 30, yPosition + 10);
        pdf.text(`Hash: ${data.signatures?.[0]?.digitalSignatureHash?.substring(0, 16)}...`, margin + 30, yPosition + 15);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  }

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