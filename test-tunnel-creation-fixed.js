// Test Tunnel Creation After Fix

async function testTunnelCreationFixed() {
  console.log('🔍 Testing Tunnel Creation After Fix');
  console.log('===================================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  let authToken = null;
  
  // Test 1: Login
  console.log('1. Testing login...');
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
      authToken = data.token;
      console.log('   ✅ Login: SUCCESS');
    } else {
      console.log('   ❌ Login failed');
      return;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return;
  }
  
  // Test 2: Test tunnel creation with proper data
  console.log('\n2. Testing tunnel creation with proper data...');
  const tunnelData = {
    subdomain: 'testfixed',
    location: 'id'
  };
  
  console.log('   📤 Sending data:', JSON.stringify(tunnelData, null, 2));
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/tunnels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Origin': 'https://tunlify.biz.id'
      },
      body: JSON.stringify(tunnelData)
    });
    
    console.log(`   📥 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Tunnel creation: SUCCESS');
      console.log('   🚇 Tunnel URL:', data.tunnel_url);
      console.log('   🔑 Connection token:', data.connection_token?.substring(0, 8) + '...');
      console.log('   📋 Setup command:', data.setup_instructions?.command);
      
      // Test client authentication
      console.log('\n3. Testing client authentication...');
      const authResponse = await fetch(`${BACKEND_URL}/api/tunnels/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connection_token: data.connection_token
        })
      });
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('   ✅ Client auth: SUCCESS');
        console.log('   🆔 Tunnel ID:', authData.tunnel_id);
        console.log('   🌐 Tunnel URL:', authData.tunnel_url);
      } else {
        console.log('   ❌ Client auth failed');
      }
      
    } else {
      const errorText = await response.text();
      console.log('   ❌ Tunnel creation failed');
      console.log('   📋 Error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors) {
          console.log('   📋 Validation errors:');
          errorData.errors.forEach(err => {
            console.log(`      - ${err.path}: ${err.msg}`);
          });
        }
      } catch (e) {
        console.log('   📋 Raw error:', errorText);
      }
    }
  } catch (error) {
    console.log('   ❌ Tunnel creation error:', error.message);
  }
  
  // Test 3: Get tunnels list
  console.log('\n4. Testing get tunnels list...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/tunnels`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const tunnels = await response.json();
      console.log('   ✅ Get tunnels: SUCCESS');
      console.log('   📊 Total tunnels:', tunnels.length);
      
      tunnels.forEach((tunnel, index) => {
        console.log(`   🚇 ${index + 1}. ${tunnel.subdomain}.${tunnel.location}.tunlify.biz.id`);
        console.log(`      Status: ${tunnel.status}`);
        console.log(`      Connected: ${tunnel.client_connected}`);
        console.log(`      Token: ${tunnel.connection_token?.substring(0, 8)}...`);
      });
    }
  } catch (error) {
    console.log('   ❌ Get tunnels error:', error.message);
  }
  
  console.log('\n===================================');
  console.log('📋 Fix Summary:');
  console.log('   🔧 Added proper form validation');
  console.log('   🔧 Fixed data sending format');
  console.log('   🔧 Added loading states');
  console.log('   🔧 Improved error handling');
  
  console.log('\n🎯 Expected Result:');
  console.log('   ✅ Form validation works');
  console.log('   ✅ Data sent correctly to backend');
  console.log('   ✅ Tunnel creation succeeds');
  console.log('   ✅ Setup dialog shows with token');
  
  console.log('\n🚀 Ready to Test Frontend:');
  console.log('   1. Open: https://tunlify.biz.id/dashboard');
  console.log('   2. Click "Create New Tunnel"');
  console.log('   3. Fill subdomain and select location');
  console.log('   4. Submit form');
  console.log('   5. Should show setup dialog with token!');
}

testTunnelCreationFixed().catch(console.error);