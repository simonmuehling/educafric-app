import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentData {
  id: number;
  firstName: string;
  lastName: string;
  className: string;
  matricule?: string;
  photo?: string;
  photoFilename?: string;
  profilePictureUrl?: string;
  photoURL?: string;
  profilePicture?: string;
  parentName?: string;
  parentPhone?: string;
  dateOfBirth?: string;
  educafricNumber?: string;
  gender?: string;
  bloodType?: string;
}

interface SchoolData {
  name: string;
  tagline?: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  email?: string;
  principalName?: string;
  principalSignature?: string;
}

interface StudentIDCardProps {
  student: StudentData;
  school: SchoolData;
  isOpen: boolean;
  onClose: () => void;
  validUntil?: string;
  schoolId?: number;
}

export function StudentIDCard({ student, school, isOpen, onClose, validUntil, schoolId }: StudentIDCardProps) {
  const { language } = useLanguage();
  const qrCanvasFrontRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasBackRef = useRef<HTMLCanvasElement>(null);
  const barcodeRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [showBack, setShowBack] = useState(false);
  
  // Fetch principal's digital signature for the school
  const { data: signatureData } = useQuery<{ signatureData: string | null; signatoryName?: string }>({
    queryKey: ['/api/signatures/principal'],
    enabled: isOpen
  });
  
  // Use stored signature or prop
  const principalSignature = signatureData?.signatureData || school.principalSignature;
  
  const fullName = `${student.firstName} ${student.lastName}`;
  const studentId = student.matricule || student.educafricNumber || `STD-${String(student.id).padStart(6, '0')}`;
  const cardId = `EDU-${new Date().getFullYear()}-${String(student.id).padStart(6, '0')}`;
  const issueDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const validityDate = validUntil || `Sept ${new Date().getFullYear() + 1}`;
  const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  
  const photoUrl = student.photo || student.photoFilename || student.profilePictureUrl || student.photoURL || student.profilePicture;
  let photoSrc: string | null = null;
  if (photoUrl) {
    if (photoUrl.startsWith('http') || photoUrl.startsWith('data:') || photoUrl.startsWith('/')) {
      photoSrc = photoUrl;
    } else {
      photoSrc = `/uploads/students/${photoUrl}`;
    }
  }

  useEffect(() => {
    if (isOpen && qrCanvasFrontRef.current) {
      const qrData = JSON.stringify({
        type: 'EDUCAFRIC_STUDENT',
        id: student.id,
        matricule: studentId,
        cardId: cardId,
        school: school.name,
        valid: validityDate
      });
      QRCode.toCanvas(qrCanvasFrontRef.current, qrData, {
        width: 80,
        margin: 1,
        color: { dark: '#1a365d', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });
    }
    if (isOpen && qrCanvasBackRef.current) {
      const verificationUrl = `https://verify.educafric.com/student/${cardId}`;
      QRCode.toCanvas(qrCanvasBackRef.current, verificationUrl, {
        width: 100,
        margin: 1,
        color: { dark: '#1a365d', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });
    }
  }, [isOpen, studentId, student.id, cardId, school.name, validityDate]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carte d'identité - ${fullName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background: #f0f0f0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 10mm;
            }
            
            .print-container {
              display: flex;
              gap: 15mm;
              flex-wrap: wrap;
              justify-content: center;
            }
            
            .id-card {
              width: 85.6mm;
              height: 54mm;
              border-radius: 3mm;
              position: relative;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
              page-break-inside: avoid;
            }
            
            /* FRONT CARD STYLES */
            .front-card {
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
              border: 0.5mm solid #e2e8f0;
            }
            
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 18mm;
              font-weight: 800;
              color: rgba(16, 185, 129, 0.03);
              white-space: nowrap;
              pointer-events: none;
              z-index: 1;
              letter-spacing: 2mm;
            }
            
            .security-pattern {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: 
                repeating-linear-gradient(45deg, transparent, transparent 2mm, rgba(16, 185, 129, 0.02) 2mm, rgba(16, 185, 129, 0.02) 4mm),
                repeating-linear-gradient(-45deg, transparent, transparent 2mm, rgba(16, 185, 129, 0.02) 2mm, rgba(16, 185, 129, 0.02) 4mm);
              pointer-events: none;
              z-index: 0;
            }
            
            .front-content {
              position: relative;
              z-index: 2;
              height: 100%;
              display: flex;
              flex-direction: column;
              padding: 2.5mm;
            }
            
            .header-strip {
              background: linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%);
              height: 8mm;
              margin: -2.5mm -2.5mm 2mm -2.5mm;
              display: flex;
              align-items: center;
              padding: 0 3mm;
              gap: 2mm;
            }
            
            .school-logo {
              width: 6mm;
              height: 6mm;
              border-radius: 1mm;
              object-fit: contain;
              background: white;
              padding: 0.3mm;
            }
            
            .logo-placeholder {
              width: 6mm;
              height: 6mm;
              background: white;
              border-radius: 1mm;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 3.5mm;
              font-weight: 800;
              color: #059669;
            }
            
            .header-text {
              flex: 1;
            }
            
            .school-name {
              font-size: 2.8mm;
              font-weight: 700;
              color: white;
              line-height: 1.1;
              text-shadow: 0 0.5mm 1mm rgba(0,0,0,0.2);
            }
            
            .school-tagline {
              font-size: 1.6mm;
              color: rgba(255,255,255,0.9);
              font-weight: 500;
            }
            
            .card-type-badge {
              background: rgba(255,255,255,0.95);
              color: #059669;
              font-size: 1.8mm;
              font-weight: 700;
              padding: 1mm 2mm;
              border-radius: 1mm;
              text-transform: uppercase;
              letter-spacing: 0.3mm;
            }
            
            .main-content {
              display: flex;
              gap: 3mm;
              flex: 1;
            }
            
            .photo-container {
              flex-shrink: 0;
            }
            
            .student-photo {
              width: 22mm;
              height: 28mm;
              border-radius: 2mm;
              object-fit: cover;
              border: 0.5mm solid #d1d5db;
              box-shadow: 0 1mm 3mm rgba(0,0,0,0.1);
            }
            
            .photo-placeholder {
              width: 22mm;
              height: 28mm;
              background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
              border-radius: 2mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 0.5mm solid #d1d5db;
              gap: 1mm;
            }
            
            .photo-placeholder svg {
              width: 8mm;
              height: 8mm;
              color: #9ca3af;
            }
            
            .photo-placeholder-text {
              font-size: 1.5mm;
              color: #9ca3af;
              font-weight: 500;
            }
            
            .info-panel {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            
            .student-name {
              font-size: 4mm;
              font-weight: 800;
              color: #111827;
              line-height: 1.1;
              margin-bottom: 1.5mm;
              text-transform: uppercase;
            }
            
            .info-grid {
              display: grid;
              gap: 1mm;
            }
            
            .info-row {
              display: flex;
              align-items: baseline;
              gap: 1mm;
            }
            
            .info-label {
              font-size: 1.8mm;
              color: #6b7280;
              font-weight: 600;
              min-width: 12mm;
            }
            
            .info-value {
              font-size: 2.2mm;
              color: #1f2937;
              font-weight: 700;
            }
            
            .validity-badge {
              display: inline-flex;
              align-items: center;
              gap: 0.5mm;
              background: linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%);
              color: #166534;
              font-size: 1.8mm;
              font-weight: 600;
              padding: 0.8mm 1.5mm;
              border-radius: 0.8mm;
              border: 0.2mm solid #86efac;
            }
            
            .qr-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              padding-top: 1mm;
            }
            
            .qr-code {
              width: 16mm;
              height: 16mm;
              border: 0.3mm solid #e5e7eb;
              border-radius: 1mm;
              padding: 0.5mm;
              background: white;
            }
            
            .qr-label {
              font-size: 1.5mm;
              color: #9ca3af;
              margin-top: 0.5mm;
              font-weight: 500;
            }
            
            .footer-strip {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: auto;
              padding-top: 1.5mm;
              border-top: 0.2mm solid #e5e7eb;
            }
            
            .card-id {
              font-size: 1.6mm;
              color: #9ca3af;
              font-family: 'Courier New', monospace;
              font-weight: 600;
            }
            
            .issue-date {
              font-size: 1.6mm;
              color: #6b7280;
            }
            
            /* BACK CARD STYLES */
            .back-card {
              background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%);
              border: 0.5mm solid #e2e8f0;
            }
            
            .back-content {
              position: relative;
              z-index: 2;
              height: 100%;
              display: flex;
              flex-direction: column;
              padding: 2.5mm;
            }
            
            .back-header {
              background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
              height: 6mm;
              margin: -2.5mm -2.5mm 2mm -2.5mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .back-title {
              font-size: 2.5mm;
              font-weight: 700;
              color: white;
              text-transform: uppercase;
              letter-spacing: 0.5mm;
            }
            
            .back-main {
              display: flex;
              gap: 3mm;
              flex: 1;
            }
            
            .verification-panel {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 1mm;
            }
            
            .back-qr {
              width: 20mm;
              height: 20mm;
              border: 0.3mm solid #e5e7eb;
              border-radius: 1.5mm;
              padding: 0.5mm;
              background: white;
            }
            
            .scan-instruction {
              font-size: 1.8mm;
              color: #6b7280;
              text-align: center;
              font-weight: 500;
            }
            
            .verification-url {
              font-size: 1.4mm;
              color: #3b82f6;
              font-family: 'Courier New', monospace;
            }
            
            .info-panel-back {
              flex: 1.2;
              display: flex;
              flex-direction: column;
              gap: 2mm;
            }
            
            .emergency-box {
              background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%);
              border: 0.3mm solid #f59e0b;
              border-radius: 1.5mm;
              padding: 2mm;
            }
            
            .emergency-title {
              font-size: 2mm;
              font-weight: 700;
              color: #92400e;
              margin-bottom: 0.8mm;
              display: flex;
              align-items: center;
              gap: 1mm;
            }
            
            .emergency-icon {
              width: 2.5mm;
              height: 2.5mm;
            }
            
            .emergency-info {
              font-size: 1.8mm;
              color: #78350f;
              line-height: 1.3;
            }
            
            .school-contact-box {
              background: #f1f5f9;
              border-radius: 1.5mm;
              padding: 1.5mm;
              flex: 1;
            }
            
            .contact-title {
              font-size: 1.8mm;
              font-weight: 700;
              color: #475569;
              margin-bottom: 0.8mm;
            }
            
            .contact-line {
              font-size: 1.6mm;
              color: #64748b;
              line-height: 1.4;
            }
            
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: auto;
              padding-top: 1.5mm;
              border-top: 0.2mm solid #e5e7eb;
            }
            
            .signature-box {
              text-align: center;
              width: 25mm;
            }
            
            .signature-line {
              border-bottom: 0.3mm solid #94a3b8;
              height: 4mm;
              margin-bottom: 0.5mm;
            }
            
            .signature-label {
              font-size: 1.5mm;
              color: #64748b;
              font-weight: 500;
            }
            
            .security-notice {
              position: absolute;
              bottom: 1mm;
              left: 50%;
              transform: translateX(-50%);
              font-size: 1.2mm;
              color: #94a3b8;
              text-align: center;
              font-style: italic;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              .print-container {
                gap: 5mm;
              }
              .id-card {
                box-shadow: none;
                border: 0.3mm solid #d1d5db;
              }
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const text = language === 'fr' ? {
    title: "Carte d'Identité Scolaire",
    printCard: "Imprimer la carte",
    flipCard: "Retourner",
    studentCard: "Carte Élève",
    studentId: "N° Matricule",
    class: "Classe",
    academicYear: "Année",
    validThru: "Validité",
    cardNumber: "N° Carte",
    issuedOn: "Émis le",
    verification: "Vérification Officielle",
    scanToVerify: "Scanner pour vérifier l'authenticité",
    verifyAt: "verify.educafric.com",
    emergencyContact: "Contact d'urgence",
    schoolContact: "Contact École",
    principalSignature: "Signature Directeur",
    studentSignature: "Signature Élève",
    securityNotice: "Document officiel - Ne pas dupliquer",
    photo: "PHOTO",
    close: "Fermer"
  } : {
    title: "Student ID Card",
    printCard: "Print Card",
    flipCard: "Flip",
    studentCard: "Student Card",
    studentId: "Student ID",
    class: "Class",
    academicYear: "Year",
    validThru: "Valid Thru",
    cardNumber: "Card No.",
    issuedOn: "Issued on",
    verification: "Official Verification",
    scanToVerify: "Scan to verify authenticity",
    verifyAt: "verify.educafric.com",
    emergencyContact: "Emergency Contact",
    schoolContact: "School Contact",
    principalSignature: "Principal Signature",
    studentSignature: "Student Signature",
    securityNotice: "Official document - Do not duplicate",
    photo: "PHOTO",
    close: "Close"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">{text.title}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBack(!showBack)}
                className="border-gray-300"
                data-testid="button-flip-id-card"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {text.flipCard}
              </Button>
              <Button
                onClick={handlePrint}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-print-id-card"
              >
                <Printer className="w-4 h-4 mr-2" />
                {text.printCard}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6 bg-gray-100 rounded-lg">
          <div ref={printRef} className="print-container" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            
            {/* FRONT SIDE */}
            <div 
              className="id-card front-card"
              style={{
                width: '85.6mm',
                height: '54mm',
                borderRadius: '3mm',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                border: '0.5mm solid #e2e8f0',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                display: showBack ? 'none' : 'block'
              }}
            >
              {/* Watermark */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-30deg)',
                fontSize: '18mm',
                fontWeight: 800,
                color: 'rgba(16, 185, 129, 0.03)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 1,
                letterSpacing: '2mm'
              }}>
                EDUCAFRIC
              </div>
              
              {/* Security Pattern */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2mm, rgba(16, 185, 129, 0.02) 2mm, rgba(16, 185, 129, 0.02) 4mm), repeating-linear-gradient(-45deg, transparent, transparent 2mm, rgba(16, 185, 129, 0.02) 2mm, rgba(16, 185, 129, 0.02) 4mm)',
                pointerEvents: 'none',
                zIndex: 0
              }} />
              
              <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', padding: '2.5mm' }}>
                {/* Header Strip */}
                <div style={{
                  background: 'linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)',
                  height: '8mm',
                  margin: '-2.5mm -2.5mm 2mm -2.5mm',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 3mm',
                  gap: '2mm'
                }}>
                  {school.logoUrl ? (
                    <img src={school.logoUrl} alt="Logo" style={{ width: '6mm', height: '6mm', borderRadius: '1mm', objectFit: 'contain', background: 'white', padding: '0.3mm' }} />
                  ) : (
                    <div style={{ width: '6mm', height: '6mm', background: 'white', borderRadius: '1mm', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5mm', fontWeight: 800, color: '#059669' }}>
                      E
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '2.8mm', fontWeight: 700, color: 'white', lineHeight: 1.1, textShadow: '0 0.5mm 1mm rgba(0,0,0,0.2)' }}>{school.name}</div>
                    <div style={{ fontSize: '1.6mm', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{school.tagline || 'Excellence • Discipline • Intégrité'}</div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    color: '#059669',
                    fontSize: '1.8mm',
                    fontWeight: 700,
                    padding: '1mm 2mm',
                    borderRadius: '1mm',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3mm'
                  }}>
                    {text.studentCard}
                  </div>
                </div>
                
                {/* Main Content */}
                <div style={{ display: 'flex', gap: '3mm', flex: 1 }}>
                  {/* Photo */}
                  <div>
                    {photoSrc ? (
                      <img 
                        src={photoSrc} 
                        alt={fullName}
                        style={{ width: '22mm', height: '28mm', borderRadius: '2mm', objectFit: 'cover', border: '0.5mm solid #d1d5db', boxShadow: '0 1mm 3mm rgba(0,0,0,0.1)' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '22mm', height: '28mm', background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)', borderRadius: '2mm', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '0.5mm solid #d1d5db', gap: '1mm' }}>
                        <svg width="8mm" height="8mm" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span style={{ fontSize: '1.5mm', color: '#9ca3af', fontWeight: 500 }}>{text.photo}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Info Panel */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '4mm', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: '1.5mm', textTransform: 'uppercase' }}>{fullName}</div>
                    
                    <div style={{ display: 'grid', gap: '1mm' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1mm' }}>
                        <span style={{ fontSize: '1.8mm', color: '#6b7280', fontWeight: 600, minWidth: '12mm' }}>{text.studentId}:</span>
                        <span style={{ fontSize: '2.2mm', color: '#1f2937', fontWeight: 700 }}>{studentId}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1mm' }}>
                        <span style={{ fontSize: '1.8mm', color: '#6b7280', fontWeight: 600, minWidth: '12mm' }}>{text.class}:</span>
                        <span style={{ fontSize: '2.2mm', color: '#1f2937', fontWeight: 700 }}>{student.className}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1mm' }}>
                        <span style={{ fontSize: '1.8mm', color: '#6b7280', fontWeight: 600, minWidth: '12mm' }}>{text.academicYear}:</span>
                        <span style={{ fontSize: '2.2mm', color: '#1f2937', fontWeight: 700 }}>{academicYear}</span>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5mm',
                      background: 'linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%)',
                      color: '#166534',
                      fontSize: '1.8mm',
                      fontWeight: 600,
                      padding: '0.8mm 1.5mm',
                      borderRadius: '0.8mm',
                      border: '0.2mm solid #86efac',
                      width: 'fit-content'
                    }}>
                      ✓ {text.validThru}: {validityDate}
                    </div>
                  </div>
                  
                  {/* QR Code */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '1mm' }}>
                    <canvas ref={qrCanvasFrontRef} style={{ width: '16mm', height: '16mm', border: '0.3mm solid #e5e7eb', borderRadius: '1mm', padding: '0.5mm', background: 'white' }} />
                    <span style={{ fontSize: '1.5mm', color: '#9ca3af', marginTop: '0.5mm', fontWeight: 500 }}>SCAN</span>
                  </div>
                </div>
                
                {/* Footer Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.5mm', borderTop: '0.2mm solid #e5e7eb' }}>
                  <span style={{ fontSize: '1.6mm', color: '#9ca3af', fontFamily: "'Courier New', monospace", fontWeight: 600 }}>{text.cardNumber}: {cardId}</span>
                  <span style={{ fontSize: '1.6mm', color: '#6b7280' }}>{text.issuedOn}: {issueDate}</span>
                </div>
              </div>
            </div>
            
            {/* BACK SIDE */}
            <div 
              className="id-card back-card"
              style={{
                width: '85.6mm',
                height: '54mm',
                borderRadius: '3mm',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
                border: '0.5mm solid #e2e8f0',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                display: showBack ? 'block' : 'none'
              }}
            >
              {/* Security Pattern */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2mm, rgba(59, 130, 246, 0.02) 2mm, rgba(59, 130, 246, 0.02) 4mm)',
                pointerEvents: 'none',
                zIndex: 0
              }} />
              
              <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', padding: '2.5mm' }}>
                {/* Back Header */}
                <div style={{
                  background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)',
                  height: '6mm',
                  margin: '-2.5mm -2.5mm 2mm -2.5mm',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '2.5mm', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5mm' }}>{text.verification}</span>
                </div>
                
                {/* Back Main Content */}
                <div style={{ display: 'flex', gap: '3mm', flex: 1 }}>
                  {/* Verification Panel */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1mm' }}>
                    <canvas ref={qrCanvasBackRef} style={{ width: '20mm', height: '20mm', border: '0.3mm solid #e5e7eb', borderRadius: '1.5mm', padding: '0.5mm', background: 'white' }} />
                    <span style={{ fontSize: '1.8mm', color: '#6b7280', textAlign: 'center', fontWeight: 500 }}>{text.scanToVerify}</span>
                    <span style={{ fontSize: '1.4mm', color: '#3b82f6', fontFamily: "'Courier New', monospace" }}>{text.verifyAt}</span>
                  </div>
                  
                  {/* Info Panel Back */}
                  <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '2mm' }}>
                    {/* Emergency Contact */}
                    <div style={{
                      background: 'linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)',
                      border: '0.3mm solid #f59e0b',
                      borderRadius: '1.5mm',
                      padding: '2mm'
                    }}>
                      <div style={{ fontSize: '2mm', fontWeight: 700, color: '#92400e', marginBottom: '0.8mm', display: 'flex', alignItems: 'center', gap: '1mm' }}>
                        ⚠ {text.emergencyContact}
                      </div>
                      <div style={{ fontSize: '1.8mm', color: '#78350f', lineHeight: 1.3 }}>
                        {student.parentName || 'Parent/Tuteur'}<br/>
                        {student.parentPhone || '+237 XXX XXX XXX'}
                      </div>
                    </div>
                    
                    {/* School Contact */}
                    <div style={{ background: '#f1f5f9', borderRadius: '1.5mm', padding: '1.5mm', flex: 1 }}>
                      <div style={{ fontSize: '1.8mm', fontWeight: 700, color: '#475569', marginBottom: '0.8mm' }}>{text.schoolContact}</div>
                      <div style={{ fontSize: '1.6mm', color: '#64748b', lineHeight: 1.4 }}>
                        {school.address || 'Adresse école'}<br/>
                        {school.phone || '+237 XXX XXX XXX'}<br/>
                        {school.email || 'contact@ecole.cm'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Signature Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.5mm', borderTop: '0.2mm solid #e5e7eb' }}>
                  <div style={{ textAlign: 'center', width: '25mm' }}>
                    {principalSignature ? (
                      <div style={{ height: '4mm', marginBottom: '0.5mm', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <img 
                          src={principalSignature} 
                          alt="Signature" 
                          style={{ maxHeight: '4mm', maxWidth: '20mm', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <div style={{ borderBottom: '0.3mm solid #94a3b8', height: '4mm', marginBottom: '0.5mm' }}></div>
                    )}
                    <span style={{ fontSize: '1.5mm', color: '#64748b', fontWeight: 500 }}>{text.principalSignature}</span>
                  </div>
                  <div style={{ textAlign: 'center', width: '25mm' }}>
                    <div style={{ borderBottom: '0.3mm solid #94a3b8', height: '4mm', marginBottom: '0.5mm' }}></div>
                    <span style={{ fontSize: '1.5mm', color: '#64748b', fontWeight: 500 }}>{text.studentSignature}</span>
                  </div>
                </div>
                
                {/* Security Notice */}
                <div style={{ position: 'absolute', bottom: '1mm', left: '50%', transform: 'translateX(-50%)', fontSize: '1.2mm', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                  {text.securityNotice}
                </div>
              </div>
            </div>
            
            {/* Print Version - shows both sides */}
            <div className="print-only-front" style={{ display: 'none' }}>
              {/* Front for printing */}
              <div 
                className="id-card front-card"
                style={{
                  width: '85.6mm',
                  height: '54mm',
                  borderRadius: '3mm',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                  border: '0.5mm solid #e2e8f0',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-30deg)',
                  fontSize: '18mm',
                  fontWeight: 800,
                  color: 'rgba(16, 185, 129, 0.03)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 1,
                  letterSpacing: '2mm'
                }}>
                  EDUCAFRIC
                </div>
                
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2mm, rgba(16, 185, 129, 0.02) 2mm, rgba(16, 185, 129, 0.02) 4mm), repeating-linear-gradient(-45deg, transparent, transparent 2mm, rgba(16, 185, 129, 0.02) 2mm, rgba(16, 185, 129, 0.02) 4mm)',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />
                
                <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', padding: '2.5mm' }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)',
                    height: '8mm',
                    margin: '-2.5mm -2.5mm 2mm -2.5mm',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 3mm',
                    gap: '2mm'
                  }}>
                    {school.logoUrl ? (
                      <img src={school.logoUrl} alt="Logo" style={{ width: '6mm', height: '6mm', borderRadius: '1mm', objectFit: 'contain', background: 'white', padding: '0.3mm' }} />
                    ) : (
                      <div style={{ width: '6mm', height: '6mm', background: 'white', borderRadius: '1mm', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5mm', fontWeight: 800, color: '#059669' }}>E</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '2.8mm', fontWeight: 700, color: 'white', lineHeight: 1.1 }}>{school.name}</div>
                      <div style={{ fontSize: '1.6mm', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{school.tagline || 'Excellence • Discipline • Intégrité'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.95)', color: '#059669', fontSize: '1.8mm', fontWeight: 700, padding: '1mm 2mm', borderRadius: '1mm', textTransform: 'uppercase' }}>{text.studentCard}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '3mm', flex: 1 }}>
                    <div>
                      {photoSrc ? (
                        <img src={photoSrc} alt={fullName} style={{ width: '22mm', height: '28mm', borderRadius: '2mm', objectFit: 'cover', border: '0.5mm solid #d1d5db' }} />
                      ) : (
                        <div style={{ width: '22mm', height: '28mm', background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)', borderRadius: '2mm', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '0.5mm solid #d1d5db' }}>
                          <svg width="8mm" height="8mm" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span style={{ fontSize: '1.5mm', color: '#9ca3af', fontWeight: 500 }}>{text.photo}</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '4mm', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: '1.5mm', textTransform: 'uppercase' }}>{fullName}</div>
                      <div style={{ display: 'grid', gap: '1mm' }}>
                        <div style={{ display: 'flex', gap: '1mm' }}><span style={{ fontSize: '1.8mm', color: '#6b7280', fontWeight: 600, minWidth: '12mm' }}>{text.studentId}:</span><span style={{ fontSize: '2.2mm', color: '#1f2937', fontWeight: 700 }}>{studentId}</span></div>
                        <div style={{ display: 'flex', gap: '1mm' }}><span style={{ fontSize: '1.8mm', color: '#6b7280', fontWeight: 600, minWidth: '12mm' }}>{text.class}:</span><span style={{ fontSize: '2.2mm', color: '#1f2937', fontWeight: 700 }}>{student.className}</span></div>
                        <div style={{ display: 'flex', gap: '1mm' }}><span style={{ fontSize: '1.8mm', color: '#6b7280', fontWeight: 600, minWidth: '12mm' }}>{text.academicYear}:</span><span style={{ fontSize: '2.2mm', color: '#1f2937', fontWeight: 700 }}>{academicYear}</span></div>
                      </div>
                      <div style={{ display: 'inline-flex', background: 'linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%)', color: '#166534', fontSize: '1.8mm', fontWeight: 600, padding: '0.8mm 1.5mm', borderRadius: '0.8mm', border: '0.2mm solid #86efac', width: 'fit-content' }}>✓ {text.validThru}: {validityDate}</div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1mm' }}>
                      <canvas className="qr-front-print" style={{ width: '16mm', height: '16mm', border: '0.3mm solid #e5e7eb', borderRadius: '1mm', padding: '0.5mm', background: 'white' }} />
                      <span style={{ fontSize: '1.5mm', color: '#9ca3af', marginTop: '0.5mm', fontWeight: 500 }}>SCAN</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.5mm', borderTop: '0.2mm solid #e5e7eb' }}>
                    <span style={{ fontSize: '1.6mm', color: '#9ca3af', fontFamily: "'Courier New', monospace", fontWeight: 600 }}>{text.cardNumber}: {cardId}</span>
                    <span style={{ fontSize: '1.6mm', color: '#6b7280' }}>{text.issuedOn}: {issueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Preview Toggle Buttons */}
          <div className="flex gap-4 mt-4">
            <Button
              variant={!showBack ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBack(false)}
              className={!showBack ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {language === 'fr' ? 'Recto' : 'Front'}
            </Button>
            <Button
              variant={showBack ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBack(true)}
              className={showBack ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {language === 'fr' ? 'Verso' : 'Back'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StudentIDCard;
