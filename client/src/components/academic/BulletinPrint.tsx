'use client';
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from "lucide-react";

type Props = {
  documentTitle?: string;            // file name in the Save dialog
  children: React.ReactNode;         // your existing preview JSX
};

export default function BulletinPrint({ documentTitle = 'bulletin', children }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  const pageStyle = `
    @page { size: A4; margin: 10mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }

      /* Better tables for multi-page */
      table { border-collapse: collapse; width: 100%; }
      table, th, td { border: 1px solid #000; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      tr, th, td { break-inside: avoid; page-break-inside: avoid; }
      .avoid-break { break-inside: avoid; }
      .page-break { break-before: page; }
    }
    /* Screen width that matches printed content */
    .print-a4 { width: 190mm; margin: 0 auto; background: #fff; }
    img { max-width: 100%; height: auto; }
  `;

  const handlePrint = useReactToPrint({
    contentRef,            // 👈 v3 expects this
    documentTitle,
    removeAfterPrint: true,
    pageStyle,
  });

  return (
    <div>
      <div className="no-print flex items-center gap-2 mb-4">
        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          data-testid="button-print-pdf"
        >
          <Printer className="h-4 w-4" />
          Print PDF
        </button>
      </div>

      {/* ⬇️ Your current preview goes inside THIS div */}
      <div ref={contentRef} className="print-a4">
        {children}
      </div>
    </div>
  );
}