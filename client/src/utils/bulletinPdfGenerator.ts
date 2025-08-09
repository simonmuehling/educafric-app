import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface Student {
  id: number;
  name: string;
  class: string;
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

  // Text labels
  const text = {
    fr: {
      title: 'BULLETIN SCOLAIRE',
      student: 'Élève',
      class: 'Classe',
      period: 'Période',
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
      student: 'Student',
      class: 'Class',
      period: 'Period',
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

  // Header with school logo
  pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');

  if (data.schoolBranding?.logoUrl) {
    try {
      // Load and add school logo
      const logoImg = new Image();
      logoImg.src = data?.schoolBranding?.logoUrl;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve; // Continue even if logo fails to load
      });
      
      if (logoImg.complete) {
        const logoSize = 25;
        pdf.addImage(logoImg, 'PNG', margin, yPosition, logoSize, logoSize);
        pdf.text(data?.schoolBranding?.schoolName || 'École', margin + logoSize + 10, yPosition + 15);
      }
    } catch (error) {
      console.error('Error loading school logo:', error);
      pdf.text(data?.schoolBranding?.schoolName || 'École', margin, yPosition + 15);
    }
  } else {
    pdf.text(data.schoolBranding?.schoolName || 'École', margin, yPosition + 15);
  }

  yPosition += 35;

  // Document title
  pdf.setFontSize(18);
  pdf.text(t.title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Student information section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  const studentInfo = [
    `${t.student}: ${data?.student?.name}`,
    `${t.class}: ${data?.student?.class}`,
    `${t.period}: ${data.period}`,
    `${t.academicYear}: ${data.academicYear}`
  ];

  studentInfo.forEach((info) => {
    pdf.text(info, margin, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Subjects table header
  pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');

  const colWidths = [60, 25, 20, 25, 40, 45];
  const headers = [t.subject, t.grade, t.coefficient, t.points, t.teacher, t.comment];
  let xPos = margin + 2;

  headers.forEach((header, index) => {
    pdf.text(header, xPos, yPosition + 6);
    xPos += colWidths[index];
  });

  yPosition += 8;

  // Subjects data
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  data?.subjects?.forEach((subject) => {
    const points = (subject.grade * subject.coefficient).toFixed(2);
    xPos = margin + 2;
    
    pdf.text(subject.name, xPos, yPosition + 6);
    xPos += colWidths[0];
    
    pdf.text(subject?.grade?.toString(), xPos, yPosition + 6);
    xPos += colWidths[1];
    
    pdf.text(subject?.coefficient?.toString(), xPos, yPosition + 6);
    xPos += colWidths[2];
    
    pdf.text(points, xPos, yPosition + 6);
    xPos += colWidths[3];
    
    pdf.text(subject.teacher, xPos, yPosition + 6);
    xPos += colWidths[4];
    
    pdf.text(subject.comment || '', xPos, yPosition + 6);
    
    yPosition += 8;
  });

  yPosition += 10;

  // General average and rank
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);

  pdf.text(`${t.generalAverage}: ${data?.generalAverage?.toFixed(2)}/20`, margin, yPosition);
  pdf.text(`${t.classRank}: ${data.classRank}/${data.totalStudents}`, pageWidth - margin - 60, yPosition);

  yPosition += 20;

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