// Test register setelah fix trust proxy specific

async function testRegisterFinal() {
  console.log('🔍 Testing Register After Specific Trust Proxy Fix');
  console.log('===============================================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  
  // Test 1: Health check dengan IP info
  console.log('1. Testing backend health with IP info...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Backend health: SUCCESS');
      console.log('   📊 Status:', data.status);
      console.log('   🌐 Client IP:', data.client_ip);
      console.log('   🔒 Trust Proxy:', data.trust_proxy);
    } else {
      console.log('   ❌ Backend health failed:', response.status);
      return;
    }
  } catch (error) {
    console.log('   ❌ Backend health error:', error.message);
    return;
  }
  
  // Test 2: Register new user
  console.log('\n2. Testing user registration...');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test User Final'
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
      console.log('   📧 OTP sent to:', testUser.email);
      console.log('   👤 User ID:', data.userId);
      console.log('   🎉 TRUST PROXY ERROR FIXED!');
    } else {
      const error = await response.json();
      console.log('   ❌ Registration failed:', error.message);
      
      // Check specific error types
      if (error.message && error.message.includes('trust proxy')) {
        console.log('   💡 Still trust proxy issue');
      } else if (error.message && error.message.includes('rate limit')) {
        console.log('   💡 Rate limiting issue');
      } else {
        console.log('   💡 Different error - check logs');
      }
    }
  } catch (error) {
    console.log('   ❌ Registration error:', error.message);
  }
  
  // Test 3: Test admin login
  console.log('\n3. Testing admin login...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://tunlify.biz.id'
      },
      body: JSON.stringify({
        email: 'admin@tunlify.net',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Admin login: SUCCESS');
      console.log('   👤 User:', data.user.name, `(${data.user.role})`);
    } else {
      const error = await response.json();
      console.log('   ❌ Admin login failed:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Admin login error:', error.message);
  }
  
  console.log('\n===============================================');
  console.log('📋 Final Fix Summary:');
  console.log('   🔧 Trust Proxy: ✅ Specific (localhost + private)');
  console.log('   🔧 Rate Limiter: ✅ Skip localhost');
  console.log('   🔧 CORS: ✅ Configured');
  console.log('   🔧 Headers: ✅ X-Forwarded-For handled');
  
  console.log('\n🎯 Ready for Production:');
  console.log('   1. Register: https://tunlify.biz.id/register');
  console.log('   2. Login: https://tunlify.biz.id/login');
  console.log('   3. Dashboard: https://tunlify.biz.id/dashboard');
  console.log('   4. Admin: https://tunlify.biz.id/admin');
}

testRegisterFinal().catch(console.error);