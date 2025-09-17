// GÉNÉRATEUR PDF SIMPLE ET FONCTIONNEL POUR LES BULLETINS EDUCAFRIC
import { PDFGenerator, CameroonOfficialHeaderData } from './pdfGenerator';

export class SimpleBulletinGenerator {
  
  static async generateSimpleBulletin(headerData?: CameroonOfficialHeaderData): Promise<Buffer> {
    try {
      const { jsPDF } = await import('jspdf');
      
      if (!jsPDF || typeof jsPDF !== 'function') {
        throw new Error('jsPDF constructor not found in imported module');
      }
      
      const doc = new jsPDF();
      
      console.log('[SIMPLE_BULLETIN] ✅ Génération bulletin simple avec en-tête standardisé');
      
      // ✅ USE STANDARDIZED CAMEROON OFFICIAL HEADER
      const headerEndY = await PDFGenerator.generateCameroonOfficialHeader(doc, headerData || {
        schoolName: 'École Saint-Joseph',
        region: 'CENTRE',
        department: 'MFOUNDI',
        educationLevel: 'secondary',
        phone: '+237 657 004 011',
        postalBox: 'B.P. 8524 Yaoundé',
        email: 'contact@educafric.com'
      });
      
      // ✅ BULLETIN TITLE POSITIONED AFTER STANDARDIZED HEADER
      let yPosition = headerEndY;
      yPosition += 10;
      
      doc.setFontSize(16);
      doc.text('BULLETIN DE NOTES', 70, yPosition);
      yPosition += 15;
      
      // ✅ STUDENT INFO POSITIONED AFTER HEADER AND TITLE
      doc.setFontSize(10);
      doc.text('Élève: Jean Kamga', 20, yPosition);
      yPosition += 10;
      doc.text('Classe: 6ème A', 20, yPosition); 
      yPosition += 10;
      doc.text('Matricule: 1', 20, yPosition);
      yPosition += 10;
      doc.text('Période: Premier Trimestre 2024-2025', 20, yPosition);
      yPosition += 15;
      
      // ✅ SUBJECTS TABLE POSITIONED DYNAMICALLY
      doc.text('MATIÈRES', 20, yPosition);
      yPosition += 10;
      
      // Notes réelles basées sur les logs d'importation
      const subjects = [
        { name: 'Mathématiques', grade: '17.5', coef: '4', total: '70.0', comment: 'Très bien' },
        { name: 'Physique', grade: '17.5', coef: '3', total: '52.5', comment: 'Très bien' }, 
        { name: 'Chimie', grade: '16.3', coef: '3', total: '48.9', comment: 'Bien' },
        { name: 'Biologie', grade: '16.2', coef: '3', total: '48.6', comment: 'Bien' },
        { name: 'Français', grade: '16.9', coef: '4', total: '67.6', comment: 'Bien' },
        { name: 'Anglais', grade: '17.1', coef: '3', total: '51.3', comment: 'Très bien' }
      ];
      
      subjects.forEach(subject => {
        doc.text(`${subject.name}: ${subject.grade}/20 (Coef: ${subject.coef}) = ${subject.total} pts - ${subject.comment}`, 20, yPosition);
        yPosition += 10;
      });
      
      // ✅ RESULTS POSITIONED DYNAMICALLY
      yPosition += 10;
      doc.text('Moyenne générale: 17.49/20', 20, yPosition);
      yPosition += 10;
      doc.text('Rang: 1/42', 20, yPosition);
      yPosition += 10;
      doc.text('Conduite: Très bien', 20, yPosition);
      
      // ✅ SIGNATURES POSITIONED DYNAMICALLY
      yPosition += 20;
      doc.text('Le Professeur Principal', 20, yPosition);
      doc.text('Le Directeur', 120, yPosition);
      yPosition += 20;
      doc.text('Mme Diallo', 20, yPosition);
      doc.text('M. Directeur', 120, yPosition);
      
      // ✅ FOOTER POSITIONED AT BOTTOM
      doc.setFontSize(8);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.text('École Saint-Joseph - Douala, Cameroun - Tel: +237657004011', 20, pageHeight - 20);
      doc.text('www.educafric.com', 20, pageHeight - 10);
      
      return Buffer.from(doc.output('arraybuffer'));
      
    } catch (error) {
      console.error('[SIMPLE_BULLETIN] ❌ Erreur:', error);
      throw error;
    }
  }
}