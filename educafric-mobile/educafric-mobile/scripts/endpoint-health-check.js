#!/usr/bin/env node

/**
 * Comprehensive Endpoint Health Check Script for Educafric Platform
 * Tests all API endpoints for 404 errors, response times, and proper authentication
 */

import https from 'https';
import http from 'http';
import fs from 'fs/promises';

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  retries: 3,
  outputFile: 'endpoint-health-report.json'
};

// Test users for authentication testing
const TEST_USERS = {
  admin: { email: 'admin@test.educafric.com', password: 'admin123', role: 'Admin' },
  teacher: { email: 'teacher@test.educafric.com', password: 'teacher123', role: 'Teacher' },
  parent: { email: 'parent@test.educafric.com', password: 'parent123', role: 'Parent' },
  student: { email: 'student@test.educafric.com', password: 'student123', role: 'Student' }
};

// Comprehensive endpoint registry
const ENDPOINTS = {
  // Authentication & User Management
  auth: [
    { method: 'POST', path: '/api/register', requiresAuth: false, testData: { email: 'test@example.com', password: 'test123', role: 'Student', firstName: 'Test', lastName: 'User' } },
    { method: 'POST', path: '/api/login', requiresAuth: false, testData: { email: 'test@example.com', password: 'test123' } },
    { method: 'POST', path: '/api/logout', requiresAuth: true },
    { method: 'GET', path: '/api/profile', requiresAuth: true },
    { method: 'PATCH', path: '/api/profile', requiresAuth: true, testData: { firstName: 'Updated' } },
    { method: 'POST', path: '/api/forgot-password', requiresAuth: false, testData: { email: 'test@example.com' } },
    { method: 'POST', path: '/api/reset-password', requiresAuth: false, testData: { token: 'test-token', password: 'newpass123' } },
    { method: 'POST', path: '/api/change-password', requiresAuth: true, testData: { currentPassword: 'old123', newPassword: 'new123' } }
  ],

  // User Management (Admin/Teachers only)
  users: [
    { method: 'GET', path: '/api/users', requiresAuth: true, roles: ['Admin', 'Teacher'] },
    { method: 'POST', path: '/api/users', requiresAuth: true, roles: ['Admin'], testData: { email: 'newuser@example.com', role: 'Student', firstName: 'New', lastName: 'User' } },
    { method: 'GET', path: '/api/users/1', requiresAuth: true, roles: ['Admin', 'Teacher'] },
    { method: 'PATCH', path: '/api/users/1', requiresAuth: true, roles: ['Admin'], testData: { firstName: 'Updated' } },
    { method: 'DELETE', path: '/api/users/1', requiresAuth: true, roles: ['Admin'] }
  ],

  // School Management
  schools: [
    { method: 'GET', path: '/api/schools', requiresAuth: true },
    { method: 'POST', path: '/api/schools', requiresAuth: true, roles: ['Admin'], testData: { name: 'Test School', address: 'Test Address', city: 'Yaoundé' } },
    { method: 'GET', path: '/api/schools/1', requiresAuth: true },
    { method: 'PATCH', path: '/api/schools/1', requiresAuth: true, roles: ['Admin'], testData: { name: 'Updated School' } }
  ],

  // Class Management
  classes: [
    { method: 'GET', path: '/api/classes', requiresAuth: true },
    { method: 'POST', path: '/api/classes', requiresAuth: true, roles: ['Admin', 'Teacher'], testData: { name: 'Test Class', level: 'Primary', schoolId: 1 } },
    { method: 'GET', path: '/api/classes/1', requiresAuth: true },
    { method: 'PATCH', path: '/api/classes/1', requiresAuth: true, roles: ['Admin', 'Teacher'], testData: { name: 'Updated Class' } }
  ],

  // Student Management
  students: [
    { method: 'GET', path: '/api/students', requiresAuth: true },
    { method: 'POST', path: '/api/students', requiresAuth: true, roles: ['Admin', 'Teacher'], testData: { firstName: 'Test', lastName: 'Student', classId: 1 } },
    { method: 'GET', path: '/api/students/1', requiresAuth: true },
    { method: 'PATCH', path: '/api/students/1', requiresAuth: true, roles: ['Admin', 'Teacher'], testData: { firstName: 'Updated' } }
  ],

  // Grade Management
  grades: [
    { method: 'GET', path: '/api/grades', requiresAuth: true, params: { studentId: 1 } },
    { method: 'POST', path: '/api/grades', requiresAuth: true, roles: ['Teacher', 'Admin'], testData: { studentId: 1, subject: 'Math', score: 85, term: 'Term 1' } },
    { method: 'GET', path: '/api/grades/1', requiresAuth: true },
    { method: 'PATCH', path: '/api/grades/1', requiresAuth: true, roles: ['Teacher', 'Admin'], testData: { score: 90 } }
  ],

  // Attendance Management
  attendance: [
    { method: 'GET', path: '/api/attendance', requiresAuth: true, params: { studentId: 1 } },
    { method: 'POST', path: '/api/attendance', requiresAuth: true, roles: ['Teacher', 'Admin'], testData: { studentId: 1, date: new Date().toISOString().split('T')[0], status: 'present' } },
    { method: 'GET', path: '/api/attendance/1', requiresAuth: true },
    { method: 'PATCH', path: '/api/attendance/1', requiresAuth: true, roles: ['Teacher', 'Admin'], testData: { status: 'absent' } }
  ],

  // Homework Management
  homework: [
    { method: 'GET', path: '/api/homework', requiresAuth: true, params: { classId: 1 } },
    { method: 'POST', path: '/api/homework', requiresAuth: true, roles: ['Teacher', 'Admin'], testData: { title: 'Test Homework', description: 'Test Description', classId: 1, dueDate: new Date().toISOString() } },
    { method: 'GET', path: '/api/homework/1', requiresAuth: true },
    { method: 'PATCH', path: '/api/homework/1', requiresAuth: true, roles: ['Teacher', 'Admin'], testData: { title: 'Updated Homework' } }
  ],

  // Device Tracking System
  tracking: [
    { method: 'POST', path: '/api/tracking/devices', requiresAuth: true, testData: { studentId: 1, deviceType: 'tablet', deviceName: 'Test Tablet' } },
    { method: 'GET', path: '/api/tracking/devices/test-device-id', requiresAuth: true },
    { method: 'GET', path: '/api/tracking/students/1/devices', requiresAuth: true },
    { method: 'GET', path: '/api/tracking/parents/1/devices', requiresAuth: true, roles: ['Parent'] },
    { method: 'POST', path: '/api/tracking/devices/test-device-id/location', requiresAuth: true, testData: { latitude: 3.8480, longitude: 11.5021, accuracy: 10 } },
    { method: 'PATCH', path: '/api/tracking/devices/test-device-id/settings', requiresAuth: true, testData: { locationFrequency: 5 } },
    { method: 'POST', path: '/api/tracking/devices/test-device-id/safe-zones', requiresAuth: true, testData: { name: 'School', latitude: 3.8480, longitude: 11.5021, radius: 100, type: 'school' } },
    { method: 'POST', path: '/api/tracking/alerts', requiresAuth: true, testData: { deviceId: 'test-device-id', type: 'entry', message: 'Test alert', severity: 'low' } },
    { method: 'GET', path: '/api/tracking/devices/test-device-id/alerts', requiresAuth: true },
    { method: 'GET', path: '/api/tracking/devices/test-device-id/zone-status/test-zone-id', requiresAuth: true },
    { method: 'POST', path: '/api/tracking/devices/test-device-id/zone-status/test-zone-id', requiresAuth: true, testData: { isInZone: true } },
    { method: 'GET', path: '/api/tracking/devices/test-device-id/last-location', requiresAuth: true },
    { method: 'POST', path: '/api/tracking/emergency-alert', requiresAuth: true, testData: { deviceId: 'test-device-id', contactId: 'test-contact-id', message: 'Emergency test' } }
  ],

  // Payment & Subscription
  payments: [
    { method: 'POST', path: '/api/create-payment-intent', requiresAuth: true, testData: { amount: 1000 } },
    { method: 'POST', path: '/api/get-or-create-subscription', requiresAuth: true }
  ],

  // Activity Logs
  activity: [
    { method: 'GET', path: '/api/activity', requiresAuth: true },
    { method: 'POST', path: '/api/activity', requiresAuth: true, testData: { action: 'test_action', description: 'Test activity' } }
  ]
};

