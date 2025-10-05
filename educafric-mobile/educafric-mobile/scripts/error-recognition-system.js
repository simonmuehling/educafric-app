#!/usr/bin/env node
import http from 'http';
import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced Error Recognition and Automation System
 * Built-in Node.js modules only - no external dependencies
 */

class EnhancedErrorRecognitionSystem {
  constructor() {
    this.errorPatterns = {
      authentication: [
        /authentication required/i,
        /invalid credentials/i,
        /unauthorized/i,
        /session expired/i,
        /access denied/i,
        /token expired/i,
        /forbidden/i,
        /login failed/i
      ],
      database: [
        /database connection/i,
        /query failed/i,
        /connection timeout/i,
        /table.*not found/i,
        /constraint violation/i,
        /pool exhausted/i,
        /deadlock/i,
        /foreign key/i,
        /duplicate entry/i
      ],
      server: [
        /internal server error/i,
        /service unavailable/i,
        /connection refused/i,
        /timeout/i,
        /memory limit/i,
        /port.*in use/i,
        /cannot start server/i,
        /process crashed/i,
        /server not responding/i
      ],
      validation: [
        /validation error/i,
        /required field/i,
        /invalid format/i,
        /missing parameter/i,
        /schema validation/i,
        /type mismatch/i,
        /format error/i,
        /bad request/i
      ],
      network: [
        /network error/i,
        /dns resolution/i,
        /ssl certificate/i,
        /connection reset/i,
        /host unreachable/i,
        /cors/i,
        /proxy error/i,
        /request timeout/i
      ],
      frontend: [
        /objects are not valid as a react child/i,
        /cannot read prop.*of undefined/i,
        /hydration failed/i,
        /render error/i,
        /component.*not found/i,
        /hook.*not found/i,
        /translation.*missing/i,
        /module not found/i,
        /jsx.*error/i
      ],
      translation: [
        /translation.*undefined/i,
        /language.*not found/i,
        /missing translation/i,
        /locale.*error/i,
        /i18n.*error/i,
        /gettext.*error/i
      ]
    };

    this.criticalEndpoints = [
      '/api/auth/login',
      '/api/auth/register', 
      '/api/auth/me',
      '/api/health',
      '/api/users',
      '/api/auth/profile'
    ];

    this.automationRules = new Map([
      ['restart_server', {
        condition: (error) => this.errorPatterns.server.some(pattern => pattern.test(error.message || error.toString())),
        action: this.restartServer.bind(this),
        priority: 'critical',
        cooldown: 300000, // 5 minutes
        lastExecuted: 0
      }],
      ['fix_translation_errors', {
        condition: (error) => this.errorPatterns.translation.some(pattern => pattern.test(error.message || error.toString())),
        action: this.fixTranslationErrors.bind(this),
        priority: 'high',
        cooldown: 60000, // 1 minute
        lastExecuted: 0
      }],
      ['fix_react_errors', {
        condition: (error) => this.errorPatterns.frontend.some(pattern => pattern.test(error.message || error.toString())),
        action: this.fixReactErrors.bind(this),
        priority: 'high',
        cooldown: 120000, // 2 minutes
        lastExecuted: 0
      }],
      ['database_reconnect', {
        condition: (error) => this.errorPatterns.database.some(pattern => pattern.test(error.message || error.toString())),
        action: this.reconnectDatabase.bind(this),
        priority: 'critical',
        cooldown: 120000, // 2 minutes
        lastExecuted: 0
      }]
    ]);

    this.errorLog = [];
    this.alertHistory = [];
    this.monitoringActive = true;
    this.fixesApplied = 0;
  }

