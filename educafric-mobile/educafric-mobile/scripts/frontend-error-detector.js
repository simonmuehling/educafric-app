#!/usr/bin/env node

// 🖥️ EDUCAFRIC FRONTEND ERROR DETECTION SYSTEM
// Monitors client-side errors, broken links, and UI issues

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FrontendErrorDetector {
  constructor() {
    this.clientDir = path.join(__dirname, '..', 'client');
    this.errors = [];
    this.warnings = [];
    this.issues = [];
  }

  // 🔍 Scan for potential routing issues
  scanRoutingIssues() {
    console.log('🔍 Scanning for routing issues...');
    
    try {
      // Check App.tsx for route definitions
      const appFile = path.join(this.clientDir, 'src', 'App.tsx');
      const appContent = fs.readFileSync(appFile, 'utf8');
      
      // Extract route paths
      const routeRegex = /<Route\s+path=["'](\/[^"']*?)["']/g;
      const routes = [];
      let match;
      
      while ((match = routeRegex.exec(appContent)) !== null) {
        routes.push(match[1]);
      }
      
      // Check for Link components with potential broken paths
      const linkRegex = /<Link\s+to=["'](\/[^"']*?)["']/g;
      const links = [];
      
      while ((match = linkRegex.exec(appContent)) !== null) {
        links.push(match[1]);
      }
      
      // Find orphaned links (links that don't have corresponding routes)
      const orphanedLinks = links.filter(link => 
        !routes.some(route => 
          route === link || 
          (route.includes(':') && this.matchesParameterizedRoute(link, route))
        )
      );
      
      if (orphanedLinks.length > 0) {
        this.errors.push({
          type: 'ROUTING',
          severity: 'HIGH',
          message: `Found ${orphanedLinks.length} orphaned links`,
          details: orphanedLinks
        });
      }
      
      return { routes, links, orphanedLinks };
    } catch (error) {
      this.errors.push({
        type: 'ROUTING',
        severity: 'CRITICAL',
        message: `Failed to analyze routing: ${error.message}`
      });
    }
  }

  // 🔗 Check for broken imports and missing components
  scanImportIssues() {
    console.log('🔗 Scanning for import issues...');
    
    const srcDir = path.join(this.clientDir, 'src');
    const files = this.getReactFiles(srcDir);
    
    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const imports = this.extractImports(content);
        
        imports.forEach(importPath => {
          if (importPath.startsWith('@/') || importPath.startsWith('./') || importPath.startsWith('../')) {
            const resolvedPath = this.resolveImportPath(filePath, importPath);
            
            if (!fs.existsSync(resolvedPath)) {
              this.errors.push({
                type: 'IMPORT',
                severity: 'HIGH',
                message: `Broken import: ${importPath}`,
                file: path.relative(this.clientDir, filePath),
                details: `Cannot find: ${resolvedPath}`
              });
            }
          }
        });
      } catch (error) {
        this.errors.push({
          type: 'IMPORT',
          severity: 'MEDIUM',
          message: `Failed to analyze imports in ${path.relative(this.clientDir, filePath)}: ${error.message}`
        });
      }
    });
  }

  // 📱 Check for responsive design issues
  scanResponsiveIssues() {
    console.log('📱 Scanning for responsive design issues...');
    
    const srcDir = path.join(this.clientDir, 'src');
    const files = this.getReactFiles(srcDir);
    
    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for hardcoded pixel values without responsive alternatives
        const hardcodedPixels = content.match(/\b\d+px\b/g) || [];
        if (hardcodedPixels.length > 5) {
          this.warnings.push({
            type: 'RESPONSIVE',
            severity: 'MEDIUM',
            message: `Found ${hardcodedPixels.length} hardcoded pixel values`,
            file: path.relative(this.clientDir, filePath),
            suggestion: 'Consider using Tailwind responsive classes or rem units'
          });
        }
        
        // Check for missing mobile-first breakpoints
        const hasResponsiveClasses = /\b(sm:|md:|lg:|xl:)/.test(content);
        const hasFixedWidths = /\bw-\d+\b|\bwidth:\s*\d+/.test(content);
        
        if (hasFixedWidths && !hasResponsiveClasses) {
          this.warnings.push({
            type: 'RESPONSIVE',
            severity: 'MEDIUM',
            message: 'Fixed widths without responsive alternatives',
            file: path.relative(this.clientDir, filePath),
            suggestion: 'Add responsive breakpoints (sm:, md:, lg:, xl:)'
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });
  }

  // 🎨 Check for accessibility issues
  scanAccessibilityIssues() {
    console.log('🎨 Scanning for accessibility issues...');
    
    const srcDir = path.join(this.clientDir, 'src');
    const files = this.getReactFiles(srcDir);
    
    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for images without alt text
        const imagesWithoutAlt = (content.match(/<img(?![^>]*alt=)/g) || []).length;
        if (imagesWithoutAlt > 0) {
          this.issues.push({
            type: 'ACCESSIBILITY',
            severity: 'HIGH',
            message: `Found ${imagesWithoutAlt} images without alt text`,
            file: path.relative(this.clientDir, filePath)
          });
        }
        
        // Check for buttons without accessible labels
        const buttonsWithoutLabel = (content.match(/<button(?![^>]*aria-label=)(?![^>]*title=)(?!>[^<]*\w)/g) || []).length;
        if (buttonsWithoutLabel > 0) {
          this.issues.push({
            type: 'ACCESSIBILITY',
            severity: 'MEDIUM',
            message: `Found ${buttonsWithoutLabel} buttons without accessible labels`,
            file: path.relative(this.clientDir, filePath)
          });
        }
        
        // Check for missing form labels
        const inputsWithoutLabels = (content.match(/<input(?![^>]*aria-label=)(?![^>]*id=)/g) || []).length;
        if (inputsWithoutLabels > 0) {
          this.issues.push({
            type: 'ACCESSIBILITY',
            severity: 'HIGH',
            message: `Found ${inputsWithoutLabels} inputs without labels`,
            file: path.relative(this.clientDir, filePath)
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });
  }

  // 🔧 Check for TypeScript errors
  scanTypeScriptErrors() {
    console.log('🔧 Scanning for TypeScript errors...');
    
    try {
      // Run TypeScript compiler check
      const tscPath = path.join(__dirname, '..', 'node_modules', '.bin', 'tsc');
      const tsConfig = path.join(__dirname, '..', 'tsconfig.json');
      
      if (fs.existsSync(tscPath) && fs.existsSync(tsConfig)) {
        const result = execSync(`${tscPath} --noEmit --skipLibCheck`, { 
          cwd: path.join(__dirname, '..'),
          encoding: 'utf8'
        });
        
        if (result.trim()) {
          const errors = result.split('\n').filter(line => line.includes('error TS'));
          this.errors.push({
            type: 'TYPESCRIPT',
            severity: 'HIGH',
            message: `Found ${errors.length} TypeScript errors`,
            details: errors.slice(0, 10) // Show first 10 errors
          });
        }
      }
    } catch (error) {
      // TypeScript errors will be in error.stdout
      if (error.stdout) {
        const errors = error.stdout.split('\n').filter(line => line.includes('error TS'));
        if (errors.length > 0) {
          this.errors.push({
            type: 'TYPESCRIPT',
            severity: 'HIGH',
            message: `Found ${errors.length} TypeScript errors`,
            details: errors.slice(0, 10)
          });
        }
      }
    }
  }

  // 🧩 Utility functions
  getReactFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && item !== 'node_modules' && item !== '.git') {
          traverse(fullPath);
        } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(item)) {
          files.push(fullPath);
        }
      });
    }
    
    traverse(dir);
    return files;
  }

  extractImports(content) {
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  resolveImportPath(currentFile, importPath) {
    const currentDir = path.dirname(currentFile);
    
    if (importPath.startsWith('@/')) {
      // Resolve @ alias to src directory
      const srcDir = path.join(this.clientDir, 'src');
      return path.resolve(srcDir, importPath.substring(2));
    } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
      // Resolve relative path
      const resolved = path.resolve(currentDir, importPath);
      
      // Try different extensions
      for (const ext of ['', '.ts', '.tsx', '.js', '.jsx']) {
        const withExt = resolved + ext;
        if (fs.existsSync(withExt)) {
          return withExt;
        }
      }
      
      // Try index files
      for (const indexFile of ['index.ts', 'index.tsx', 'index.js', 'index.jsx']) {
        const indexPath = path.join(resolved, indexFile);
        if (fs.existsSync(indexPath)) {
          return indexPath;
        }
      }
      
      return resolved;
    }
    
    return importPath;
  }

  matchesParameterizedRoute(link, route) {
    const routeParts = route.split('/');
    const linkParts = link.split('/');
    
    if (routeParts.length !== linkParts.length) {
      return false;
    }
    
    return routeParts.every((part, index) => {
      return part.startsWith(':') || part === linkParts[index];
    });
  }

  // 📊 Generate comprehensive report
  generateReport() {
    const report = `
🖥️ EDUCAFRIC FRONTEND ERROR DETECTION REPORT
==========================================
Generated: ${new Date().toLocaleString()}

📊 SUMMARY:
❌ Critical Errors: ${this.errors.filter(e => e.severity === 'CRITICAL').length}
⚠️ High Priority: ${this.errors.filter(e => e.severity === 'HIGH').length + this.issues.filter(i => i.severity === 'HIGH').length}
🔸 Medium Priority: ${this.errors.filter(e => e.severity === 'MEDIUM').length + this.issues.filter(i => i.severity === 'MEDIUM').length + this.warnings.length}

`;

    // Critical and High Priority Issues
    const criticalErrors = this.errors.filter(e => e.severity === 'CRITICAL');
    const highPriorityIssues = [
      ...this.errors.filter(e => e.severity === 'HIGH'),
      ...this.issues.filter(i => i.severity === 'HIGH')
    ];

    if (criticalErrors.length > 0 || highPriorityIssues.length > 0) {
      let criticalSection = '🚨 CRITICAL & HIGH PRIORITY ISSUES:\n' + '='.repeat(50) + '\n';
      
      [...criticalErrors, ...highPriorityIssues].forEach((issue, index) => {
        criticalSection += `${index + 1}. ${issue.type}: ${issue.message}\n`;
        if (issue.file) criticalSection += `   File: ${issue.file}\n`;
        if (issue.details) {
          criticalSection += `   Details: ${Array.isArray(issue.details) ? issue.details.join('\n            ') : issue.details}\n`;
        }
        if (issue.suggestion) criticalSection += `   Suggestion: ${issue.suggestion}\n`;
        criticalSection += '\n';
      });
      
      return report + criticalSection;
    }

    // Medium Priority Issues
    const mediumIssues = [
      ...this.errors.filter(e => e.severity === 'MEDIUM'),
      ...this.issues.filter(i => i.severity === 'MEDIUM'),
      ...this.warnings
    ];

    if (mediumIssues.length > 0) {
      let mediumSection = '🔸 MEDIUM PRIORITY ISSUES:\n' + '='.repeat(30) + '\n';
      
      mediumIssues.forEach((issue, index) => {
        mediumSection += `${index + 1}. ${issue.type}: ${issue.message}\n`;
        if (issue.file) mediumSection += `   File: ${issue.file}\n`;
        if (issue.suggestion) mediumSection += `   Suggestion: ${issue.suggestion}\n`;
        mediumSection += '\n';
      });
      
      return report + mediumSection;
    }

    return report + '✅ No critical frontend issues detected!\n';
  }

  // 🏃‍♂️ Run all scans
  async run() {
    console.log('🚀 Starting Frontend Error Detection...');
    
    this.scanRoutingIssues();
    this.scanImportIssues();
    this.scanResponsiveIssues();
    this.scanAccessibilityIssues();
    this.scanTypeScriptErrors();
    
    const report = this.generateReport();
    console.log(report);
    
    // Save report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `frontend-errors-${timestamp}.txt`;
    const filepath = path.join(__dirname, filename);
    fs.writeFileSync(filepath, report);
    
    console.log(`📄 Report saved to: ${filepath}`);
    
    // Exit with error code if critical issues found
    const hasCriticalIssues = this.errors.some(e => e.severity === 'CRITICAL') ||
                             this.issues.some(i => i.severity === 'HIGH');
    
    if (hasCriticalIssues) {
      console.log('\n🚨 Critical frontend issues detected!');
      process.exit(1);
    }
    
    console.log('\n✅ Frontend scan completed successfully!');
    return { errors: this.errors, warnings: this.warnings, issues: this.issues };
  }
}

// 🎯 CLI Usage
if (process.argv[1] === __filename) {
  const detector = new FrontendErrorDetector();
  detector.run();
}

export default FrontendErrorDetector;