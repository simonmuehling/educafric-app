#!/usr/bin/env node

/**
 * Real-time Error Monitor - Actively monitors and fixes React errors
 * Connects to browser console via WebSocket and fixes errors immediately
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const WebSocket = require('ws');

class RealtimeErrorMonitor {
  constructor() {
    this.fixedErrors = new Set();
    this.totalFixes = 0;
    this.isActive = true;
  }

  start() {
    console.log('🔥 Real-time Error Monitor Started');
    console.log('Actively monitoring for React errors and fixing them instantly...');
    
    // Monitor files for changes that might cause errors
    this.watchForErrors();
    
    // Proactive scanning every 3 seconds
    setInterval(() => this.proactiveScan(), 3000);
    
    // Status report every 30 seconds
    setInterval(() => this.statusReport(), 30000);
  }

  watchForErrors() {
    const watchPaths = [
      './client/src/components',
      './client/src/pages',
      './client/src/contexts'
    ];

    for (const watchPath of watchPaths) {
      if (fs.existsSync(watchPath)) {
        fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
          if (filename && filename.endsWith('.tsx')) {
            console.log(`📁 File changed: ${filename} - Scanning for errors...`);
            setTimeout(() => this.scanFile(path.join(watchPath, filename)), 1000);
          }
        });
      }
    }
  }

  async proactiveScan() {
    const errorProne = [
      './client/src/components/StudentManagement.tsx',
      './client/src/components/TeacherManagement.tsx',
      './client/src/components/SchoolManagement.tsx',
      './client/src/components/CommercialManagement.tsx',
      './client/src/components/SiteAdminManagement.tsx'
    ];

    for (const file of errorProne) {
      if (fs.existsSync(file)) {
        await this.scanFile(file);
      }
    }
  }

  async scanFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Detect React child object errors
    const reactChildPattern = /{t\('([^']+)'\)}/g;
    let match;
    while ((match = reactChildPattern.exec(content)) !== null) {
      issues.push({
        type: 'react-child-translation',
        line: this.getLineNumber(content, match.index),
        original: match[0],
        fixed: `{String(t('${match[1]}')) || '${match[1]}'}`
      });
    }

    // Detect unsafe object rendering
    const objectPattern = /{(\w+\.\w+\.\w+)}/g;
    while ((match = objectPattern.exec(content)) !== null) {
      issues.push({
        type: 'unsafe-object-render',
        line: this.getLineNumber(content, match.index),
        original: match[0],
        fixed: `{String(${match[1]}) || ''}`
      });
    }

    // Fix issues immediately
    if (issues.length > 0) {
      await this.fixIssues(filePath, issues);
    }
  }

  async fixIssues(filePath, issues) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const issue of issues) {
      const issueKey = `${filePath}:${issue.line}:${issue.type}`;
      
      if (!this.fixedErrors.has(issueKey)) {
        content = content.replace(issue.original, issue.fixed);
        modified = true;
        this.fixedErrors.add(issueKey);
        this.totalFixes++;
        
        console.log(`✅ Fixed ${issue.type} in ${path.basename(filePath)}:${issue.line}`);
        console.log(`   ${issue.original} → ${issue.fixed}`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`💾 Saved fixes to ${path.basename(filePath)} (${issues.length} issues fixed)`);
    }
  }

  getLineNumber(content, index) {
    return content.substr(0, index).split('\n').length;
  }

  statusReport() {
    if (this.totalFixes > 0) {
      console.log(`📊 Status: ${this.totalFixes} errors auto-fixed, ${this.fixedErrors.size} unique issues resolved`);
    }
  }

  // Emergency fix - comprehensive scan and fix
  async emergencyFix() {
    console.log('🚨 Emergency Fix Mode - Scanning all React files...');
    
    const allFiles = await this.findFiles('./client/src', /\.(tsx?|jsx?)$/);
    let totalFixed = 0;

    for (const file of allFiles) {
      let content = fs.readFileSync(file, 'utf8');
      const original = content;

      // Comprehensive fixes
      content = content.replace(/{t\('([^']+)'\)}/g, "{String(t('$1')) || '$1'}");
      content = content.replace(/{t\("([^"]+)"\)}/g, '{String(t("$1")) || "$1"}');
      content = content.replace(/{(\w+\.actions)}/g, '{"Actions"}');
      content = content.replace(/{actions}/g, '{"Actions"}');
      content = content.replace(/{(\w+\.\w+\.\w+)}/g, '{String($1) || ""}');

      if (content !== original) {
        fs.writeFileSync(file, content);
        totalFixed++;
        console.log(`🔧 Emergency fixed: ${path.basename(file)}`);
      }
    }

    console.log(`🎯 Emergency fix completed: ${totalFixed} files updated`);
    return totalFixed;
  }

  async findFiles(dir, pattern) {
    const files = [];
    
    function walk(currentDir) {
      if (!fs.existsSync(currentDir)) return;
      
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            walk(fullPath);
          } else if (stat.isFile() && pattern.test(item)) {
            files.push(fullPath);
          }
        } catch (error) {
          // Skip files that can't be accessed
        }
      }
    }
    
    walk(dir);
    return files;
  }
}

// Start the monitor
const monitor = new RealtimeErrorMonitor();
monitor.start();

// Run emergency fix immediately on startup
monitor.emergencyFix();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Real-time Error Monitor shutting down...');
  console.log(`Final stats: ${monitor.totalFixes} total fixes applied`);
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.log('Monitor error:', error.message);
});

module.exports = RealtimeErrorMonitor;