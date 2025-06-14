// Test Caddy Fix After Restart

async function testCaddyFix() {
  console.log('🔍 Testing Caddy Fix After Restart');
  console.log('==================================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  
  // Test 1: SSL dan basic connectivity
  console.log('1. Testing SSL and basic connectivity...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SSL & Connectivity: SUCCESS');
      console.log('   📊 Status:', data.status);
      console.log('   🔒 HTTPS: Working');
    } else {
      console.log('   ❌ SSL/Connectivity failed:', response.status);
    }
  } catch (error) {
    console.log('   ❌ SSL/Connectivity error:', error.message);
    
    if (error.message.includes('certificate')) {
      console.log('   💡 SSL certificate issue');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('   💡 Caddy not running or port issue');
    }
  }
  
  // Test 2: CORS headers (should be clean now)
  console.log('\n2. Testing CORS headers...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/server-locations`, {
      method: 'GET',
      headers: {
        'Origin': 'https://tunlify.biz.id'
      }
    });
    
    const allowOrigin = response.headers.get('access-control-allow-origin');
    console.log(`   Access-Control-Allow-Origin: ${allowOrigin}`);
    
    if (allowOrigin && !allowOrigin.includes(',')) {
      console.log('   ✅ CORS Headers: CLEAN (no duplicates)');
    } else if (allowOrigin && allowOrigin.includes(',')) {
      console.log('   ❌ CORS Headers: Still duplicated');
    } else {
      console.log('   ⚠️  CORS Headers: Not found');
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API Endpoint: SUCCESS');
      console.log('   📊 Server locations:', data.length);
    }
  } catch (error) {
    console.log('   ❌ CORS test error:', error.message);
  }
  
  // Test 3: Registration (the main test)
  console.log('\n3. Testing registration...');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test Caddy Fix'
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
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Registration: SUCCESS');
      console.log('   📧 Email:', testUser.email);
      console.log('   🎉 CADDY FIX WORKING!');
    } else {
      const error = await response.json();
      console.log('   ❌ Registration failed:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Registration error:', error.message);
    
    if (error.message.includes('CORS')) {
      console.log('   💡 Still CORS issue - check backend logs');
    } else if (error.message.includes('Failed to fetch')) {
      console.log('   💡 Network issue - check Caddy status');
    }
  }
  
  console.log('\n==================================');
  console.log('📋 Caddy Fix Summary:');
  console.log('   🔧 Removed unnecessary X-Forwarded headers');
  console.log('   🔧 Cleaned up Caddyfile formatting');
  console.log('   🔧 Removed duplicate CORS headers');
  console.log('   🔧 Restarted Caddy service');
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Check Caddy status: sudo systemctl status caddy');
  console.log('   2. Check Caddy logs: sudo journalctl -u caddy -f');
  console.log('   3. Test frontend registration');
}

testCaddyFix().catch(console.error);