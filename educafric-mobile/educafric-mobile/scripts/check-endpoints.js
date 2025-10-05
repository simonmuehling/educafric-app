#!/usr/bin/env node
/**
 * Comprehensive endpoint checker for Educafric platform
 * Tests all endpoints, routes, and functionality systematically
 */

const baseUrl = process.env.VITE_API_URL || 'http://localhost:5000';

const endpoints = [
  // Authentication endpoints
  { method: 'POST', path: '/api/auth/register', requiresAuth: false, requiresBody: true },
  { method: 'POST', path: '/api/auth/login', requiresAuth: false, requiresBody: true },
  { method: 'POST', path: '/api/auth/logout', requiresAuth: true, requiresBody: false },
  { method: 'GET', path: '/api/auth/me', requiresAuth: true, requiresBody: false },
  { method: 'POST', path: '/api/auth/forgot-password', requiresAuth: false, requiresBody: true },
  { method: 'POST', path: '/api/auth/reset-password', requiresAuth: false, requiresBody: true },
  { method: 'POST', path: '/api/auth/change-password', requiresAuth: true, requiresBody: true },
  { method: 'PATCH', path: '/api/auth/profile', requiresAuth: true, requiresBody: true },
  { method: 'DELETE', path: '/api/auth/account', requiresAuth: true, requiresBody: false },

  // School management endpoints
  { method: 'GET', path: '/api/schools', requiresAuth: true, requiresBody: false },
  { method: 'POST', path: '/api/schools', requiresAuth: true, requiresBody: true },
  { method: 'GET', path: '/api/schools/:id', requiresAuth: true, requiresBody: false },
  { method: 'PATCH', path: '/api/schools/:id', requiresAuth: true, requiresBody: true },

  // User management endpoints
  { method: 'GET', path: '/api/users', requiresAuth: true, requiresBody: false },
  { method: 'GET', path: '/api/users/:id', requiresAuth: true, requiresBody: false },
  { method: 'PATCH', path: '/api/users/:id', requiresAuth: true, requiresBody: true },

  // Class management endpoints
  { method: 'GET', path: '/api/classes', requiresAuth: true, requiresBody: false },
  { method: 'POST', path: '/api/classes', requiresAuth: true, requiresBody: true },
  { method: 'GET', path: '/api/classes/:id', requiresAuth: true, requiresBody: false },
  { method: 'PATCH', path: '/api/classes/:id', requiresAuth: true, requiresBody: true },

  // Grade management endpoints
  { method: 'GET', path: '/api/grades', requiresAuth: true, requiresBody: false },
  { method: 'POST', path: '/api/grades', requiresAuth: true, requiresBody: true },
  { method: 'GET', path: '/api/grades/:id', requiresAuth: true, requiresBody: false },
  { method: 'PATCH', path: '/api/grades/:id', requiresAuth: true, requiresBody: true },

  // Attendance endpoints
  { method: 'GET', path: '/api/attendance', requiresAuth: true, requiresBody: false },
  { method: 'POST', path: '/api/attendance', requiresAuth: true, requiresBody: true },
  { method: 'PATCH', path: '/api/attendance/:id', requiresAuth: true, requiresBody: true },

  // Payment endpoints (if Stripe is configured)
  { method: 'POST', path: '/api/create-payment-intent', requiresAuth: true, requiresBody: true },
  { method: 'POST', path: '/api/get-or-create-subscription', requiresAuth: true, requiresBody: false },
];

const testBodies = {
  '/api/auth/register': {
    email: 'test@example.com',
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User',
    role: 'Student'
  },
  '/api/auth/login': {
    email: 'test@example.com',
    password: 'testpassword123'
  },
  '/api/auth/forgot-password': {
    email: 'test@example.com'
  },
  '/api/auth/reset-password': {
    token: 'test-token',
    password: 'newpassword123',
    confirmPassword: 'newpassword123'
  },
  '/api/auth/change-password': {
    currentPassword: 'testpassword123',
    newPassword: 'newpassword456',
    confirmPassword: 'newpassword456'
  },
  '/api/auth/profile': {
    firstName: 'Updated',
    lastName: 'User'
  }
};

