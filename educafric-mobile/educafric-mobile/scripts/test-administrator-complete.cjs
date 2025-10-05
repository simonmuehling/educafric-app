const fs = require('fs');

class AdministratorManagementTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.cookies = 'educafric.sid=s%3AhpH9Tv-_AHuNfb-KbRmf0Q2GNQlrknJe.oYRle7c321tYnTEyjBP88Cpu580NOjGZztxNpw5iMmQ';
    this.testResults = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const { default: fetch } = await import('node-fetch');
      const options = {
        method,
        headers: {
          'Cookie': this.cookies,
          'Content-Type': 'application/json'
        }
      };

      if (data && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const result = await response.json();
      
      return {
        status: response.status,
        ok: response.ok,
        data: result
      };
    } catch (error) {
      console.error(`❌ Request failed for ${endpoint}:`, error);
      return { status: 500, ok: false, error: error.message };
    }
  }

  async test(name, testFunction) {
    this.testResults.totalTests++;
    try {
      const result = await testFunction();
      if (result) {
        console.log(`✅ ${name}`);
        this.testResults.passed++;
      } else {
        console.log(`❌ ${name}`);
        this.testResults.failed++;
        this.testResults.errors.push(name);
      }
    } catch (error) {
      console.log(`❌ ${name} - Error: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`${name}: ${error.message}`);
    }
  }

  async runAllTests() {
    console.log('🧪 ADMINISTRATOR MANAGEMENT SYSTEM - COMPREHENSIVE TEST SUITE');
    console.log('==============================================================\n');

    // Test 1: Get current administrators (should be empty initially)
    await this.test('1. GET Administrators - Empty list', async () => {
      const response = await this.makeRequest('/api/school/1/administrators');
      return response.ok && Array.isArray(response.data) && response.data.length === 0;
    });

    // Test 2: Get available teachers for assignment
    await this.test('2. GET Available Teachers', async () => {
      const response = await this.makeRequest('/api/school/1/available-teachers');
      console.log(`   📊 Available teachers: ${response.data?.length || 0}`);
      return response.ok && Array.isArray(response.data);
    });

    // Test 3: Get module permissions
    await this.test('3. GET Module Permissions', async () => {
      const response = await this.makeRequest('/api/permissions/modules');
      const permissions = response.data;
      const expectedPermissions = ['manage_teachers', 'manage_students', 'view_reports', 'manage_classes'];
      const hasAllPermissions = expectedPermissions.every(perm => permissions.hasOwnProperty(perm));
      console.log(`   📋 Found ${Object.keys(permissions).length} permissions`);
      return response.ok && hasAllPermissions;
    });

    // Test 4: Add administrator (assistant level)
    let newAdminId = null;
    await this.test('4. POST Add Administrator (Assistant)', async () => {
      const response = await this.makeRequest('/api/school/1/administrators', 'POST', {
        teacherId: 3,
        adminLevel: 'assistant'
      });
      if (response.ok && response.data.id) {
        newAdminId = response.data.id;
        console.log(`   👤 Created admin with ID: ${newAdminId}`);
        console.log(`   🔑 Permissions: ${response.data.permissions.length} granted`);
        return true;
      }
      return false;
    });

    // Test 5: Get administrators after creation
    await this.test('5. GET Administrators - After creation', async () => {
      const response = await this.makeRequest('/api/school/1/administrators');
      const hasAdmin = response.ok && response.data.length === 1;
      if (hasAdmin) {
        console.log(`   📊 Administrator found: ${response.data[0].teacherName}`);
        console.log(`   📈 Level: ${response.data[0].adminLevel}`);
      }
      return hasAdmin;
    });

    // Test 6: Update administrator permissions
    if (newAdminId) {
      await this.test('6. PATCH Update Administrator Permissions', async () => {
        const newPermissions = ['manage_classes', 'manage_timetables', 'view_reports'];
        const response = await this.makeRequest(`/api/school/1/administrators/${newAdminId}`, 'PATCH', {
          permissions: newPermissions
        });
        if (response.ok) {
          console.log(`   🔄 Updated permissions: ${newPermissions.join(', ')}`);
          return true;
        }
        return false;
      });
    }

    // Test 7: Try adding second administrator (limited level)
    await this.test('7. POST Add Second Administrator (Limited)', async () => {
      const response = await this.makeRequest('/api/school/1/administrators', 'POST', {
        teacherId: 5,
        adminLevel: 'limited'
      });
      if (response.ok) {
        console.log(`   👤 Second admin created with limited permissions`);
        return true;
      }
      return false;
    });

    // Test 8: Try adding third administrator (should fail - max 2)
    await this.test('8. POST Third Administrator - Should fail (Max 2)', async () => {
      const response = await this.makeRequest('/api/school/1/administrators', 'POST', {
        teacherId: 6,
        adminLevel: 'assistant'
      });
      // This should fail, so we expect !response.ok
      const expectedFailure = !response.ok && response.data.message.includes('maximum 2');
      if (expectedFailure) {
        console.log(`   ⚠️  Correctly rejected: ${response.data.message}`);
      }
      return expectedFailure;
    });

    // Test 9: Get final administrator list
    await this.test('9. GET Final Administrator List', async () => {
      const response = await this.makeRequest('/api/school/1/administrators');
      const hasCorrectCount = response.ok && response.data.length === 2;
      if (hasCorrectCount) {
        console.log(`   📊 Final count: ${response.data.length} administrators`);
        response.data.forEach((admin, index) => {
          console.log(`   ${index + 1}. ${admin.teacherName} (${admin.adminLevel}) - ${admin.permissions.length} permissions`);
        });
      }
      return hasCorrectCount;
    });

    // Test 10: Remove an administrator
    if (newAdminId) {
      await this.test('10. DELETE Remove Administrator', async () => {
        const response = await this.makeRequest(`/api/school/1/administrators/${newAdminId}`, 'DELETE');
        if (response.ok) {
          console.log(`   🗑️  Successfully removed admin ${newAdminId}`);
          return true;
        }
        return false;
      });
    }

    // Test Results Summary
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Total Tests: ${this.testResults.totalTests}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.testResults.passed / this.testResults.totalTests) * 100)}%`);

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults.errors.forEach(error => console.log(`   - ${error}`));
    }

    // Save results to file
    try {
      const report = {
        timestamp: new Date().toISOString(),
        testSuite: 'Administrator Management System',
        results: this.testResults,
        details: {
          baseUrl: this.baseUrl,
          testCount: this.testResults.totalTests,
          successRate: Math.round((this.testResults.passed / this.testResults.totalTests) * 100)
        }
      };

      fs.writeFileSync('./administrator-test-report.json', JSON.stringify(report, null, 2));
      console.log('\n📄 Test report saved to: administrator-test-report.json');
    } catch (error) {
      console.log('\n⚠️  Could not save test report:', error.message);
    }

    console.log('\n🎯 ADMINISTRATOR MANAGEMENT SYSTEM TEST COMPLETE!');
    
    return this.testResults.passed === this.testResults.totalTests;
  }
}

// Run the tests
const tester = new AdministratorManagementTester();
tester.runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});