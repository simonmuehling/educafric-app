import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, X, RotateCcw } from 'lucide-react';
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
}

interface SchoolData {
  name: string;
  tagline?: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
}

interface StudentIDCardProps {
  student: StudentData;
  school: SchoolData;
  isOpen: boolean;
  onClose: () => void;
  validUntil?: string;
}

export function StudentIDCard({ student, school, isOpen, onClose, validUntil }: StudentIDCardProps) {
  const { language } = useLanguage();
  const qrCanvasFrontRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasBackRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  const fullName = `${student.firstName} ${student.lastName}`;
  const studentId = student.matricule || student.educafricNumber || `STD-${student.id}`;
  const validityDate = validUntil || `Sept ${new Date().getFullYear() + 1}`;
  
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
      QRCode.toCanvas(qrCanvasFrontRef.current, studentId, {
        width: 60,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
    }
    if (isOpen && qrCanvasBackRef.current) {
      QRCode.toCanvas(qrCanvasBackRef.current, `EDUCAFRIC:${studentId}:${student.id}`, {
        width: 80,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
    }
  }, [isOpen, studentId, student.id]);

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
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Montserrat', sans-serif;
              background: white;
              display: flex;
              justify-content: center;
              padding: 10mm;
            }
            
            .id-wrapper {
              display: flex;
              gap: 10mm;
              flex-wrap: wrap;
              justify-content: center;
            }
            
            .id-card {
              width: 85.6mm;
              height: 54mm;
              border-radius: 4mm;
              box-shadow: 0 0 5mm rgba(0, 0, 0, 0.2);
              background: white;
              padding: 3mm;
              display: flex;
              flex-direction: column;
              border: 0.3mm solid #ddd;
              page-break-inside: avoid;
            }
            
            .front {
              background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            }
            
            .back {
              background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            }
            
            .school-header {
              display: flex;
              align-items: center;
              gap: 2mm;
              border-bottom: 0.3mm solid #e0e0e0;
              padding-bottom: 2mm;
              margin-bottom: 2mm;
            }
            
            .school-logo {
              width: 10mm;
              height: 10mm;
              object-fit: contain;
              border-radius: 1mm;
            }
            
            .school-logo-placeholder {
              width: 10mm;
              height: 10mm;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border-radius: 1mm;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 5mm;
              font-weight: bold;
            }
            
            .school-info {
              flex: 1;
            }
            
            .school-name {
              font-size: 3.2mm;
              font-weight: 700;
              color: #1f2937;
              margin: 0;
              line-height: 1.2;
            }
            
            .school-tagline {
              font-size: 2.2mm;
              color: #6b7280;
              margin: 0;
            }
            
            .card-type {
              font-size: 2mm;
              color: #10b981;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5mm;
            }
            
            .content-section {
              display: flex;
              gap: 3mm;
              flex: 1;
            }
            
            .photo-section {
              flex-shrink: 0;
            }
            
            .student-photo {
              width: 20mm;
              height: 26mm;
              border-radius: 1.5mm;
              object-fit: cover;
              border: 0.3mm solid #d1d5db;
            }
            
            .photo-placeholder {
              width: 20mm;
              height: 26mm;
              background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
              border-radius: 1.5mm;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 0.3mm solid #d1d5db;
            }
            
            .photo-placeholder svg {
              width: 10mm;
              height: 10mm;
              color: #9ca3af;
            }
            
            .info-section {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            
            .student-name {
              font-size: 3.5mm;
              font-weight: 700;
              color: #111827;
              margin-bottom: 1mm;
            }
            
            .info-row {
              display: flex;
              align-items: baseline;
              gap: 1mm;
              margin-bottom: 0.5mm;
            }
            
            .label {
              font-size: 2mm;
              color: #6b7280;
              font-weight: 500;
            }
            
            .value {
              font-size: 2.4mm;
              color: #1f2937;
              font-weight: 600;
            }
            
            .qr-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.5mm;
            }
            
            .qr-code {
              width: 14mm;
              height: 14mm;
            }
            
            .qr-label {
              font-size: 1.8mm;
              color: #9ca3af;
            }
            
            /* BACK SIDE */
            .back-header {
              text-align: center;
              border-bottom: 0.3mm solid #e0e0e0;
              padding-bottom: 2mm;
              margin-bottom: 2mm;
            }
            
            .back-title {
              font-size: 3mm;
              font-weight: 700;
              color: #10b981;
              margin: 0;
            }
            
            .verification-section {
              display: flex;
              justify-content: center;
              margin: 2mm 0;
            }
            
            .back-qr {
              width: 22mm;
              height: 22mm;
            }
            
            .scan-text {
              text-align: center;
              font-size: 2mm;
              color: #6b7280;
              margin-top: 1mm;
            }
            
            .emergency-box {
              border: 0.3mm solid #f59e0b;
              border-radius: 1.5mm;
              padding: 2mm;
              margin: 2mm 0;
              background: #fffbeb;
            }
            
            .emergency-title {
              font-size: 2.2mm;
              font-weight: 600;
              color: #b45309;
              margin-bottom: 1mm;
            }
            
            .emergency-info {
              font-size: 2mm;
              color: #78350f;
            }
            
            .footer-note {
              text-align: center;
              font-size: 1.8mm;
              color: #9ca3af;
              border-top: 0.2mm solid #e5e7eb;
              padding-top: 1.5mm;
              margin-top: auto;
            }
            
            @media print {
              body * {
                visibility: visible;
              }
              body {
                padding: 0;
              }
              .id-wrapper {
                position: absolute;
                top: 0;
                left: 0;
              }
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
    studentId: "N° Élève",
    class: "Classe",
    validThru: "Valide jusqu'au",
    verification: "Vérification",
    scanText: "Scanner pour vérification",
    emergencyContact: "Contact d'urgence",
    property: "Propriété de",
    close: "Fermer"
  } : {
    title: "Student ID Card",
    printCard: "Print Card",
    flipCard: "Flip",
    studentId: "Student ID",
    class: "Class",
    validThru: "Valid Thru",
    verification: "Verification",
    scanText: "Scan for verification",
    emergencyContact: "Emergency Contact",
    property: "Property of",
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
        
        <div className="flex flex-col items-center py-6">
          <div ref={printRef} className="id-wrapper" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* FRONT SIDE */}
            <div 
              className="id-card front"
              style={{
                width: '85.6mm',
                height: '54mm',
                borderRadius: '4mm',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                padding: '3mm',
                display: 'flex',
                flexDirection: 'column',
                border: '0.3mm solid #e5e7eb',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              {/* School Header */}
              <div className="school-header" style={{ display: 'flex', alignItems: 'center', gap: '2mm', borderBottom: '0.3mm solid #e0e0e0', paddingBottom: '2mm', marginBottom: '2mm' }}>
                {school.logoUrl ? (
                  <img src={school.logoUrl} alt="Logo" className="school-logo" style={{ width: '10mm', height: '10mm', objectFit: 'contain', borderRadius: '1mm' }} />
                ) : (
                  <div className="school-logo-placeholder" style={{ width: '10mm', height: '10mm', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '1mm', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '5mm', fontWeight: 'bold' }}>
                    E
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h2 className="school-name" style={{ fontSize: '3.2mm', fontWeight: 700, color: '#1f2937', margin: 0, lineHeight: 1.2 }}>{school.name}</h2>
                  <p className="school-tagline" style={{ fontSize: '2.2mm', color: '#6b7280', margin: 0 }}>{school.tagline || 'Excellence • Discipline • Intégrité'}</p>
                </div>
                <div className="card-type" style={{ fontSize: '2mm', color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5mm' }}>
                  CARTE ÉLÈVE
                </div>
              </div>

              {/* Content Section */}
              <div className="content-section" style={{ display: 'flex', gap: '3mm', flex: 1 }}>
                {/* Photo */}
                <div className="photo-section">
                  {photoSrc ? (
                    <img 
                      src={photoSrc} 
                      alt={fullName} 
                      className="student-photo"
                      style={{ width: '20mm', height: '26mm', borderRadius: '1.5mm', objectFit: 'cover', border: '0.3mm solid #d1d5db' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="photo-placeholder" style={{ width: '20mm', height: '26mm', background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)', borderRadius: '1.5mm', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.3mm solid #d1d5db' }}>
                      <svg width="10mm" height="10mm" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="info-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="student-name" style={{ fontSize: '3.5mm', fontWeight: 700, color: '#111827', marginBottom: '1mm' }}>{fullName}</h3>
                    
                    <div className="info-row" style={{ display: 'flex', alignItems: 'baseline', gap: '1mm', marginBottom: '0.5mm' }}>
                      <span className="label" style={{ fontSize: '2mm', color: '#6b7280', fontWeight: 500 }}>{text.studentId}:</span>
                      <span className="value" style={{ fontSize: '2.4mm', color: '#1f2937', fontWeight: 600 }}>{studentId}</span>
                    </div>
                    
                    <div className="info-row" style={{ display: 'flex', alignItems: 'baseline', gap: '1mm', marginBottom: '0.5mm' }}>
                      <span className="label" style={{ fontSize: '2mm', color: '#6b7280', fontWeight: 500 }}>{text.class}:</span>
                      <span className="value" style={{ fontSize: '2.4mm', color: '#1f2937', fontWeight: 600 }}>{student.className}</span>
                    </div>
                    
                    <div className="info-row" style={{ display: 'flex', alignItems: 'baseline', gap: '1mm', marginBottom: '0.5mm' }}>
                      <span className="label" style={{ fontSize: '2mm', color: '#6b7280', fontWeight: 500 }}>{text.validThru}:</span>
                      <span className="value" style={{ fontSize: '2.4mm', color: '#1f2937', fontWeight: 600 }}>{validityDate}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="qr-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5mm' }}>
                  <canvas ref={qrCanvasFrontRef} style={{ width: '14mm', height: '14mm' }} />
                  <span className="qr-label" style={{ fontSize: '1.8mm', color: '#9ca3af' }}>SCAN</span>
                </div>
              </div>
            </div>

            {/* BACK SIDE */}
            <div 
              className="id-card back"
              style={{
                width: '85.6mm',
                height: '54mm',
                borderRadius: '4mm',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                padding: '3mm',
                display: 'flex',
                flexDirection: 'column',
                border: '0.3mm solid #e5e7eb',
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              <div className="back-header" style={{ textAlign: 'center', borderBottom: '0.3mm solid #e0e0e0', paddingBottom: '2mm', marginBottom: '2mm' }}>
                <h3 className="back-title" style={{ fontSize: '3mm', fontWeight: 700, color: '#10b981', margin: 0 }}>{text.verification}</h3>
              </div>

              <div className="verification-section" style={{ display: 'flex', justifyContent: 'center', margin: '2mm 0' }}>
                <canvas ref={qrCanvasBackRef} style={{ width: '22mm', height: '22mm' }} />
              </div>

              <p className="scan-text" style={{ textAlign: 'center', fontSize: '2mm', color: '#6b7280', marginTop: '1mm' }}>{text.scanText}</p>

              <div className="emergency-box" style={{ border: '0.3mm solid #f59e0b', borderRadius: '1.5mm', padding: '2mm', margin: '2mm 0', background: '#fffbeb' }}>
                <h4 className="emergency-title" style={{ fontSize: '2.2mm', fontWeight: 600, color: '#b45309', marginBottom: '1mm' }}>{text.emergencyContact}</h4>
                <p className="emergency-info" style={{ fontSize: '2mm', color: '#78350f', margin: 0 }}>
                  {student.parentName || 'Parent/Tuteur'}
                </p>
                <p className="emergency-info" style={{ fontSize: '2mm', color: '#78350f', margin: 0 }}>
                  {student.parentPhone || school.phone || '+237 XXX XXX XXX'}
                </p>
              </div>

              <p className="footer-note" style={{ textAlign: 'center', fontSize: '1.8mm', color: '#9ca3af', borderTop: '0.2mm solid #e5e7eb', paddingTop: '1.5mm', marginTop: 'auto' }}>
                {text.property} {school.name}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StudentIDCard;
