#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

class EmergencySyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
  }

  fix() {
    console.log('🚨 Emergency Syntax Fix - Correcting automated script errors...');
    
    const files = [
      'client/src/components/FreemiumPricingPlans.tsx',
      'client/src/components/EducafricCardSlider.tsx',
      'client/src/components/EducafricFeatures.tsx',
      'client/src/components/EducafricHero.tsx',
      'client/src/pages/Login.tsx'
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        this.fixFile(file);
      }
    }

    console.log(`✅ Emergency fix complete - ${this.fixedFiles} files corrected`);
  }

  fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Fix broken syntax: obj.(Array.isArray(...) => obj.property
    content = content.replace(/(\w+)\.\(Array\.isArray\([^)]+\)\s*\?\s*([^:]+)\s*:\s*[^)]+\)\./g, '$1.$2.');

    // Fix malformed function calls like t('(string || '')')
    content = content.replace(/t\('\([^)]+\|\|\s*['"']['"']\)'\)/g, "t('title')");

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles++;
      console.log(`✅ Fixed syntax errors in ${path.basename(filePath)}`);
    }
  }
}

new EmergencySyntaxFixer().fix();