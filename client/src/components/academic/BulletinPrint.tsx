'use client';
import React, { useRef } from 'react';
import { Printer } from "lucide-react";

type Props = {
  documentTitle?: string;            // file name in the Save dialog
  children: React.ReactNode;         // your existing preview JSX
};

export default function BulletinPrint({ documentTitle = 'bulletin', children }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Native print handler with image and font loading
  const handlePrint = async () => {
    try {
      console.log('🖨️ Preparing to print...');
      
      // Wait for fonts to load
      await (document.fonts?.ready ?? Promise.resolve());
      console.log('✅ Fonts loaded');
      
      // Wait for all images in the print area to load
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
      
      // Small delay to ensure layout is settled
      await new Promise(resolve => 
        requestAnimationFrame(() => setTimeout(resolve, 100))
      );
      
      console.log('🖨️ Opening print dialog...');
      window.print();
    } catch (error) {
      console.error('❌ Print error:', error);
      // Fallback - just try to print anyway
      window.print();
    }
  };


  return (
    <div>
      <div className="no-print flex items-center gap-2 mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          data-testid="button-print-pdf"
        >
          <Printer className="h-4 w-4" />
          Print PDF
        </button>
      </div>

      {/* ⬇️ Print-ready content with unique ID for targeting */}
      <div id="print-root" ref={contentRef} className="w-full max-w-4xl mx-auto bg-white">
        {children}
      </div>
    </div>
  );
}