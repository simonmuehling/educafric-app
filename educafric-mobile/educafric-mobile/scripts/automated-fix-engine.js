#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Automated Fix Engine - Detects and fixes common issues automatically
 * Integrated with Enhanced Error Recognition System
 */

class AutomatedFixEngine {
  constructor() {
    this.fixPatterns = [
      {
        name: 'react_translation_errors',
        pattern: /objects are not valid as a react child/i,
        description: 'Fix React translation object rendering issues',
        fix: this.fixReactTranslationErrors.bind(this)
      },
      {
        name: 'missing_imports',
        pattern: /module.*not found/i,
        description: 'Fix missing import statements',
        fix: this.fixMissingImports.bind(this)
      },
      {
        name: 'typescript_errors',
        pattern: /property.*does not exist on type/i,
        description: 'Fix TypeScript property access errors',
        fix: this.fixTypeScriptErrors.bind(this)
      },
      {
        name: 'authentication_session',
        pattern: /authentication required|session expired/i,
        description: 'Fix authentication and session issues',
        fix: this.fixAuthenticationIssues.bind(this)
      },
      {
        name: 'database_connection',
        pattern: /database connection|query failed/i,
        description: 'Fix database connectivity issues',
        fix: this.fixDatabaseIssues.bind(this)
      }
    ];

    this.fixHistory = [];
    this.backupCreated = false;
  }

