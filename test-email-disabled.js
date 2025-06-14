// Test Email Disabled Configuration

async function testEmailDisabled() {
  console.log('🔍 Testing Email Disabled Configuration');
  console.log('======================================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  
  // Test 1: Health check
  console.log('1. Testing backend health...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Backend health: SUCCESS');
      console.log('   📊 Status:', data.status);
      console.log('   🌐 Environment:', data.environment);
    } else {
      console.log('   ❌ Backend health failed:', response.status);
      return;
    }
  } catch (error) {
    console.log('   ❌ Backend health error:', error.message);
    return;
  }
  
  // Test 2: Register new user (should auto-verify)
  console.log('\n2. Testing registration with email disabled...');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test User Auto Verify'
  };
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://tunlify.biz.id'
      },
      body: JSON.stringify(testUser)
    });
    
    console.log(`   Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Registration: SUCCESS');
      console.log('   📧 Email:', testUser.email);
      console.log('   👤 User ID:', data.userId);
      console.log('   🔄 Auto verified:', data.autoVerified || false);
      
      if (data.message.includes('email disabled')) {
        console.log('   🎉 EMAIL DISABLED WORKING!');
      }
      
      // Test immediate login (should work since auto-verified)
      console.log('\n3. Testing immediate login...');
      const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://tunlify.biz.id'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('   ✅ Login: SUCCESS');
        console.log('   👤 User:', loginData.user.name);
        console.log('   ✅ Verified:', loginData.user.is_verified);
        console.log('   🎉 NO OTP NEEDED!');
      } else {
        const loginError = await loginResponse.json();
        console.log('   ❌ Login failed:', loginError.message);
      }
      
    } else {
      const error = await response.json();
      console.log('   ❌ Registration failed:', error.message);
      
      if (error.message && error.message.includes('email')) {
        console.log('   💡 Email still being sent - PM2 restart needed');
      }
    }
  } catch (error) {
    console.log('   ❌ Registration error:', error.message);
  }
  
  console.log('\n======================================');
  console.log('📋 Email Disabled Status:');
  console.log('   🔧 DISABLE_EMAIL=true');
  console.log('   🔧 SMTP config commented out');
  console.log('   🔧 PM2 restarted with --update-env');
  
  console.log('\n🎯 Expected Behavior:');
  console.log('   ✅ No email sending attempts');
  console.log('   ✅ Users auto-verified on registration');
  console.log('   ✅ Can login immediately without OTP');
  console.log('   ✅ No SMTP timeout errors');
}

testEmailDisabled().catch(console.error);