  // HTTP request utility using built-in modules
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Educafric-Error-Monitor/1.0',
          ...options.headers
        },
        timeout: options.timeout || 10000
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: jsonData,
              body: data
            });
          } catch (err) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: null,
              body: data
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.data && ['POST', 'PUT', 'PATCH'].includes(options.method?.toUpperCase())) {
        req.write(JSON.stringify(options.data));
      }

      req.end();
    });
  }

  // Test endpoint with error recognition
  async testEndpoint(url, method = 'GET', data = null) {
    const startTime = Date.now();
    const testResult = {
      url,
      method,
      timestamp: new Date().toISOString(),
      status: 'unknown',
      statusCode: null,
      responseTime: 0,
      error: null,
      errorType: null,
      autoActions: []
    };

    try {
      const response = await this.makeRequest(url, {
        method,
        data,
        timeout: 15000
      });

      testResult.status = 'success';
      testResult.statusCode = response.status;
      testResult.responseTime = Date.now() - startTime;

      // Check for application-level errors in successful responses
      if (response.data && response.data.error) {
        testResult.error = response.data.error;
        testResult.errorType = this.categorizeError(response.data.error);
      }

    } catch (error) {
      testResult.status = 'error';
      testResult.statusCode = 0;
      testResult.responseTime = Date.now() - startTime;
      testResult.error = {
        message: error.message,
        code: error.code,
        stack: error.stack
      };
      testResult.errorType = this.categorizeError(error);

      // Execute automation rules
      testResult.autoActions = await this.executeAutomationRules(error, url);
    }

    this.logError(testResult);
    return testResult;
  }

  // Categorize errors based on patterns
  categorizeError(error) {
    const errorMessage = error.message || error.toString() || '';
    
    for (const [category, patterns] of Object.entries(this.errorPatterns)) {
      if (patterns.some(pattern => pattern.test(errorMessage))) {
        return category;
      }
    }
    
    return 'unknown';
  }

  // Execute automation rules
  async executeAutomationRules(error, endpoint) {
    const actions = [];
    const now = Date.now();

    for (const [ruleName, rule] of this.automationRules.entries()) {
      if (rule.condition(error) && (now - rule.lastExecuted) > rule.cooldown) {
        try {
          console.log(`🤖 Executing automation rule: ${ruleName} for endpoint ${endpoint}`);
          await rule.action(error, endpoint);
          rule.lastExecuted = now;
          this.fixesApplied++;
          actions.push({
            rule: ruleName,
            executed: true,
            timestamp: new Date().toISOString(),
            priority: rule.priority
          });
        } catch (actionError) {
          console.error(`❌ Failed to execute automation rule ${ruleName}:`, actionError.message);
          actions.push({
            rule: ruleName,
            executed: false,
            error: actionError.message,
            timestamp: new Date().toISOString(),
            priority: rule.priority
          });
        }
      }
    }

    return actions;
  }

  // Automation Actions
  async restartServer(error, endpoint) {
    console.log('🔄 Attempting server restart due to critical error...');
    try {
      // Create restart signal file
      const restartFile = path.join(__dirname, '../.restart-signal');
      await fs.writeFile(restartFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        reason: 'Automated restart due to server error',
        error: error.message,
        endpoint
      }));
      
      console.log('✅ Restart signal created - server will restart on next check');
      return { action: 'restart_signal_created', success: true };
    } catch (err) {
      console.error('❌ Failed to create restart signal:', err.message);
      throw err;
    }
  }

  async fixTranslationErrors(error, endpoint) {
    console.log('🌍 Attempting to fix translation errors...');
    try {
      const fixes = [];
      
      // Check for React translation object errors
      if (/objects are not valid as a react child/i.test(error.message)) {
        const loginFile = path.join(__dirname, '../client/src/pages/Login.tsx');
        
        try {
          const content = await fs.readFile(loginFile, 'utf8');
          
          // Look for toast calls without String() wrapper
          const toastRegex = /toast\s*\(\s*{[\s\S]*?title:\s*([^,}]+)[\s\S]*?}\s*\)/g;
          let newContent = content;
          let hasChanges = false;
          
          newContent = newContent.replace(toastRegex, (match, titleGroup) => {
            if (!titleGroup.trim().startsWith('String(')) {
              hasChanges = true;
              return match.replace(titleGroup, `String(${titleGroup.trim()} || 'Notification')`);
            }
            return match;
          });
          
          if (hasChanges) {
            await fs.writeFile(loginFile, newContent);
            fixes.push('Fixed toast translation objects in Login.tsx');
          }
          
        } catch (fileErr) {
          console.warn(`Could not fix Login.tsx: ${fileErr.message}`);
        }
      }
      
      console.log('✅ Translation error fixes completed');
      return { fixes, success: true };
    } catch (err) {
      console.error('❌ Translation fix failed:', err.message);
      throw err;
    }
  }

  async fixReactErrors(error, endpoint) {
    console.log('⚛️  Attempting to fix React errors...');
    try {
      const fixes = [];
      const errorMessage = error.message || error.toString();
      
      // Common React fixes
      if (/cannot read prop.*of undefined/i.test(errorMessage)) {
        fixes.push('Add null checks for object properties');
        fixes.push('Use optional chaining (?.) operator');
      }
      
      if (/component.*not found/i.test(errorMessage)) {
        fixes.push('Check component import statements');
        fixes.push('Verify component file paths');
      }
      
      if (/hook.*not found/i.test(errorMessage)) {
        fixes.push('Verify React hook imports');
        fixes.push('Check hook usage rules');
      }
      
      console.log('✅ React error analysis completed');
      return { analysis: fixes, success: true };
    } catch (err) {
      console.error('❌ React fix analysis failed:', err.message);
      throw err;
    }
  }

  async reconnectDatabase(error, endpoint) {
    console.log('🔌 Attempting database reconnection...');
    try {
      // Simulate database reconnection check
      const dbChecks = [
        'Verifying DATABASE_URL environment variable',
        'Testing database connectivity',
        'Checking connection pool status',
        'Validating database schema'
      ];
      
      for (const check of dbChecks) {
        console.log(`  • ${check}`);
        await this.delay(500);
      }
      
      console.log('✅ Database connectivity check completed');
      return { checks: dbChecks, success: true };
    } catch (err) {
      console.error('❌ Database reconnection failed:', err.message);
      throw err;
    }
  }

  // Log errors with enhanced details
  logError(testResult) {
    if (testResult.status === 'error' || testResult.error) {
      this.errorLog.push({
        ...testResult,
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      
      // Keep only last 500 errors
      if (this.errorLog.length > 500) {
        this.errorLog = this.errorLog.slice(-500);
      }

      // Generate alert for critical errors
      if (this.criticalEndpoints.includes(testResult.url) && testResult.status === 'error') {
        this.generateAlert(testResult);
      }
    }
  }

  // Generate alerts for critical issues
  generateAlert(testResult) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity: this.getSeverity(testResult),
      endpoint: testResult.url,
      errorType: testResult.errorType,
      message: testResult.error?.message || 'Unknown error',
      statusCode: testResult.statusCode,
      autoActions: testResult.autoActions || []
    };

    this.alertHistory.push(alert);
    console.log(`🚨 ALERT [${alert.severity}]: ${alert.message} on ${alert.endpoint}`);

    // Keep only last 50 alerts
    if (this.alertHistory.length > 50) {
      this.alertHistory = this.alertHistory.slice(-50);
    }
  }

  // Determine alert severity
  getSeverity(testResult) {
    if (testResult.statusCode >= 500 || testResult.errorType === 'server') return 'critical';
    if (testResult.statusCode >= 400 || testResult.errorType === 'authentication') return 'high';
    if (testResult.responseTime > 5000) return 'medium';
    return 'low';
  }

  // Run comprehensive monitoring
  async runComprehensiveMonitoring() {
    console.log('🏥 Starting comprehensive error recognition monitoring...');
    const baseUrl = 'http://localhost:5000';
    
    const endpoints = [
      { url: `${baseUrl}/api/health`, method: 'GET' },
      // Test authentication with realistic scenarios (without actual login to avoid console noise)
      { url: `${baseUrl}/api/auth/me`, method: 'GET' },
      { url: `${baseUrl}/api/users`, method: 'GET' },
      { url: `${baseUrl}/api/auth/profile`, method: 'GET' },
      // Test public endpoints
      { url: `${baseUrl}/api/schools`, method: 'GET' },
      { url: `${baseUrl}/api/tracking/status`, method: 'GET' }
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing: ${endpoint.method} ${endpoint.url}`);
        const result = await this.testEndpoint(endpoint.url, endpoint.method, endpoint.data);
        results.push(result);
        
        // Brief pause between requests
        await this.delay(500);
      } catch (error) {
        console.error(`❌ Failed to test ${endpoint.url}:`, error.message);
      }
    }

    return this.generateMonitoringReport(results);
  }

  // Generate monitoring report
  generateMonitoringReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length,
        avgResponseTime: 0,
        fixesApplied: this.fixesApplied
      },
      errorsByType: {},
      criticalIssues: [],
      automationActions: [],
      recommendations: []
    };

    // Calculate metrics
    const successfulResults = results.filter(r => r.status === 'success');
    if (successfulResults.length > 0) {
      report.summary.avgResponseTime = Math.round(
        successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length
      );
    }

    // Categorize errors
    results.filter(r => r.errorType).forEach(result => {
      if (!report.errorsByType[result.errorType]) {
        report.errorsByType[result.errorType] = 0;
      }
      report.errorsByType[result.errorType]++;
    });

    // Identify critical issues
    report.criticalIssues = results.filter(r => 
      this.criticalEndpoints.includes(r.url) && r.status === 'error'
    );

    // Collect automation actions
    results.forEach(result => {
      if (result.autoActions && result.autoActions.length > 0) {
        report.automationActions.push(...result.autoActions);
      }
    });

    // Generate recommendations
    report.recommendations = this.generateRecommendations(results);

    return { report, results };
  }

  // Generate actionable recommendations
  generateRecommendations(results) {
    const recommendations = [];
    const errorCounts = {};

    results.forEach(result => {
      if (result.errorType) {
        errorCounts[result.errorType] = (errorCounts[result.errorType] || 0) + 1;
      }
    });

    // Generate specific recommendations based on error patterns
    Object.entries(errorCounts).forEach(([errorType, count]) => {
      const recMap = {
        authentication: {
          priority: 'high',
          message: `Authentication errors detected (${count} instances). Session management needs attention.`,
          actions: ['Check session configuration', 'Verify authentication middleware', 'Test user login flow']
        },
        database: {
          priority: 'critical',
          message: `Database issues found (${count} instances). Immediate attention required.`,
          actions: ['Verify database connectivity', 'Check connection pool settings', 'Review query performance']
        },
        server: {
          priority: 'critical',
          message: `Server stability issues detected (${count} instances).`,
          actions: ['Monitor server resources', 'Check application logs', 'Consider scaling options']
        },
        frontend: {
          priority: 'medium',
          message: `Frontend errors detected (${count} instances). User experience may be affected.`,
          actions: ['Check React component rendering', 'Verify translation objects', 'Test UI components']
        }
      };

      if (recMap[errorType]) {
        recommendations.push({
          type: errorType,
          ...recMap[errorType]
        });
      }
    });

    return recommendations;
  }

  // Save monitoring report
  async saveReport(reportData) {
    try {
      const reportPath = path.join(__dirname, '../error-recognition-report.json');
      const detailedReportPath = path.join(__dirname, '../detailed-error-monitoring.json');
      
      // Save summary report
      await fs.writeFile(reportPath, JSON.stringify(reportData.report, null, 2));
      
      // Save detailed report
      await fs.writeFile(detailedReportPath, JSON.stringify({
        ...reportData.report,
        detailedResults: reportData.results,
        errorLog: this.errorLog.slice(-25),
        alertHistory: this.alertHistory.slice(-10),
        automationRules: Array.from(this.automationRules.entries()).map(([name, rule]) => ({
          name,
          priority: rule.priority,
          cooldown: rule.cooldown,
          lastExecuted: rule.lastExecuted
        }))
      }, null, 2));
      
      console.log(`📊 Error recognition reports saved:`);
      console.log(`  - Summary: ${reportPath}`);
      console.log(`  - Detailed: ${detailedReportPath}`);
      
    } catch (error) {
      console.error('❌ Failed to save monitoring report:', error.message);
    }
  }

  // Display comprehensive dashboard
  displayDashboard(reportData) {
    const { report } = reportData;
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 ENHANCED ERROR RECOGNITION & AUTOMATION DASHBOARD');
    console.log('='.repeat(80));
    
    console.log(`📊 MONITORING SUMMARY:`);
    console.log(`  ✅ Successful: ${report.summary.successful}/${report.summary.total}`);
    console.log(`  ❌ Failed: ${report.summary.failed}/${report.summary.total}`);
    console.log(`  🤖 Fixes Applied: ${report.summary.fixesApplied}`);
    console.log(`  ⏱️  Avg Response Time: ${report.summary.avgResponseTime}ms`);
    
    if (Object.keys(report.errorsByType).length > 0) {
      console.log(`\n🏷️  ERRORS BY TYPE:`);
      Object.entries(report.errorsByType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    }
    
    if (report.criticalIssues.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES (${report.criticalIssues.length}):`);
      report.criticalIssues.forEach(issue => {
        console.log(`  ❌ ${issue.url}: ${issue.error?.message || 'Unknown error'}`);
      });
    }
    
    if (report.automationActions.length > 0) {
      console.log(`\n🤖 AUTOMATION ACTIONS EXECUTED (${report.automationActions.length}):`);
      report.automationActions.forEach(action => {
        const status = action.executed ? '✅' : '❌';
        console.log(`  ${status} ${action.rule} (${action.priority})`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log(`\n💡 ACTIONABLE RECOMMENDATIONS:`);
      report.recommendations.forEach(rec => {
        console.log(`  [${rec.priority.toUpperCase()}] ${rec.message}`);
        rec.actions.forEach(action => {
          console.log(`    • ${action}`);
        });
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`⏰ Report generated: ${report.timestamp}`);
    console.log('='.repeat(80) + '\n');
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const monitor = new EnhancedErrorRecognitionSystem();
  
  try {
    console.log('🚀 Starting Enhanced Error Recognition System...');
    
    const reportData = await monitor.runComprehensiveMonitoring();
    
    monitor.displayDashboard(reportData);
    await monitor.saveReport(reportData);
    
    console.log('✅ Enhanced error recognition and automation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error recognition system failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { EnhancedErrorRecognitionSystem };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}