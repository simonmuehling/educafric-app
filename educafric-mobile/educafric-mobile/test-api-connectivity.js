#!/usr/bin/env node

/**
 * EDUCAFRIC API CONNECTIVITY TEST SUITE
 * Tests all API endpoints with different user roles
 * Validates access control and authentication
 */

import axios from 'axios';
import fs from 'fs';

const API_BASE = 'http://localhost:5000';
const TEST_RESULTS = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    roleBasedTests: {}
  }
};

// Test accounts for different roles
const TEST_ACCOUNTS = {
  student: { email: 'student.demo@test.educafric.com', password: 'password' },
  teacher: { email: 'teacher.demo@test.educafric.com', password: 'password' },
  parent: { email: 'parent.demo@test.educafric.com', password: 'password' },
  freelancer: { email: 'freelancer.demo@test.educafric.com', password: 'password' },
  commercial: { email: 'commercial.demo@test.educafric.com', password: 'password' },
  admin: { email: 'admin.demo@test.educafric.com', password: 'password' },
  director: { email: 'director.demo@test.educafric.com', password: 'password' },
  siteadmin: { email: 'simon.admin@educafric.com', password: 'educ12-Baxster' }
};

// API endpoints grouped by access level
const API_ENDPOINTS = {
  public: [
    { method: 'GET', path: '/api/auth/me', description: 'Check authentication status' },
  ],
  authenticated: [
    { method: 'GET', path: '/api/profile', description: 'Get user profile' },
    { method: 'GET', path: '/api/notifications', description: 'Get notifications' },
    { method: 'GET', path: '/api/homework', description: 'Get homework assignments' },
    { method: 'GET', path: '/api/subjects', description: 'Get subjects' },
    { method: 'GET', path: '/api/grades', description: 'Get grades' },
  ],
  teacher: [
    { method: 'GET', path: '/api/teacher/classes', description: 'Get teacher classes' },
    { method: 'GET', path: '/api/teacher/students', description: 'Get teacher students' },
    { method: 'POST', path: '/api/teacher/attendance', description: 'Submit attendance' },
  ],
  parent: [
    { method: 'GET', path: '/api/parent/children', description: 'Get parent children' },
    { method: 'GET', path: '/api/parent/communications', description: 'Get parent communications' },
  ],
  student: [
    { method: 'GET', path: '/api/student/assignments', description: 'Get student assignments' },
    { method: 'GET', path: '/api/student/grades', description: 'Get student grades' },
  ],
  admin: [
    { method: 'GET', path: '/api/admin/users', description: 'Get all users (admin only)' },
    { method: 'GET', path: '/api/admin/schools', description: 'Get all schools (admin only)' },
    { method: 'GET', path: '/api/school/stats', description: 'Get school statistics' },
    { method: 'GET', path: '/api/school/modules', description: 'Get school modules' },
  ],
  commercial: [
    { method: 'GET', path: '/api/commercial/prospects', description: 'Get commercial prospects' },
    { method: 'GET', path: '/api/commercial/schools', description: 'Get commercial schools' },
  ],
  freelancer: [
    { method: 'GET', path: '/api/freelancer/students', description: 'Get freelancer students' },
    { method: 'GET', path: '/api/freelancer/sessions', description: 'Get freelancer sessions' },
  ]
};

// Helper function to make authenticated request
async function makeAuthenticatedRequest(method, path, sessionCookie, data = null) {
  try {
    const config = {
      method: method.toLowerCase(),
      url: `${API_BASE}${path}`,
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: () => true // Don't throw on any status code
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      status: response.status,
      data: response.data,
      success: response.status >= 200 && response.status < 400
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      success: false
    };
  }
}

// Login and get session cookie
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password
    }, {
      timeout: 10000,
      validateStatus: () => true
    });

    if (response.status === 200 && response.headers['set-cookie']) {
      const sessionCookie = response.headers['set-cookie']
        .find(cookie => cookie.startsWith('connect.sid='));
      return {
        success: true,
        sessionCookie,
        user: response.data
      };
    }

    return {
      success: false,
      error: `Login failed: ${response.status} - ${JSON.stringify(response.data)}`
    };
  } catch (error) {
    return {
      success: false,
      error: `Login error: ${error.message}`
    };
  }
}

// Test a specific endpoint with a user role
async function testEndpoint(role, endpoint, sessionCookie) {
  console.log(`  Testing ${endpoint.method} ${endpoint.path} as ${role}...`);
  
  const result = await makeAuthenticatedRequest(
    endpoint.method,
    endpoint.path,
    sessionCookie
  );

  const testResult = {
    role,
    method: endpoint.method,
    path: endpoint.path,
    description: endpoint.description,
    status: result.status,
    success: result.success,
    response: result.data,
    timestamp: new Date().toISOString()
  };

  TEST_RESULTS.tests.push(testResult);
  TEST_RESULTS.summary.total++;

  if (result.success) {
    TEST_RESULTS.summary.passed++;
    console.log(`    ✅ ${result.status} - ${endpoint.description}`);
  } else {
    TEST_RESULTS.summary.failed++;
    console.log(`    ❌ ${result.status} - ${endpoint.description} - ${JSON.stringify(result.data)}`);
  }

  return testResult;
}

// Test all endpoints for a specific role
async function testRoleEndpoints(role, sessionCookie) {
  console.log(`\n🔍 Testing endpoints for role: ${role.toUpperCase()}`);
  
  const roleTests = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test authenticated endpoints (available to all logged-in users)
  for (const endpoint of API_ENDPOINTS.authenticated) {
    const result = await testEndpoint(role, endpoint, sessionCookie);
    roleTests.tests.push(result);
    roleTests.total++;
    if (result.success) roleTests.passed++;
    else roleTests.failed++;
  }

  // Test role-specific endpoints
  if (API_ENDPOINTS[role]) {
    for (const endpoint of API_ENDPOINTS[role]) {
      const result = await testEndpoint(role, endpoint, sessionCookie);
      roleTests.tests.push(result);
      roleTests.total++;
      if (result.success) roleTests.passed++;
      else roleTests.failed++;
    }
  }

  // Test admin endpoints (only for admin roles)
  if (['admin', 'director', 'siteadmin'].includes(role)) {
    for (const endpoint of API_ENDPOINTS.admin) {
      const result = await testEndpoint(role, endpoint, sessionCookie);
      roleTests.tests.push(result);
      roleTests.total++;
      if (result.success) roleTests.passed++;
      else roleTests.failed++;
    }
  }

  TEST_RESULTS.summary.roleBasedTests[role] = roleTests;
  console.log(`📊 ${role.toUpperCase()} Summary: ${roleTests.passed}/${roleTests.total} passed`);
  
  return roleTests;
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting EDUCAFRIC API Connectivity Tests...\n');

  // Test public endpoints first
  console.log('🔓 Testing public endpoints...');
  for (const endpoint of API_ENDPOINTS.public) {
    await testEndpoint('public', endpoint, '');
  }

  // Test each role
  for (const [role, credentials] of Object.entries(TEST_ACCOUNTS)) {
    console.log(`\n🔐 Logging in as ${role}...`);
    
    const loginResult = await login(credentials.email, credentials.password);
    
    if (loginResult.success) {
      console.log(`✅ Login successful for ${role}: ${loginResult.user.email}`);
      await testRoleEndpoints(role, loginResult.sessionCookie);
    } else {
      console.log(`❌ Login failed for ${role}: ${loginResult.error}`);
      TEST_RESULTS.summary.roleBasedTests[role] = {
        total: 0,
        passed: 0,
        failed: 1,
        tests: [],
        loginError: loginResult.error
      };
    }
  }

  // Generate final report
  console.log('\n📋 FINAL TEST REPORT');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${TEST_RESULTS.summary.total}`);
  console.log(`Passed: ${TEST_RESULTS.summary.passed}`);
  console.log(`Failed: ${TEST_RESULTS.summary.failed}`);
  console.log(`Success Rate: ${((TEST_RESULTS.summary.passed / TEST_RESULTS.summary.total) * 100).toFixed(2)}%`);

  console.log('\n🎯 Role-Based Summary:');
  for (const [role, stats] of Object.entries(TEST_RESULTS.summary.roleBasedTests)) {
    if (stats.loginError) {
      console.log(`  ${role.toUpperCase()}: LOGIN FAILED - ${stats.loginError}`);
    } else {
      console.log(`  ${role.toUpperCase()}: ${stats.passed}/${stats.total} (${((stats.passed / stats.total) * 100).toFixed(1)}%)`);
    }
  }

  // Save detailed results
  fs.writeFileSync('api-connectivity-report.json', JSON.stringify(TEST_RESULTS, null, 2));
  console.log('\n💾 Detailed report saved to: api-connectivity-report.json');

  return TEST_RESULTS;
}

// Run tests if called directly
runAllTests().catch(console.error);

export { runAllTests, TEST_ACCOUNTS, API_ENDPOINTS };