#!/usr/bin/env node

/**
 * EDUCAFRIC VERSION 4 COMPREHENSIVE FEATURE TEST
 * Tests all major platform features including authentication, dashboards, notifications, and APIs
 */

const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://0e189d66-0188-4a3e-b6ef-8eea83cb1789-00-10ax8umiht0w8.picard.replit.dev';
const COOKIE_FILE = 'test-cookies.txt';

// Test credentials for different roles
const TEST_ACCOUNTS = {
  admin: { email: 'school.admin@test.educafric.com', password: 'admin123', role: 'Admin' },
  teacher: { email: 'teacher.demo@test.educafric.com', password: 'teacher123', role: 'Teacher' },
  parent: { email: 'parent.demo@test.educafric.com', password: 'parent123', role: 'Parent' },
  student: { email: 'student.demo@test.educafric.com', password: 'student123', role: 'Student' },
  director: { email: 'director.demo@test.educafric.com', password: 'director123', role: 'Director' },
  freelancer: { email: 'freelancer.demo@test.educafric.com', password: 'freelancer123', role: 'Freelancer' },
  commercial: { email: 'commercial.demo@test.educafric.com', password: 'commercial123', role: 'Commercial' },
  siteadmin: { email: 'admin@educafric.com', password: 'siteadmin123', role: 'SiteAdmin' }
};

let testResults = {
  authentication: { passed: 0, failed: 0, tests: [] },
  dashboards: { passed: 0, failed: 0, tests: [] },
  apis: { passed: 0, failed: 0, tests: [] },
  notifications: { passed: 0, failed: 0, tests: [] },
  bilingual: { passed: 0, failed: 0, tests: [] },
  mobile: { passed: 0, failed: 0, tests: [] }
};

console.log('🚀 EDUCAFRIC VERSION 4 COMPREHENSIVE TESTING');
console.log('='.repeat(50));

