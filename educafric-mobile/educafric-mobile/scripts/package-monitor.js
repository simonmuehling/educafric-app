#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Package and Dependency Monitor
 * Tracks package health and dependency issues
 */

class PackageMonitor {
  constructor() {
    this.packagePath = path.join(__dirname, '../package.json');
    this.monitoringResults = {
      timestamp: new Date().toISOString(),
      packageStatus: 'unknown',
      dependencies: {
        total: 0,
        installed: 0,
        missing: 0,
        outdated: 0
      },
      scripts: {
        total: 0,
        validated: 0,
        errors: []
      },
      health: {
        score: 0,
        issues: [],
        recommendations: []
      }
    };
  }

  async runMonitoring() {
    console.log('📦 Starting Package and Dependency Monitoring...');
    
    try {
      await this.checkPackageJson();
      await this.analyzeDependencies();
      await this.validateScripts();
      await this.generateHealthScore();
      await this.saveMonitoringResults();
      
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Package monitoring failed:', error.message);
      this.monitoringResults.packageStatus = 'error';
      this.monitoringResults.health.issues.push({
        type: 'monitoring_error',
        message: error.message,
        severity: 'high'
      });
    }
  }

  async checkPackageJson() {
    try {
      const packageContent = await fs.readFile(this.packagePath, 'utf8');
      const packageData = JSON.parse(packageContent);
      
      this.monitoringResults.packageStatus = 'valid';
      this.monitoringResults.packageData = {
        name: packageData.name,
        version: packageData.version,
        type: packageData.type,
        dependencies: Object.keys(packageData.dependencies || {}).length,
        devDependencies: Object.keys(packageData.devDependencies || {}).length,
        scripts: Object.keys(packageData.scripts || {}).length
      };
      
      console.log('✅ Package.json validated successfully');
      
    } catch (error) {
      console.error('❌ Package.json validation failed:', error.message);
      this.monitoringResults.packageStatus = 'error';
      throw error;
    }
  }

  async analyzeDependencies() {
    try {
      const packageContent = await fs.readFile(this.packagePath, 'utf8');
      const packageData = JSON.parse(packageContent);
      
      const allDeps = {
        ...packageData.dependencies,
        ...packageData.devDependencies
      };
      
      this.monitoringResults.dependencies.total = Object.keys(allDeps).length;
      
      // Check for potential issues
      const criticalDependencies = [
        'react', 'express', 'drizzle-orm', '@neondatabase/serverless',
        'stripe', '@vonage/server-sdk', 'bcrypt', 'passport'
      ];
      
      const missingCritical = criticalDependencies.filter(dep => !allDeps[dep]);
      if (missingCritical.length > 0) {
        this.monitoringResults.health.issues.push({
          type: 'missing_critical',
          message: `Missing critical dependencies: ${missingCritical.join(', ')}`,
          severity: 'critical'
        });
      }
      
      // Check for version conflicts
      const potentialConflicts = this.checkVersionConflicts(allDeps);
      if (potentialConflicts.length > 0) {
        this.monitoringResults.health.issues.push({
          type: 'version_conflicts',
          message: `Potential version conflicts detected`,
          details: potentialConflicts,
          severity: 'medium'
        });
      }
      
      this.monitoringResults.dependencies.installed = Object.keys(allDeps).length;
      console.log(`📊 Analyzed ${this.monitoringResults.dependencies.total} dependencies`);
      
    } catch (error) {
      console.error('❌ Dependency analysis failed:', error.message);
      this.monitoringResults.health.issues.push({
        type: 'dependency_error',
        message: error.message,
        severity: 'high'
      });
    }
  }

  checkVersionConflicts(dependencies) {
    const conflicts = [];
    
    // Check for React version conflicts
    const reactVersion = dependencies.react;
    const reactDomVersion = dependencies['react-dom'];
    if (reactVersion && reactDomVersion && reactVersion !== reactDomVersion) {
      conflicts.push({
        packages: ['react', 'react-dom'],
        versions: [reactVersion, reactDomVersion],
        recommendation: 'Ensure React and React-DOM versions match'
      });
    }
    
    return conflicts;
  }

