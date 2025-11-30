'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Printer, Download, Smartphone, Monitor } from "lucide-react";

type Props = {
  documentTitle?: string;
  children: React.ReactNode;
};

export default function BulletinPrint({ documentTitle = 'bulletin', children }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showMobileNotice, setShowMobileNotice] = useState(false);

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

  const handlePrint = async () => {
    if (isMobile) {
      setShowMobileNotice(true);
      setTimeout(() => setShowMobileNotice(false), 5000);
    }
    
    setIsPrinting(true);
    try {
      console.log('🖨️ Preparing to print...');
      
      await (document.fonts?.ready ?? Promise.resolve());
      console.log('✅ Fonts loaded');
      
      const printArea = document.getElementById('print-root');
      if (printArea) {
        const imgs = Array.from(printArea.querySelectorAll('img')) as HTMLImageElement[];
        const unloadedImgs = imgs.filter(img => !img.complete);
        
        if (unloadedImgs.length > 0) {
          console.log(`⏳ Waiting for ${unloadedImgs.length} images to load...`);
          await Promise.all(
            unloadedImgs.map(img => 
              new Promise(resolve => {
                img.onload = img.onerror = resolve;
              })
            )
          );
        }
        console.log('✅ All images loaded');
      }
      
      await new Promise(resolve => 
        requestAnimationFrame(() => setTimeout(resolve, 150))
      );
      
      console.log('🖨️ Opening print dialog...');
      window.print();
    } catch (error) {
      console.error('❌ Print error:', error);
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div>
      <div className="no-print flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-sm disabled:opacity-50 touch-manipulation min-h-[48px]"
            data-testid="button-print-pdf"
          >
            {isPrinting ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Printer className="h-5 w-5" />
            )}
            <span className="text-base">{isPrinting ? 'Préparation...' : 'Imprimer PDF'}</span>
          </button>
          
          {isMobile && (
            <div className="flex items-center gap-1 text-amber-600 text-sm">
              <Smartphone className="h-4 w-4" />
              <span>Mobile</span>
            </div>
          )}
        </div>
        
        {showMobileNotice && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <Monitor className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Conseil pour mobile</p>
                <p>Pour une meilleure qualité d'impression, utilisez un ordinateur ou sélectionnez "Enregistrer en PDF" dans les options d'impression.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div id="print-root" ref={contentRef} className="w-full max-w-4xl mx-auto bg-white">
        {children}
      </div>
    </div>
  );
}