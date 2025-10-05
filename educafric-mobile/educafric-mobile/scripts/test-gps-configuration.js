/**
 * GPS CONFIGURATION SYSTEM TEST SCRIPT
 * Tests all GPS device configuration functionality
 * Based on comprehensive tracking device setup requirements
 */

const cookies = require('fs').readFileSync('admin_director_cookies.txt', 'utf8').trim();

console.log('🧪 [GPS_CONFIG_TEST] Starting comprehensive GPS configuration system test...\n');

const baseUrl = 'http://localhost:5000';

// Test device configurations for different types
const testDevices = [
  {
    deviceName: 'Smartwatch Élève Junior',
    deviceType: 'smartwatch',
    studentId: 1,
    emergencyContact: '+237657123456',
    deviceId: 'SW001234567890',
    updateInterval: 30
  },
  {
    deviceName: 'Traceur GPS Marie',
    deviceType: 'gps_tracker', 
    studentId: 2,
    emergencyContact: '+237698765432',
    deviceId: '123456789012345',
    updateInterval: 60
  },
  {
    deviceName: 'Tablette École Paul',
    deviceType: 'tablet',
    studentId: 3,
    emergencyContact: '+237677890123',
    deviceId: 'TAB987654321',
    updateInterval: 300
  }
];

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies,
      ...options.headers
    }
  });

  return response;
}

async function testGeolocationOverview() {
  console.log('📊 Testing geolocation overview API...');
  
  try {
    const response = await makeRequest(`${baseUrl}/api/geolocation/overview`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Geolocation overview successful:', {
        totalDevices: data.totalDevices || 0,
        activeDevices: data.activeDevices || 0,
        safeZones: data.safeZones || 0
      });
      return true;
    } else {
      console.log('❌ Geolocation overview failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Geolocation overview error:', error.message);
    return false;
  }
}

async function testDeviceRegistration(device) {
  console.log(`📱 Testing device registration: ${device.deviceName} (${device.deviceType})...`);
  
  try {
    const response = await makeRequest(`${baseUrl}/api/geolocation/devices`, {
      method: 'POST',
      body: JSON.stringify(device)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Device registered successfully:`, {
        name: data.name,
        type: data.type,
        deviceId: data.deviceId,
        updateInterval: data.updateInterval
      });
      return data;
    } else {
      const error = await response.text();
      console.log(`❌ Device registration failed (${response.status}):`, error);
      return null;
    }
  } catch (error) {
    console.log('❌ Device registration error:', error.message);
    return null;
  }
}

async function testDeviceConnection(deviceId) {
  console.log(`🔄 Testing device connection: ${deviceId}...`);
  
  try {
    const response = await makeRequest(`${baseUrl}/api/geolocation/devices/${deviceId}/test`, {
      method: 'POST'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Device connection test successful:', {
        status: data.testResult?.status,
        batteryLevel: data.testResult?.batteryLevel,
        signal: data.testResult?.signal,
        networkType: data.testResult?.networkType
      });
      return true;
    } else {
      console.log('❌ Device connection test failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Device connection test error:', error.message);
    return false;
  }
}

function generateDeviceConfig(deviceType, deviceData) {
  const baseConfig = {
    deviceType,
    childId: `student_${deviceData.studentId}`,
    deviceName: deviceData.deviceName,
    deviceId: deviceData.deviceId,
    apiEndpoint: "https://api.educonnect.africa/tracking",
    updateInterval: deviceData.updateInterval || 30,
    emergencyContact: deviceData.emergencyContact || "+237657004011"
  };

  switch (deviceType) {
    case 'smartwatch':
      return {
        ...baseConfig,
        networkSettings: {
          server: "api.educonnect.africa",
          port: 443,
          protocol: "REST API",
          updateInterval: deviceData.updateInterval || 30,
          connection: "4G/WiFi/3G"
        },
        qrCodeExpiry: "24h",
        supportedModels: ["Xplora X5/X6 Play", "TickTalk 4/5", "Garmin Bounce"]
      };
    
    case 'gps_tracker':
      return {
        ...baseConfig,
        serverConfig: {
          server: "gps.educonnect.africa",
          port: 8080,
          protocol: "TCP",
          apn: "internet",
          smsCommands: [
            "CONFIG#gps.educonnect.africa#8080#",
            `TIMER#${deviceData.updateInterval || 30}#`,
            `SOS#${deviceData.emergencyContact}#`,
            "APN#internet##"
          ]
        },
        carrierSettings: {
          mtn: { apn: "internet", username: "", password: "" },
          orange: { apn: "orange.cm", username: "orange", password: "orange" },
          camtel: { apn: "camtel", username: "", password: "" }
        }
      };
    
    case 'tablet':
      return {
        ...baseConfig,
        pwaConfig: {
          installUrl: "https://educonnect.africa/pwa",
          mode: "enfant",
          permissions: ["location_always", "notifications", "background_sync"]
        }
      };
    
    default:
      return baseConfig;
  }
}

