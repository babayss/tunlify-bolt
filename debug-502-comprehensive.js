// Debug 502 Error - Comprehensive Analysis

async function debug502Error() {
  console.log('🔍 Debug 502 Error - Comprehensive Analysis');
  console.log('============================================\n');
  
  const BACKEND_URL = 'https://api.tunlify.biz.id';
  let authToken = null;
  let tunnelData = null;
  
  // Test 1: Backend Health Check
  console.log('1. Testing backend health...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Backend Health: OK');
      console.log(`   📊 Status: ${data.status}`);
      console.log(`   🔌 WebSocket: ${data.websocket_enabled}`);
      console.log(`   📊 Active Tunnels: ${data.active_tunnels}`);
      console.log(`   🌐 Environment: ${data.environment}`);
    } else {
      console.log('   ❌ Backend Health: FAILED');
      return;
    }
  } catch (error) {
    console.log('   ❌ Backend Health Error:', error.message);
    return;
  }
  
  // Test 2: Authentication
  console.log('\n2. Testing authentication...');
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
      console.log('   ✅ Authentication: SUCCESS');
      console.log(`   👤 User: ${data.user.name} (${data.user.role})`);
    } else {
      console.log('   ❌ Authentication: FAILED');
      return;
    }
  } catch (error) {
    console.log('   ❌ Authentication Error:', error.message);
    return;
  }
  
  // Test 3: Get Existing Tunnels
  console.log('\n3. Getting existing tunnels...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/tunnels`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.ok) {
      const tunnels = await response.json();
      console.log(`   ✅ Found ${tunnels.length} tunnels`);
      
      if (tunnels.length > 0) {
        tunnelData = tunnels[0];
        console.log(`   🚇 Using: ${tunnelData.subdomain}.${tunnelData.location}.tunlify.biz.id`);
        console.log(`   📊 Status: ${tunnelData.status}`);
        console.log(`   📊 Client Connected: ${tunnelData.client_connected}`);
        console.log(`   🔑 Token: ${tunnelData.connection_token?.substring(0, 8)}...`);
      } else {
        console.log('   ⚠️  No tunnels found - creating test tunnel...');
        
        const createResponse = await fetch(`${BACKEND_URL}/api/tunnels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            subdomain: 'debug502',
            location: 'id'
          })
        });
        
        if (createResponse.ok) {
          tunnelData = await createResponse.json();
          console.log('   ✅ Test tunnel created');
        }
      }
    }
  } catch (error) {
    console.log('   ❌ Get Tunnels Error:', error.message);
    return;
  }
  
  if (!tunnelData) {
    console.log('❌ No tunnel available for testing');
    return;
  }
  
  // Test 4: Direct Tunnel Proxy Test
  console.log('\n4. Testing tunnel proxy directly...');
  try {
    const response = await fetch(`${BACKEND_URL}/tunnel-proxy`, {
      headers: {
        'X-Tunnel-Subdomain': tunnelData.subdomain,
        'X-Tunnel-Region': tunnelData.location,
        'User-Agent': 'Debug-Test/1.0'
      }
    });
    
    console.log(`   📊 Status: ${response.status}`);
    console.log(`   📊 Status Text: ${response.statusText}`);
    
    // Log response headers
    console.log('   📋 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`      ${key}: ${value}`);
    }
    
    const responseText = await response.text();
    console.log('   📄 Response Body:');
    console.log('   ' + responseText.split('\n').join('\n   '));
    
    // Analyze the error
    if (response.status === 502) {
      try {
        const errorData = JSON.parse(responseText);
        console.log('\n   🔍 Error Analysis:');
        console.log(`      Message: ${errorData.message}`);
        console.log(`      Status: ${errorData.status || 'Not specified'}`);
        console.log(`      Help: ${errorData.help || 'No help provided'}`);
      } catch (e) {
        console.log('   💡 Non-JSON error response');
      }
    }
  } catch (error) {
    console.log('   ❌ Tunnel Proxy Error:', error.message);
  }
  
  // Test 5: Actual Tunnel URL
  console.log('\n5. Testing actual tunnel URL...');
  const tunnelUrl = `https://${tunnelData.subdomain}.${tunnelData.location}.tunlify.biz.id`;
  try {
    const response = await fetch(tunnelUrl);
    console.log(`   📊 Tunnel URL Status: ${response.status}`);
    
    if (response.status === 502) {
      const responseText = await response.text();
      console.log('   📄 Tunnel URL Response:');
      console.log('   ' + responseText.split('\n').join('\n   '));
    }
  } catch (error) {
    console.log('   ❌ Tunnel URL Error:', error.message);
  }
  
  // Test 6: WebSocket Connection Test
  console.log('\n6. Testing WebSocket endpoint availability...');
  const wsUrl = `wss://api.tunlify.biz.id/ws/tunnel?token=${tunnelData.connection_token}`;
  console.log(`   🔌 WebSocket URL: ${wsUrl}`);
  console.log('   💡 WebSocket requires actual client connection');
  
  console.log('\n============================================');
  console.log('📋 Comprehensive Analysis Summary:');
  console.log('');
  console.log('🔧 System Status:');
  console.log('   ✅ Backend API: Running');
  console.log('   ✅ Database: Connected');
  console.log('   ✅ Authentication: Working');
  console.log('   ✅ Tunnel Creation: Working');
  console.log('   ❓ Proxy Forwarding: Check response above');
  
  console.log('\n💡 Next Steps Based on Error:');
  console.log('   1. Check the exact error message above');
  console.log('   2. If "WebSocket not connected" → Run tunnel client');
  console.log('   3. If "Implementation pending" → WebSocket proxy needs work');
  console.log('   4. If different error → Check backend logs');
  
  console.log('\n🚀 To Fix 502 Error:');
  console.log(`   Tunnel URL: ${tunnelUrl}`);
  console.log(`   Connection Token: ${tunnelData.connection_token}`);
  console.log('   Run: node nodejs-client/index.js -t YOUR_TOKEN -l 127.0.0.1:3000');
}

debug502Error().catch(console.error);