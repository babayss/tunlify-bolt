// Test Tunnel Creation Final - After Removing target_ip/target_port Requirements

async function testTunnelCreationFinal() {
  console.log('🔍 Testing Tunnel Creation Final - Ngrok Style');
  console.log('==============================================\n');
  
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
  
  // Test 2: Create tunnel with ONLY subdomain and location (ngrok-style)
  console.log('\n2. Testing ngrok-style tunnel creation...');
  const tunnelData = {
    subdomain: 'ngroktest',
    location: 'id'
    // NO target_ip and target_port - client will specify these
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
      console.log('   🎉 NGROK-STYLE TUNNELING WORKING!');
      
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
        console.log('   👤 User:', authData.user);
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
        console.log(`      Target IP: ${tunnel.target_ip || 'Not set (ngrok-style)'}`);
        console.log(`      Target Port: ${tunnel.target_port || 'Not set (ngrok-style)'}`);
      });
    }
  } catch (error) {
    console.log('   ❌ Get tunnels error:', error.message);
  }
  
  console.log('\n==============================================');
  console.log('📋 Ngrok-Style System Summary:');
  console.log('   🔧 User creates tunnel with subdomain + location only');
  console.log('   🔧 Gets connection token for client');
  console.log('   🔧 Downloads Golang client');
  console.log('   🔧 Runs: ./tunlify-client -token=XXX -local=127.0.0.1:3000');
  console.log('   🔧 Client specifies local address at runtime');
  
  console.log('\n🎯 Key Differences from Previous System:');
  console.log('   ❌ OLD: User specifies target_ip + target_port in dashboard');
  console.log('   ✅ NEW: User only specifies subdomain + location');
  console.log('   ✅ NEW: Client specifies local address when connecting');
  console.log('   ✅ NEW: More flexible like ngrok');
  
  console.log('\n🚀 Ready for Frontend Testing:');
  console.log('   1. Open: https://tunlify.biz.id/dashboard');
  console.log('   2. Click "Create New Tunnel"');
  console.log('   3. Only fill subdomain and location');
  console.log('   4. Get connection token');
  console.log('   5. Use token with Golang client');
}

testTunnelCreationFinal().catch(console.error);