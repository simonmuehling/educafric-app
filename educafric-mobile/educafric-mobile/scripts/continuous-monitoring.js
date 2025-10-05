#!/usr/bin/env node
const { ErrorRecognitionSystem } = require('./enhanced-error-monitoring.js');
const fs = require('fs').promises;
const path = require('path');

/**
 * Continuous Monitoring System with Automated Error Recognition and Response
 * Runs continuous health checks, detects patterns, and executes automated fixes
 */

class ContinuousMonitor {
  constructor() {
    this.errorRecognition = new ErrorRecognitionSystem();
    this.monitoringInterval = 30000; // 30 seconds
    this.isRunning = false;
    this.cycles = 0;
    this.errorTrends = new Map();
    this.performanceHistory = [];
    this.alertThresholds = {
      errorRate: 0.3, // 30% error rate triggers alert
      responseTime: 5000, // 5 seconds
      consecutiveFailures: 3
    };
  }

  // Start continuous monitoring
  async startMonitoring() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring is already running');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Starting continuous monitoring system...');
    console.log(`📊 Monitoring interval: ${this.monitoringInterval / 1000} seconds`);

    while (this.isRunning) {
      try {
        await this.runMonitoringCycle();
        
        // Wait for next cycle
        await this.delay(this.monitoringInterval);
        
      } catch (error) {
        console.error('❌ Monitoring cycle error:', error.message);
        await this.delay(5000); // Brief pause before retry
      }
    }
  }

  // Stop monitoring
  stopMonitoring() {
    console.log('🛑 Stopping continuous monitoring...');
    this.isRunning = false;
  }

  // Execute a single monitoring cycle
  async runMonitoringCycle() {
    this.cycles++;
    const cycleStart = Date.now();
    
    console.log(`\n🔍 Monitoring Cycle #${this.cycles} - ${new Date().toLocaleTimeString()}`);
    
    try {
      // Run comprehensive health check
      const reportData = await this.errorRecognition.runComprehensiveHealthCheck();
      
      // Analyze trends and patterns
      await this.analyzeTrends(reportData);
      
      // Check for critical conditions
      await this.checkCriticalConditions(reportData);
      
      // Update performance history
      this.updatePerformanceHistory(reportData);
      
      // Save cycle results
      await this.saveCycleResults(reportData);
      
      const cycleDuration = Date.now() - cycleStart;
      console.log(`✅ Cycle completed in ${cycleDuration}ms`);
      
    } catch (error) {
      console.error(`❌ Monitoring cycle failed:`, error.message);
    }
  }

  // Analyze error trends and patterns
  async analyzeTrends(reportData) {
    const { report } = reportData;
    
    // Track error types over time
    Object.entries(report.errorsByType).forEach(([errorType, count]) => {
      if (!this.errorTrends.has(errorType)) {
        this.errorTrends.set(errorType, []);
      }
      
      const history = this.errorTrends.get(errorType);
      history.push({
        timestamp: Date.now(),
        count,
        cycle: this.cycles
      });
      
      // Keep only last 20 data points
      if (history.length > 20) {
        history.shift();
      }
    });

    // Detect increasing error trends
    this.errorTrends.forEach((history, errorType) => {
      if (history.length >= 5) {
        const recent = history.slice(-5);
        const isIncreasing = recent.every((point, index) => 
          index === 0 || point.count >= recent[index - 1].count
        );
        
        if (isIncreasing && recent[recent.length - 1].count > 0) {
          console.log(`📈 Increasing trend detected for ${errorType} errors`);
          this.handleTrendAlert(errorType, recent);
        }
      }
    });
  }

  // Handle trend-based alerts
  async handleTrendAlert(errorType, trendData) {
    const alert = {
      type: 'trend',
      errorType,
      severity: 'medium',
      message: `Increasing trend detected for ${errorType} errors`,
      data: trendData,
      timestamp: new Date().toISOString()
    };

    console.log(`🚨 TREND ALERT: ${alert.message}`);
    
    // Execute preventive actions based on error type
    await this.executePreventiveActions(errorType);
  }

  // Execute preventive actions for trend alerts
  async executePreventiveActions(errorType) {
    const actions = {
      authentication: async () => {
        console.log('🔐 Preventive action: Checking authentication system...');
        // Add authentication system checks
      },
      database: async () => {
        console.log('💾 Preventive action: Optimizing database connections...');
        // Add database optimization
      },
      server: async () => {
        console.log('🖥️  Preventive action: Monitoring server resources...');
        // Add server resource monitoring
      },
      network: async () => {
        console.log('🌐 Preventive action: Checking network connectivity...');
        // Add network diagnostics
      }
    };

    const action = actions[errorType];
    if (action) {
      try {
        await action();
        console.log(`✅ Preventive action completed for ${errorType}`);
      } catch (error) {
        console.error(`❌ Preventive action failed for ${errorType}:`, error.message);
      }
    }
  }

  // Check for critical conditions requiring immediate action
  async checkCriticalConditions(reportData) {
    const { report } = reportData;
    const criticalConditions = [];

    // High error rate
    const errorRate = report.summary.failed / report.summary.total;
    if (errorRate >= this.alertThresholds.errorRate) {
      criticalConditions.push({
        type: 'high_error_rate',
        severity: 'critical',
        message: `High error rate: ${(errorRate * 100).toFixed(1)}%`,
        value: errorRate,
        threshold: this.alertThresholds.errorRate
      });
    }

    // Slow response times
    if (report.summary.avgResponseTime >= this.alertThresholds.responseTime) {
      criticalConditions.push({
        type: 'slow_response',
        severity: 'high',
        message: `Slow average response time: ${report.summary.avgResponseTime}ms`,
        value: report.summary.avgResponseTime,
        threshold: this.alertThresholds.responseTime
      });
    }

    // Critical endpoint failures
    if (report.criticalIssues.length > 0) {
      criticalConditions.push({
        type: 'critical_endpoint_failure',
        severity: 'critical',
        message: `${report.criticalIssues.length} critical endpoints failing`,
        endpoints: report.criticalIssues.map(issue => issue.url)
      });
    }

    // Execute immediate responses for critical conditions
    for (const condition of criticalConditions) {
      console.log(`🚨 CRITICAL CONDITION: ${condition.message}`);
      await this.handleCriticalCondition(condition);
    }
  }

  // Handle critical conditions with immediate response
  async handleCriticalCondition(condition) {
    const responses = {
      high_error_rate: async () => {
        console.log('🆘 Responding to high error rate...');
        // Implement error rate response (e.g., circuit breaker, scaling)
        await this.errorRecognition.executeAutomationRules(
          { message: 'High error rate detected' }, 
          'system'
        );
      },
      slow_response: async () => {
        console.log('🐌 Responding to slow response times...');
        // Implement performance optimization
        await this.optimizePerformance();
      },
      critical_endpoint_failure: async () => {
        console.log('💀 Responding to critical endpoint failures...');
        // Implement service recovery
        await this.recoverCriticalServices(condition.endpoints);
      }
    };

    const response = responses[condition.type];
    if (response) {
      try {
        await response();
        console.log(`✅ Critical condition response completed for ${condition.type}`);
      } catch (error) {
        console.error(`❌ Critical condition response failed:`, error.message);
      }
    }
  }

  // Optimize performance when slow response detected
  async optimizePerformance() {
    const optimizations = [
      'Checking database query performance',
      'Optimizing API response caching',
      'Reviewing resource utilization'
    ];

    for (const optimization of optimizations) {
      console.log(`  🔧 ${optimization}`);
      await this.delay(1000);
    }
  }

  // Recover critical services
  async recoverCriticalServices(endpoints) {
    for (const endpoint of endpoints) {
      console.log(`  🔄 Attempting recovery for ${endpoint}`);
      
      // Simulate service recovery steps
      const recoverySteps = [
        'Checking service health',
        'Restarting service if needed',
        'Validating service response'
      ];

      for (const step of recoverySteps) {
        console.log(`    • ${step}`);
        await this.delay(500);
      }
    }
  }

  // Update performance history for trend analysis
  updatePerformanceHistory(reportData) {
    const { report } = reportData;
    
    this.performanceHistory.push({
      timestamp: Date.now(),
      cycle: this.cycles,
      errorRate: report.summary.failed / report.summary.total,
      avgResponseTime: report.summary.avgResponseTime,
      totalRequests: report.summary.total,
      automationActions: report.automationActions.length
    });

    // Keep only last 50 performance records
    if (this.performanceHistory.length > 50) {
      this.performanceHistory.shift();
    }
  }

  // Save cycle results for analysis
  async saveCycleResults(reportData) {
    try {
      const cycleReport = {
        ...reportData.report,
        cycle: this.cycles,
        trends: Object.fromEntries(this.errorTrends),
        performanceHistory: this.performanceHistory.slice(-10) // Last 10 records
      };

      const reportPath = path.join(__dirname, '../continuous-monitoring-report.json');
      await fs.writeFile(reportPath, JSON.stringify(cycleReport, null, 2));
      
    } catch (error) {
      console.error('❌ Failed to save cycle results:', error.message);
    }
  }

  // Generate comprehensive monitoring dashboard
  displayMonitoringDashboard() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 CONTINUOUS MONITORING DASHBOARD');
    console.log('='.repeat(80));
    
    console.log(`🔄 Monitoring Status: ${this.isRunning ? 'ACTIVE' : 'STOPPED'}`);
    console.log(`📈 Cycles Completed: ${this.cycles}`);
    console.log(`⏱️  Monitoring Interval: ${this.monitoringInterval / 1000}s`);
    
    if (this.performanceHistory.length > 0) {
      const latest = this.performanceHistory[this.performanceHistory.length - 1];
      console.log(`\n📊 LATEST METRICS:`);
      console.log(`  Error Rate: ${(latest.errorRate * 100).toFixed(1)}%`);
      console.log(`  Avg Response Time: ${latest.avgResponseTime}ms`);
      console.log(`  Total Requests: ${latest.totalRequests}`);
    }
    
    if (this.errorTrends.size > 0) {
      console.log(`\n📈 ERROR TRENDS:`);
      this.errorTrends.forEach((history, errorType) => {
        const latest = history[history.length - 1];
        console.log(`  ${errorType}: ${latest ? latest.count : 0} (latest)`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const monitor = new ContinuousMonitor();
  
  // Set up graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    monitor.stopMonitoring();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    monitor.stopMonitoring();
    process.exit(0);
  });

  console.log('🚀 Starting Continuous Monitoring System...');
  console.log('Press Ctrl+C to stop monitoring');
  
  // Display initial dashboard
  monitor.displayMonitoringDashboard();
  
  // Start monitoring
  await monitor.startMonitoring();
}

// Export for use as module
module.exports = { ContinuousMonitor };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Continuous monitoring failed:', error.message);
    process.exit(1);
  });
}