async function makeRequest(method, path, body = null, headers = {}) {
  const url = `${baseUrl}${path}`;
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: null
    };
  }
}

async function checkEndpoint(endpoint) {
  const { method, path, requiresAuth, requiresBody } = endpoint;
  const body = requiresBody ? testBodies[path] : null;
  
  console.log(`\n🔍 Testing ${method} ${path}`);
  
  // Test without authentication first
  const response = await makeRequest(method, path, body);
  
  if (requiresAuth && response.status === 401) {
    console.log(`✅ Correctly requires authentication (401)`);
    return { endpoint: path, status: 'protected', code: 401 };
  }
  
  if (!requiresAuth && response.ok) {
    console.log(`✅ Public endpoint working (${response.status})`);
    return { endpoint: path, status: 'working', code: response.status };
  }
  
  if (response.status === 404) {
    console.log(`❌ Endpoint not found (404)`);
    return { endpoint: path, status: 'not-found', code: 404 };
  }
  
  if (response.status === 500) {
    console.log(`❌ Server error (500): ${response.data?.message || 'Unknown error'}`);
    return { endpoint: path, status: 'server-error', code: 500, error: response.data };
  }
  
  if (response.status === 400) {
    console.log(`⚠️  Bad request (400): ${response.data?.message || 'Validation error'}`);
    return { endpoint: path, status: 'validation-error', code: 400, error: response.data };
  }
  
  console.log(`ℹ️  Response (${response.status}): ${JSON.stringify(response.data).slice(0, 100)}`);
  return { endpoint: path, status: 'unknown', code: response.status, data: response.data };
}

async function runHealthCheck() {
  console.log('🚀 Starting Educafric Endpoint Health Check');
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log(`📊 Testing ${endpoints.length} endpoints\n`);

  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint);
    results.push(result);
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n📈 SUMMARY');
  console.log('=' * 50);
  
  const statusCounts = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {});

  Object.entries(statusCounts).forEach(([status, count]) => {
    const emoji = {
      'working': '✅',
      'protected': '🔒',
      'not-found': '❌',
      'server-error': '💥',
      'validation-error': '⚠️',
      'unknown': '❓'
    }[status] || '❔';
    
    console.log(`${emoji} ${status.toUpperCase()}: ${count} endpoints`);
  });

  // List problematic endpoints
  const problems = results.filter(r => ['not-found', 'server-error'].includes(r.status));
  if (problems.length > 0) {
    console.log('\n🔧 ISSUES TO FIX:');
    problems.forEach(problem => {
      console.log(`  ${problem.endpoint} - ${problem.status} (${problem.code})`);
      if (problem.error) {
        console.log(`    Error: ${JSON.stringify(problem.error, null, 2)}`);
      }
    });
  }

  console.log('\n✨ Health check complete!');
  return results;
}

// Frontend route checker
async function checkFrontendRoutes() {
  console.log('\n🌐 Checking Frontend Routes');
  
  const routes = [
    '/',
    '/login',
    '/forgot-password',
    '/reset-password/test-token',
    '/dashboard',
    '/profile',
    '/students',
    '/teachers',
    '/grades',
    '/attendance',
    '/subscribe'
  ];

  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route}`);
      const status = response.status === 200 ? '✅' : response.status === 404 ? '❌' : '⚠️';
      console.log(`${status} ${route} (${response.status})`);
    } catch (error) {
      console.log(`❌ ${route} - Connection failed`);
    }
  }
}

// Run the health check
if (require.main === module) {
  runHealthCheck()
    .then(() => checkFrontendRoutes())
    .catch(console.error);
}

module.exports = { runHealthCheck, checkEndpoint, makeRequest };