'use client';
import { useRef, useState, useEffect } from 'react';
import { Printer, Smartphone, FileDown, Loader2 } from "lucide-react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useLanguage } from '@/contexts/LanguageContext';

type Props = {
  documentTitle?: string;
  children: React.ReactNode;
};

const translations = {
  fr: {
    print: 'Imprimer',
    downloadPdf: 'Télécharger PDF',
    preparing: 'Préparation...',
    mobileMode: 'Mode mobile',
    loadingImages: 'Chargement des images...',
    generatingPdf: 'Génération du PDF...',
    downloading: 'Téléchargement...',
    done: 'Terminé!',
    errorRetry: 'Erreur - Réessayez',
  },
  en: {
    print: 'Print',
    downloadPdf: 'Download PDF',
    preparing: 'Preparing...',
    mobileMode: 'Mobile mode',
    loadingImages: 'Loading images...',
    generatingPdf: 'Generating PDF...',
    downloading: 'Downloading...',
    done: 'Done!',
    errorRetry: 'Error - Retry',
  }
};

export default function BulletinPrint({ documentTitle = 'bulletin', children }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const generatePDF = async () => {
    const printArea = document.getElementById('print-root');
    if (!printArea) {
      console.error('Print area not found');
      return;
    }

    setIsGenerating(true);
    setProgress(t.preparing);

    try {
      document.documentElement.classList.add('pdf-capture-mode');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await (document.fonts?.ready ?? Promise.resolve());
      
      const imgs = Array.from(printArea.querySelectorAll('img')) as HTMLImageElement[];
      const unloadedImgs = imgs.filter(img => !img.complete);
      if (unloadedImgs.length > 0) {
        setProgress(t.loadingImages);
        await Promise.all(
          unloadedImgs.map(img => 
            new Promise(resolve => {
              img.onload = img.onerror = resolve;
            })
          )
        );
      }

      setProgress(t.generatingPdf);
      
      const A4_WIDTH_PX = 794;
      
      const canvas = await html2canvas(printArea, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: A4_WIDTH_PX,
        windowWidth: A4_WIDTH_PX,
      });

      document.documentElement.classList.remove('pdf-capture-mode');

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        const scaleFactor = pdfHeight / imgHeight;
        const scaledWidth = imgWidth * scaleFactor;
        const xOffset = (pdfWidth - scaledWidth) / 2;
        pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledWidth, pdfHeight);
      }

      setProgress(t.downloading);
      
      const fileName = `${documentTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      setProgress(t.done);
      setTimeout(() => setProgress(''), 2000);

    } catch (error) {
      console.error('PDF generation error:', error);
      document.documentElement.classList.remove('pdf-capture-mode');
      setProgress(t.errorRetry);
      setTimeout(() => setProgress(''), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDesktopPrint = async () => {
    setIsGenerating(true);
    setProgress(t.preparing);
    
    try {
      await (document.fonts?.ready ?? Promise.resolve());
      
      const printArea = document.getElementById('print-root');
      if (printArea) {
        const imgs = Array.from(printArea.querySelectorAll('img')) as HTMLImageElement[];
        const unloadedImgs = imgs.filter(img => !img.complete);
        if (unloadedImgs.length > 0) {
          await Promise.all(
            unloadedImgs.map(img => 
              new Promise(resolve => {
                img.onload = img.onerror = resolve;
              })
            )
          );
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      window.print();
    } catch (error) {
      console.error('Print error:', error);
      window.print();
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  return (
    <div>
      <div className="no-print flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {isMobile ? (
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-medium shadow-md disabled:opacity-50 touch-manipulation min-h-[52px] text-base"
              data-testid="button-download-pdf"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileDown className="h-5 w-5" />
              )}
              <span>{isGenerating ? progress : t.downloadPdf}</span>
            </button>
          ) : (
            <button
              onClick={handleDesktopPrint}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50"
              data-testid="button-print-pdf"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              <span>{isGenerating ? t.preparing : t.print}</span>
            </button>
          )}
          
          {isMobile && (
            <div className="flex items-center gap-1 text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded">
              <Smartphone className="h-4 w-4" />
              <span>{t.mobileMode}</span>
            </div>
          )}
        </div>
        
        {isGenerating && progress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{progress}</span>
          </div>
        )}
      </div>

      <div id="print-root" ref={contentRef} className="w-full max-w-4xl mx-auto bg-white">
        {children}
      </div>
    </div>
  );
}