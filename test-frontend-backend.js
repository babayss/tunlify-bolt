const { apiClient } = require('./lib/api');

async function testFrontendBackendConnection() {
  console.log('🔍 Testing Frontend to Backend Connection');
  console.log('=========================================\n');
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const response = await apiClient.get('/health');
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Health check: SUCCESS');
      console.log('   📊 Backend status:', data.status);
    } else {
      console.log('   ❌ Health check failed:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Health check error:', error.message);
  }
  
  // Test 2: Server locations
  console.log('\n2. Testing server locations...');
  try {
    const response = await apiClient.get('/api/server-locations');
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Server locations: SUCCESS');
      console.log('   📊 Available locations:', data.length);
    } else {
      console.log('   ❌ Server locations failed:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Server locations error:', error.message);
  }
  
  // Test 3: Content endpoints
  console.log('\n3. Testing content endpoints...');
  try {
    const response = await apiClient.get('/api/content/landing?lang=en');
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Landing content: SUCCESS');
      console.log('   📝 Hero title:', data.hero?.title || 'Not found');
    } else {
      console.log('   ❌ Landing content failed:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Landing content error:', error.message);
  }
  
  // Test 4: Login flow
  console.log('\n4. Testing login flow...');
  try {
    const response = await apiClient.post('/api/auth/login', {
      email: 'admin@tunlify.net',
      password: 'admin123'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Login: SUCCESS');
      console.log('   👤 User:', data.user.name);
      console.log('   🔑 Token received:', data.token ? 'YES' : 'NO');
      
      // Test authenticated endpoint
      console.log('\n5. Testing authenticated endpoint...');
      const authResponse = await apiClient.get('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      if (authResponse.ok) {
        const userData = await authResponse.json();
        console.log('   ✅ Auth endpoint: SUCCESS');
        console.log('   👤 Current user:', userData.name);
      } else {
        console.log('   ❌ Auth endpoint failed:', authResponse.status);
      }
      
    } else {
      const error = await response.json();
      console.log('   ❌ Login failed:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
  }
  
  console.log('\n=========================================');
  console.log('✅ Frontend-Backend connection test completed!');
}

testFrontendBackendConnection().catch(console.error);