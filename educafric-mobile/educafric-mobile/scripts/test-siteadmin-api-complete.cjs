#!/usr/bin/env node

/**
 * Complete Site Admin API System Test
 * Tests all Site Admin API endpoints with authentication
 */

const http = require('http');

class SiteAdminAPITester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.cookies = '';
    this.user = null;
  }

  makeRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SiteAdminAPITester/1.0'
        }
      };

      if (this.cookies) {
        options.headers['Cookie'] = this.cookies;
      }

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(body);
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: jsonData
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: body
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async login() {
    console.log('\n🔑 [AUTH] Testing Site Admin Authentication...');
    
    // Test with multiple site admin credential combinations
    const credentials = [
      { email: 'admin@test.educafric.com', password: 'demo123' },
      { email: 'simon.admin@educafric.com', password: 'admin123' },
      { email: 'siteadmin.demo@test.educafric.com', password: 'demo123' },
      { email: 'admin.demo@test.educafric.com', password: 'demo123' }
    ];

    for (const cred of credentials) {
      console.log(`🔍 Trying login: ${cred.email} / ${cred.password}`);
      
      const response = await this.makeRequest('POST', '/api/auth/login', cred);
      
      if (response.statusCode === 200) {
        // Check both response.data.user and response.data for user information
        const user = response.data.user || response.data;
        if (user && user.email) {
          const setCookieHeader = response.headers['set-cookie'];
          if (setCookieHeader) {
            this.cookies = setCookieHeader[0].split(';')[0];
            console.log(`✅ [AUTH] Successfully logged in as: ${user.email} (Role: ${user.role})`);
            console.log(`📝 [AUTH] User ID: ${user.id}`);
            return user;
          }
        }
      }
      
      console.log(`❌ [AUTH] Failed: ${response.data.message || 'Unknown error'}`);
    }
    
    throw new Error('All site admin login attempts failed');
  }

  async testAPI(name, endpoint, expectedFields = []) {
    console.log(`\n🧪 [TEST] ${name}`);
    console.log(`📡 [API] GET ${endpoint}`);
    
    const startTime = Date.now();
    const response = await this.makeRequest('GET', endpoint);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.statusCode === 200) {
      console.log(`✅ [API] Response: ${response.statusCode} (${responseTime}ms)`);
      
      const data = response.data;
      if (Array.isArray(data)) {
        console.log(`📊 [DATA] Records: ${data.length}`);
        if (data.length === 0) {
          console.log(`📄 [DATA] Empty result or fallback data`);
        } else {
          const firstRecord = data[0];
          const availableFields = Object.keys(firstRecord);
          console.log(`🔍 [FIELDS] Available: ${availableFields.join(', ')}`);
          
          if (expectedFields.length > 0) {
            const missingFields = expectedFields.filter(field => !availableFields.includes(field));
            if (missingFields.length > 0) {
              console.log(`⚠️ [SCHEMA] Missing fields: ${missingFields.join(', ')}`);
            } else {
              console.log(`✅ [SCHEMA] All expected fields present`);
            }
          }
        }
      } else {
        console.log(`📊 [DATA] Records: Single object`);
        if (data && typeof data === 'object') {
          const availableFields = Object.keys(data);
          console.log(`🔍 [FIELDS] Available: ${availableFields.join(', ')}`);
        }
      }
      
      return { success: true, responseTime, data };
    } else {
      console.log(`❌ [API] Response: ${response.statusCode} (${responseTime}ms)`);
      console.log(`💥 [ERROR] ${response.data.message || 'Unknown error'}`);
      return { success: false, responseTime, error: response.data };
    }
  }

  async runCompleteTest() {
    console.log('🚀 [SITE_ADMIN_API_TEST] Starting Complete Site Admin API System Test');
    console.log('=====================================');

    try {
      // Step 1: Authentication
      this.user = await this.login();

      // Step 2: Test all Site Admin API endpoints
      const tests = [
        {
          name: 'Site Admin Platform Statistics',
          endpoint: '/api/admin/stats',
          expectedFields: ['totalUsers', 'totalSchools', 'activeSubscriptions', 'monthlyRevenue']
        },
        {
          name: 'Site Admin Schools Management',
          endpoint: '/api/admin/schools',
          expectedFields: ['id', 'name', 'location', 'subscriptionPlan', 'status', 'createdAt']
        },
        {
          name: 'Site Admin Users Management', 
          endpoint: '/api/admin/users',
          expectedFields: ['id', 'email', 'role', 'firstName', 'lastName', 'schoolId', 'createdAt']
        },
        {
          name: 'Site Admin System Health',
          endpoint: '/api/admin/system/health', 
          expectedFields: ['status', 'uptime', 'memory', 'database', 'services']
        },
        {
          name: 'Site Admin Analytics Module',
          endpoint: '/api/admin/analytics',
          expectedFields: ['userGrowth', 'schoolGrowth', 'revenueGrowth', 'engagementMetrics']
        },
        {
          name: 'Site Admin Audit Logs',
          endpoint: '/api/admin/audit-logs',
          expectedFields: ['id', 'userId', 'action', 'resource', 'timestamp', 'ipAddress']
        }
      ];

      const results = [];
      for (const test of tests) {
        const result = await this.testAPI(test.name, test.endpoint, test.expectedFields);
        results.push({ ...test, ...result });
      }

      // Step 3: Results Summary
      console.log('\n=====================================');
      console.log('📊 [RESULTS] Complete Site Admin API Test Results');
      console.log('=====================================');
      
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const successRate = ((passed / results.length) * 100).toFixed(1);
      
      console.log(`✅ Passed: ${passed}/${results.length}`);
      console.log(`❌ Failed: ${failed}/${results.length}`);
      console.log(`📈 Success Rate: ${successRate}%`);

      if (successRate === '100.0') {
        console.log('\n🎉 [SUCCESS] All Site Admin API modules are fully operational!');
        console.log('🔥 [STATUS] Site Admin system ready for production deployment');
      } else {
        console.log('\n⚠️ [WARNING] Some Site Admin API modules need attention');
        
        const failedTests = results.filter(r => !r.success);
        for (const test of failedTests) {
          console.log(`❌ [FAILED] ${test.name}: ${test.error?.message || 'Unknown error'}`);
        }
      }

    } catch (error) {
      console.log(`💥 [FATAL] Test execution failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the test
const tester = new SiteAdminAPITester();
tester.runCompleteTest();