// Test koneksi Frontend (Server B) ke Backend (Server A)

const BACKEND_URL = 'http://70.153.208.184:3001';

async function testConnection() {
  console.log('🔍 Testing Frontend to Backend Connection');
  console.log('Server B (Frontend): 70.153.208.190');
  console.log('Server A (Backend):  70.153.208.184:3001');
  console.log('=========================================\n');
  
  // Test 1: Health check
  console.log('1. Testing backend health...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Backend health: SUCCESS');
      console.log('   📊 Status:', data.status);
      console.log('   🌍 Environment:', data.environment);
    } else {
      console.log('   ❌ Backend health failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Backend health error:', error.message);
    console.log('   💡 Make sure backend is running on Server A');
    return false;
  }
  
  // Test 2: CORS check
  console.log('\n2. Testing CORS configuration...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/server-locations`, {
      method: 'GET',
      headers: {
        'Origin': 'http://70.153.208.190:3000',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ CORS: SUCCESS');
      console.log('   📊 Server locations:', data.length);
    } else {
      console.log('   ❌ CORS failed:', response.status);
    }
  } catch (error) {
    console.log('   ❌ CORS error:', error.message);
  }
  
  // Test 3: Authentication flow
  console.log('\n3. Testing authentication...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://70.153.208.190:3000'
      },
      body: JSON.stringify({
        email: 'admin@tunlify.net',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Authentication: SUCCESS');
      console.log('   👤 User:', data.user.name, `(${data.user.role})`);
      
      // Test authenticated endpoint
      console.log('\n4. Testing authenticated endpoint...');
      const authResponse = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Origin': 'http://70.153.208.190:3000'
        }
      });
      
      if (authResponse.ok) {
        const userData = await authResponse.json();
        console.log('   ✅ Authenticated endpoint: SUCCESS');
        console.log('   👤 Current user:', userData.name);
      } else {
        console.log('   ❌ Authenticated endpoint failed:', authResponse.status);
      }
      
    } else {
      const error = await response.json();
      console.log('   ❌ Authentication failed:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Authentication error:', error.message);
  }
  
  console.log('\n=========================================');
  console.log('✅ Connection test completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Start frontend dev server: npm run dev');
  console.log('   2. Open browser: http://70.153.208.190:3000');
  console.log('   3. Test login with: admin@tunlify.net / admin123');
  console.log('   4. Check dashboard functionality');
  
  return true;
}

testConnection().catch(console.error);