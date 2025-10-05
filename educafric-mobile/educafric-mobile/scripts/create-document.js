#!/usr/bin/env node

/**
 * EDUCAFRIC Instant Document Creation Utility
 * Usage: node scripts/create-document.js "Document Name" "Description" "Category"
 * 
 * This script instantly creates and integrates documents into the EDUCAFRIC system
 */

const fs = require('fs');
const path = require('path');

function createInstantDocument(name, description, category = 'technical') {
  console.log(`🚀 Creating document: ${name}`);
  
  // Generate file names
  const fileName = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
  
  const htmlPath = path.join(__dirname, '..', 'public', 'documents', `${fileName}.html`);
  
  // Create HTML document
  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Educafric</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
        }
        h1 { font-size: 2.2rem; margin: 0; }
        h2 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${name}</h1>
        <p>Documentation EDUCAFRIC - Système de Gestion Éducatif Africain</p>
    </div>
    
    <div class="content">
        <h2>Description</h2>
        <p>${description}</p>
        
        <h2>Contenu du Document</h2>
        <p>Ce document fait partie du système documentaire EDUCAFRIC. Il contient des informations techniques et commerciales pour l'écosystème éducatif africain.</p>
        
        <h2>Catégorie</h2>
        <p><strong>${category}</strong></p>
        
        <h2>Informations</h2>
        <ul>
            <li>Date de création: ${new Date().toLocaleDateString('fr-FR')}</li>
            <li>Version: 1.0</li>
            <li>Statut: Finalisé</li>
        </ul>
    </div>
    
    <div class="footer">
        <p>© 2025 EDUCAFRIC - Plateforme Éducative Technologique Africaine</p>
        <p>Generated: ${new Date().toLocaleString('fr-FR')}</p>
    </div>
</body>
</html>`;

  // Write HTML file
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`✅ HTML document created: ${htmlPath}`);
  
  // Return document info for integration
  return {
    fileName: `${fileName}.html`,
    name,
    description,
    category,
    url: `/documents/${fileName}.html`,
    size: `${Math.round(htmlContent.length / 1024)} KB`,
    date: new Date().toISOString().split('T')[0]
  };
}

// Command line usage
if (require.main === module) {
  const [,, name, description, category] = process.argv;
  
  if (!name || !description) {
    console.log('Usage: node create-document.js "Document Name" "Description" [category]');
    process.exit(1);
  }
  
  const doc = createInstantDocument(name, description, category);
  console.log('\n🎉 Document ready for integration:');
  console.log(JSON.stringify(doc, null, 2));
  console.log('\nDocument URL:', `http://localhost:5000${doc.url}`);
}

module.exports = { createInstantDocument };