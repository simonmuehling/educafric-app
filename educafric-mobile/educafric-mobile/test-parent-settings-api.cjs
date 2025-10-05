const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// Set up cookie jar for session management
const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ jar: cookieJar }));

async function testParentSettingsAPI() {
  try {
    console.log('[PARENT_SETTINGS_TEST] 🔄 Starting Parent Settings API test...');

    // Step 1: Login as parent demo user
    console.log('[PARENT_SETTINGS_TEST] 1️⃣ Logging in as parent demo user...');
    const loginResponse = await client.post('http://localhost:5000/api/auth/login', {
      email: 'marie.parent@test.educafric.com',
      password: 'demo123',
      rememberMe: false
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    console.log('[PARENT_SETTINGS_TEST] ✅ Login successful');
    console.log('[PARENT_SETTINGS_TEST] Response:', loginResponse.data);

    // Step 2: Test GET profile endpoint
    console.log('[PARENT_SETTINGS_TEST] 2️⃣ Testing GET /api/parent/profile...');
    try {
      const profileResponse = await client.get('http://localhost:5000/api/parent/profile');
      console.log('[PARENT_SETTINGS_TEST] ✅ GET profile response:', profileResponse.data);
    } catch (error) {
      console.log('[PARENT_SETTINGS_TEST] ❌ GET profile error:', error.response?.status, error.response?.data);
    }

    // Step 3: Test PATCH profile endpoint
    console.log('[PARENT_SETTINGS_TEST] 3️⃣ Testing PATCH /api/parent/profile...');
    try {
      const updateData = {
        firstName: 'Updated Demo',
        lastName: 'Parent',
        phone: '+237 656 200 999',
        language: 'fr',
        notifications: {
          email: true,
          sms: true,
          push: true
        }
      };

      const updateResponse = await client.patch('http://localhost:5000/api/parent/profile', updateData);
      console.log('[PARENT_SETTINGS_TEST] ✅ PATCH profile response:', updateResponse.data);
    } catch (error) {
      console.log('[PARENT_SETTINGS_TEST] ❌ PATCH profile error:', error.response?.status, error.response?.data);
    }

    console.log('[PARENT_SETTINGS_TEST] 🎉 Test completed');

  } catch (error) {
    console.error('[PARENT_SETTINGS_TEST] ❌ Test failed:', error.message);
  }
}

// Run the test
testParentSettingsAPI();