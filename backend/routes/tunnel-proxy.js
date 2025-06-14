const express = require('express');
const supabase = require('../config/database');

const router = express.Router();

// Tunnel proxy handler
router.use('*', async (req, res, next) => {
  try {
    const subdomain = req.headers['x-tunnel-subdomain'];
    const region = req.headers['x-tunnel-region'];
    
    console.log(`🔍 Tunnel request: ${subdomain}.${region}.tunlify.biz.id`);
    console.log(`🔍 Method: ${req.method} ${req.url}`);
    console.log(`🔍 Headers:`, {
      subdomain,
      region,
      'x-real-ip': req.headers['x-real-ip'],
      'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
    });
    
    if (!subdomain || !region) {
      console.log('❌ Missing subdomain or region headers');
      return res.status(400).json({ 
        message: 'Invalid tunnel request',
        error: 'Missing subdomain or region headers',
        received_headers: { subdomain, region }
      });
    }

    // Find tunnel in database
    console.log(`🔍 Looking up tunnel: ${subdomain}.${region}`);
    const { data: tunnels, error } = await supabase
      .from('tunnels')
      .select(`
        *,
        users!tunnels_user_id_fkey(email, name)
      `)
      .eq('subdomain', subdomain)
      .eq('location', region)
      .eq('status', 'active')
      .limit(1);

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({
        message: 'Database error',
        error: error.message
      });
    }

    if (!tunnels || tunnels.length === 0) {
      console.log(`❌ Tunnel not found: ${subdomain}.${region}`);
      return res.status(404).json({
        message: 'Tunnel not found',
        subdomain: subdomain,
        region: region,
        help: 'Make sure your tunnel is active and client is connected'
      });
    }

    const tunnel = tunnels[0];
    console.log(`✅ Tunnel found:`, {
      id: tunnel.id,
      subdomain: tunnel.subdomain,
      location: tunnel.location,
      status: tunnel.status,
      client_connected: tunnel.client_connected,
      user: tunnel.users?.email
    });

    // Check if client is connected
    if (!tunnel.client_connected) {
      console.log(`❌ Client not connected for tunnel: ${subdomain}.${region}`);
      return res.status(503).json({
        message: 'Tunnel client not connected',
        subdomain: subdomain,
        region: region,
        help: 'Start your tunnel client with the connection token',
        tunnel_url: `https://${subdomain}.${region}.tunlify.biz.id`,
        status: 'client_disconnected',
        instructions: {
          download: 'https://github.com/tunlify/client/releases/latest',
          command: `./tunlify-client -token=${tunnel.connection_token} -local=127.0.0.1:3000`
        }
      });
    }

    // Get WebSocket forwarding function from app locals
    const { activeTunnels, forwardRequest } = req.app.locals;
    const tunnelKey = `${subdomain}.${region}`;

    console.log(`🔍 Checking active WebSocket connections for: ${tunnelKey}`);
    console.log(`🔍 Active tunnels: ${activeTunnels ? activeTunnels.size : 0}`);

    if (!activeTunnels || !activeTunnels.has(tunnelKey)) {
      console.log(`❌ WebSocket connection not found for: ${tunnelKey}`);
      return res.status(503).json({
        message: 'Tunnel client WebSocket not connected',
        subdomain: subdomain,
        region: region,
        tunnel_id: tunnel.id,
        status: 'websocket_disconnected',
        help: 'Client needs to establish WebSocket connection',
        websocket_url: `wss://api.tunlify.biz.id/ws/tunnel?token=${tunnel.connection_token}`,
        instructions: {
          step1: 'Download latest client',
          step2: 'Run: ./tunlify-client -token=YOUR_TOKEN -local=127.0.0.1:3000',
          step3: 'Client will auto-connect via WebSocket'
        }
      });
    }

    // Forward request via WebSocket
    console.log(`🔄 Forwarding request via WebSocket: ${req.method} ${req.url}`);
    
    try {
      const requestData = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
      };

      const response = await forwardRequest(tunnelKey, requestData);
      
      console.log(`✅ Response received from client: ${response.statusCode}`);

      // Set response headers
      if (response.headers) {
        Object.entries(response.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      }

      // Add tunnel info headers
      res.setHeader('X-Tunnel-Subdomain', subdomain);
      res.setHeader('X-Tunnel-Region', region);
      res.setHeader('X-Powered-By', 'Tunlify');
      res.setHeader('X-Tunnel-User', tunnel.users?.email || 'unknown');

      // Send response
      res.status(response.statusCode || 200);
      
      if (response.body) {
        res.send(response.body);
      } else {
        res.end();
      }

    } catch (forwardError) {
      console.error(`❌ Request forwarding error: ${forwardError.message}`);
      
      if (forwardError.message.includes('timeout')) {
        return res.status(504).json({
          message: 'Gateway Timeout',
          error: 'Local application did not respond in time',
          tunnel: `${subdomain}.${region}.tunlify.biz.id`,
          help: 'Check if your local application is running and responsive'
        });
      } else if (forwardError.message.includes('not connected')) {
        return res.status(503).json({
          message: 'Service Unavailable',
          error: 'Tunnel client disconnected during request',
          tunnel: `${subdomain}.${region}.tunlify.biz.id`,
          help: 'Restart your tunnel client'
        });
      } else {
        return res.status(502).json({
          message: 'Bad Gateway',
          error: 'Unable to forward request to local application',
          tunnel: `${subdomain}.${region}.tunlify.biz.id`,
          details: forwardError.message
        });
      }
    }

  } catch (error) {
    console.error('❌ Tunnel proxy error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;