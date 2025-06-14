// Test Email Configuration

async function testEmailConfig() {
  console.log('🔍 Testing Email Configuration');
  console.log('==============================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  
  // Test 1: Register dengan email disabled
  console.log('1. Testing registration with email disabled...');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test User Email'
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
      
      if (data.emailError) {
        console.log('   ⚠️  Email error (auto-verified):', data.emailError);
      }
      
      // Test login immediately (should work if auto-verified)
      console.log('\n2. Testing immediate login...');
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
      } else {
        const loginError = await loginResponse.json();
        console.log('   ❌ Login failed:', loginError.message);
      }
      
    } else {
      const error = await response.json();
      console.log('   ❌ Registration failed:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Registration error:', error.message);
  }
  
  console.log('\n==============================');
  console.log('📋 Email Configuration Options:');
  console.log('');
  console.log('🔧 Option 1: Disable Email (Recommended for testing)');
  console.log('   Add to .env: DISABLE_EMAIL=true');
  console.log('   Result: Auto-verify users, no OTP needed');
  console.log('');
  console.log('🔧 Option 2: Gmail SMTP');
  console.log('   SMTP_HOST=smtp.gmail.com');
  console.log('   SMTP_PORT=587');
  console.log('   SMTP_USER=your-email@gmail.com');
  console.log('   SMTP_PASS=your-app-password');
  console.log('');
  console.log('🔧 Option 3: Mailtrap (Development)');
  console.log('   SMTP_HOST=smtp.mailtrap.io');
  console.log('   SMTP_PORT=2525');
  console.log('   Get credentials from mailtrap.io');
  console.log('');
  console.log('💡 Current: Email fallback enabled (auto-verify on email fail)');
}

testEmailConfig().catch(console.error);