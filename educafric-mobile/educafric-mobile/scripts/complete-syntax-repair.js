#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

class CompleteSyntaxRepair {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
  }

  repair() {
    console.log('🔧 Complete Syntax Repair - Fixing all automated script damage...');
    
    // Get all affected files
    try {
      const result = execSync('find client/src -name "*.tsx" -o -name "*.ts" | xargs grep -l "\\.(Array\\.isArray"', { encoding: 'utf8' });
      const files = result.trim().split('\n').filter(f => f);
      
      console.log(`Found ${files.length} files with syntax errors`);
      
      for (const file of files) {
        this.fixFile(file);
      }
    } catch (error) {
      console.log('No more files with .Array.isArray errors found');
    }

    console.log(`✅ Complete repair finished - ${this.fixedFiles} files, ${this.totalFixes} fixes applied`);
  }

  fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let fixes = 0;

    // Fix: obj.(Array.isArray(prop) ? prop : [])
    const regex1 = /(\w+)\.\(Array\.isArray\((\w+)\)\s*\?\s*\2\s*:\s*\[\]\)/g;
    content = content.replace(regex1, (match, obj, prop) => {
      fixes++;
      return `${obj}.${prop}`;
    });

    // Fix: obj.(Array.isArray(xyz) ? xyz : []).map
    const regex2 = /(\w+)\.\(Array\.isArray\([^)]+\)\s*\?\s*([^:]+)\s*:\s*[^)]+\)\.(\w+)/g;
    content = content.replace(regex2, (match, obj, prop, method) => {
      fixes++;
      return `${obj}.${prop.trim()}.${method}`;
    });

    // Fix: malformed translation calls
    content = content.replace(/t\('\([^)]+\|\|\s*['"']['"']\)'\)/g, "t('title')");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles++;
      this.totalFixes += fixes;
      console.log(`✅ Fixed ${fixes} issues in ${filePath.split('/').pop()}`);
    }
  }
}

new CompleteSyntaxRepair().repair();