  async validateScripts() {
    try {
      const packageContent = await fs.readFile(this.packagePath, 'utf8');
      const packageData = JSON.parse(packageContent);
      
      const scripts = packageData.scripts || {};
      this.monitoringResults.scripts.total = Object.keys(scripts).length;
      
      // Check for required scripts
      const requiredScripts = ['dev', 'build', 'start'];
      const missingScripts = requiredScripts.filter(script => !scripts[script]);
      
      if (missingScripts.length > 0) {
        this.monitoringResults.scripts.errors.push({
          type: 'missing_scripts',
          message: `Missing required scripts: ${missingScripts.join(', ')}`,
          severity: 'medium'
        });
      }
      
      // Validate script commands
      Object.entries(scripts).forEach(([name, command]) => {
        if (typeof command !== 'string' || command.trim() === '') {
          this.monitoringResults.scripts.errors.push({
            type: 'invalid_script',
            script: name,
            message: `Script '${name}' has invalid command`,
            severity: 'low'
          });
        }
      });
      
      this.monitoringResults.scripts.validated = Object.keys(scripts).length - this.monitoringResults.scripts.errors.length;
      console.log(`🔧 Validated ${this.monitoringResults.scripts.validated}/${this.monitoringResults.scripts.total} scripts`);
      
    } catch (error) {
      console.error('❌ Script validation failed:', error.message);
      this.monitoringResults.scripts.errors.push({
        type: 'validation_error',
        message: error.message,
        severity: 'high'
      });
    }
  }

  generateHealthScore() {
    let score = 100;
    
    // Deduct points for issues
    this.monitoringResults.health.issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    // Deduct points for script errors
    this.monitoringResults.scripts.errors.forEach(error => {
      switch (error.severity) {
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });
    
    this.monitoringResults.health.score = Math.max(0, score);
    
    // Generate recommendations
    if (this.monitoringResults.health.score < 70) {
      this.monitoringResults.health.recommendations.push({
        priority: 'high',
        message: 'Package health is below optimal. Review and fix critical issues.',
        actions: ['Fix missing critical dependencies', 'Resolve version conflicts', 'Update package scripts']
      });
    }
    
    if (this.monitoringResults.dependencies.total > 100) {
      this.monitoringResults.health.recommendations.push({
        priority: 'medium',
        message: 'Large number of dependencies detected. Consider optimization.',
        actions: ['Review unused dependencies', 'Bundle similar packages', 'Implement tree shaking']
      });
    }
  }

  async saveMonitoringResults() {
    try {
      const reportPath = path.join(__dirname, '../package-monitor.json');
      await fs.writeFile(reportPath, JSON.stringify(this.monitoringResults, null, 2));
      console.log(`💾 Package monitoring report saved: ${reportPath}`);
    } catch (error) {
      console.error('❌ Failed to save monitoring results:', error.message);
    }
  }

  displayResults() {
    console.log('\n' + '='.repeat(70));
    console.log('📦 PACKAGE AND DEPENDENCY MONITORING DASHBOARD');
    console.log('='.repeat(70));
    
    console.log(`📊 PACKAGE STATUS: ${this.monitoringResults.packageStatus.toUpperCase()}`);
    
    if (this.monitoringResults.packageData) {
      console.log(`📄 Package: ${this.monitoringResults.packageData.name} v${this.monitoringResults.packageData.version}`);
      console.log(`📦 Dependencies: ${this.monitoringResults.packageData.dependencies}`);
      console.log(`🔧 Dev Dependencies: ${this.monitoringResults.packageData.devDependencies}`);
      console.log(`⚙️  Scripts: ${this.monitoringResults.packageData.scripts}`);
    }
    
    console.log(`\n🏥 HEALTH SCORE: ${this.monitoringResults.health.score}/100`);
    
    if (this.monitoringResults.health.issues.length > 0) {
      console.log(`\n⚠️  ISSUES (${this.monitoringResults.health.issues.length}):`);
      this.monitoringResults.health.issues.forEach(issue => {
        const icon = issue.severity === 'critical' ? '🚨' : issue.severity === 'high' ? '⚠️' : '📝';
        console.log(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`);
      });
    }
    
    if (this.monitoringResults.scripts.errors.length > 0) {
      console.log(`\n🔧 SCRIPT ISSUES (${this.monitoringResults.scripts.errors.length}):`);
      this.monitoringResults.scripts.errors.forEach(error => {
        console.log(`  ❌ ${error.message}`);
      });
    }
    
    if (this.monitoringResults.health.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      this.monitoringResults.health.recommendations.forEach(rec => {
        console.log(`  [${rec.priority.toUpperCase()}] ${rec.message}`);
        if (rec.actions) {
          rec.actions.forEach(action => {
            console.log(`    • ${action}`);
          });
        }
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`⏰ Report generated: ${this.monitoringResults.timestamp}`);
    console.log('='.repeat(70) + '\n');
  }
}

// Main execution
async function main() {
  const monitor = new PackageMonitor();
  await monitor.runMonitoring();
}

// Export for use as module
export { PackageMonitor };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Package monitoring failed:', error.message);
    process.exit(1);
  });
}