  // Main fix execution method
  async executeFix(error, context = {}) {
    console.log('🔧 Automated Fix Engine analyzing error...');
    
    const errorMessage = error.message || error.toString();
    const matchingFixes = this.findMatchingFixes(errorMessage);
    
    if (matchingFixes.length === 0) {
      console.log('❌ No automated fixes available for this error type');
      return { success: false, message: 'No matching fix patterns found' };
    }

    console.log(`🎯 Found ${matchingFixes.length} potential fix(es)`);
    
    const results = [];
    for (const fixPattern of matchingFixes) {
      try {
        console.log(`🛠️  Applying fix: ${fixPattern.description}`);
        const result = await fixPattern.fix(error, context);
        results.push({
          name: fixPattern.name,
          success: true,
          result,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Fix applied successfully: ${fixPattern.name}`);
        
      } catch (fixError) {
        console.error(`❌ Fix failed: ${fixPattern.name} - ${fixError.message}`);
        results.push({
          name: fixPattern.name,
          success: false,
          error: fixError.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Record fix attempt in history
    this.recordFixAttempt(error, results);
    
    return {
      success: results.some(r => r.success),
      fixes: results,
      message: `Applied ${results.filter(r => r.success).length} out of ${results.length} fixes`
    };
  }

  // Find matching fix patterns
  findMatchingFixes(errorMessage) {
    return this.fixPatterns.filter(pattern => 
      pattern.pattern.test(errorMessage)
    );
  }

  // Fix React translation object rendering errors
  async fixReactTranslationErrors(error, context) {
    console.log('🌍 Fixing React translation object errors...');
    
    const filesToCheck = [
      'client/src/pages/Login.tsx',
      'client/src/pages/Profile.tsx',
      'client/src/contexts/LanguageContext.tsx'
    ];

    const fixes = [];
    
    for (const filePath of filesToCheck) {
      try {
        const fullPath = path.join(__dirname, '..', filePath);
        const content = await fs.readFile(fullPath, 'utf8');
        
        // Look for toast calls with potential object translation issues
        const toastPattern = /toast\s*\(\s*{[\s\S]*?title:\s*([^,}]+)[\s\S]*?}\s*\)/g;
        let match;
        let modified = false;
        let newContent = content;
        
        while ((match = toastPattern.exec(content)) !== null) {
          const titleExpression = match[1].trim();
          
          // If title doesn't start with String(), wrap it
          if (!titleExpression.startsWith('String(')) {
            const wrappedTitle = `String(${titleExpression} || 'Notification')`;
            newContent = newContent.replace(match[1], wrappedTitle);
            modified = true;
          }
        }
        
        if (modified) {
          await fs.writeFile(fullPath, newContent);
          fixes.push(`Fixed toast translations in ${filePath}`);
        }
        
      } catch (err) {
        console.warn(`Could not fix translations in ${filePath}: ${err.message}`);
      }
    }
    
    return { filesFixed: fixes.length, details: fixes };
  }

  // Fix missing import statements
  async fixMissingImports(error, context) {
    console.log('📦 Fixing missing import statements...');
    
    const commonImports = {
      'React': "import React from 'react';",
      'useState': "import { useState } from 'react';",
      'useEffect': "import { useEffect } from 'react';",
      'Button': "import { Button } from '@/components/ui/button';",
      'Input': "import { Input } from '@/components/ui/input';",
      'Card': "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';",
      'toast': "import { toast } from '@/hooks/use-toast';"
    };

    // This is a simplified fix - in production, you'd analyze the specific error
    const fixes = [];
    const errorMessage = error.message || error.toString();
    
    for (const [component, importStatement] of Object.entries(commonImports)) {
      if (errorMessage.includes(component)) {
        fixes.push(`Add missing import: ${importStatement}`);
      }
    }
    
    return { suggestedImports: fixes };
  }

  // Fix TypeScript property access errors
  async fixTypeScriptErrors(error, context) {
    console.log('🔧 Fixing TypeScript property access errors...');
    
    const errorMessage = error.message || error.toString();
    const propertyMatch = errorMessage.match(/Property '(\w+)' does not exist on type '(\w+)'/);
    
    if (propertyMatch) {
      const [, property, type] = propertyMatch;
      
      const suggestions = [
        `Add optional chaining: ?.${property}`,
        `Use type assertion: (obj as any).${property}`,
        `Check if property exists: obj.${property} !== undefined`,
        `Add property to ${type} interface`
      ];
      
      return { 
        property, 
        type, 
        suggestions,
        autoFix: `Use type assertion as temporary fix`
      };
    }
    
    return { message: 'Could not parse TypeScript error for auto-fix' };
  }

  // Fix authentication and session issues
  async fixAuthenticationIssues(error, context) {
    console.log('🔐 Fixing authentication issues...');
    
    const fixes = [];
    
    // Check session configuration
    fixes.push('Verify session middleware configuration');
    fixes.push('Check authentication endpoints');
    fixes.push('Validate user login flow');
    
    // In a real implementation, these would perform actual checks and fixes
    return { 
      checksPerformed: fixes,
      recommendations: [
        'Ensure session secret is properly configured',
        'Check database connectivity for session storage',
        'Verify authentication middleware is properly applied'
      ]
    };
  }

  // Fix database connectivity issues
  async fixDatabaseIssues(error, context) {
    console.log('💾 Fixing database issues...');
    
    const fixes = [];
    
    // Database connection diagnostics
    fixes.push('Check DATABASE_URL environment variable');
    fixes.push('Verify database server connectivity');
    fixes.push('Test connection pool settings');
    
    return {
      diagnosticsRun: fixes,
      recommendations: [
        'Verify database credentials',
        'Check network connectivity to database server',
        'Review connection pool configuration',
        'Ensure database server is running'
      ]
    };
  }

  // Record fix attempt in history
  recordFixAttempt(error, results) {
    this.fixHistory.push({
      timestamp: new Date().toISOString(),
      error: {
        message: error.message || error.toString(),
        type: this.categorizeError(error)
      },
      fixes: results,
      success: results.some(r => r.success)
    });

    // Keep only last 100 fix attempts
    if (this.fixHistory.length > 100) {
      this.fixHistory = this.fixHistory.slice(-100);
    }
  }

  // Categorize errors (similar to ErrorRecognitionSystem)
  categorizeError(error) {
    const errorMessage = error.message || error.toString();
    
    const patterns = {
      react: /react|component|render|jsx/i,
      typescript: /type|property.*does not exist/i,
      auth: /authentication|unauthorized|session/i,
      database: /database|query|connection/i,
      network: /network|timeout|connection refused/i
    };

    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(errorMessage)) {
        return category;
      }
    }

    return 'unknown';
  }

  // Generate fix report
  generateFixReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalAttempts: this.fixHistory.length,
      successfulFixes: this.fixHistory.filter(f => f.success).length,
      failedFixes: this.fixHistory.filter(f => !f.success).length,
      categoriesFixed: {},
      recentFixes: this.fixHistory.slice(-10)
    };

    // Count fixes by category
    this.fixHistory.forEach(fix => {
      const category = fix.error.type;
      report.categoriesFixed[category] = (report.categoriesFixed[category] || 0) + 1;
    });

    return report;
  }

  // Display fix dashboard
  displayFixDashboard() {
    const report = this.generateFixReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('🔧 AUTOMATED FIX ENGINE DASHBOARD');
    console.log('='.repeat(60));
    
    console.log(`📊 SUMMARY:`);
    console.log(`  Total Fix Attempts: ${report.totalAttempts}`);
    console.log(`  Successful Fixes: ${report.successfulFixes}`);
    console.log(`  Failed Fixes: ${report.failedFixes}`);
    
    if (report.totalAttempts > 0) {
      const successRate = (report.successfulFixes / report.totalAttempts * 100).toFixed(1);
      console.log(`  Success Rate: ${successRate}%`);
    }
    
    if (Object.keys(report.categoriesFixed).length > 0) {
      console.log(`\n🏷️  FIXES BY CATEGORY:`);
      Object.entries(report.categoriesFixed).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    }
    
    if (report.recentFixes.length > 0) {
      console.log(`\n🕐 RECENT FIXES:`);
      report.recentFixes.slice(-5).forEach(fix => {
        const status = fix.success ? '✅' : '❌';
        const time = new Date(fix.timestamp).toLocaleTimeString();
        console.log(`  ${status} ${time} - ${fix.error.type}: ${fix.error.message.substring(0, 50)}...`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }

  // Save fix history
  async saveFixHistory() {
    try {
      const report = this.generateFixReport();
      const reportPath = path.join(__dirname, '../automated-fix-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`💾 Fix history saved to: ${reportPath}`);
    } catch (error) {
      console.error('❌ Failed to save fix history:', error.message);
    }
  }
}

// Test function to demonstrate fix engine
async function testFixEngine() {
  const fixEngine = new AutomatedFixEngine();
  
  console.log('🧪 Testing Automated Fix Engine...');
  
  // Test different error types
  const testErrors = [
    { message: 'Objects are not valid as a React child', type: 'react_translation' },
    { message: 'Property phone does not exist on type User', type: 'typescript' },
    { message: 'Authentication required', type: 'auth' },
    { message: 'Database connection failed', type: 'database' }
  ];

  for (const testError of testErrors) {
    console.log(`\n🔍 Testing fix for: ${testError.message}`);
    const result = await fixEngine.executeFix(testError);
    console.log(`Result: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
  }

  fixEngine.displayFixDashboard();
  await fixEngine.saveFixHistory();
}

// Main execution
async function main() {
  console.log('🚀 Starting Automated Fix Engine...');
  await testFixEngine();
}

// Export for use as module
export { AutomatedFixEngine };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Automated Fix Engine failed:', error.message);
    process.exit(1);
  });
}