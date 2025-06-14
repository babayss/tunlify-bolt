// Test CORS Fix - No More Duplicate Headers

async function testCORSFix() {
  console.log('🔍 Testing CORS Fix - No Duplicate Headers');
  console.log('==========================================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  
  // Test 1: Health check with CORS headers inspection
  console.log('1. Testing health endpoint CORS headers...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Origin': 'https://tunlify.biz.id'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log('   CORS Headers:');
    
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials'
    ];
    
    corsHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        console.log(`   - ${header}: ${value}`);
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Health check: SUCCESS');
    }
  } catch (error) {
    console.log('   ❌ Health check error:', error.message);
  }
  
  // Test 2: Registration with CORS
  console.log('\n2. Testing registration with CORS...');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test CORS Fix'
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
    
    // Check for duplicate CORS headers
    const allowOrigin = response.headers.get('access-control-allow-origin');
    console.log(`   Access-Control-Allow-Origin: ${allowOrigin}`);
    
    if (allowOrigin && allowOrigin.includes(',')) {
      console.log('   ❌ DUPLICATE CORS HEADERS DETECTED!');
    } else {
      console.log('   ✅ CORS Headers: CLEAN (no duplicates)');
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Registration: SUCCESS');
      console.log('   📧 Email:', testUser.email);
      console.log('   🎉 NO CORS ERRORS!');
    } else {
      const error = await response.json();
      console.log('   ❌ Registration failed:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Registration error:', error.message);
    
    if (error.message.includes('CORS')) {
      console.log('   💡 Still CORS issue');
    } else {
      console.log('   💡 Different error - CORS might be fixed');
    }
  }
  
  // Test 3: Preflight OPTIONS request
  console.log('\n3. Testing preflight OPTIONS request...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://tunlify.biz.id',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
    console.log(`   Allow-Methods: ${response.headers.get('access-control-allow-methods')}`);
    
    if (response.status === 200) {
      console.log('   ✅ Preflight: SUCCESS');
    }
  } catch (error) {
    console.log('   ❌ Preflight error:', error.message);
  }
  
  console.log('\n==========================================');
  console.log('📋 CORS Fix Summary:');
  console.log('   🔧 Backend: Single CORS configuration with origin function');
  console.log('   🔧 Caddy: Removed duplicate CORS headers');
  console.log('   🔧 Express: Using cors() middleware only');
  
  console.log('\n🎯 Expected Result:');
  console.log('   ✅ No duplicate Access-Control-Allow-Origin headers');
  console.log('   ✅ Registration should work from frontend');
  console.log('   ✅ No CORS policy errors in browser');
}

testCORSFix().catch(console.error);