import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";

type Props = {
  // whatever data you use to render the preview
  documentTitle?: string; // e.g. "Sophie_Biyaga_Premier_2025-2026"
  children: React.ReactNode; // your existing preview JSX goes here
};

export default function BulletinPrint({ documentTitle = "bulletin", children }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const pageStyle = `
    @page { size: A4; margin: 10mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      #root, #app { padding: 0 !important; }
      .no-print { display: none !important; }

      /* Keep tables pretty */
      table { border-collapse: collapse; width: 100%; }
      table, th, td { border: 1px solid #000; }
      thead { display: table-header-group; } /* repeat header on page breaks */
      tfoot { display: table-footer-group; }
      tr, th, td, thead, tbody, tfoot { break-inside: avoid; page-break-inside: avoid; }

      /* Optional helpers */
      .avoid-break { break-inside: avoid; page-break-inside: avoid; }
      .page-break { page-break-before: always; break-before: page; }
    }

    /* Screen width that matches A4 content */
    .print-a4 {
      width: 190mm;     /* 210mm - 2 * 10mm page margins */
      margin: 0 auto;
      background: #fff;
    }
    img { max-width: 100%; height: auto; }
  `;

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle,
    removeAfterPrint: true,
    pageStyle,
  });

  return (
    <div>
      {/* Toolbar hidden in print */}
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

      {/* Your existing preview goes inside this container */}
      <div ref={printRef} className="print-a4">
        {children}
      </div>
    </div>
  );
}