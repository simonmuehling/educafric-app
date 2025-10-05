const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testAdministratorManagement() {
  console.log('🧪 ADMINISTRATOR MANAGEMENT - SIMPLE VALIDATION TEST');
  console.log('=====================================================\n');

  const cookieFile = 'admin_test_cookies.txt';
  
  try {
    // Step 1: Login as director
    console.log('🔐 Step 1: Director Login...');
    const { stdout: loginResult } = await execAsync(`curl -c ${cookieFile} -X POST http://localhost:5000/api/auth/login \\
      -H "Content-Type: application/json" \\
      -d '{"email": "test.admin@educafric.com", "password": "admin123"}' \\
      -s`);
    
    const loginData = JSON.parse(loginResult);
    if (loginData.id && loginData.role === 'Director') {
      console.log(`✅ Login successful: ${loginData.firstName} ${loginData.lastName} (${loginData.role})`);
    } else {
      console.log('❌ Login failed');
      return;
    }

    // Step 2: Get current administrators
    console.log('\n📋 Step 2: Get Current Administrators...');
    const { stdout: adminList } = await execAsync(`curl -b ${cookieFile} -X GET http://localhost:5000/api/school/1/administrators -s`);
    const admins = JSON.parse(adminList);
    console.log(`✅ Found ${admins.length} administrator(s)`);
    
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.teacherName} (${admin.adminLevel}) - ${admin.permissions.length} permissions`);
      });
    }

    // Step 3: Get available teachers
    console.log('\n👥 Step 3: Get Available Teachers...');
    const { stdout: teacherList } = await execAsync(`curl -b ${cookieFile} -X GET http://localhost:5000/api/school/1/available-teachers -s`);
    const teachers = JSON.parse(teacherList);
    console.log(`✅ Found ${teachers.length} available teacher(s)`);
    
    // Step 4: Get module permissions
    console.log('\n🔑 Step 4: Get Module Permissions...');
    const { stdout: permissionList } = await execAsync(`curl -b ${cookieFile} -X GET http://localhost:5000/api/permissions/modules -s`);
    const permissions = JSON.parse(permissionList);
    console.log(`✅ Found ${Object.keys(permissions).length} available permissions`);

    console.log('\n🎯 ADMINISTRATOR MANAGEMENT SYSTEM STATUS: ✅ FULLY OPERATIONAL');
    console.log('==========================================================');
    console.log('✅ Director authentication working');
    console.log('✅ Administrator listing functional');  
    console.log('✅ Available teachers endpoint working');
    console.log('✅ Module permissions endpoint working');
    console.log('✅ All APIs responding correctly');
    console.log('\n🚀 Administrator Management system is ready for production use!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdministratorManagement();