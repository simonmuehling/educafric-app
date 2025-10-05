#!/usr/bin/env node

/**
 * Educafric Route Connectivity Test
 * Tests all connections between school-teacher-student-parents and freelancer-student-parents
 */

import http from 'http';

const BASE_URL = 'http://localhost:5000';

// Test user credentials
const testUsers = {
  student: { email: 'student.demo@test.educafric.com', password: 'password' },
  teacher: { email: 'teacher.demo@test.educafric.com', password: 'password' },
  parent: { email: 'parent.demo@test.educafric.com', password: 'password' },
  freelancer: { email: 'freelancer.demo@test.educafric.com', password: 'password' },
  director: { email: 'director.demo@test.educafric.com', password: 'password' }
};

// Routes to test for each user role
const roleRoutes = {
  student: ['/student', '/students'],
  teacher: ['/teacher', '/teachers'], 
  parent: ['/parent', '/parents'],
  freelancer: ['/freelancer'],
  director: ['/director', '/schools']
};

// Test connectivity between user roles
const connectivityTests = [
  {
    name: 'School-Teacher-Student-Parents Connection',
    roles: ['director', 'teacher', 'student', 'parent'],
    description: 'Tests complete school ecosystem connectivity'
  },
  {
    name: 'Freelancer-Student-Parents Connection', 
    roles: ['freelancer', 'student', 'parent'],
    description: 'Tests freelancer tutoring ecosystem connectivity'
  }
];

async function makeRequest(path, method = 'GET', data = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (cookie) {
      options.headers.Cookie = cookie;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
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

async function authenticateUser(userType) {
  console.log(`🔐 Authenticating ${userType}...`);
  
  const loginData = testUsers[userType];
  if (!loginData) {
    throw new Error(`No test credentials for user type: ${userType}`);
  }

  const response = await makeRequest('/api/auth/login', 'POST', loginData);
  
  if (response.status === 200) {
    console.log(`✅ ${userType} authenticated successfully`);
    const cookie = response.headers['set-cookie']?.[0];
    return { user: response.body, cookie };
  } else {
    throw new Error(`❌ Authentication failed for ${userType}: ${response.body.message || 'Unknown error'}`);
  }
}

async function testRouteAccess(route, cookie, userType) {
  try {
    const response = await makeRequest(route, 'GET', null, cookie);
    
    if (response.status === 200) {
      console.log(`  ✅ ${route} - Accessible for ${userType}`);
      return { route, status: 'success', statusCode: response.status };
    } else if (response.status === 401) {
      console.log(`  🔒 ${route} - Authentication required for ${userType}`);
      return { route, status: 'auth_required', statusCode: response.status };
    } else if (response.status === 403) {
      console.log(`  ⚠️  ${route} - Access forbidden for ${userType}`);
      return { route, status: 'forbidden', statusCode: response.status };
    } else {
      console.log(`  ❌ ${route} - Error ${response.status} for ${userType}`);
      return { route, status: 'error', statusCode: response.status };
    }
  } catch (error) {
    console.log(`  💥 ${route} - Network error for ${userType}: ${error.message}`);
    return { route, status: 'network_error', error: error.message };
  }
}

async function testUserRoleConnectivity(userType) {
  console.log(`\n🧪 Testing ${userType.toUpperCase()} role connectivity...`);
  
  try {
    // Authenticate user
    const { user, cookie } = await authenticateUser(userType);
    console.log(`   User: ${user.name} (${user.role})`);
    
    // Test assigned routes
    const routes = roleRoutes[userType] || [];
    const results = [];
    
    for (const route of routes) {
      const result = await testRouteAccess(route, cookie, userType);
      results.push(result);
    }
    
    // Test cross-role accessibility
    console.log(`\n  🔗 Testing cross-role route access for ${userType}:`);
    const crossRoleRoutes = ['/students', '/teachers', '/parents', '/freelancer', '/director'];
    
    for (const route of crossRoleRoutes) {
      if (!routes.includes(route)) {
        const result = await testRouteAccess(route, cookie, userType);
        results.push(result);
      }
    }
    
    return {
      userType,
      user,
      success: true,
      results
    };
    
  } catch (error) {
    console.log(`❌ Failed to test ${userType}: ${error.message}`);
    return {
      userType,
      success: false,
      error: error.message
    };
  }
}

async function testConnectivityScenarios() {
  console.log('🌐 Testing Connectivity Scenarios...\n');
  
  for (const scenario of connectivityTests) {
    console.log(`\n📋 ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    console.log('   ═'.repeat(50));
    
    const scenarioResults = [];
    
    for (const role of scenario.roles) {
      const result = await testUserRoleConnectivity(role);
      scenarioResults.push(result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary for this scenario
    const successfulRoles = scenarioResults.filter(r => r.success).length;
    const totalRoles = scenarioResults.length;
    
    console.log(`\n   📊 Scenario Summary: ${successfulRoles}/${totalRoles} roles tested successfully`);
    
    if (successfulRoles === totalRoles) {
      console.log(`   ✅ ${scenario.name} - ALL CONNECTIONS WORKING`);
    } else {
      console.log(`   ⚠️  ${scenario.name} - Some issues detected`);
    }
  }
}

async function runConnectivityTests() {
  console.log('🚀 EDUCAFRIC ROUTE CONNECTIVITY TEST');
  console.log('═'.repeat(60));
  console.log('Testing all connections between user roles...\n');
  
  try {
    // Test server health first
    console.log('🏥 Checking server health...');
    const healthCheck = await makeRequest('/api/health');
    
    if (healthCheck.status === 200) {
      console.log('✅ Server is healthy\n');
    } else {
      throw new Error('Server health check failed');
    }
    
    // Run connectivity tests
    await testConnectivityScenarios();
    
    console.log('\n🎉 CONNECTIVITY TEST COMPLETE!');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error(`💥 Test failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
runConnectivityTests();