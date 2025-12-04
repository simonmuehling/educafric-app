import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, RotateCcw, Smartphone, Download } from 'lucide-react';
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
  birthDate?: string;
  birthPlace?: string;
  placeOfBirth?: string;
  educafricNumber?: string;
  gender?: string;
  bloodType?: string;
}

interface SchoolData {
  name: string;
  tagline?: string;
  slogan?: string;
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
  
  // Academic year calculation - Valid until end of August of academic year
  const currentMonth = new Date().getMonth(); // 0-11
  const currentYear = new Date().getFullYear();
  // If we're between September-December, academic year is currentYear-nextYear
  // If we're between January-August, academic year is previousYear-currentYear
  const academicYearStart = currentMonth >= 8 ? currentYear : currentYear - 1; // September is month 8
  const academicYearEnd = academicYearStart + 1;
  const academicYear = `${academicYearStart}-${academicYearEnd}`;
  const validityDate = validUntil || `31 Août ${academicYearEnd}`;
  
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
    const generateQRCodes = async () => {
      // Wait for DOM to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[ID_CARD] Generating QR codes, isOpen:', isOpen);
      console.log('[ID_CARD] Front canvas ref:', qrCanvasFrontRef.current);
      console.log('[ID_CARD] Back canvas ref:', qrCanvasBackRef.current);
      
      if (isOpen && qrCanvasFrontRef.current) {
        try {
          // Verification URL for scanning - leads to verify page
          const verificationUrl = `${window.location.origin}/verify?type=student&id=${student.id}&code=${cardId}&year=${academicYear}`;
          await QRCode.toCanvas(qrCanvasFrontRef.current, verificationUrl, {
            width: 120,
            margin: 1,
            color: { dark: '#059669', light: '#ffffff' },
            errorCorrectionLevel: 'M'
          });
          console.log('[ID_CARD] ✅ Front QR code generated with URL:', verificationUrl);
        } catch (err) {
          console.error('[ID_CARD] ❌ Error generating front QR:', err);
        }
      }
      if (isOpen && qrCanvasBackRef.current) {
        try {
          const verificationUrl = `${window.location.origin}/verify?type=student&id=${student.id}&code=${cardId}&year=${academicYear}`;
          await QRCode.toCanvas(qrCanvasBackRef.current, verificationUrl, {
            width: 150,
            margin: 1,
            color: { dark: '#1e40af', light: '#ffffff' },
            errorCorrectionLevel: 'M'
          });
          console.log('[ID_CARD] ✅ Back QR code generated');
        } catch (err) {
          console.error('[ID_CARD] ❌ Error generating back QR:', err);
        }
      }
    };
    
