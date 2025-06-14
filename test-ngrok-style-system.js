// Test Ngrok-Style Tunneling System

async function testNgrokStyleSystem() {
  console.log('🔍 Testing Ngrok-Style Tunneling System');
  console.log('======================================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  let authToken = null;
  
  // Test 1: Login untuk mendapatkan auth token
  console.log('1. Testing admin login...');
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
      console.log('   👤 User:', data.user.name);
    } else {
      console.log('   ❌ Login failed');
      return;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return;
  }
  
  // Test 2: Buat tunnel baru (ngrok-style)
  console.log('\n2. Testing tunnel creation (ngrok-style)...');
  let tunnelData = null;
  try {
    const response = await fetch(`${BACKEND_URL}/api/tunnels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Origin': 'https://tunlify.biz.id'
      },
      body: JSON.stringify({
        subdomain: 'testapp',
        location: 'id'
      })
    });
    
    if (response.ok) {
      tunnelData = await response.json();
      console.log('   ✅ Tunnel Creation: SUCCESS');
      console.log('   🚇 Tunnel URL:', tunnelData.tunnel_url);
      console.log('   🔑 Connection Token:', tunnelData.connection_token);
      console.log('   📋 Setup Command:', tunnelData.setup_instructions.command);
    } else {
      const error = await response.json();
      console.log('   ❌ Tunnel creation failed:', error.message);
      return;
    }
  } catch (error) {
    console.log('   ❌ Tunnel creation error:', error.message);
    return;
  }
  
  // Test 3: Test client authentication endpoint
  console.log('\n3. Testing client authentication...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/tunnels/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        connection_token: tunnelData.connection_token
      })
    });
    
    if (response.ok) {
      const authData = await response.json();
      console.log('   ✅ Client Auth: SUCCESS');
      console.log('   🆔 Tunnel ID:', authData.tunnel_id);
      console.log('   🌐 Tunnel URL:', authData.tunnel_url);
      console.log('   👤 User:', authData.user);
    } else {
      const error = await response.json();
      console.log('   ❌ Client auth failed:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Client auth error:', error.message);
  }
  
  // Test 4: Test tunnel lookup (should fail karena client belum connect)
  console.log('\n4. Testing tunnel lookup (should show not connected)...');
  try {
    const response = await fetch(`${BACKEND_URL}/tunnel-proxy`, {
      headers: {
        'X-Tunnel-Subdomain': 'testapp',
        'X-Tunnel-Region': 'id'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    if (response.status === 404) {
      console.log('   ✅ Tunnel Lookup: Correctly shows not connected');
    } else {
      const text = await response.text();
      console.log('   📄 Response:', text.substring(0, 100) + '...');
    }
  } catch (error) {
    console.log('   ❌ Tunnel lookup error:', error.message);
  }
  
  // Test 5: Get user tunnels
  console.log('\n5. Testing get user tunnels...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/tunnels`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const tunnels = await response.json();
      console.log('   ✅ Get Tunnels: SUCCESS');
      console.log('   📊 Tunnels count:', tunnels.length);
      
      tunnels.forEach(tunnel => {
        console.log(`   🚇 ${tunnel.subdomain}.${tunnel.location}.tunlify.biz.id`);
        console.log(`      Status: ${tunnel.status}`);
        console.log(`      Connected: ${tunnel.client_connected}`);
        console.log(`      Token: ${tunnel.connection_token.substring(0, 8)}...`);
      });
    } else {
      console.log('   ❌ Get tunnels failed');
    }
  } catch (error) {
    console.log('   ❌ Get tunnels error:', error.message);
  }
  
  console.log('\n======================================');
  console.log('📋 Ngrok-Style System Summary:');
  console.log('   🔧 User creates tunnel → Gets connection token');
  console.log('   🔧 Download Golang client');
  console.log('   🔧 Run: ./tunlify-client -token=XXX -local=127.0.0.1:3000');
  console.log('   🔧 Client authenticates with token');
  console.log('   🔧 Traffic forwarded to local app');
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Build Golang client');
  console.log('   2. Test client connection');
  console.log('   3. Implement WebSocket for real-time forwarding');
  console.log('   4. Add client status monitoring');
  
  console.log('\n🚀 Ready for Testing:');
  console.log('   1. Create tunnel: https://tunlify.biz.id/dashboard');
  console.log('   2. Copy connection token');
  console.log('   3. Run client with token');
  console.log('   4. Access tunnel URL');
}

testNgrokStyleSystem().catch(console.error);