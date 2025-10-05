#!/usr/bin/env node

/**
 * DIRECTOR MODULES API VALIDATION SCRIPT
 * Tests all 10 Director Dashboard modules backend integration
 * Confirms PostgreSQL connectivity and data availability
 */

const http = require('http');
const https = require('https');

const config = {
  hostname: process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'localhost',
  port: process.env.REPL_SLUG ? 443 : 3000,
  protocol: process.env.REPL_SLUG ? 'https:' : 'http:',
  credentials: 'school.admin@test.educafric.com:admin123'
};

console.log(`🚀 DIRECTOR MODULES API VALIDATION SCRIPT STARTED`);
console.log(`📡 Testing against: ${config.protocol}//${config.hostname}${config.port === 443 ? '' : ':' + config.port}`);

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const client = config.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = res.headers['content-type']?.includes('application/json') ? JSON.parse(data) : data;
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Step 1: Login and get session cookies
async function login() {
  console.log(`\n🔐 STEP 1: Authenticating as Director...`);
  
  const loginData = JSON.stringify({
    email: 'school.admin@test.educafric.com',
    password: 'admin123'
  });

  const loginOptions = {
    hostname: config.hostname,
    port: config.port,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  try {
    const response = await makeRequest(loginOptions, loginData);
    
    if (response.status === 200) {
      console.log(`✅ Authentication successful!`);
      console.log(`📧 User: ${response.data.user?.email}`);
      console.log(`🏫 School ID: ${response.data.user?.schoolId}`);
      console.log(`👤 Role: ${response.data.user?.role}`);
      
      // Extract session cookies
      const cookies = response.headers['set-cookie'];
      const sessionCookie = cookies?.find(cookie => cookie.startsWith('educafric.sid='));
      
      if (sessionCookie) {
        console.log(`🍪 Session cookie obtained: ${sessionCookie.split(';')[0]}`);
        return sessionCookie.split(';')[0]; // Return just the cookie value
      } else {
        throw new Error('No session cookie found in response');
      }
    } else {
      throw new Error(`Login failed: ${response.status} - ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error(`❌ Login failed:`, error.message);
    throw error;
  }
}

// Step 2: Test all Director Module APIs
async function testDirectorAPIs(sessionCookie) {
  console.log(`\n🧪 STEP 2: Testing All Director Module APIs...`);
  
  const directorEndpoints = [
    { name: 'Class Management', path: '/api/director/class-management' },
    { name: 'Attendance Management', path: '/api/director/attendance-management' },
    { name: 'Parent Requests', path: '/api/director/parent-requests' },
    { name: 'Geolocation Management', path: '/api/director/geolocation-management' },
    { name: 'Bulletin Approval', path: '/api/director/bulletin-approval' },
    { name: 'Teacher Absence', path: '/api/director/teacher-absence' },
    { name: 'Timetable Configuration', path: '/api/director/timetable-configuration' },
    { name: 'Financial Management', path: '/api/director/financial-management' },
    { name: 'Reports Analytics', path: '/api/director/reports-analytics' },
    { name: 'Communications Center', path: '/api/director/communications-center' }
  ];

  const results = [];
  
  for (const endpoint of directorEndpoints) {
    console.log(`\n🔍 Testing ${endpoint.name}...`);
    
    const options = {
      hostname: config.hostname,
      port: config.port,
      path: endpoint.path,
      method: 'GET',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      }
    };

    try {
      const startTime = Date.now();
      const response = await makeRequest(options);
      const duration = Date.now() - startTime;
      
      if (response.status === 200) {
        const dataLength = JSON.stringify(response.data).length;
        console.log(`✅ ${endpoint.name}: SUCCESS (${duration}ms, ${dataLength} bytes)`);
        
        // Log sample data structure for verification
        if (typeof response.data === 'object' && response.data !== null) {
          const keys = Object.keys(response.data);
          console.log(`   📊 Data keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
          
          // Special validation for different data types
          if (Array.isArray(response.data)) {
            console.log(`   📋 Array with ${response.data.length} items`);
          } else if (response.data.total !== undefined) {
            console.log(`   📈 Stats: total=${response.data.total}, lastUpdate=${response.data.lastUpdate}`);
          }
        }
        
        results.push({ endpoint: endpoint.name, status: 'SUCCESS', duration, data: response.data });
      } else {
        console.log(`❌ ${endpoint.name}: FAILED (${response.status})`);
        console.log(`   Error: ${JSON.stringify(response.data)}`);
        results.push({ endpoint: endpoint.name, status: 'FAILED', error: response.data });
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
      results.push({ endpoint: endpoint.name, status: 'ERROR', error: error.message });
    }
  }
  
  return results;
}

// Step 3: Generate validation report
function generateReport(results) {
  console.log(`\n📊 DIRECTOR MODULES VALIDATION REPORT`);
  console.log(`=============================================`);
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status !== 'SUCCESS');
  
  console.log(`✅ Successful APIs: ${successful.length}/${results.length}`);
  console.log(`❌ Failed APIs: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log(`\n🎯 SUCCESSFUL ENDPOINTS:`);
    successful.forEach(result => {
      console.log(`   ✅ ${result.endpoint} (${result.duration}ms)`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n⚠️  FAILED ENDPOINTS:`);
    failed.forEach(result => {
      console.log(`   ❌ ${result.endpoint}: ${result.error}`);
    });
  }
  
  // Overall status
  const successRate = (successful.length / results.length) * 100;
  console.log(`\n🏆 OVERALL SUCCESS RATE: ${successRate.toFixed(1)}%`);
  
  if (successRate === 100) {
    console.log(`\n🎉 ALL DIRECTOR MODULE APIS ARE FUNCTIONAL!`);
    console.log(`🚀 Backend integration for Director Dashboard is COMPLETE!`);
  } else if (successRate >= 80) {
    console.log(`\n⚡ Most Director APIs working - minor issues to resolve`);
  } else {
    console.log(`\n🔧 Significant issues detected - requires attention`);
  }
  
  return successRate;
}

// Main execution
async function main() {
  try {
    const sessionCookie = await login();
    const results = await testDirectorAPIs(sessionCookie);
    const successRate = generateReport(results);
    
    console.log(`\n🏁 Director Modules API validation completed!`);
    process.exit(successRate === 100 ? 0 : 1);
    
  } catch (error) {
    console.error(`\n💥 Validation script failed:`, error.message);
    process.exit(1);
  }
}

// Run the validation
main().catch(console.error);