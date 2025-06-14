// Test CORS Preflight Fix

async function testCORSPreflightFix() {
  console.log('🔍 Testing CORS Preflight Fix');
  console.log('=============================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  
  // Test 1: Manual OPTIONS request
  console.log('1. Testing manual OPTIONS request...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://tunlify.biz.id',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
    console.log(`   Allow-Methods: ${response.headers.get('access-control-allow-methods')}`);
    console.log(`   Allow-Headers: ${response.headers.get('access-control-allow-headers')}`);
    console.log(`   Allow-Credentials: ${response.headers.get('access-control-allow-credentials')}`);
    
    if (response.status === 200 && response.headers.get('access-control-allow-origin')) {
      console.log('   ✅ OPTIONS Request: SUCCESS');
    } else {
      console.log('   ❌ OPTIONS Request: FAILED');
    }
  } catch (error) {
    console.log('   ❌ OPTIONS Request error:', error.message);
  }
  
  // Test 2: Health check with CORS
  console.log('\n2. Testing health check with CORS...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Origin': 'https://tunlify.biz.id'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Health Check: SUCCESS');
      console.log('   📊 CORS Enabled:', data.cors_enabled);
      console.log(`   🌐 Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
    } else {
      console.log('   ❌ Health Check failed:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Health Check error:', error.message);
  }
  
  // Test 3: Registration (the real test)
  console.log('\n3. Testing registration with full CORS...');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test CORS Preflight Fix'
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
    console.log(`   Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Registration: SUCCESS');
      console.log('   📧 Email:', testUser.email);
      console.log('   🎉 CORS PREFLIGHT FIXED!');
    } else {
      const error = await response.json();
      console.log('   ❌ Registration failed:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Registration error:', error.message);
    
    if (error.message.includes('CORS')) {
      console.log('   💡 Still CORS issue');
    } else if (error.message.includes('Failed to fetch')) {
      console.log('   💡 Network/SSL issue');
    } else {
      console.log('   💡 Different error - CORS might be working');
    }
  }
  
  // Test 4: Server locations (simple GET)
  console.log('\n4. Testing server locations...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/server-locations`, {
      method: 'GET',
      headers: {
        'Origin': 'https://tunlify.biz.id'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Server Locations: SUCCESS');
      console.log('   📊 Locations count:', data.length);
    } else {
      console.log('   ❌ Server Locations failed:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Server Locations error:', error.message);
  }
  
  console.log('\n=============================');
  console.log('📋 CORS Preflight Fix Summary:');
  console.log('   🔧 Added explicit OPTIONS handler');
  console.log('   🔧 Enhanced CORS configuration');
  console.log('   🔧 Added Access-Control-Max-Age');
  console.log('   🔧 Comprehensive headers support');
  
  console.log('\n🎯 Expected Result:');
  console.log('   ✅ OPTIONS requests return 200 with CORS headers');
  console.log('   ✅ Registration works from frontend');
  console.log('   ✅ No "No Access-Control-Allow-Origin header" errors');
}

testCORSPreflightFix().catch(console.error);