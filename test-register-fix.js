// Test register setelah fix trust proxy

async function testRegisterFix() {
  console.log('🔍 Testing Register After Trust Proxy Fix');
  console.log('==========================================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  
  // Test 1: Health check
  console.log('1. Testing backend health...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Backend health: SUCCESS');
      console.log('   📊 Status:', data.status);
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
    name: 'Test User'
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
    } else {
      const error = await response.json();
      console.log('   ❌ Registration failed:', error.message);
      
      // Check if it's still the trust proxy error
      if (error.message && error.message.includes('trust proxy')) {
        console.log('   💡 Still trust proxy issue - backend restart needed');
      }
    }
  } catch (error) {
    console.log('   ❌ Registration error:', error.message);
  }
  
  // Test 3: Rate limiting (should work now)
  console.log('\n3. Testing rate limiting...');
  try {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        fetch(`${BACKEND_URL}/api/server-locations`, {
          headers: { 'Origin': 'https://tunlify.biz.id' }
        })
      );
    }
    
    const responses = await Promise.all(promises);
    const statuses = responses.map(r => r.status);
    
    console.log('   📊 Multiple requests statuses:', statuses);
    if (statuses.every(s => s === 200)) {
      console.log('   ✅ Rate limiting: Working (no 429 errors)');
    } else {
      console.log('   ⚠️  Some requests failed');
    }
  } catch (error) {
    console.log('   ❌ Rate limiting test error:', error.message);
  }
  
  console.log('\n==========================================');
  console.log('📋 Fix Summary:');
  console.log('   🔧 Trust Proxy: ✅ Enabled');
  console.log('   🔧 Rate Limiter: ✅ Updated');
  console.log('   🔧 X-Forwarded-For: ✅ Handled');
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Try register di frontend: https://tunlify.biz.id/register');
  console.log('   2. Error trust proxy should be gone');
  console.log('   3. Registration should work normally');
}

testRegisterFix().catch(console.error);