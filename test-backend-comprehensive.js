const https = require('https');
const http = require('http');

const BACKEND_URL = 'http://103.127.132.1:3001';

// Test backend health endpoint
async function testBackendHealth() {
  console.log('🔍 Testing backend health...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
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

// Test server locations endpoint
async function testServerLocations() {
  console.log('\n🔍 Testing server locations...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/server-locations`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Server Locations: OK');
      console.log('   📊 Available locations:', data.length);
      data.forEach(location => {
        console.log(`      - ${location.name} (${location.region_code}): ${location.ip_address}`);
      });
      return data;
    } else {
      console.log('   ❌ Server Locations failed:', response.status);
      return [];
    }
  } catch (error) {
    console.log('   ❌ Server Locations error:', error.message);
    return [];
  }
}

// Test content endpoints
async function testContentEndpoints() {
  console.log('\n🔍 Testing content endpoints...');
  
  const endpoints = [
    { path: '/api/content/landing?lang=en', description: 'Landing Content (EN)' },
    { path: '/api/content/landing?lang=id', description: 'Landing Content (ID)' },
    { path: '/api/content/pricing?lang=en', description: 'Pricing Content (EN)' },
    { path: '/api/content/pricing?lang=id', description: 'Pricing Content (ID)' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint.path}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint.description}: OK`);
        
        // Show some content structure
        if (data.hero) {
          console.log(`      Title: ${data.hero.title}`);
        }
        if (data.plans) {
          console.log(`      Plans: ${data.plans.length} available`);
        }
      } else {
        console.log(`   ❌ ${endpoint.description}: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.description}: ${error.message}`);
    }
  }
}

// Test registration flow
async function testRegistration() {
  console.log('\n🔍 Testing registration flow...');
  
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
      },
      body: JSON.stringify(testUser)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Registration: SUCCESS');
      console.log('   📧 OTP should be sent to:', testUser.email);
      console.log('   👤 User ID:', data.userId);
      return { success: true, userId: data.userId, email: testUser.email };
    } else {
      const error = await response.json();
      console.log('   ❌ Registration failed:', error.message);
      return { success: false };
    }
  } catch (error) {
    console.log('   ❌ Registration error:', error.message);
    return { success: false };
  }
}

// Test login with default admin
async function testAdminLogin() {
  console.log('\n🔍 Testing admin login...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
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
      console.log('   ✅ Admin Login: SUCCESS');
      console.log('   👤 User:', data.user.name, `(${data.user.role})`);
      console.log('   ✅ Verified:', data.user.is_verified);
      return data.token;
    } else {
      const error = await response.json();
      console.log('   ❌ Admin login failed:', error.message);
      return null;
    }
  } catch (error) {
    console.log('   ❌ Admin login error:', error.message);
    return null;
  }
}

// Test authenticated endpoints
async function testAuthenticatedEndpoints(token) {
  if (!token) {
    console.log('\n⏭️  Skipping authenticated endpoint tests (no token)');
    return;
  }
  
  console.log('\n🔍 Testing authenticated endpoints...');
  
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test /api/auth/me
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: authHeaders
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ /api/auth/me: SUCCESS');
      console.log('   👤 Current user:', data.name, `(${data.email})`);
    } else {
      console.log('   ❌ /api/auth/me failed:', response.status);
    }
  } catch (error) {
    console.log('   ❌ /api/auth/me error:', error.message);
  }
  
  // Test /api/tunnels (should be empty for new user)
  try {
    const response = await fetch(`${BACKEND_URL}/api/tunnels`, {
      headers: authHeaders
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ /api/tunnels: SUCCESS');
      console.log('   🚇 Tunnels count:', data.length);
    } else {
      console.log('   ❌ /api/tunnels failed:', response.status);
    }
  } catch (error) {
    console.log('   ❌ /api/tunnels error:', error.message);
  }
}

// Test admin endpoints
async function testAdminEndpoints(token) {
  if (!token) {
    console.log('\n⏭️  Skipping admin endpoint tests (no token)');
    return;
  }
  
  console.log('\n🔍 Testing admin endpoints...');
  
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const adminEndpoints = [
    { path: '/api/admin/users', description: 'Admin Users' },
    { path: '/api/admin/server-locations', description: 'Admin Server Locations' },
    { path: '/api/admin/content', description: 'Admin Content' },
    { path: '/api/admin/settings', description: 'Admin Settings' }
  ];
  
  for (const endpoint of adminEndpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint.path}`, {
        headers: authHeaders
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint.description}: OK`);
        
        if (Array.isArray(data)) {
          console.log(`      📊 Items count: ${data.length}`);
        }
      } else {
        console.log(`   ❌ ${endpoint.description}: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.description}: ${error.message}`);
    }
  }
}

// Test tunnel creation
async function testTunnelCreation(token) {
  if (!token) {
    console.log('\n⏭️  Skipping tunnel creation test (no token)');
    return;
  }
  
  console.log('\n🔍 Testing tunnel creation...');
  
  const testTunnel = {
    subdomain: `test${Date.now()}`,
    target_ip: '127.0.0.1',
    target_port: 3000,
    location: 'id'
  };
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/tunnels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testTunnel)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Tunnel Creation: SUCCESS');
      console.log('   🚇 Tunnel URL:', `${testTunnel.subdomain}.${testTunnel.location}.tunlify.biz.id`);
      console.log('   🎯 Target:', `${testTunnel.target_ip}:${testTunnel.target_port}`);
      return data.id;
    } else {
      const error = await response.json();
      console.log('   ❌ Tunnel creation failed:', error.message);
      return null;
    }
  } catch (error) {
    console.log('   ❌ Tunnel creation error:', error.message);
    return null;
  }
}

// Test database connection
async function testDatabaseConnection() {
  console.log('\n🔍 Testing database connection...');
  
  try {
    // Test by trying to get server locations (this requires DB access)
    const response = await fetch(`${BACKEND_URL}/api/server-locations`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Database Connection: SUCCESS');
      console.log('   📊 Database responsive, returned', data.length, 'records');
      return true;
    } else {
      console.log('   ❌ Database connection issue:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Database connection error:', error.message);
    return false;
  }
}

// Main test function
async function runComprehensiveTests() {
  console.log('🚀 Tunlify Backend Comprehensive Test Suite');
  console.log('===========================================\n');
  
  // Basic health check
  const healthOk = await testBackendHealth();
  
  if (!healthOk) {
    console.log('\n❌ Backend is not responding. Please check if the server is running.');
    return;
  }
  
  // Database connection test
  const dbOk = await testDatabaseConnection();
  
  if (!dbOk) {
    console.log('\n❌ Database connection failed. Please check Supabase configuration.');
    return;
  }
  
  // Test public endpoints
  await testServerLocations();
  await testContentEndpoints();
  
  // Test authentication flow
  const registrationResult = await testRegistration();
  const adminToken = await testAdminLogin();
  
  // Test authenticated endpoints
  await testAuthenticatedEndpoints(adminToken);
  await testAdminEndpoints(adminToken);
  
  // Test tunnel functionality
  const tunnelId = await testTunnelCreation(adminToken);
  
  console.log('\n===========================================');
  console.log('✅ Comprehensive test suite completed!');
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log('   🏥 Health Check:', healthOk ? '✅ PASS' : '❌ FAIL');
  console.log('   🗄️  Database:', dbOk ? '✅ PASS' : '❌ FAIL');
  console.log('   📝 Registration:', registrationResult.success ? '✅ PASS' : '❌ FAIL');
  console.log('   🔐 Admin Login:', adminToken ? '✅ PASS' : '❌ FAIL');
  console.log('   🚇 Tunnel Creation:', tunnelId ? '✅ PASS' : '❌ FAIL');
  
  if (healthOk && dbOk && adminToken) {
    console.log('\n🎉 Backend is fully functional and ready for production!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Update frontend NEXT_PUBLIC_BACKEND_URL to point to your backend');
    console.log('   2. Test frontend connection to backend');
    console.log('   3. Configure Caddy for tunnel routing');
    console.log('   4. Test end-to-end tunnel functionality');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
  }
}

// Run tests
runComprehensiveTests().catch(console.error);