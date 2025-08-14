const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Professional PDF styling
const pdfStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      font-size: 14px;
      max-width: 210mm;
      margin: 0 auto;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    
    .header .subtitle {
      font-size: 16px;
      opacity: 0.9;
      font-weight: 300;
    }
    
    .content {
      padding: 0 30px 30px 30px;
    }
    
    h1 {
      color: #667eea;
      font-size: 28px;
      font-weight: 600;
      margin: 30px 0 20px 0;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
      page-break-after: avoid;
    }
    
    h2 {
      color: #4a5568;
      font-size: 22px;
      font-weight: 600;
      margin: 25px 0 15px 0;
      page-break-after: avoid;
    }
    
    h3 {
      color: #2d3748;
      font-size: 18px;
      font-weight: 500;
      margin: 20px 0 12px 0;
      page-break-after: avoid;
    }
    
    p {
      margin-bottom: 15px;
      text-align: justify;
      line-height: 1.7;
    }
    
    ul, ol {
      margin: 15px 0;
      padding-left: 25px;
    }
    
    li {
      margin-bottom: 8px;
      line-height: 1.6;
    }
    
    .highlight-box {
      background: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .success-box {
      background: #f0fff4;
      border-left: 4px solid #38a169;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .warning-box {
      background: #fffbf0;
      border-left: 4px solid #ed8936;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 12px;
      text-align: left;
    }
    
    th {
      background: #667eea;
      color: white;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background: #f8f9fa;
    }
    
    .footer {
      text-align: center;
      padding: 30px;
      border-top: 2px solid #e2e8f0;
      margin-top: 40px;
      color: #718096;
      font-size: 12px;
      page-break-inside: avoid;
    }
    
    .logo {
      font-weight: 700;
      color: #667eea;
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .contact-info {
      margin-top: 15px;
      font-size: 11px;
    }
    
    .educafric-branding {
      color: #667eea;
      font-weight: 600;
    }
  </style>
`;

// Simple markdown to HTML converter
function simpleMarkdownToHtml(content) {
  // Process headings
  content = content.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  content = content.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  content = content.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Process bold and italic
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Process lists
  content = content.replace(/^- (.+)$/gm, '<li>$1</li>');
  content = content.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
  
  // Process special elements
  content = content.replace(/^✅(.+)$/gm, '<div class="success-box">✅$1</div>');
  content = content.replace(/^⚠️(.+)$/gm, '<div class="warning-box">⚠️$1</div>');
  content = content.replace(/^❌(.+)$/gm, '<div class="warning-box">❌$1</div>');
  
  // Process paragraphs (wrap non-tag lines)
  const lines = content.split('\n');
  let result = '';
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (inList) {
        result += '</ul>\n';
        inList = false;
      }
      result += '\n';
      continue;
    }
    
    if (line.startsWith('<li>')) {
      if (!inList) {
        result += '<ul>\n';
        inList = true;
      }
      result += line + '\n';
    } else if (line.startsWith('<h') || line.startsWith('<div') || line.startsWith('<table')) {
      if (inList) {
        result += '</ul>\n';
        inList = false;
      }
      result += line + '\n';
    } else if (!line.startsWith('<')) {
      if (inList) {
        result += '</ul>\n';
        inList = false;
      }
      result += '<p>' + line + '</p>\n';
    } else {
      result += line + '\n';
    }
  }
  
  if (inList) {
    result += '</ul>\n';
  }
  
  // Brand highlighting
  result = result.replace(/EducAfric/g, '<span class="educafric-branding">EducAfric</span>');
  result = result.replace(/EDUCAFRIC/g, '<span class="educafric-branding">EDUCAFRIC</span>');
  
  return result;
}

// Generate document info
function generateDocumentInfo(filename) {
  const baseName = path.basename(filename, '.md');
  
  const titleMap = {
    '00-index-documents-alphabetique': 'Index Alphabétique des Documents',
    '00-liste-alphabetique-mise-a-jour': 'Mise à Jour - Tri Alphabétique',
    'COMMERCIAL_GUIDE_PREMIUM_MODULES': 'Guide Commercial - Modules Premium',
    'GUIDE_COMMERCIAL_MODULES_PREMIUM': 'Guide Commercial - Modules Premium',
    'contrat-partenariat-etablissements-freelancers-2025-simplifie': 'Contrat de Partenariat Simplifié 2025',
    'educafric-contrat-partenariat-etablissements-freelancers-2025': 'Contrat de Partenariat EducAfric 2025',
    'educafric-partnership-contract-schools-freelancers-parents-2025-en': 'Partnership Contract 2025 (English)',
    'educafric-prospection-kit-english': 'Prospection Kit (English)',
    'geolocalisation-resume-francais': 'Géolocalisation - Résumé',
    'geolocation-summary-english': 'Geolocation Summary (English)',
    'guide-commercial-modules-premium-freemium': 'Guide Commercial - Premium & Freemium',
    'guide-notifications-educafric': 'Guide Notifications EducAfric',
    'kit-prospection-educafric-complet': 'Kit de Prospection Complet',
    'notifications-system-english': 'Notifications System (English)',
    'notifications-system-francais': 'Système de Notifications',
    'partnership-contract-schools-freelancers-2025-simplified-en': 'Partnership Contract Simplified (English)',
    'pricing-plans-english': 'Pricing Plans (English)',
    'tarifs-complets-educafric': 'Tarifs Complets EducAfric',
    'tarifs-plans-francais': 'Plans Tarifaires'
  };
  
  const title = titleMap[baseName] || baseName.replace(/-/g, ' ').replace(/_/g, ' ');
  
  let subtitle = 'Document EducAfric';
  if (filename.includes('contrat') || filename.includes('contract')) {
    subtitle = 'Contrat de Partenariat - EducAfric Platform';
  } else if (filename.includes('commercial') || filename.includes('guide')) {
    subtitle = 'Guide Commercial - EducAfric Solutions';
  } else if (filename.includes('tarif') || filename.includes('pricing')) {
    subtitle = 'Tarification - Plans d\'Abonnement EducAfric';
  } else if (filename.includes('notification')) {
    subtitle = 'Système de Notifications - EducAfric';
  } else if (filename.includes('geolocation') || filename.includes('geolocalisation')) {
    subtitle = 'Géolocalisation - Services EducAfric';
  }
  
  return { title, subtitle };
}

// Sample content for recreated documents
const sampleDocuments = {
  '00-index-documents-alphabetique': `# Index Alphabétique des Documents EducAfric

## Documents Commerciaux et Contractuels

### A - C
- **Argumentaire Vente EducAfric FR**
- **Brochure Commerciale EducAfric EN**  
- **Contrat Partenariat Établissements-Freelancers 2025**
- **Contrat Partenariat Commercial FR**

### D - G
- **Document Commercial EducAfric**
- **Guide Commercial Modules Premium**
- **Guide Notifications EducAfric**

### K - P
- **Kit Prospection EducAfric Complet**
- **Partnership Contract EN**
- **Plans Tarifaires Français**
- **Pricing Plans English**

### S - T
- **Système Notifications Français**
- **Tarifs Complets EducAfric**

---

## 📊 Statistiques
- **Total documents**: 26
- **Langues**: Français (14), Anglais (12)
- **Types**: Commerciaux (8), Contractuels (6), Techniques (12)

---

*Index généré automatiquement - EducAfric Platform*`,

  'COMMERCIAL_GUIDE_PREMIUM_MODULES': `# Guide Commercial - Modules Premium EducAfric

## 🎯 Modules Premium Disponibles

### Module Géolocalisation Premium
✅ **Fonctionnalités avancées**:
- Suivi GPS temps réel
- Zones de sécurité personnalisées
- Alertes automatiques parents
- Historique déplacements

### Module Communications Premium
✅ **Outils de communication**:
- SMS illimités
- WhatsApp Business API
- Notifications push avancées
- Templates personnalisés

### Module Analytics Premium
✅ **Analyses avancées**:
- Rapports détaillés
- Tableaux de bord personnalisés
- Exports Excel/PDF
- Métriques en temps réel

## 💰 Tarification Premium

### École Publique Premium
- **250,000 CFA/an**
- Tous modules inclus
- Support prioritaire

### École Privée Premium  
- **750,000 CFA/an**
- Modules complets
- Formation incluse

### École Entreprise Premium
- **150,000 CFA/an**
- Tableau de bord bilingue
- Modules spécialisés

---

*Guide commercial mis à jour - EducAfric 2025*`,

  'tarifs-complets-educafric': `# Tarifs Complets EducAfric 2025

## 🏫 Plans Écoles

### École Publique
- **Prix**: 250,000 CFA/an
- **Étudiants**: Illimités
- **Fonctionnalités**: Complètes
- **Support**: Standard

### École Privée
- **Prix**: 750,000 CFA/an
- **Étudiants**: Illimités
- **Fonctionnalités**: Premium
- **Support**: Prioritaire

### École Entreprise
- **Prix**: 150,000 CFA/an
- **Formation professionnelle**: Oui
- **Dashboard bilingue**: Oui
- **Modules spécialisés**: Inclus

## 👨‍💼 Plans Freelancers

### Plan Professionnel
- **Mensuel**: 12,000 CFA/mois
- **Annuel**: 120,000 CFA/an
- **Étudiants**: 50 maximum
- **Outils**: Complets

## 📞 Contact
- **Téléphone**: +237 657 004 011
- **Email**: admin@educafric.com

---

*Tarification officielle EducAfric - Mise à jour 2025*`
};

async function createPdfFromContent(title, subtitle, content, outputPath) {
  const htmlContent = simpleMarkdownToHtml(content);
  
  const fullHtml = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${pdfStyles}
  </head>
  <body>
      <div class="header">
          <div class="logo">EducAfric</div>
          <h1>${title}</h1>
          <div class="subtitle">${subtitle}</div>
      </div>
      
      <div class="content">
          ${htmlContent}
      </div>
      
      <div class="footer">
          <div class="logo">EducAfric</div>
          <div class="contact-info">
              <div><strong>Contact:</strong> +237 657 004 011 | admin@educafric.com</div>
              <div><strong>Plateforme Éducative Africaine</strong> - Solutions Numériques pour l'Éducation</div>
              <div>Document généré le ${new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</div>
          </div>
      </div>
  </body>
  </html>
  `;
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    printBackground: true,
    preferCSSPageSize: true
  });
  
  await browser.close();
  console.log(`✅ PDF created: ${outputPath}`);
}

async function main() {
  const documentsDir = path.join(__dirname, '..', 'public', 'documents');
  
  // Create key documents
  const keyDocs = [
    '00-index-documents-alphabetique',
    'COMMERCIAL_GUIDE_PREMIUM_MODULES',
    'tarifs-complets-educafric'
  ];
  
  for (const docKey of keyDocs) {
    const { title, subtitle } = generateDocumentInfo(docKey);
    const content = sampleDocuments[docKey];
    const outputPath = path.join(documentsDir, `${docKey}.pdf`);
    
    await createPdfFromContent(title, subtitle, content, outputPath);
  }
  
  console.log('\n🎉 Key PDF documents have been created successfully!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createPdfFromContent, main };