#!/usr/bin/env node

/**
 * Complete Notification System Test
 * Tests all notification functionalities including in-app, PWA, SMS, and email notifications
 */

const http = require('http');

class NotificationSystemTester {
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
          'User-Agent': 'NotificationSystemTester/1.0'
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
    console.log('\n🔑 [AUTH] Testing Notification System Authentication...');
    
    // Test with teacher account for notification testing
    const credentials = [
      { email: 'teacher.sandbox@educafric.com', password: 'test123' },
      { email: 'parent.demo@test.educafric.com', password: 'demo123' },
      { email: 'admin.demo@test.educafric.com', password: 'demo123' }
    ];

    for (const cred of credentials) {
      console.log(`🔍 Trying login: ${cred.email} / ${cred.password}`);
      
      const response = await this.makeRequest('POST', '/api/auth/login', cred);
      
      if (response.statusCode === 200) {
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
    
    throw new Error('All notification system login attempts failed');
  }

  async testNotificationAPI(name, endpoint, testData = null) {
    console.log(`\n🧪 [TEST] ${name}`);
    console.log(`📡 [API] ${testData ? 'POST' : 'GET'} ${endpoint}`);
    
    const startTime = Date.now();
    const response = await this.makeRequest(testData ? 'POST' : 'GET', endpoint, testData);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log(`✅ [API] Response: ${response.statusCode} (${responseTime}ms)`);
      
      const data = response.data;
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          console.log(`📊 [DATA] Records: ${data.length}`);
        } else {
          const fields = Object.keys(data);
          console.log(`🔍 [FIELDS] Available: ${fields.slice(0, 5).join(', ')}${fields.length > 5 ? '...' : ''}`);
        }
      }
      
      return { success: true, responseTime, data };
    } else {
      console.log(`❌ [API] Response: ${response.statusCode} (${responseTime}ms)`);
      console.log(`💥 [ERROR] ${response.data.message || response.data || 'Unknown error'}`);
      return { success: false, responseTime, error: response.data };
    }
  }

  async runCompleteNotificationTest() {
    console.log('🚀 [NOTIFICATION_SYSTEM_TEST] Starting Complete Notification System Test');
    console.log('=====================================');

    try {
      // Step 1: Authentication
      this.user = await this.login();

      // Step 2: Test Notification API Endpoints
      const tests = [
        {
          name: 'In-App Notification - Success Test',
          endpoint: '/api/notifications/send',
          testData: {
            type: 'success',
            title: 'Test Success Notification',
            message: 'This is a test success notification from API',
            category: 'system',
            priority: 'medium'
          }
        },
        {
          name: 'In-App Notification - Grade Alert',
          endpoint: '/api/notifications/send',
          testData: {
            type: 'grade',
            title: 'Nouvelle Note Disponible',
            message: 'Une nouvelle note a été ajoutée en Mathématiques: 18/20',
            category: 'educational',
            priority: 'high'
          }
        },
        {
          name: 'SMS Notification - Emergency Test',
          endpoint: '/api/notifications/sms/send',
          testData: {
            to: '+237656200472',
            message: 'TEST EDUCAFRIC: Alerte urgente - Votre enfant a activé le bouton SOS',
            type: 'emergency'
          }
        },
        {
          name: 'Email Notification - Grade Report',
          endpoint: '/api/emails/grade-report',
          testData: {
            studentName: 'Junior Kamga',
            subject: 'Mathématiques',
            grade: '18/20',
            parentEmail: 'parent.test@educafric.com'
          }
        },
        {
          name: 'WhatsApp Notification Test',
          endpoint: '/api/whatsapp/send-message',
          testData: {
            to: '+237656200472',
            message: 'TEST EDUCAFRIC: Bulletin scolaire disponible pour Junior Kamga'
          }
        },
        {
          name: 'Notification History/Logs',
          endpoint: '/api/notifications/history'
        },
        {
          name: 'Notification Preferences',
          endpoint: '/api/notifications/preferences'
        },
        {
          name: 'PWA Push Notification Test',
          endpoint: '/api/notifications/push/test',
          testData: {
            title: 'EDUCAFRIC Test',
            body: 'Test de notification push PWA',
            icon: '/favicon.ico'
          }
        }
      ];

      const results = [];
      for (const test of tests) {
        const result = await this.testNotificationAPI(test.name, test.endpoint, test.testData);
        results.push({ ...test, ...result });
        
        // Wait between tests to avoid overwhelming the system
        if (test.testData) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Step 3: Results Summary
      console.log('\n=====================================');
      console.log('📊 [RESULTS] Complete Notification System Test Results');
      console.log('=====================================');
      
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const successRate = ((passed / results.length) * 100).toFixed(1);
      
      console.log(`✅ Passed: ${passed}/${results.length}`);
      console.log(`❌ Failed: ${failed}/${results.length}`);
      console.log(`📈 Success Rate: ${successRate}%`);

      // Categorize results
      const inAppTests = results.filter(r => r.endpoint.includes('/notifications/send'));
      const smsTests = results.filter(r => r.endpoint.includes('/sms/'));
      const emailTests = results.filter(r => r.endpoint.includes('/emails/'));
      const whatsappTests = results.filter(r => r.endpoint.includes('/whatsapp/'));
      const pwaTests = results.filter(r => r.endpoint.includes('/push/'));

      console.log('\n📱 [IN-APP NOTIFICATIONS]');
      inAppTests.forEach(test => {
        console.log(`${test.success ? '✅' : '❌'} ${test.name}`);
      });

      console.log('\n📞 [SMS NOTIFICATIONS]');
      smsTests.forEach(test => {
        console.log(`${test.success ? '✅' : '❌'} ${test.name}`);
      });

      console.log('\n📧 [EMAIL NOTIFICATIONS]');
      emailTests.forEach(test => {
        console.log(`${test.success ? '✅' : '❌'} ${test.name}`);
      });

      console.log('\n💚 [WHATSAPP NOTIFICATIONS]');
      whatsappTests.forEach(test => {
        console.log(`${test.success ? '✅' : '❌'} ${test.name}`);
      });

      console.log('\n🔔 [PWA PUSH NOTIFICATIONS]');
      pwaTests.forEach(test => {
        console.log(`${test.success ? '✅' : '❌'} ${test.name}`);
      });

      if (successRate === '100.0') {
        console.log('\n🎉 [SUCCESS] All notification systems are fully operational!');
        console.log('🔥 [STATUS] Complete notification infrastructure ready');
      } else if (parseFloat(successRate) >= 70) {
        console.log('\n⚠️ [PARTIAL SUCCESS] Most notification systems operational');
        console.log(`📊 [STATUS] ${successRate}% of notification features working`);
      } else {
        console.log('\n⚠️ [WARNING] Notification systems need attention');
        
        const failedTests = results.filter(r => !r.success);
        for (const test of failedTests) {
          console.log(`❌ [FAILED] ${test.name}: ${test.error?.message || 'Unknown error'}`);
        }
      }

    } catch (error) {
      console.log(`💥 [FATAL] Notification system test failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the test
const tester = new NotificationSystemTester();
tester.runCompleteNotificationTest();