import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FinancialProjectionData {
  schoolName: string;
  studentCount: number;
  monthlyFeePerStudent: number;
  teacherCount: number;
  currentSystemCosts: number;
  educafricAnnualCost: number;
  currentAnnualRevenue: number;
  revenueIncrease: number;
  costSavings: number;
  netGain: number;
  roi: number;
  paybackPeriod: number;
  fiveYearProjections: Array<{
    year: number;
    revenue: number;
    savings: number;
    netProfit: number;
  }>;
  language: 'fr' | 'en';
}

export const generateFinancialProjectionPDF = async (data: FinancialProjectionData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf?.internal?.pageSize.getWidth();
  const pageHeight = pdf?.internal?.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Textes bilingues
  const text = {
    fr: {
      title: 'PROJECTIONS FINANCIÈRES EDUCAFRIC',
      subtitle: 'Analyse des Gains Potentiels - Établissements Scolaires Cameroun',
      schoolParameters: 'Paramètres de l\'École',
      studentCount: 'Nombre d\'Élèves',
      monthlyFee: 'Frais Mensuel par Élève',
      teacherCount: 'Nombre d\'Enseignants',
      currentCosts: 'Coûts Système Actuel',
      educafricCost: 'Coût EDUCAFRIC Annual',
      financialResults: 'Résultats Financiers',
      currentRevenue: 'Revenus Annuels Actuels',
      revenueIncrease: 'Augmentation Revenus',
      costSavings: 'Économies de Coûts',
      netGain: 'Gain Net Annuel',
      roi: 'Retour sur Investissement (ROI)',
      paybackPeriod: 'Période de Retour',
      fiveYearForecast: 'Prévisions sur 5 Ans',
      year: 'Année',
      revenue: 'Revenus',
      savings: 'Économies',
      netProfit: 'Profit Net',
      assumptions: 'Hypothèses de Calcul',
      assumption1: '• Augmentation frais scolaires de 15% grâce aux services premium',
      assumption2: '• Réduction coûts opérationnels de 20% via automatisation',
      assumption3: '• Amélioration rétention élèves de 10% via satisfaction parents',
      assumption4: '• Revenus additionnels services géolocalisation et communication',
      benefits: 'Avantages EDUCAFRIC',
      benefit1: '• Satisfaction Parents (+25%)',
      benefit2: '• Efficacité Administrative (+40%)',
      benefit3: '• Productivité Enseignants (+30%)',
      benefit4: '• Engagement Élèves (+35%)',
      benefit5: '• Communication Améliorée (+50%)',
      benefit6: '• Analyses de Données (+60%)',
      months: 'mois',
      generatedOn: 'Document généré le',
      cameroonContext: 'Contexte Camerounais',
      marketData: '• 8,000+ écoles privées au Cameroun',
      marketData2: '• 12,000+ écoles publiques',
      marketData3: '• Support bilingue FR/EN optimisé',
      marketData4: '• Tarification en CFA accessible'
    },
    en: {
      title: 'EDUCAFRIC FINANCIAL PROJECTIONS',
      subtitle: 'Potential Gains Analysis - Cameroon Educational Institutions',
      schoolParameters: 'School Parameters',
      studentCount: 'Number of Students',
      monthlyFee: 'Monthly Fee per Student',
      teacherCount: 'Number of Teachers',
      currentCosts: 'Current System Costs',
      educafricCost: 'EDUCAFRIC Annual Cost',
      financialResults: 'Financial Results',
      currentRevenue: 'Current Annual Revenue',
      revenueIncrease: 'Revenue Increase',
      costSavings: 'Cost Savings',
      netGain: 'Annual Net Gain',
      roi: 'Return on Investment (ROI)',
      paybackPeriod: 'Payback Period',
      fiveYearForecast: '5-Year Forecast',
      year: 'Year',
      revenue: 'Revenue',
      savings: 'Savings',
      netProfit: 'Net Profit',
      assumptions: 'Calculation Assumptions',
      assumption1: '• 15% school fee increase through premium services',
      assumption2: '• 20% operational cost reduction via automation',
      assumption3: '• 10% student retention improvement via parent satisfaction',
      assumption4: '• Additional revenue from geolocation and communication services',
      benefits: 'EDUCAFRIC Benefits',
      benefit1: '• Parent Satisfaction (+25%)',
      benefit2: '• Administrative Efficiency (+40%)',
      benefit3: '• Teacher Productivity (+30%)',
      benefit4: '• Student Engagement (+35%)',
      benefit5: '• Improved Communication (+50%)',
      benefit6: '• Data Insights (+60%)',
      months: 'months',
      generatedOn: 'Document generated on',
      cameroonContext: 'Cameroon Context',
      marketData: '• 8,000+ private schools in Cameroon',
      marketData2: '• 12,000+ public schools',
      marketData3: '• Bilingual FR/EN support optimized',
      marketData4: '• Affordable CFA pricing'
    }
  };

  const t = text[data.language];

  // Fonction utilitaire pour formater les montants CFA
  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA';
  };

  // En-tête avec logo et titre
  pdf.setFillColor(59, 130, 246); // Bleu
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t.title, margin, 15);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(t.subtitle, margin, 20);

  yPosition = 35;

  // Date de génération
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.text(`${t.generatedOn}: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin - 40, yPosition);
  yPosition += 15;

  // Section Paramètres de l'École
  pdf.setFillColor(243, 244, 246);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t.schoolParameters, margin + 2, yPosition + 5);
  yPosition += 12;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const parameters = [
    [t.studentCount, data?.studentCount?.toString()],
    [t.monthlyFee, formatCFA(data.monthlyFeePerStudent)],
    [t.teacherCount, data?.teacherCount?.toString()],
    [t.currentCosts, formatCFA(data.currentSystemCosts)],
    [t.educafricCost, formatCFA(data.educafricAnnualCost)]
  ];

  parameters.forEach(([label, value]) => {
    pdf.text(`${label}:`, margin + 5, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, margin + 80, yPosition);
    pdf.setFont('helvetica', 'normal');
    yPosition += 6;
  });

  yPosition += 10;

  // Section Résultats Financiers
  pdf.setFillColor(34, 197, 94); // Vert
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t.financialResults, margin + 2, yPosition + 5);
  yPosition += 12;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const results = [
    [t.currentRevenue, formatCFA(data.currentAnnualRevenue)],
    [t.revenueIncrease, formatCFA(data.revenueIncrease)],
    [t.costSavings, formatCFA(data.costSavings)],
    [t.netGain, formatCFA(data.netGain)],
    [t.roi, `${data?.roi?.toFixed(1)}%`],
    [t.paybackPeriod, `${data?.paybackPeriod?.toFixed(1)} ${t.months}`]
  ];

  results.forEach(([label, value]) => {
    pdf.text(`${label}:`, margin + 5, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, margin + 80, yPosition);
    pdf.setFont('helvetica', 'normal');
    yPosition += 6;
  });

  yPosition += 10;

  // Section Prévisions 5 ans
  pdf.setFillColor(168, 85, 247); // Violet
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t.fiveYearForecast, margin + 2, yPosition + 5);
  yPosition += 12;

  // Tableau des projections
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  
  const tableHeaders = [t.year, t.revenue, t.savings, t.netProfit];
  const colWidth = (pageWidth - 2 * margin) / 4;
  
  tableHeaders.forEach((header, index) => {
    pdf.text(header, margin + index * colWidth + 2, yPosition);
  });
  yPosition += 6;

  pdf.setFont('helvetica', 'normal');
  data?.fiveYearProjections?.forEach(projection => {
    pdf.text(projection?.year?.toString(), margin + 2, yPosition);
    pdf.text(formatCFA(projection.revenue), margin + colWidth + 2, yPosition);
    pdf.text(formatCFA(projection.savings), margin + 2 * colWidth + 2, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatCFA(projection.netProfit), margin + 3 * colWidth + 2, yPosition);
    pdf.setFont('helvetica', 'normal');
    yPosition += 5;
  });

  // Nouvelle page pour les détails supplémentaires
  pdf.addPage();
  yPosition = margin;

  // Section Avantages EDUCAFRIC
  pdf.setFillColor(249, 115, 22); // Orange
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t.benefits, margin + 2, yPosition + 5);
  yPosition += 12;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const benefits = [t.benefit1, t.benefit2, t.benefit3, t.benefit4, t.benefit5, t.benefit6];
  benefits.forEach(benefit => {
    pdf.text(benefit, margin + 5, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Section Hypothèses
  pdf.setFillColor(59, 130, 246); // Bleu
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t.assumptions, margin + 2, yPosition + 5);
  yPosition += 12;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const assumptions = [t.assumption1, t.assumption2, t.assumption3, t.assumption4];
  assumptions.forEach(assumption => {
    pdf.text(assumption, margin + 5, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Section Contexte Camerounais
  pdf.setFillColor(236, 72, 153); // Rose
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t.cameroonContext, margin + 2, yPosition + 5);
  yPosition += 12;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const marketData = [t.marketData, t.marketData2, t.marketData3, t.marketData4];
  marketData.forEach(data => {
    pdf.text(data, margin + 5, yPosition);
    yPosition += 6;
  });

  // Pied de page
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('EDUCAFRIC - Plateforme Éducative Africaine', margin, pageHeight - 10);
  pdf.text('www.educafric.com | info@educafric.com | +237 6 56 20 04 72', pageWidth - margin - 80, pageHeight - 10);

  return pdf;
};

export const downloadFinancialProjectionPDF = async (data: FinancialProjectionData, filename?: string) => {
  const pdf = await generateFinancialProjectionPDF(data);
  const defaultFilename = `projections-financières-educafric-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename || defaultFilename);
};