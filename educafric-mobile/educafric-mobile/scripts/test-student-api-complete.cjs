#!/usr/bin/env node

/**
 * Complete Student API System Test
 * Tests all Student API endpoints with authentication
 */

const http = require('http');

class StudentAPITester {
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
          'User-Agent': 'StudentAPITester/1.0'
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
    console.log('\n🔑 [AUTH] Testing Student Authentication...');
    
    // Test with multiple student credential combinations
    const credentials = [
      { email: 'student.demo@test.educafric.com', password: 'demo123' },
      { email: 'junior.kamga@test.educafric.com', password: 'sandbox123' },
      { email: 'marie.student@test.educafric.com', password: 'test123' },
      { email: 'demo.student@educafric.com', password: 'demo123' }
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
    
    throw new Error('All student login attempts failed');
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
          console.log(`📄 [DATA] Empty result (normal for new student)`);
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
    console.log('🚀 [STUDENT_API_TEST] Starting Complete Student API System Test');
    console.log('=====================================');

    try {
      // Step 1: Authentication
      this.user = await this.login();

      // Step 2: Test all Student API endpoints
      const tests = [
        {
          name: 'Student Profile/Settings',
          endpoint: '/api/student/profile',
          expectedFields: ['id', 'email', 'firstName', 'lastName', 'className', 'parentId']
        },
        {
          name: 'Student Timetable Module',
          endpoint: '/api/student/timetable',
          expectedFields: ['id', 'day', 'startTime', 'endTime', 'subject', 'teacher', 'room']
        },
        {
          name: 'Student Messages Module', 
          endpoint: '/api/student/messages',
          expectedFields: ['id', 'subject', 'content', 'senderName', 'recipientName', 'sentAt', 'status']
        },
        {
          name: 'Student Grades Module',
          endpoint: '/api/student/grades', 
          expectedFields: ['id', 'subject', 'grade', 'coefficient', 'examType', 'date', 'teacherName']
        },
        {
          name: 'Student Attendance Module',
          endpoint: '/api/student/attendance',
          expectedFields: ['id', 'date', 'status', 'subject', 'teacherName', 'notes']
        },
        {
          name: 'Student Homework Module',
          endpoint: '/api/student/homework',
          expectedFields: ['id', 'subject', 'title', 'description', 'dueDate', 'status', 'teacherName']
        }
      ];

      const results = [];
      for (const test of tests) {
        const result = await this.testAPI(test.name, test.endpoint, test.expectedFields);
        results.push({ ...test, ...result });
      }

      // Step 3: Results Summary
      console.log('\n=====================================');
      console.log('📊 [RESULTS] Complete Student API Test Results');
      console.log('=====================================');
      
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const successRate = ((passed / results.length) * 100).toFixed(1);
      
      console.log(`✅ Passed: ${passed}/${results.length}`);
      console.log(`❌ Failed: ${failed}/${results.length}`);
      console.log(`📈 Success Rate: ${successRate}%`);

      if (successRate === '100.0') {
        console.log('\n🎉 [SUCCESS] All Student API modules are fully operational!');
        console.log('🔥 [STATUS] Student system ready for production deployment');
      } else {
        console.log('\n⚠️ [WARNING] Some Student API modules need attention');
        
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
const tester = new StudentAPITester();
tester.runCompleteTest();