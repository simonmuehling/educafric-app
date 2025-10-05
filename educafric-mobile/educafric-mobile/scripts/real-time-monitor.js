#!/usr/bin/env node

// 🔄 EDUCAFRIC REAL-TIME ENDPOINT MONITORING
// Continuous monitoring with alerts and notifications

import EndpointMonitor from './endpoint-monitor.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RealTimeMonitor extends EndpointMonitor {
  constructor(baseUrl, options = {}) {
    super(baseUrl);
    this.interval = options.interval || 60000; // 1 minute default
    this.alertThreshold = options.alertThreshold || 3; // Alert after 3 consecutive failures
    this.consecutiveFailures = new Map();
    this.isRunning = false;
    this.logFile = path.join(__dirname, 'monitoring.log');
  }

  // 📝 Log with timestamp
  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(logEntry.trim());
    fs.appendFileSync(this.logFile, logEntry);
  }

  // 🚨 Enhanced alert system
  checkAlerts(results) {
    const alerts = [];
    
    results.forEach(result => {
      const endpointId = `${result.method}:${result.endpoint}`;
      
      if (!result.success) {
        const currentFailures = this.consecutiveFailures.get(endpointId) || 0;
        this.consecutiveFailures.set(endpointId, currentFailures + 1);
        
        if (currentFailures + 1 >= this.alertThreshold) {
          alerts.push({
            type: 'CRITICAL',
            endpoint: endpointId,
            message: `Endpoint failing for ${currentFailures + 1} consecutive checks`,
            statusCode: result.statusCode,
            error: result.error
          });
        }
      } else {
        // Reset failure count on success
        this.consecutiveFailures.delete(endpointId);
      }
    });

    return alerts;
  }

  // 📧 Send alerts (placeholder for email/SMS integration)
  async sendAlerts(alerts) {
    if (alerts.length === 0) return;

    this.log(`🚨 SENDING ${alerts.length} ALERTS`, 'ALERT');
    
    alerts.forEach(alert => {
      this.log(`${alert.type}: ${alert.endpoint} - ${alert.message}`, 'ALERT');
      
      // Here you would integrate with:
      // - Email service (SendGrid, Mailgun)
      // - SMS service (Vonage, Twilio)
      // - Slack/Discord webhooks
      // - Push notifications
    });
  }

  // 📊 Generate health status
  generateHealthStatus(results) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const healthPercentage = (successful / total) * 100;
    
    return {
      timestamp: new Date().toISOString(),
      total,
      successful,
      failed: total - successful,
      healthPercentage: Math.round(healthPercentage * 100) / 100,
      status: healthPercentage >= 95 ? 'HEALTHY' : 
             healthPercentage >= 80 ? 'DEGRADED' : 'CRITICAL'
    };
  }

  // 💾 Save health metrics
  saveHealthMetrics(health) {
    const metricsFile = path.join(__dirname, 'health-metrics.json');
    let metrics = [];
    
    if (fs.existsSync(metricsFile)) {
      try {
        metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      } catch (error) {
        this.log(`Error reading metrics file: ${error.message}`, 'ERROR');
      }
    }
    
    metrics.push(health);
    
    // Keep only last 100 entries
    if (metrics.length > 100) {
      metrics = metrics.slice(-100);
    }
    
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  }

  // 🔄 Single monitoring cycle
  async runCycle() {
    try {
      this.log('🔍 Starting monitoring cycle...');
      
      const endpoints = this.getEndpoints();
      const promises = endpoints.map(endpoint => this.makeRequest(endpoint));
      const results = await Promise.all(promises);
      
      // Analyze results
      this.analyzeResults(results);
      
      // Check for alerts
      const alerts = this.checkAlerts(results);
      await this.sendAlerts(alerts);
      
      // Generate health status
      const health = this.generateHealthStatus(results);
      this.saveHealthMetrics(health);
      
      // Log summary
      this.log(`✅ Cycle complete - Health: ${health.status} (${health.healthPercentage}%)`);
      this.log(`📊 ${health.successful}/${health.total} endpoints healthy`);
      
      if (alerts.length > 0) {
        this.log(`🚨 ${alerts.length} alerts generated`, 'WARN');
      }
      
      // Reset results for next cycle
      this.results = { success: [], errors: [], warnings: [], notFound: [] };
      
    } catch (error) {
      this.log(`❌ Monitoring cycle failed: ${error.message}`, 'ERROR');
    }
  }

  // 🏃‍♂️ Start continuous monitoring
  async start() {
    if (this.isRunning) {
      this.log('⚠️ Monitor is already running', 'WARN');
      return;
    }
    
    this.isRunning = true;
    this.log(`🚀 Starting real-time monitoring (interval: ${this.interval}ms)`);
    this.log(`📍 Base URL: ${this.baseUrl}`);
    this.log(`🎯 Alert threshold: ${this.alertThreshold} consecutive failures`);
    
    // Initial run
    await this.runCycle();
    
    // Schedule continuous monitoring
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.runCycle();
      }
    }, this.interval);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
    });
    
    process.on('SIGTERM', () => {
      this.stop();
    });
  }

  // 🛑 Stop monitoring
  stop() {
    if (!this.isRunning) return;
    
    this.log('🛑 Stopping real-time monitoring...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.log('✅ Monitoring stopped');
    process.exit(0);
  }

  // 📈 Generate monitoring dashboard data
  generateDashboard() {
    const metricsFile = path.join(__dirname, 'health-metrics.json');
    
    if (!fs.existsSync(metricsFile)) {
      return { error: 'No metrics data available' };
    }
    
    try {
      const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      const latest = metrics[metrics.length - 1];
      
      // Calculate trends
      const last24h = metrics.filter(m => {
        const age = Date.now() - new Date(m.timestamp).getTime();
        return age <= 24 * 60 * 60 * 1000; // 24 hours
      });
      
      const avgHealth = last24h.reduce((sum, m) => sum + m.healthPercentage, 0) / last24h.length;
      
      return {
        current: latest,
        trends: {
          last24h: Math.round(avgHealth * 100) / 100,
          totalChecks: last24h.length,
          incidents: last24h.filter(m => m.status !== 'HEALTHY').length
        },
        history: metrics.slice(-50) // Last 50 entries
      };
    } catch (error) {
      return { error: `Failed to read metrics: ${error.message}` };
    }
  }
}

// 🎯 CLI Usage
if (process.argv[1] === __filename) {
  const baseUrl = process.argv[2] || 'http://localhost:5000';
  const interval = parseInt(process.argv[3]) || 60000;
  
  const monitor = new RealTimeMonitor(baseUrl, { interval });
  
  if (process.argv.includes('--dashboard')) {
    console.log(JSON.stringify(monitor.generateDashboard(), null, 2));
  } else {
    monitor.start();
  }
}

export default RealTimeMonitor;