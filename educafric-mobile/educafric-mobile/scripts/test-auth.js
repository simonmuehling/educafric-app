#!/usr/bin/env node
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000';

async function testAuthFlow() {
  console.log('🔐 Testing Authentication Flow\n');

  // Test 1: Register new user
  console.log('1. Testing user registration...');
  try {
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@educafric.com`,
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        role: 'Student'
      })
    });

    const registerData = await registerResponse.json();
    if (registerResponse.ok) {
      console.log('✅ Registration successful');
      console.log(`   User ID: ${registerData.id}`);
    } else {
      console.log('❌ Registration failed:', registerData.message);
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
  }

  // Test 2: Login existing user
  console.log('\n2. Testing user login...');
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@educafric.com',
        password: 'demo123'
      })
    });

    const loginData = await loginResponse.json();
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log(`   User: ${loginData.firstName} ${loginData.lastName}`);
      console.log(`   Role: ${loginData.role}`);
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }

  // Test 3: Protected route (without auth)
  console.log('\n3. Testing protected route without auth...');
  try {
    const meResponse = await fetch(`${baseUrl}/api/auth/me`);
    const meData = await meResponse.json();
    
    if (meResponse.status === 401) {
      console.log('✅ Protected route correctly requires auth');
    } else {
      console.log('❌ Protected route issue:', meData);
    }
  } catch (error) {
    console.log('❌ Protected route error:', error.message);
  }

  // Test 4: Password reset request
  console.log('\n4. Testing password reset request...');
  try {
    const resetResponse = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@educafric.com'
      })
    });

    const resetData = await resetResponse.json();
    if (resetResponse.ok) {
      console.log('✅ Password reset request successful');
      if (resetData.resetToken) {
        console.log(`   Reset token: ${resetData.resetToken.slice(0, 8)}...`);
      }
    } else {
      console.log('❌ Password reset failed:', resetData.message);
    }
  } catch (error) {
    console.log('❌ Password reset error:', error.message);
  }

  console.log('\n✨ Authentication flow testing complete!');
}

testAuthFlow().catch(console.error);