class EndpointHealthChecker {
  constructor() {
    this.results = {
      summary: {
        totalEndpoints: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        startTime: new Date().toISOString(),
        endTime: null
      },
      categories: {},
      sessions: {},
      errors: []
    };
  }

  async makeRequest(method, url, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Educafric-Health-Checker/1.0',
          ...headers
        },
        timeout: CONFIG.timeout
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : {};
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: jsonBody,
              rawBody: body
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body,
              rawBody: body
            });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PATCH')) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async login(userType) {
    const user = TEST_USERS[userType];
    if (!user) throw new Error(`Unknown user type: ${userType}`);

    try {
      const response = await this.makeRequest('POST', `${CONFIG.baseUrl}/api/login`, {
        email: user.email,
        password: user.password
      });

      if (response.statusCode === 200 && response.body.success) {
        // Extract session cookie
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          const sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid='));
          if (sessionCookie) {
            this.results.sessions[userType] = sessionCookie.split(';')[0];
            return this.results.sessions[userType];
          }
        }
      }
      throw new Error(`Login failed for ${userType}: ${response.body.message || 'Unknown error'}`);
    } catch (error) {
      throw new Error(`Login failed for ${userType}: ${error.message}`);
    }
  }

  async testEndpoint(category, endpoint) {
    const startTime = Date.now();
    const result = {
      category,
      method: endpoint.method,
      path: endpoint.path,
      requiresAuth: endpoint.requiresAuth,
      roles: endpoint.roles || [],
      status: 'unknown',
      statusCode: null,
      responseTime: 0,
      error: null,
      warnings: []
    };

    try {
      // Build URL with query parameters
      let url = `${CONFIG.baseUrl}${endpoint.path}`;
      if (endpoint.params) {
        const params = new URLSearchParams(endpoint.params);
        url += '?' + params.toString();
      }

      let headers = {};
      
      // Add authentication if required
      if (endpoint.requiresAuth) {
        const userType = endpoint.roles && endpoint.roles.length > 0 ? endpoint.roles[0].toLowerCase() : 'admin';
        const sessionCookie = this.results.sessions[userType];
        
        if (!sessionCookie) {
          try {
            await this.login(userType);
            headers.Cookie = this.results.sessions[userType];
          } catch (loginError) {
            result.status = 'failed';
            result.error = `Authentication failed: ${loginError.message}`;
            return result;
          }
        } else {
          headers.Cookie = sessionCookie;
        }
      }

      // Make the request
      const response = await this.makeRequest(endpoint.method, url, endpoint.testData, headers);
      result.statusCode = response.statusCode;
      result.responseTime = Date.now() - startTime;

      // Evaluate response
      if (response.statusCode === 404) {
        result.status = 'failed';
        result.error = 'Endpoint not found (404)';
      } else if (response.statusCode >= 500) {
        result.status = 'failed';
        result.error = `Server error (${response.statusCode}): ${response.body.message || 'Unknown server error'}`;
      } else if (response.statusCode === 401 && endpoint.requiresAuth) {
        result.status = 'failed';
        result.error = 'Authentication required but failed';
      } else if (response.statusCode === 403) {
        result.status = 'failed';
        result.error = 'Forbidden - insufficient permissions';
      } else if (response.statusCode >= 400) {
        result.status = 'warning';
        result.warnings.push(`Client error (${response.statusCode}): ${response.body.message || 'Unknown client error'}`);
      } else if (response.statusCode >= 200 && response.statusCode < 300) {
        result.status = 'passed';
      } else {
        result.status = 'warning';
        result.warnings.push(`Unexpected status code: ${response.statusCode}`);
      }

      // Check response time
      if (result.responseTime > 5000) {
        result.warnings.push(`Slow response time: ${result.responseTime}ms`);
      }

    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
      result.responseTime = Date.now() - startTime;
    }

    return result;
  }

  async runHealthCheck() {
    console.log('🏥 Starting Educafric Endpoint Health Check...');
    console.log(`📊 Testing ${this.getTotalEndpointCount()} endpoints across ${Object.keys(ENDPOINTS).length} categories\n`);

    // Initialize sessions for authentication
    console.log('🔐 Setting up authentication sessions...');
    for (const userType of Object.keys(TEST_USERS)) {
      try {
        await this.login(userType);
        console.log(`✅ ${userType} session established`);
      } catch (error) {
        console.log(`❌ ${userType} session failed: ${error.message}`);
        this.results.errors.push(`Failed to establish ${userType} session: ${error.message}`);
      }
    }
    console.log('');

    // Test all endpoints
    for (const [category, endpoints] of Object.entries(ENDPOINTS)) {
      console.log(`📁 Testing ${category} endpoints...`);
      this.results.categories[category] = {
        total: endpoints.length,
        passed: 0,
        failed: 0,
        warnings: 0,
        endpoints: []
      };

      for (const endpoint of endpoints) {
        const result = await this.testEndpoint(category, endpoint);
        this.results.categories[category].endpoints.push(result);

        // Update counters
        this.results.summary.totalEndpoints++;
        this.results.categories[category][result.status]++;
        this.results.summary[result.status]++;

        // Print result
        const statusIcon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        const authInfo = result.requiresAuth ? ` (🔒${result.roles.length > 0 ? result.roles.join(',') : 'any'})` : '';
        console.log(`  ${statusIcon} ${result.method} ${result.path}${authInfo} - ${result.responseTime}ms`);
        
        if (result.error) {
          console.log(`    ❌ ${result.error}`);
        }
        
        if (result.warnings.length > 0) {
          result.warnings.forEach(warning => console.log(`    ⚠️ ${warning}`));
        }
      }
      console.log('');
    }

    this.results.summary.endTime = new Date().toISOString();
    this.printSummary();
    await this.saveReport();
  }

  getTotalEndpointCount() {
    return Object.values(ENDPOINTS).reduce((total, endpoints) => total + endpoints.length, 0);
  }

  printSummary() {
    console.log('📋 HEALTH CHECK SUMMARY');
    console.log('========================');
    console.log(`Total Endpoints: ${this.results.summary.totalEndpoints}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`⚠️ Warnings: ${this.results.summary.warnings}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`📊 Success Rate: ${((this.results.summary.passed / this.results.summary.totalEndpoints) * 100).toFixed(1)}%`);
    
    if (this.results.summary.failed > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      Object.entries(this.results.categories).forEach(([category, data]) => {
        const failedEndpoints = data.endpoints.filter(e => e.status === 'failed');
        if (failedEndpoints.length > 0) {
          console.log(`\n${category.toUpperCase()}:`);
          failedEndpoints.forEach(endpoint => {
            console.log(`  ❌ ${endpoint.method} ${endpoint.path}: ${endpoint.error}`);
          });
        }
      });
    }

    if (this.results.summary.warnings > 0) {
      console.log('\n⚠️ WARNINGS:');
      Object.entries(this.results.categories).forEach(([category, data]) => {
        const warningEndpoints = data.endpoints.filter(e => e.status === 'warning');
        if (warningEndpoints.length > 0) {
          console.log(`\n${category.toUpperCase()}:`);
          warningEndpoints.forEach(endpoint => {
            console.log(`  ⚠️ ${endpoint.method} ${endpoint.path}`);
            endpoint.warnings.forEach(warning => console.log(`    - ${warning}`));
          });
        }
      });
    }
  }

  async saveReport() {
    try {
      await fs.writeFile(CONFIG.outputFile, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Detailed report saved to: ${CONFIG.outputFile}`);
    } catch (error) {
      console.error(`❌ Failed to save report: ${error.message}`);
    }
  }
}

// Run the health check
const checker = new EndpointHealthChecker();
checker.runHealthCheck().catch(error => {
  console.error('❌ Health check failed:', error.message);
  process.exit(1);
});

export { EndpointHealthChecker, ENDPOINTS, CONFIG };