    if (isOpen) {
      generateQRCodes();
    }
  }, [isOpen, studentId, student.id, cardId, school.name, validityDate, academicYear]);

  const [isPrinting, setIsPrinting] = useState(false);
  const printIframeRef = useRef<HTMLIFrameElement>(null);
  
  // Detect if mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    // For mobile devices, use inline iframe approach which works better
    const isMobile = isMobileDevice();
    
    // Convert QR canvases to data URLs before cloning (canvas content is lost in innerHTML)
    const frontQRDataUrl = qrCanvasFrontRef.current?.toDataURL('image/png') || '';
    const backQRDataUrl = qrCanvasBackRef.current?.toDataURL('image/png') || '';
    
    // Clone the print content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = printContent.innerHTML;
    
    // Find and show all front and back cards for printing
    tempContainer.querySelectorAll('.front-card').forEach((el) => {
      (el as HTMLElement).style.display = 'block';
    });
    tempContainer.querySelectorAll('.back-card').forEach((el) => {
      (el as HTMLElement).style.display = 'block';
    });
    
    // Hide the print-only-front section that has incomplete QR codes
    tempContainer.querySelectorAll('.print-only-front').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
    
    // Replace canvas elements with img elements containing the QR code data
    const canvases = tempContainer.querySelectorAll('canvas');
    canvases.forEach((canvas, index) => {
      const img = document.createElement('img');
      // Alternate between front and back QR based on which one we're processing
      img.src = index === 0 ? frontQRDataUrl : backQRDataUrl;
      img.style.cssText = canvas.style.cssText;
      img.setAttribute('width', canvas.style.width || '16mm');
      img.setAttribute('height', canvas.style.height || '16mm');
      canvas.parentNode?.replaceChild(img, canvas);
    });
    
    const capturedHTML = tempContainer.innerHTML;
    
    const printStyles = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      html, body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: white !important;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 5mm;
      }
      
      .print-container {
        display: flex;
        gap: 10mm;
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .id-card {
        width: 85.6mm;
        height: 54mm;
        border-radius: 3mm;
        position: relative;
        overflow: hidden;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      /* FRONT CARD STYLES - FULL COLOR */
      .front-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%) !important;
        border: 0.5mm solid #e2e8f0 !important;
      }
      
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 18mm;
        font-weight: 800;
        color: rgba(16, 185, 129, 0.03) !important;
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
          repeating-linear-gradient(-45deg, transparent, transparent 2mm, rgba(16, 185, 129, 0.02) 2mm, rgba(16, 185, 129, 0.02) 4mm) !important;
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
        background: linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%) !important;
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
        background: white !important;
        padding: 0.3mm;
      }
      
      .logo-placeholder {
        width: 6mm;
        height: 6mm;
        background: white !important;
        border-radius: 1mm;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3.5mm;
        font-weight: 800;
        color: #059669 !important;
      }
      
      .header-text {
        flex: 1;
      }
      
      .school-name {
        font-size: 2.8mm;
        font-weight: 700;
        color: white !important;
        line-height: 1.1;
        text-shadow: 0 0.5mm 1mm rgba(0,0,0,0.2);
      }
      
      .school-tagline {
        font-size: 1.6mm;
        color: rgba(255,255,255,0.9) !important;
        font-weight: 500;
      }
      
      .card-type-badge {
        background: rgba(255,255,255,0.95) !important;
        color: #059669 !important;
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
        border: 0.5mm solid #d1d5db !important;
      }
      
      .photo-placeholder {
        width: 22mm;
        height: 28mm;
        background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%) !important;
        border-radius: 2mm;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 0.5mm solid #d1d5db !important;
        gap: 1mm;
      }
      
      .photo-placeholder svg {
        width: 8mm;
        height: 8mm;
        color: #9ca3af !important;
      }
      
      .photo-placeholder-text {
        font-size: 1.5mm;
        color: #9ca3af !important;
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
        color: #111827 !important;
        line-height: 1.1;
        margin-bottom: 1.5mm;
        text-transform: uppercase;
      }
      
      .info-grid {
        display: grid;
        gap: 0.8mm;
      }
      
      .info-row {
        display: flex;
        align-items: baseline;
        gap: 1mm;
      }
      
      .birth-info {
        display: flex;
        align-items: baseline;
        gap: 1mm;
        flex-wrap: wrap;
      }
      
      .birth-label {
        font-size: 1.8mm;
        color: #6b7280 !important;
        font-weight: 600;
      }
      
      .birth-value {
        font-size: 2mm;
        color: #1f2937 !important;
        font-weight: 600;
      }
      
      .info-label {
        font-size: 1.8mm;
        color: #6b7280 !important;
        font-weight: 600;
        min-width: 12mm;
      }
      
      .info-value {
        font-size: 2.2mm;
        color: #1f2937 !important;
        font-weight: 700;
      }
      
      .validity-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5mm;
        background: linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%) !important;
        color: #166534 !important;
        font-size: 1.8mm;
        font-weight: 600;
        padding: 0.8mm 1.5mm;
        border-radius: 0.8mm;
        border: 0.2mm solid #86efac !important;
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
        border: 0.3mm solid #e5e7eb !important;
        border-radius: 1mm;
        padding: 0.5mm;
        background: white !important;
      }
      
      .qr-label {
        font-size: 1.5mm;
        color: #9ca3af !important;
        margin-top: 0.5mm;
        font-weight: 500;
      }
      
      .footer-strip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 1.5mm;
        border-top: 0.2mm solid #e5e7eb !important;
      }
      
      .card-id {
        font-size: 1.6mm;
        color: #9ca3af !important;
        font-family: 'Courier New', monospace;
        font-weight: 600;
      }
      
      .issue-date {
        font-size: 1.6mm;
        color: #6b7280 !important;
      }
      
      /* BACK CARD STYLES - FULL COLOR */
      .back-card {
        background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%) !important;
        border: 0.5mm solid #e2e8f0 !important;
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
        background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%) !important;
        height: 6mm;
        margin: -2.5mm -2.5mm 2mm -2.5mm;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .back-title {
        font-size: 2.5mm;
        font-weight: 700;
        color: white !important;
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
        border: 0.3mm solid #e5e7eb !important;
        border-radius: 1.5mm;
        padding: 0.5mm;
        background: white !important;
      }
      
      .scan-instruction {
        font-size: 1.8mm;
        color: #6b7280 !important;
        text-align: center;
        font-weight: 500;
      }
      
      .verification-url {
        font-size: 1.4mm;
        color: #3b82f6 !important;
        font-family: 'Courier New', monospace;
      }
      
      .info-panel-back {
        flex: 1.2;
        display: flex;
        flex-direction: column;
        gap: 2mm;
      }
      
      .emergency-box {
        background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%) !important;
        border: 0.3mm solid #f59e0b !important;
        border-radius: 1.5mm;
        padding: 2mm;
      }
      
      .emergency-title {
        font-size: 2mm;
        font-weight: 700;
        color: #92400e !important;
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
        color: #78350f !important;
        line-height: 1.3;
      }
      
      .school-contact-box {
        background: #f1f5f9 !important;
        border-radius: 1.5mm;
        padding: 1.5mm;
        flex: 1;
      }
      
      .contact-title {
        font-size: 1.8mm;
        font-weight: 700;
        color: #475569 !important;
        margin-bottom: 0.8mm;
      }
      
      .contact-line {
        font-size: 1.6mm;
        color: #64748b !important;
        line-height: 1.4;
      }
      
      .signature-section {
        display: flex;
        justify-content: space-between;
        margin-top: auto;
        padding-top: 1.5mm;
        border-top: 0.2mm solid #e5e7eb !important;
      }
      
      .signature-box {
        text-align: center;
        width: 25mm;
      }
      
      .signature-line {
        border-bottom: 0.3mm solid #94a3b8 !important;
        height: 4mm;
        margin-bottom: 0.5mm;
      }
      
      .signature-label {
        font-size: 1.5mm;
        color: #64748b !important;
        font-weight: 500;
      }
      
      .security-notice {
        position: absolute;
        bottom: 1mm;
        left: 50%;
        transform: translateX(-50%);
        font-size: 1.2mm;
        color: #94a3b8 !important;
        text-align: center;
        font-style: italic;
      }
      
      /* Mobile-specific print optimizations */
      @media print {
        @page {
          size: auto;
          margin: 5mm;
        }
        
        html, body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
          background: white !important;
        }
        
        body {
          padding: 0;
          margin: 0;
        }
        
        .print-container {
          gap: 5mm;
        }
        
        .id-card {
          box-shadow: none;
          border: 0.3mm solid #d1d5db !important;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Force all backgrounds and colors to print */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        img {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      
      /* Signature image styling */
      .signature-img {
        max-height: 6mm;
        max-width: 20mm;
        object-fit: contain;
      }
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Carte d'identité - ${fullName}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          ${capturedHTML}
          <script>
            // Auto-print after images load
            window.onload = function() {
              setTimeout(function() {
                window.print();
                ${isMobile ? '' : 'window.close();'}
              }, 800);
            };
          </script>
        </body>
      </html>
    `;

    if (isMobile) {
      // Mobile approach: Open new page (works better on mobile browsers)
      setIsPrinting(true);
      
      // Create a blob URL for mobile
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Open in new tab which works better on mobile
      const newTab = window.open(url, '_blank');
      
      if (!newTab) {
        // Fallback: create hidden iframe
        let iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.zIndex = '99999';
        iframe.style.background = 'white';
        
        document.body.appendChild(iframe);
        iframe.contentWindow?.document.write(htmlContent);
        iframe.contentWindow?.document.close();
        
        // Add close button for mobile
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕ Fermer / Close';
        closeBtn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:100000;padding:10px 20px;background:#ef4444;color:white;border:none;border-radius:8px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3)';
        closeBtn.onclick = () => {
          document.body.removeChild(iframe);
          document.body.removeChild(closeBtn);
          setIsPrinting(false);
        };
        document.body.appendChild(closeBtn);
      } else {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          setIsPrinting(false);
        }, 2000);
      }
    } else {
      // Desktop: Use popup window (original approach)
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert(language === 'fr' 
          ? 'Veuillez autoriser les popups pour imprimer la carte.' 
          : 'Please allow popups to print the card.');
        return;
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  // Format birth date
  const formatBirthDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };
  
  const birthDateValue = student.birthDate || student.dateOfBirth;
  const birthPlaceValue = student.birthPlace || student.placeOfBirth;
  const formattedBirthDate = formatBirthDate(birthDateValue);
  
  const text = language === 'fr' ? {
    title: "Carte d'Identité Scolaire",
    printCard: "Imprimer la carte",
    flipCard: "Retourner",
    studentCard: "Carte Élève",
    studentId: "N° Matricule",
    class: "Classe",
    academicYear: "Année",
    birthDate: "Né(e) le",
    birthPlace: "à",
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
    birthDate: "Born on",
    birthPlace: "at",
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
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-xl font-bold text-gray-900">{text.title}</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBack(!showBack)}
                className="border-gray-300"
                data-testid="button-flip-id-card"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                {text.flipCard}
              </Button>
              <Button
                onClick={handlePrint}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-print-id-card"
              >
                <Printer className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{text.printCard}</span>
                <span className="sm:hidden">{language === 'fr' ? 'Imprimer' : 'Print'}</span>
              </Button>
            </div>
          </DialogTitle>
          {isMobileDevice() && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-md mt-2 border border-amber-200">
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              <span>
                {language === 'fr' 
                  ? 'Mobile: Cliquez "Imprimer" puis "Enregistrer en PDF" pour imprimer en couleur depuis une imprimante.' 
                  : 'Mobile: Click "Print" then "Save as PDF" to print in color from a printer.'}
              </span>
            </div>
          )}
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
                    <img 
                      src={school.logoUrl} 
                      alt="Logo" 
                      style={{ width: '6mm', height: '6mm', borderRadius: '1mm', objectFit: 'contain', background: 'white', padding: '0.3mm' }}
                      onError={(e) => {
                        console.error('[ID_CARD] Logo failed to load:', school.logoUrl);
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ 
                    width: '6mm', height: '6mm', background: 'white', borderRadius: '1mm', 
                    display: school.logoUrl ? 'none' : 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    fontSize: '3.5mm', fontWeight: 800, color: '#059669' 
                  }}>
                    E
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '2.8mm', fontWeight: 700, color: 'white', lineHeight: 1.1, textShadow: '0 0.5mm 1mm rgba(0,0,0,0.2)' }}>{school.name}</div>
                    <div style={{ fontSize: '1.6mm', color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontStyle: 'italic' }}>{school.slogan || school.tagline || 'Excellence • Discipline • Intégrité'}</div>
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
                    <div style={{ fontSize: '3.2mm', fontWeight: 800, color: '#111827', lineHeight: 1.15, marginBottom: '1mm', textTransform: 'uppercase', maxWidth: '30mm' }}>{fullName}</div>
                    
                    <div style={{ display: 'grid', gap: '0.5mm' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5mm', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '1.5mm', color: '#6b7280', fontWeight: 600 }}>{text.studentId}:</span>
                        <span style={{ fontSize: '1.7mm', color: '#1f2937', fontWeight: 700 }}>{studentId}</span>
                      </div>
                      {formattedBirthDate && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5mm', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '1.5mm', color: '#6b7280', fontWeight: 600 }}>{text.birthDate}</span>
                          <span style={{ fontSize: '1.7mm', color: '#1f2937', fontWeight: 600 }}>{formattedBirthDate}</span>
                        </div>
                      )}
                      {birthPlaceValue && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5mm', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '1.5mm', color: '#6b7280', fontWeight: 600 }}>{text.birthPlace}</span>
                          <span style={{ fontSize: '1.7mm', color: '#1f2937', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '20mm' }}>{birthPlaceValue}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5mm', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '1.5mm', color: '#6b7280', fontWeight: 600 }}>{text.class}:</span>
                        <span style={{ fontSize: '1.7mm', color: '#1f2937', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '22mm' }}>{student.className}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5mm', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '1.5mm', color: '#6b7280', fontWeight: 600 }}>{text.academicYear}:</span>
                        <span style={{ fontSize: '1.7mm', color: '#1f2937', fontWeight: 700 }}>{academicYear}</span>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5mm',
                      background: 'linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%)',
                      color: '#166534',
                      fontSize: '1.5mm',
                      fontWeight: 600,
                      padding: '0.6mm 1.2mm',
                      borderRadius: '0.8mm',
                      border: '0.2mm solid #86efac',
                      width: 'fit-content',
                      whiteSpace: 'nowrap'
                    }}>
                      ✓ {text.validThru}: {validityDate}
                    </div>
                  </div>
                  
                  {/* QR Code & Signature Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1mm', minWidth: '20mm' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <canvas ref={qrCanvasFrontRef} style={{ width: '18mm', height: '18mm', border: '0.3mm solid #e5e7eb', borderRadius: '1mm', padding: '0.5mm', background: 'white' }} />
                      <span style={{ fontSize: '1.3mm', color: '#9ca3af', marginTop: '0.3mm', fontWeight: 500 }}>SCAN</span>
                    </div>
                    {/* Principal Signature on Front */}
                    <div style={{ textAlign: 'center', marginTop: '1mm' }}>
                      {principalSignature ? (
                        <img 
                          src={principalSignature} 
                          alt="Signature Directeur" 
                          style={{ maxHeight: '6mm', maxWidth: '18mm', objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{ width: '16mm', borderBottom: '0.3mm solid #94a3b8', height: '4mm' }}></div>
                      )}
                      <span style={{ fontSize: '1.2mm', color: '#6b7280', display: 'block' }}>Directeur</span>
                    </div>
                  </div>
                </div>
                
                {/* Footer Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1mm', borderTop: '0.2mm solid #e5e7eb' }}>
                  <span style={{ fontSize: '1.5mm', color: '#9ca3af', fontFamily: "'Courier New', monospace", fontWeight: 600 }}>{text.cardNumber}: {cardId}</span>
                  <span style={{ fontSize: '1.5mm', color: '#6b7280' }}>{text.issuedOn}: {issueDate}</span>
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
                      <div style={{ fontSize: '1.6mm', color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontStyle: 'italic' }}>{school.slogan || school.tagline || 'Excellence • Discipline • Intégrité'}</div>
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
                      <div style={{ fontSize: '3.2mm', fontWeight: 800, color: '#111827', lineHeight: 1.15, marginBottom: '1mm', textTransform: 'uppercase', maxWidth: '30mm' }}>{fullName}</div>
                      <div style={{ display: 'grid', gap: '0.5mm' }}>
                        <div style={{ display: 'flex', gap: '0.5mm', whiteSpace: 'nowrap' }}><span style={{ fontSize: '1.5mm', color: '#6b7280', fontWeight: 600 }}>{text.studentId}:</span><span style={{ fontSize: '1.7mm', color: '#1f2937', fontWeight: 700 }}>{studentId}</span></div>
                        <div style={{ display: 'flex', gap: '0.5mm', whiteSpace: 'nowrap' }}><span style={{ fontSize: '1.5mm', color: '#6b7280', fontWeight: 600 }}>{text.class}:</span><span style={{ fontSize: '1.7mm', color: '#1f2937', fontWeight: 700 }}>{student.className}</span></div>
                        <div style={{ display: 'flex', gap: '0.5mm', whiteSpace: 'nowrap' }}><span style={{ fontSize: '1.5mm', color: '#6b7280', fontWeight: 600 }}>{text.academicYear}:</span><span style={{ fontSize: '1.7mm', color: '#1f2937', fontWeight: 700 }}>{academicYear}</span></div>
                      </div>
                      <div style={{ display: 'inline-flex', background: 'linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%)', color: '#166534', fontSize: '1.5mm', fontWeight: 600, padding: '0.6mm 1.2mm', borderRadius: '0.8mm', border: '0.2mm solid #86efac', width: 'fit-content', whiteSpace: 'nowrap' }}>✓ {text.validThru}: {validityDate}</div>
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
