// Test Tunnel System untuk memastikan wildcard *.id.tunlify.biz.id bekerja

async function testTunnelSystem() {
  console.log('🔍 Testing Tunnel System');
  console.log('========================\n');
  
  const BACKEND_URL = 'http://localhost:3001';
  
  // Test 1: Backend tunnel-proxy endpoint
  console.log('1. Testing tunnel-proxy endpoint...');
  try {
    const response = await fetch(`${BACKEND_URL}/tunnel-proxy`, {
      headers: {
        'X-Tunnel-Subdomain': 'test',
        'X-Tunnel-Region': 'id'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    if (response.status === 404) {
      console.log('   ✅ Tunnel proxy endpoint working (404 = tunnel not found)');
    } else {
      const data = await response.text();
      console.log('   📄 Response:', data.substring(0, 100) + '...');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // Test 2: Login dan buat tunnel
  console.log('\n2. Testing tunnel creation...');
  try {
    // Login dulu
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@tunlify.net',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const { token } = await loginResponse.json();
      console.log('   ✅ Login successful');
      
      // Buat tunnel test
      const tunnelResponse = await fetch(`${BACKEND_URL}/api/tunnels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subdomain: 'testapp',
          target_ip: '127.0.0.1',
          target_port: 8080,
          location: 'id'
        })
      });
      
      if (tunnelResponse.ok) {
        const tunnel = await tunnelResponse.json();
        console.log('   ✅ Tunnel created successfully');
        console.log('   🚇 Tunnel URL: testapp.id.tunlify.biz.id');
        console.log('   🎯 Target: 127.0.0.1:8080');
        
        // Test tunnel lookup
        console.log('\n3. Testing tunnel lookup...');
        const lookupResponse = await fetch(`${BACKEND_URL}/tunnel-proxy`, {
          headers: {
            'X-Tunnel-Subdomain': 'testapp',
            'X-Tunnel-Region': 'id'
          }
        });
        
        console.log(`   Lookup status: ${lookupResponse.status}`);
        if (lookupResponse.status === 502) {
          console.log('   ✅ Tunnel found but target unreachable (expected)');
        } else {
          const data = await lookupResponse.text();
          console.log('   📄 Response:', data.substring(0, 100) + '...');
        }
        
      } else {
        const error = await tunnelResponse.json();
        console.log('   ❌ Tunnel creation failed:', error.message);
      }
    } else {
      console.log('   ❌ Login failed');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n========================');
  console.log('📋 Tunnel System Status:');
  console.log('   🔧 Caddy Config: *.id.tunlify.biz.id → localhost:3001/tunnel-proxy');
  console.log('   🔧 Backend Handler: /tunnel-proxy → Database lookup → User target');
  console.log('   🔧 SSL: Cloudflare DNS untuk semua subdomain');
  
  console.log('\n🧪 Manual Test:');
  console.log('   1. Buat tunnel di dashboard: myapp.id.tunlify.biz.id → 127.0.0.1:3000');
  console.log('   2. Jalankan app lokal di port 3000');
  console.log('   3. Akses: https://myapp.id.tunlify.biz.id');
  console.log('   4. Should proxy ke app lokal kamu!');
}

testTunnelSystem().catch(console.error);