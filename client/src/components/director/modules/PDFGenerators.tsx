import React from 'react';
import { PDFGeneratorsPanel } from '@/components/director/PDFGeneratorsPanel';

/**
 * Director PDF Generators Module
 * 
 * Integrates PDFGeneratorsPanel into the director dashboard
 * providing professional document generation capabilities.
 */
const PDFGenerators: React.FC = () => {
  return (
    <div className="space-y-6">
      <PDFGeneratorsPanel />
    </div>
  );
};

export default PDFGenerators;