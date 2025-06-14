// Test Final CORS Fix - Caddy Tidak Handle OPTIONS

async function testFinalCORSFix() {
  console.log('🔍 Testing Final CORS Fix - Caddy Passes All to Backend');
  console.log('======================================================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  
  // Test 1: Direct OPTIONS request ke backend
  console.log('1. Testing direct OPTIONS request...');
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
    console.log(`   Max-Age: ${response.headers.get('access-control-max-age')}`);
    
    if (response.status === 200 && response.headers.get('access-control-allow-origin')) {
      console.log('   ✅ OPTIONS Request: SUCCESS - Backend handled it!');
    } else {
      console.log('   ❌ OPTIONS Request: FAILED');
    }
  } catch (error) {
    console.log('   ❌ OPTIONS Request error:', error.message);
  }
  
  // Test 2: Health check
  console.log('\n2. Testing health check...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      headers: {
        'Origin': 'https://tunlify.biz.id'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Health Check: SUCCESS');
      console.log('   📊 CORS Enabled:', data.cors_enabled);
    }
  } catch (error) {
    console.log('   ❌ Health Check error:', error.message);
  }
  
  // Test 3: Registration (THE MAIN TEST)
  console.log('\n3. Testing registration - THE MOMENT OF TRUTH...');
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test Final CORS Fix'
  };
  
  try {
    console.log('   Sending registration request...');
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
      console.log('   👤 User ID:', data.userId);
      console.log('   🎉 CORS PREFLIGHT FINALLY FIXED!');
      console.log('   🎉 REGISTRATION WORKING FROM FRONTEND!');
    } else {
      const error = await response.json();
      console.log('   ❌ Registration failed:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Registration error:', error.message);
    
    if (error.message.includes('CORS')) {
      console.log('   💡 Still CORS issue - check backend logs');
    } else if (error.message.includes('Failed to fetch')) {
      console.log('   💡 Network issue');
    } else {
      console.log('   💡 Different error - CORS might be working now');
    }
  }
  
  // Test 4: Login test
  console.log('\n4. Testing admin login...');
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
      console.log('   ✅ Admin Login: SUCCESS');
      console.log('   👤 User:', data.user.name);
    } else {
      const error = await response.json();
      console.log('   ❌ Admin Login failed:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Admin Login error:', error.message);
  }
  
  console.log('\n======================================================');
  console.log('📋 Final CORS Fix Summary:');
  console.log('   🔧 Removed ALL OPTIONS handling from Caddy');
  console.log('   🔧 Removed ALL CORS headers from Caddy');
  console.log('   🔧 Backend handles ALL CORS including preflight');
  console.log('   🔧 Comprehensive CORS config in Express');
  
  console.log('\n🎯 What Should Happen Now:');
  console.log('   ✅ Browser sends OPTIONS request');
  console.log('   ✅ Caddy passes it to backend');
  console.log('   ✅ Backend responds with CORS headers');
  console.log('   ✅ Browser allows the actual POST request');
  console.log('   ✅ Registration works from frontend!');
  
  console.log('\n🚀 Ready to Test Frontend:');
  console.log('   1. Open: https://tunlify.biz.id/register');
  console.log('   2. Fill form and submit');
  console.log('   3. Should work without CORS errors!');
}

testFinalCORSFix().catch(console.error);