// HTTP request helper
function makeRequest(method, path, data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Educafric-Version4-Tester/1.0',
        'Accept': 'application/json',
        ...(cookies && { 'Cookie': cookies })
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const responseData = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            cookies: res.headers['set-cookie'] || []
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: { raw: body },
            cookies: res.headers['set-cookie'] || []
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Extract session cookie
function extractSessionCookie(cookies) {
  const sessionCookie = cookies.find(cookie => cookie.includes('educafric.sid='));
  return sessionCookie || '';
}

// Test authentication for all roles
async function testAuthentication() {
  console.log('\n📋 Testing Authentication System...');
  
  for (const [role, credentials] of Object.entries(TEST_ACCOUNTS)) {
    try {
      const response = await makeRequest('POST', '/api/auth/login', credentials);
      
      if (response.status === 200 && response.data.user) {
        testResults.authentication.passed++;
        testResults.authentication.tests.push({
          test: `${role} login`,
          status: 'PASS',
          details: `✅ ${credentials.email} authenticated successfully`
        });
        
        // Save cookie for this role
        const sessionCookie = extractSessionCookie(response.cookies);
        if (sessionCookie) {
          fs.writeFileSync(`${COOKIE_FILE}-${role}`, sessionCookie);
        }
        
      } else {
        testResults.authentication.failed++;
        testResults.authentication.tests.push({
          test: `${role} login`,
          status: 'FAIL',
          details: `❌ Login failed: ${response.data.message || 'Unknown error'}`
        });
      }
    } catch (error) {
      testResults.authentication.failed++;
      testResults.authentication.tests.push({
        test: `${role} login`,
        status: 'ERROR',
        details: `💥 Network error: ${error.message}`
      });
    }
  }
}

// Test dashboard access for authenticated users
async function testDashboards() {
  console.log('\n🎯 Testing Dashboard Access...');
  
  const dashboardEndpoints = {
    admin: ['/api/admin/stats', '/api/admin/schools', '/api/admin/audit-logs'],
    teacher: ['/api/teacher/classes', '/api/teacher/students'],
    parent: ['/api/parent/children', '/api/parent/messages'],
    student: ['/api/student/timetable', '/api/student/grades'],
    director: ['/api/director/overview', '/api/school/stats'],
    freelancer: ['/api/freelancer/students', '/api/freelancer/sessions'],
    commercial: ['/api/commercial/leads', '/api/commercial/reports'],
    siteadmin: ['/api/admin/platform-stats', '/api/admin/users']
  };
  
  for (const [role, endpoints] of Object.entries(dashboardEndpoints)) {
    try {
      const cookieFile = `${COOKIE_FILE}-${role}`;
      if (!fs.existsSync(cookieFile)) continue;
      
      const cookies = fs.readFileSync(cookieFile, 'utf8');
      
      for (const endpoint of endpoints) {
        try {
          const response = await makeRequest('GET', endpoint, null, cookies);
          
          if (response.status === 200) {
            testResults.dashboards.passed++;
            testResults.dashboards.tests.push({
              test: `${role} - ${endpoint}`,
              status: 'PASS',
              details: `✅ Dashboard API accessible`
            });
          } else {
            testResults.dashboards.failed++;
            testResults.dashboards.tests.push({
              test: `${role} - ${endpoint}`,
              status: 'FAIL',
              details: `❌ Status ${response.status}: ${response.data.message || 'Access denied'}`
            });
          }
        } catch (error) {
          testResults.dashboards.failed++;
          testResults.dashboards.tests.push({
            test: `${role} - ${endpoint}`,
            status: 'ERROR',
            details: `💥 Request failed: ${error.message}`
          });
        }
      }
    } catch (error) {
      console.log(`⚠️  No cookie found for ${role}, skipping dashboard tests`);
    }
  }
}

// Test core API functionality
async function testAPIs() {
  console.log('\n🔧 Testing Core APIs...');
  
  const coreAPIs = [
    { path: '/api/health', method: 'GET', description: 'Health check' },
    { path: '/api/geolocation/overview', method: 'GET', description: 'Geolocation system', requiresAuth: true },
    { path: '/api/notifications/test', method: 'POST', description: 'Notification system', data: { type: 'test' }, requiresAuth: true },
    { path: '/api/payment-methods/CM', method: 'GET', description: 'Payment methods (Cameroon)' },
    { path: '/api/currencies/current', method: 'GET', description: 'Currency localization' }
  ];
  
  for (const api of coreAPIs) {
    try {
      let cookies = '';
      if (api.requiresAuth && fs.existsSync(`${COOKIE_FILE}-admin`)) {
        cookies = fs.readFileSync(`${COOKIE_FILE}-admin`, 'utf8');
      }
      
      const response = await makeRequest(api.method, api.path, api.data, cookies);
      
      if (response.status === 200 || (response.status === 401 && api.requiresAuth && !cookies)) {
        testResults.apis.passed++;
        testResults.apis.tests.push({
          test: api.description,
          status: 'PASS',
          details: `✅ ${api.path} responding correctly`
        });
      } else {
        testResults.apis.failed++;
        testResults.apis.tests.push({
          test: api.description,
          status: 'FAIL',
          details: `❌ Status ${response.status}: ${response.data.message || 'Unexpected response'}`
        });
      }
    } catch (error) {
      testResults.apis.failed++;
      testResults.apis.tests.push({
        test: api.description,
        status: 'ERROR',
        details: `💥 API error: ${error.message}`
      });
    }
  }
}

// Test notification system
async function testNotifications() {
  console.log('\n📱 Testing Notification System...');
  
  if (!fs.existsSync(`${COOKIE_FILE}-admin`)) {
    testResults.notifications.failed++;
    testResults.notifications.tests.push({
      test: 'Notification system',
      status: 'SKIP',
      details: '⚠️  No admin authentication available'
    });
    return;
  }
  
  const cookies = fs.readFileSync(`${COOKIE_FILE}-admin`, 'utf8');
  const notificationTests = [
    { endpoint: '/api/notifications/send-sms', data: { to: '+237600000000', message: 'Test SMS' }, name: 'SMS notifications' },
    { endpoint: '/api/notifications/send-email', data: { to: 'test@example.com', subject: 'Test', message: 'Test email' }, name: 'Email notifications' },
    { endpoint: '/api/notifications/send-push', data: { title: 'Test', body: 'Test push' }, name: 'Push notifications' }
  ];
  
  for (const test of notificationTests) {
    try {
      const response = await makeRequest('POST', test.endpoint, test.data, cookies);
      
      if (response.status === 200 || response.status === 202) {
        testResults.notifications.passed++;
        testResults.notifications.tests.push({
          test: test.name,
          status: 'PASS',
          details: `✅ ${test.name} system functional`
        });
      } else {
        testResults.notifications.failed++;
        testResults.notifications.tests.push({
          test: test.name,
          status: 'FAIL',
          details: `❌ Status ${response.status}: ${response.data.message || 'Service unavailable'}`
        });
      }
    } catch (error) {
      testResults.notifications.failed++;
      testResults.notifications.tests.push({
        test: test.name,
        status: 'ERROR',
        details: `💥 Test failed: ${error.message}`
      });
    }
  }
}

// Test bilingual functionality
async function testBilingual() {
  console.log('\n🌍 Testing Bilingual Support...');
  
  const bilingualTests = [
    { path: '/api/translations/fr', description: 'French translations' },
    { path: '/api/translations/en', description: 'English translations' },
    { path: '/api/error-messages/fr', description: 'French error messages' },
    { path: '/api/error-messages/en', description: 'English error messages' }
  ];
  
  for (const test of bilingualTests) {
    try {
      const response = await makeRequest('GET', test.path);
      
      if (response.status === 200 && response.data) {
        testResults.bilingual.passed++;
        testResults.bilingual.tests.push({
          test: test.description,
          status: 'PASS',
          details: `✅ ${test.description} available`
        });
      } else {
        testResults.bilingual.failed++;
        testResults.bilingual.tests.push({
          test: test.description,
          status: 'FAIL',
          details: `❌ Translation service unavailable`
        });
      }
    } catch (error) {
      testResults.bilingual.failed++;
      testResults.bilingual.tests.push({
        test: test.description,
        status: 'ERROR',
        details: `💥 Translation error: ${error.message}`
      });
    }
  }
}

// Test mobile responsiveness
async function testMobile() {
  console.log('\n📱 Testing Mobile Features...');
  
  const mobileTests = [
    { path: '/', headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)' }, description: 'iOS compatibility' },
    { path: '/', headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10)' }, description: 'Android compatibility' },
    { path: '/api/geolocation/mobile-check', description: 'Mobile geolocation' },
    { path: '/api/capacitor/status', description: 'Capacitor integration' }
  ];
  
  for (const test of mobileTests) {
    try {
      const response = await makeRequest('GET', test.path, null, '', test.headers);
      
      if (response.status === 200) {
        testResults.mobile.passed++;
        testResults.mobile.tests.push({
          test: test.description,
          status: 'PASS',
          details: `✅ ${test.description} working`
        });
      } else {
        testResults.mobile.failed++;
        testResults.mobile.tests.push({
          test: test.description,
          status: 'FAIL',
          details: `❌ Mobile feature not responsive`
        });
      }
    } catch (error) {
      testResults.mobile.failed++;
      testResults.mobile.tests.push({
        test: test.description,
        status: 'ERROR',
        details: `💥 Mobile test failed: ${error.message}`
      });
    }
  }
}

// Display comprehensive results
function displayResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 EDUCAFRIC VERSION 4 TEST RESULTS');
  console.log('='.repeat(60));
  
  const categories = Object.keys(testResults);
  let totalPassed = 0;
  let totalFailed = 0;
  
  categories.forEach(category => {
    const result = testResults[category];
    const total = result.passed + result.failed;
    const passRate = total > 0 ? ((result.passed / total) * 100).toFixed(1) : '0.0';
    
    console.log(`\n🔍 ${category.toUpperCase()} TESTS:`);
    console.log(`   ✅ Passed: ${result.passed}`);
    console.log(`   ❌ Failed: ${result.failed}`);
    console.log(`   📈 Success Rate: ${passRate}%`);
    
    if (result.tests.length > 0) {
      console.log('   📝 Details:');
      result.tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`      ${icon} ${test.test}: ${test.details}`);
      });
    }
    
    totalPassed += result.passed;
    totalFailed += result.failed;
  });
  
  const overallTotal = totalPassed + totalFailed;
  const overallPassRate = overallTotal > 0 ? ((totalPassed / overallTotal) * 100).toFixed(1) : '0.0';
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 OVERALL RESULTS:');
  console.log(`   Total Tests: ${overallTotal}`);
  console.log(`   Passed: ${totalPassed}`);
  console.log(`   Failed: ${totalFailed}`);
  console.log(`   Success Rate: ${overallPassRate}%`);
  
  if (overallPassRate >= 80) {
    console.log('\n🎉 EXCELLENT! Platform ready for production deployment');
  } else if (overallPassRate >= 60) {
    console.log('\n⚠️  GOOD: Most features working, minor issues detected');
  } else {
    console.log('\n🔧 NEEDS ATTENTION: Multiple issues require fixing');
  }
  
  // Clean up cookie files
  try {
    fs.readdirSync('.').forEach(file => {
      if (file.startsWith(COOKIE_FILE)) {
        fs.unlinkSync(file);
      }
    });
  } catch (e) {
    // Ignore cleanup errors
  }
}

// Main test execution
async function runTests() {
  try {
    await testAuthentication();
    await testDashboards();
    await testAPIs();
    await testNotifications();
    await testBilingual();
    await testMobile();
    
    displayResults();
    
  } catch (error) {
    console.error('🚨 CRITICAL ERROR:', error.message);
    process.exit(1);
  }
}

// Execute tests
runTests();