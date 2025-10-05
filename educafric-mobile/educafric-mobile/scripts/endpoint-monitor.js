#!/usr/bin/env node

// 🚨 EDUCAFRIC ENDPOINT MONITORING & 404 ALERT SYSTEM
// Comprehensive script to detect and alert on endpoint issues across the platform

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EndpointMonitor {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = {
      success: [],
      errors: [],
      warnings: [],
      notFound: []
    };
    this.startTime = Date.now();
  }

  // 🔍 Comprehensive list of all Educafric API endpoints
  getEndpoints() {
    return [
      // Authentication endpoints
      { path: '/api/auth/me', method: 'GET', requiresAuth: true },
      { path: '/api/auth/login', method: 'POST', requiresAuth: false },
      { path: '/api/auth/register', method: 'POST', requiresAuth: false },
      { path: '/api/auth/logout', method: 'POST', requiresAuth: true },
      { path: '/api/auth/forgot-password', method: 'POST', requiresAuth: false },
      { path: '/api/auth/reset-password', method: 'POST', requiresAuth: false },

      // User management endpoints
      { path: '/api/users', method: 'GET', requiresAuth: true },
      { path: '/api/users/profile', method: 'GET', requiresAuth: true },
      { path: '/api/users/profile', method: 'PUT', requiresAuth: true },

      // School management endpoints
      { path: '/api/schools', method: 'GET', requiresAuth: true },
      { path: '/api/schools', method: 'POST', requiresAuth: true },
      { path: '/api/schools/1', method: 'GET', requiresAuth: true },
      { path: '/api/schools/1', method: 'PUT', requiresAuth: true },
      { path: '/api/schools/1', method: 'DELETE', requiresAuth: true },

      // Student management endpoints
      { path: '/api/students', method: 'GET', requiresAuth: true },
      { path: '/api/students', method: 'POST', requiresAuth: true },
      { path: '/api/students/1', method: 'GET', requiresAuth: true },
      { path: '/api/students/1', method: 'PUT', requiresAuth: true },
      { path: '/api/students/1', method: 'DELETE', requiresAuth: true },

      // Teacher management endpoints
      { path: '/api/teachers', method: 'GET', requiresAuth: true },
      { path: '/api/teachers', method: 'POST', requiresAuth: true },
      { path: '/api/teachers/1', method: 'GET', requiresAuth: true },
      { path: '/api/teachers/1', method: 'PUT', requiresAuth: true },
      { path: '/api/teachers/1', method: 'DELETE', requiresAuth: true },

      // Class management endpoints
      { path: '/api/classes', method: 'GET', requiresAuth: true },
      { path: '/api/classes', method: 'POST', requiresAuth: true },
      { path: '/api/classes/1', method: 'GET', requiresAuth: true },
      { path: '/api/classes/1', method: 'PUT', requiresAuth: true },
      { path: '/api/classes/1', method: 'DELETE', requiresAuth: true },

      // Grade management endpoints
      { path: '/api/grades', method: 'GET', requiresAuth: true },
      { path: '/api/grades', method: 'POST', requiresAuth: true },
      { path: '/api/grades/1', method: 'GET', requiresAuth: true },
      { path: '/api/grades/1', method: 'PUT', requiresAuth: true },
      { path: '/api/grades/1', method: 'DELETE', requiresAuth: true },

      // Attendance endpoints
      { path: '/api/attendance', method: 'GET', requiresAuth: true },
      { path: '/api/attendance', method: 'POST', requiresAuth: true },
      { path: '/api/attendance/1', method: 'GET', requiresAuth: true },
      { path: '/api/attendance/1', method: 'PUT', requiresAuth: true },

      // Homework endpoints
      { path: '/api/homework', method: 'GET', requiresAuth: true },
      { path: '/api/homework', method: 'POST', requiresAuth: true },
      { path: '/api/homework/1', method: 'GET', requiresAuth: true },
      { path: '/api/homework/1', method: 'PUT', requiresAuth: true },
      { path: '/api/homework/1', method: 'DELETE', requiresAuth: true },

      // Payment endpoints (Stripe integration)
      { path: '/api/create-payment-intent', method: 'POST', requiresAuth: true },
      { path: '/api/get-or-create-subscription', method: 'POST', requiresAuth: true },
      { path: '/api/payments', method: 'GET', requiresAuth: true },
      { path: '/api/payments/history', method: 'GET', requiresAuth: true },

      // Communication endpoints (SMS/WhatsApp)
      { path: '/api/notifications/send', method: 'POST', requiresAuth: true },
      { path: '/api/notifications/settings', method: 'GET', requiresAuth: true },
      { path: '/api/notifications/settings', method: 'PUT', requiresAuth: true },

      // Report generation endpoints
      { path: '/api/reports/students', method: 'GET', requiresAuth: true },
      { path: '/api/reports/teachers', method: 'GET', requiresAuth: true },
      { path: '/api/reports/attendance', method: 'GET', requiresAuth: true },
      { path: '/api/reports/grades', method: 'GET', requiresAuth: true },

      // File upload endpoints
      { path: '/api/upload/avatar', method: 'POST', requiresAuth: true },
      { path: '/api/upload/documents', method: 'POST', requiresAuth: true },

      // Dashboard analytics endpoints
      { path: '/api/dashboard/stats', method: 'GET', requiresAuth: true },
      { path: '/api/dashboard/recent-activity', method: 'GET', requiresAuth: true },

      // Administrative endpoints
      { path: '/api/admin/users', method: 'GET', requiresAuth: true },
      { path: '/api/admin/schools', method: 'GET', requiresAuth: true },
      { path: '/api/admin/system-stats', method: 'GET', requiresAuth: true },

      // Health check endpoints
      { path: '/api/health', method: 'GET', requiresAuth: false },
      { path: '/api/version', method: 'GET', requiresAuth: false }
    ];
  }

  // 🌐 Make HTTP request with comprehensive error handling
  async makeRequest(endpoint) {
    return new Promise((resolve) => {
      const url = `${this.baseUrl}${endpoint.path}`;
      const isHttps = url.startsWith('https');
      const requestModule = isHttps ? https : http;

      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Educafric-Endpoint-Monitor/1.0'
        }
      };

      // Add mock authentication for protected endpoints
      if (endpoint.requiresAuth) {
        options.headers['Authorization'] = 'Bearer mock-token-for-testing';
      }

      const startTime = Date.now();
      const req = requestModule.request(url, options, (res) => {
        const responseTime = Date.now() - startTime;
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            endpoint: endpoint.path,
            method: endpoint.method,
            statusCode: res.statusCode,
            responseTime,
            requiresAuth: endpoint.requiresAuth,
            headers: res.headers,
            body: data,
            success: res.statusCode < 400
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          endpoint: endpoint.path,
          method: endpoint.method,
          statusCode: 0,
          responseTime: Date.now() - startTime,
          requiresAuth: endpoint.requiresAuth,
          error: error.message,
          success: false
        });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        resolve({
          endpoint: endpoint.path,
          method: endpoint.method,
          statusCode: 0,
          responseTime: 10000,
          requiresAuth: endpoint.requiresAuth,
          error: 'Request timeout',
          success: false
        });
      });

      // Send mock data for POST/PUT requests
      if (['POST', 'PUT'].includes(endpoint.method)) {
        const mockData = this.getMockData(endpoint.path);
        req.write(JSON.stringify(mockData));
      }

      req.end();
    });
  }

  // 📝 Generate appropriate mock data for different endpoints
  getMockData(path) {
    if (path.includes('auth/login')) {
      return { email: 'test@example.com', password: 'testpassword' };
    }
    if (path.includes('auth/register')) {
      return { 
        email: 'test@example.com', 
        password: 'testpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      };
    }
    if (path.includes('students')) {
      return { 
        firstName: 'Jean',
        lastName: 'Dupond',
        email: 'jean.dupond@example.com',
        classId: 1
      };
    }
    if (path.includes('teachers')) {
      return { 
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@example.com',
        subject: 'Mathematics'
      };
    }
    return { test: true };
  }

  // 🚨 Categorize and analyze results
  analyzeResults(results) {
    results.forEach(result => {
      if (result.statusCode === 404) {
        this.results.notFound.push(result);
      } else if (result.statusCode >= 500) {
        this.results.errors.push(result);
      } else if (result.statusCode >= 400) {
        this.results.warnings.push(result);
      } else if (result.success) {
        this.results.success.push(result);
      } else {
        this.results.errors.push(result);
      }
    });
  }

  // 📊 Generate comprehensive report
  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const total = this.results.success.length + this.results.errors.length + 
                  this.results.warnings.length + this.results.notFound.length;

    let report = `
🌍 EDUCAFRIC ENDPOINT MONITORING REPORT
=====================================
Generated: ${new Date().toLocaleString()}
Total Time: ${totalTime}ms
Total Endpoints Tested: ${total}

📊 SUMMARY:
✅ Successful: ${this.results.success.length}
⚠️  Warnings (4xx): ${this.results.warnings.length}
❌ Errors (5xx): ${this.results.errors.length}
🔍 Not Found (404): ${this.results.notFound.length}
`;

    // 🚨 404 ALERTS - High Priority
    if (this.results.notFound.length > 0) {
      report += `\n🚨 404 NOT FOUND ALERTS (HIGH PRIORITY):
${'='.repeat(50)}\n`;
      this.results.notFound.forEach(result => {
        report += `❌ ${result.method} ${result.endpoint}
   Status: ${result.statusCode}
   Response Time: ${result.responseTime}ms
   Requires Auth: ${result.requiresAuth}
   Error: ${result.error || 'Endpoint not found'}
   
`;
      });
    }

    // 💥 SERVER ERRORS - Critical Priority
    if (this.results.errors.length > 0) {
      report += `\n💥 SERVER ERRORS (CRITICAL PRIORITY):
${'='.repeat(50)}\n`;
      this.results.errors.forEach(result => {
        report += `❌ ${result.method} ${result.endpoint}
   Status: ${result.statusCode}
   Response Time: ${result.responseTime}ms
   Requires Auth: ${result.requiresAuth}
   Error: ${result.error || 'Server error'}
   
`;
      });
    }

    // ⚠️ CLIENT ERRORS - Medium Priority
    if (this.results.warnings.length > 0) {
      report += `\n⚠️ CLIENT ERRORS (MEDIUM PRIORITY):
${'='.repeat(50)}\n`;
      this.results.warnings.forEach(result => {
        report += `⚠️ ${result.method} ${result.endpoint}
   Status: ${result.statusCode}
   Response Time: ${result.responseTime}ms
   Requires Auth: ${result.requiresAuth}
   Body: ${result.body.substring(0, 200)}${result.body.length > 200 ? '...' : ''}
   
`;
      });
    }

    // ✅ SUCCESSFUL ENDPOINTS
    if (this.results.success.length > 0) {
      report += `\n✅ SUCCESSFUL ENDPOINTS:
${'='.repeat(30)}\n`;
      this.results.success.forEach(result => {
        report += `✅ ${result.method} ${result.endpoint} (${result.statusCode}) - ${result.responseTime}ms\n`;
      });
    }

    // 📈 PERFORMANCE ANALYSIS
    const avgResponseTime = this.results.success.reduce((sum, r) => sum + r.responseTime, 0) / 
                           Math.max(this.results.success.length, 1);
    
    report += `\n📈 PERFORMANCE ANALYSIS:
${'='.repeat(30)}
Average Response Time: ${Math.round(avgResponseTime)}ms
Slowest Endpoint: ${this.getSlowestEndpoint()}
Fastest Endpoint: ${this.getFastestEndpoint()}
`;

    // 🔧 RECOMMENDATIONS
    report += `\n🔧 RECOMMENDATIONS:
${'='.repeat(20)}`;

    if (this.results.notFound.length > 0) {
      report += `\n• Fix ${this.results.notFound.length} missing endpoints (404 errors)`;
    }
    if (this.results.errors.length > 0) {
      report += `\n• Investigate ${this.results.errors.length} server errors (5xx)`;
    }
    if (avgResponseTime > 1000) {
      report += `\n• Optimize response times (average: ${Math.round(avgResponseTime)}ms)`;
    }
    if (this.results.warnings.length > 5) {
      report += `\n• Review authentication and validation logic`;
    }

    return report;
  }

  getSlowestEndpoint() {
    const allResults = [...this.results.success, ...this.results.errors, ...this.results.warnings, ...this.results.notFound];
    const slowest = allResults.reduce((max, r) => r.responseTime > max.responseTime ? r : max, { responseTime: 0 });
    return slowest.responseTime > 0 ? `${slowest.method} ${slowest.endpoint} (${slowest.responseTime}ms)` : 'N/A';
  }

  getFastestEndpoint() {
    const allResults = [...this.results.success, ...this.results.errors, ...this.results.warnings, ...this.results.notFound];
    const fastest = allResults.reduce((min, r) => r.responseTime < min.responseTime ? r : min, { responseTime: Infinity });
    return fastest.responseTime < Infinity ? `${fastest.method} ${fastest.endpoint} (${fastest.responseTime}ms)` : 'N/A';
  }

  // 💾 Save report to file
  saveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `endpoint-monitoring-report-${timestamp}.txt`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, report);
    console.log(`📄 Report saved to: ${filepath}`);
    return filepath;
  }

  // 🏃‍♂️ Run comprehensive monitoring
  async run() {
    console.log('🚀 Starting Educafric Endpoint Monitoring...');
    console.log(`📍 Base URL: ${this.baseUrl}`);
    
    const endpoints = this.getEndpoints();
    console.log(`🔍 Testing ${endpoints.length} endpoints...`);

    const promises = endpoints.map(endpoint => this.makeRequest(endpoint));
    const results = await Promise.all(promises);
    
    this.analyzeResults(results);
    const report = this.generateReport();
    
    console.log(report);
    this.saveReport(report);

    // 🚨 Alert if critical issues found
    if (this.results.notFound.length > 0 || this.results.errors.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES DETECTED!');
      console.log(`❌ ${this.results.notFound.length} endpoints returning 404`);
      console.log(`💥 ${this.results.errors.length} endpoints with server errors`);
      process.exit(1);
    }

    console.log('\n✅ Monitoring completed successfully!');
    return this.results;
  }
}

// 🎯 CLI Usage
if (process.argv[1] === __filename) {
  const baseUrl = process.argv[2] || 'http://localhost:5000';
  const monitor = new EndpointMonitor(baseUrl);
  
  monitor.run().catch(error => {
    console.error('❌ Monitoring failed:', error);
    process.exit(1);
  });
}

export default EndpointMonitor;