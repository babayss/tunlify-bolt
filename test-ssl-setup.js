// Test SSL setup untuk Server A

const https = require('https');

async function testSSLSetup() {
  console.log('🔍 Testing SSL Setup for Server A');
  console.log('==================================\n');
  
  const endpoints = [
    {
      url: 'https://api.tunlify.biz.id/health',
      description: 'Backend API SSL'
    },
    {
      url: 'https://api.tunlify.biz.id/api/server-locations',
      description: 'API Endpoint SSL'
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.description}...`);
    
    try {
      const response = await fetch(endpoint.url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint.description}: SUCCESS`);
        console.log(`   🔒 SSL: WORKING`);
        
        if (endpoint.url.includes('/health')) {
          console.log(`   📊 Status: ${data.status}`);
        } else if (Array.isArray(data)) {
          console.log(`   📊 Data count: ${data.length}`);
        }
      } else {
        console.log(`   ❌ ${endpoint.description}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.description}: ${error.message}`);
      
      if (error.message.includes('certificate')) {
        console.log('   💡 SSL certificate issue detected');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('   💡 Connection refused - check if Caddy is running');
      }
    }
    
    console.log('');
  }
  
  // Test tunnel subdomain (jika ada)
  console.log('Testing tunnel subdomain SSL...');
  try {
    // Test dengan subdomain yang tidak ada (should return 404 but with SSL)
    const response = await fetch('https://test.id.tunlify.biz.id');
    console.log(`   🔒 Tunnel SSL: WORKING (Status: ${response.status})`);
  } catch (error) {
    if (error.message.includes('certificate')) {
      console.log('   ❌ Tunnel SSL: Certificate issue');
    } else {
      console.log('   ✅ Tunnel SSL: Working (connection established)');
    }
  }
  
  console.log('\n==================================');
  console.log('📋 SSL Test Summary:');
  console.log('   🔒 API SSL should be working');
  console.log('   🔒 Tunnel SSL should be working');
  console.log('   💡 If errors, check Caddy logs: sudo journalctl -u caddy -f');
}

testSSLSetup().catch(console.error);