export interface DocumentData {
  id: string;
  title: string;
  user: any;
  type: 'system' | 'commercial' | 'proposal' | 'report';
  content?: string;
}

export class PDFGenerator {
  static async generateSystemReport(data: DocumentData): Promise<Buffer> {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const doc = new jsPDF();
    
    // Configuration
    doc.setFont('helvetica');
    
    // En-tête avec logo
    doc.setFontSize(20);
    doc.setTextColor(0, 121, 242); // #0079F2
    doc.text('EDUCAFRIC', 20, 30);
    doc.setFontSize(16);
    doc.text('Plateforme Éducative Africaine', 20, 40);
    
    // Ligne de séparation
    doc.setDrawColor(0, 121, 242);
    doc.setLineWidth(1);
    doc.line(20, 45, 190, 45);
    
    // Métadonnées document
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Document ID: ${data.id}`, 20, 55);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 62);
    doc.text(`Généré par: ${data.user.email}`, 20, 69);
    doc.text(`Type: Rapport Système`, 20, 76);
    
    // Titre principal
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(data.title || 'Rapport Système EDUCAFRIC', 20, 90);
    
    // Contenu principal
    doc.setFontSize(12);
    let yPosition = 110;
    
    // Section Informations système
    doc.setFontSize(14);
    doc.setTextColor(0, 121, 242);
    doc.text('Informations du Système', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const systemInfo = [
      'Utilisateurs actifs: 12,847',
      'Écoles connectées: 156',
      'Revenus mensuels: 87,500,000 CFA',
      'Croissance: +24.5%',
      'Nouveaux utilisateurs (30j): 2,341',
      'Taux de rétention: 89.2%'
    ];
    
    systemInfo.forEach(info => {
      doc.text(`• ${info}`, 25, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Section Documents récents
    doc.setFontSize(14);
    doc.setTextColor(0, 121, 242);
    doc.text('Documents Récents', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const recentDocs = [
      'Rapport mensuel Janvier 2025',
      'Projections financières Q1 2025',
      'Analyse utilisateurs Yaoundé',
      'Statistiques écoles privées',
      'Rapport sécurité platform'
    ];
    
    recentDocs.forEach(docName => {
      doc.text(`• ${docName}`, 25, yPosition);
      yPosition += 6;
    });
    
    yPosition += 15;
    
    // Section Statistiques détaillées
    doc.setFontSize(14);
    doc.setTextColor(0, 121, 242);
    doc.text('Statistiques Détaillées', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const detailedStats = [
      'Performance du système:',
      '  - Temps de réponse moyen: 245ms',
      '  - Disponibilité: 99.8%',
      '  - Charge CPU moyenne: 23.4%',
      '  - Utilisation mémoire: 67.2%',
      '',
      'Activité utilisateurs:',
      '  - Sessions actives simultanées: 1,247',
      '  - Pages vues (24h): 45,892',
      '  - Temps moyen par session: 18min 34s',
      '  - Taux de rebond: 12.3%',
      '',
      'Répartition géographique:',
      '  - Yaoundé: 45% des utilisateurs',
      '  - Douala: 32% des utilisateurs',
      '  - Autres villes: 23% des utilisateurs'
    ];
    
    detailedStats.forEach(stat => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(stat, 25, yPosition);
      yPosition += 6;
    });
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('© 2025 EDUCAFRIC - Confidentiel', 20, 285);
      doc.text(`Page ${i}/${pageCount}`, 170, 285);
    }
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  static async generateBulletinGuideDocument(data: DocumentData): Promise<Buffer> {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const doc = new jsPDF();
    
    // Configuration
    doc.setFont('helvetica');
    
    // En-tête spécial bulletins
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // #3B82F6
    doc.text('EDUCAFRIC', 20, 30);
    doc.setFontSize(14);
    doc.text('Guide Bulletins Scolaires', 20, 40);
    
    // Ligne de séparation
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.line(20, 45, 190, 45);
    
    // Métadonnées
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Document: ${data.id}`, 20, 55);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 62);
    doc.text(`Pour: ${data.user.email}`, 20, 69);
    
    // Titre principal
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Guide Commercial - Bulletins EDUCAFRIC', 20, 85);
    
    let yPosition = 105;
    
    // Section 1: Qu'est-ce que les bulletins EDUCAFRIC
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('1. Qu\'est-ce que les bulletins EDUCAFRIC ?', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const intro = [
      'Les bulletins EDUCAFRIC transforment la gestion des notes',
      'de vos écoles avec une solution 100% numérique.',
      '',
      'Fini les bulletins papier, les erreurs de calcul, et les',
      'bulletins perdus par les élèves !'
    ];
    
    intro.forEach(line => {
      doc.text(line, 25, yPosition);
      yPosition += 7;
    });
    
    yPosition += 10;
    
    // Section 2: Comment ça marche
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('2. Comment ça marche (très simple)', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const steps = [
      'Étape 1: L\'enseignant saisit les notes sur son téléphone',
      '          (plus simple qu\'envoyer un SMS)',
      '',
      'Étape 2: Le système calcule automatiquement les moyennes',
      '          (zéro erreur de calcul possible)',
      '',
      'Étape 3: Bulletin PDF créé instantanément avec mise en',
      '          page professionnelle',
      '',
      'Étape 4: Envoi automatique aux parents par SMS/Email',
      '          (100% des parents reçoivent le bulletin)',
      '',
      'Étape 5: Consultation permanente sur téléphone',
      '          (historique complet accessible)'
    ];
    
    steps.forEach(line => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(line, 25, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Section 3: Économies concrètes
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('3. Économies pour une école de 300 élèves', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const savings = [
      'INVESTISSEMENT: 75,000 XAF/an seulement',
      '',
      'ÉCONOMIES RÉALISÉES:',
      '• Papier et photocopies: -150,000 XAF/an',
      '• Temps enseignants: -100,000 XAF/an',
      '• Corrections d\'erreurs: -50,000 XAF/an',
      '• Distribution: -30,000 XAF/an',
      '',
      'TOTAL ÉCONOMISÉ: 330,000 XAF/AN',
      'ROI: +340% dès la première année !'
    ];
    
    savings.forEach(line => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      if (line.startsWith('TOTAL') || line.startsWith('ROI')) {
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94); // Vert pour ROI
      } else if (line.startsWith('INVESTISSEMENT') || line.startsWith('ÉCONOMIES')) {
        doc.setFontSize(12);
        doc.setTextColor(139, 92, 246); // Violet pour sections
      } else {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
      }
      doc.text(line, 25, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Section 4: Arguments de vente
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('4. Arguments de vente clés', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const salesArgs = [
      'POUR LES DIRECTEURS:',
      '"Votre école aura l\'image la plus moderne de la ville.',
      'Les parents choisiront votre école pour sa technologie."',
      '',
      'POUR LES ENSEIGNANTS:',
      '"Plus jamais de nuits à calculer les moyennes. Vous',
      'gagnez 10 heures par trimestre !"',
      '',
      'POUR LES PARENTS:',
      '"Suivez la progression de votre enfant en temps réel.',
      'Plus d\'attente de 3 mois pour connaître ses résultats."'
    ];
    
    salesArgs.forEach(line => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      if (line.startsWith('POUR LES')) {
        doc.setFontSize(12);
        doc.setTextColor(139, 92, 246);
      } else {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
      }
      doc.text(line, 25, yPosition);
      yPosition += 7;
    });
    
    yPosition += 10;
    
    // Section 5: Réponses aux objections
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('5. Réponses aux objections courantes', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const objections = [
      'Q: "C\'est trop cher pour notre budget"',
      'R: "140 XAF/jour mais vous économisez 330,000 XAF/an !"',
      '',
      'Q: "Nos enseignants ne savent pas utiliser l\'ordinateur"',
      'R: "Interface plus simple qu\'un SMS. Formation gratuite',
      '    de 2h incluse. 95% maîtrisent dès le premier jour."',
      '',
      'Q: "Et si internet ne marche pas ?"',
      'R: "Mode hors-ligne inclus ! Synchronisation automatique',
      '    dès que la connexion revient."',
      '',
      'Q: "Pourquoi pas une solution internationale ?"',
      'R: "Les solutions étrangères coûtent 5x plus cher, pas',
      '    de français, ni SMS/WhatsApp, ni notation sur 20."'
    ];
    
    objections.forEach(line => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      if (line.startsWith('Q:')) {
        doc.setTextColor(220, 38, 127); // Rose pour questions
      } else if (line.startsWith('R:')) {
        doc.setTextColor(34, 197, 94); // Vert pour réponses
      } else {
        doc.setTextColor(0, 0, 0);
      }
      doc.text(line, 25, yPosition);
      yPosition += 6;
    });
    
    // Contact final
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 30;
    }
    
    yPosition += 15;
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('CONTACT POUR DÉMONSTRATION', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Téléphone: +237 657 004 011', 25, yPosition);
    yPosition += 8;
    doc.text('Email: admin@educafric.com', 25, yPosition);
    yPosition += 8;
    doc.text('Démo gratuite: https://educafric.com/sandbox', 25, yPosition);
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('© 2025 EDUCAFRIC - Guide Bulletins Commerciaux', 20, 285);
      doc.text(`Page ${i}/${pageCount}`, 170, 285);
    }
    
    return Buffer.from(doc.output('arraybuffer'));
  }
  
  static async generateCommercialDocument(data: DocumentData): Promise<Buffer> {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const doc = new jsPDF();
    
    // Configuration
    doc.setFont('helvetica');
    
    // En-tête commercial
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246); // #8B5CF6
    doc.text('EDUCAFRIC', 20, 30);
    doc.setFontSize(14);
    doc.text('Solution Éducative Digitale', 20, 40);
    
    // Ligne de séparation
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(1);
    doc.line(20, 45, 190, 45);
    
    // Métadonnées
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Document Commercial ID: ${data.id}`, 20, 55);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 62);
    doc.text(`Représentant: ${data.user.email}`, 20, 69);
    
    // Titre principal
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(data.title || 'Document Commercial EDUCAFRIC', 20, 85);
    
    // Contenu commercial
    doc.setFontSize(12);
    let yPosition = 105;
    
    // Section Présentation
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('Présentation EDUCAFRIC', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const presentation = [
      'EDUCAFRIC est la première plateforme éducative numérique',
      'spécialement conçue pour le marché africain.',
      '',
      'Notre solution offre:',
      '• Gestion complète des écoles',
      '• Communication parents-enseignants',
      '• Suivi des performances académiques',
      '• Paiements en ligne sécurisés',
      '• Support multilingue (FR/EN)',
      '• Optimisé pour les réseaux africains'
    ];
    
    presentation.forEach(line => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(line, 20, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Section Tarifs
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('Plans Tarifaires (CFA)', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const pricing = [
      'ÉCOLES:',
      '• Plan Basic: 50,000 CFA/an',
      '  - Jusqu\'à 200 élèves',
      '  - Fonctionnalités essentielles',
      '',
      '• Plan Premium: 100,000 CFA/an',
      '  - Élèves illimités',
      '  - Toutes les fonctionnalités',
      '  - Support prioritaire',
      '',
      'PARENTS:',
      '• École Publique: 1,000 CFA/mois',
      '• École Privée: 1,500 CFA/mois',
      '  - Réductions famille nombreuse'
    ];
    
    pricing.forEach(line => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(line, 20, yPosition);
      yPosition += 7;
    });
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('© 2025 EDUCAFRIC - info@educafric.com', 20, 285);
      doc.text(`Page ${i}/${pageCount}`, 170, 285);
    }
    
    return Buffer.from(doc.output('arraybuffer'));
  }
  
  static async generateProposalDocument(data: DocumentData): Promise<Buffer> {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const doc = new jsPDF();
    
    // Configuration
    doc.setFont('helvetica');
    
    // En-tête proposition
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // #10B981
    doc.text('EDUCAFRIC', 20, 30);
    doc.setFontSize(14);
    doc.text('Proposition de Partenariat', 20, 40);
    
    // Ligne de séparation
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(1);
    doc.line(20, 45, 190, 45);
    
    // Métadonnées
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Proposition ID: ${data.id}`, 20, 55);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 62);
    doc.text(`Contact: ${data.user.email}`, 20, 69);
    
    // Titre principal
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(data.title || 'Proposition de Partenariat EDUCAFRIC', 20, 85);
    
    // Contenu proposition
    doc.setFontSize(12);
    let yPosition = 105;
    
    const proposalContent = [
      'Cher partenaire,',
      '',
      'Nous vous proposons un partenariat stratégique avec EDUCAFRIC',
      'pour révolutionner l\'éducation en Afrique.',
      '',
      'Avantages du partenariat:',
      '• Accès au marché éducatif africain',
      '• Technologie éprouvée et adaptée',
      '• Support technique complet',
      '• Formation des équipes',
      '• Revenus partagés',
      '',
      'Nos références:',
      '• 156 écoles partenaires',
      '• 12,847 utilisateurs actifs',
      '• 87.5M CFA de revenus mensuels',
      '• 89.2% de taux de satisfaction',
      '',
      'Prochaines étapes:',
      '1. Présentation détaillée',
      '2. Négociation des termes',
      '3. Signature du contrat',
      '4. Déploiement pilote',
      '5. Expansion régionale'
    ];
    
    proposalContent.forEach(line => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(line, 20, yPosition);
      yPosition += 8;
    });
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('© 2025 EDUCAFRIC - Confidentiel', 20, 285);
      doc.text(`Page ${i}/${pageCount}`, 170, 285);
    }
    
    return Buffer.from(doc.output('arraybuffer'));
  }
}