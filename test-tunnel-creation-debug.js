// Debug Tunnel Creation Error

async function debugTunnelCreation() {
  console.log('🔍 Debug Tunnel Creation Error');
  console.log('==============================\n');
  
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
  
  // Test 2: Check server locations
  console.log('\n2. Testing server locations...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/server-locations`);
    if (response.ok) {
      const locations = await response.json();
      console.log('   ✅ Server locations: SUCCESS');
      console.log('   📊 Available locations:');
      locations.forEach(loc => {
        console.log(`      - ${loc.region_code}: ${loc.name}`);
      });
    }
  } catch (error) {
    console.log('   ❌ Server locations error:', error.message);
  }
  
  // Test 3: Try tunnel creation with detailed logging
  console.log('\n3. Testing tunnel creation...');
  const tunnelData = {
    subdomain: 'debugtest',
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
    console.log(`   📥 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`   📥 Response body: ${responseText}`);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('   ✅ Tunnel creation: SUCCESS');
      console.log('   🚇 Tunnel URL:', data.tunnel_url);
      console.log('   🔑 Connection token:', data.connection_token?.substring(0, 8) + '...');
    } else {
      console.log('   ❌ Tunnel creation failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('   📋 Error details:', errorData);
      } catch (e) {
        console.log('   📋 Raw error:', responseText);
      }
    }
  } catch (error) {
    console.log('   ❌ Tunnel creation error:', error.message);
  }
  
  // Test 4: Check database schema
  console.log('\n4. Testing database schema...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/tunnels`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const tunnels = await response.json();
      console.log('   ✅ Get tunnels: SUCCESS');
      console.log('   📊 Existing tunnels:', tunnels.length);
      
      if (tunnels.length > 0) {
        console.log('   📋 Sample tunnel structure:');
        const sample = tunnels[0];
        Object.keys(sample).forEach(key => {
          console.log(`      ${key}: ${typeof sample[key]}`);
        });
      }
    }
  } catch (error) {
    console.log('   ❌ Get tunnels error:', error.message);
  }
  
  console.log('\n==============================');
  console.log('📋 Debug Summary:');
  console.log('   🔧 Check validation errors in response');
  console.log('   🔧 Check database schema migration');
  console.log('   🔧 Check backend logs for detailed errors');
  
  console.log('\n💡 Common Issues:');
  console.log('   - Missing connection_token column in database');
  console.log('   - Validation rules too strict');
  console.log('   - Foreign key constraint on location');
  console.log('   - Missing client_connected column');
}

debugTunnelCreation().catch(console.error);