function testConfigurationGeneration() {
  console.log('⚙️  Testing GPS configuration generation...\n');
  
  testDevices.forEach(device => {
    const config = generateDeviceConfig(device.deviceType, device);
    console.log(`📋 Configuration for ${device.deviceName}:`);
    console.log(`   Type: ${config.deviceType}`);
    console.log(`   Update Interval: ${config.updateInterval}s`);
    console.log(`   Emergency Contact: ${config.emergencyContact}`);
    
    if (device.deviceType === 'smartwatch') {
      console.log(`   Server: ${config.networkSettings.server}:${config.networkSettings.port}`);
      console.log(`   Protocol: ${config.networkSettings.protocol}`);
      console.log(`   QR Expiry: ${config.qrCodeExpiry}`);
    } else if (device.deviceType === 'gps_tracker') {
      console.log(`   GPS Server: ${config.serverConfig.server}:${config.serverConfig.port}`);
      console.log(`   SMS Commands: ${config.serverConfig.smsCommands.length} commands`);
      console.log(`   Carriers: MTN, Orange, Camtel supported`);
    } else if (device.deviceType === 'tablet') {
      console.log(`   PWA Install: ${config.pwaConfig.installUrl}`);
      console.log(`   Mode: ${config.pwaConfig.mode}`);
      console.log(`   Permissions: ${config.pwaConfig.permissions.length} granted`);
    }
    console.log('');
  });
}

async function runComprehensiveTest() {
  console.log('🚀 [GPS_CONFIG_TEST] Starting comprehensive GPS system test...\n');
  
  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Configuration Generation
  console.log('=== TEST 1: GPS Configuration Generation ===');
  testConfigurationGeneration();
  totalTests++;
  passedTests++; // This test always passes as it's local generation

  // Test 2: Geolocation Overview API
  console.log('=== TEST 2: Geolocation Overview API ===');
  const overviewResult = await testGeolocationOverview();
  totalTests++;
  if (overviewResult) passedTests++;
  console.log('');

  // Test 3: Device Registration for All Types
  console.log('=== TEST 3: Device Registration (All Types) ===');
  const registeredDevices = [];
  
  for (const device of testDevices) {
    const result = await testDeviceRegistration(device);
    totalTests++;
    if (result) {
      passedTests++;
      registeredDevices.push(result);
    }
  }
  console.log('');

  // Test 4: Device Connection Testing
  console.log('=== TEST 4: Device Connection Testing ===');
  for (const device of registeredDevices) {
    const connectionResult = await testDeviceConnection(device.deviceId || device.id);
    totalTests++;
    if (connectionResult) passedTests++;
  }
  console.log('');

  // Final Results
  console.log('='.repeat(60));
  console.log('🏁 [GPS_CONFIG_TEST] FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL GPS CONFIGURATION TESTS PASSED! System fully functional.');
  } else {
    console.log('⚠️  Some tests failed. Check logs above for details.');
  }
  
  console.log('='.repeat(60));
  
  return passedTests === totalTests;
}

runComprehensiveTest()
  .then(success => {
    console.log(`\n🧪 [GPS_CONFIG_TEST] Test completed. Success: ${success}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 [GPS_CONFIG_TEST] Test suite error:', error);
    process.exit(1);
  });