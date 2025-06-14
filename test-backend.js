const https = require('https');
const http = require('http');

// Test backend health endpoint
async function testBackendHealth() {
  console.log('🔍 Testing backend health...');
  
  try {
    const response = await fetch('http://103.127.132.1:3001/health');
    const data = await response.json();
    
    console.log('✅ Backend Health Check:');
    console.log('   Status:', data.status);
    console.log('   Environment:', data.environment);
    console.log('   Version:', data.version);
    console.log('   Timestamp:', data.timestamp);
    
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    return false;
  }
}

// Test backend API endpoints
async function testBackendAPI() {
  console.log('\n🔍 Testing backend API endpoints...');
  
  const endpoints = [
    { path: '/api/server-locations', method: 'GET', description: 'Server Locations' },
    { path: '/api/content/landing?lang=en', method: 'GET', description: 'Landing Content' },
    { path: '/api/content/pricing?lang=en', method: 'GET', description: 'Pricing Content' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint.description}...`);
      const response = await fetch(`http://103.127.132.1:3001${endpoint.path}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint.description}: OK`);
        console.log(`   📊 Response size: ${JSON.stringify(data).length} bytes`);
      } else {
        console.log(`   ❌ ${endpoint.description}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.description}: ${error.message}`);
    }
  }
}

// Test login endpoint
async function testLogin() {
  console.log('\n🔍 Testing login endpoint...');
  
  try {
    const response = await fetch('http://103.127.132.1:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@tunlify.net',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Login: SUCCESS');
      console.log('   👤 User:', data.user.name, `(${data.user.role})`);
      console.log('   🔑 Token received:', data.token ? 'YES' : 'NO');
      return data.token;
    } else {
      const error = await response.json();
      console.log('   ❌ Login failed:', error.message);
      return null;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return null;
  }
}

// Test authenticated endpoint
async function testAuthenticatedEndpoint(token) {
  if (!token) {
    console.log('\n⏭️  Skipping authenticated endpoint test (no token)');
    return;
  }
  
  console.log('\n🔍 Testing authenticated endpoint...');
  
  try {
    const response = await fetch('http://103.127.132.1:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Auth endpoint: SUCCESS');
      console.log('   👤 Current user:', data.name, `(${data.email})`);
    } else {
      console.log('   ❌ Auth endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Auth endpoint error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Tunlify Backend Test Suite');
  console.log('================================\n');
  
  const healthOk = await testBackendHealth();
  
  if (healthOk) {
    await testBackendAPI();
    const token = await testLogin();
    await testAuthenticatedEndpoint(token);
  }
  
  console.log('\n================================');
  console.log('✅ Test suite completed!');
}

// Run tests
runTests().catch(console.error);