const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const supabase = require('../config/database');

const router = express.Router();

// Tunnel proxy handler
router.use('*', async (req, res, next) => {
  try {
    const subdomain = req.headers['x-tunnel-subdomain'];
    const region = req.headers['x-tunnel-region'];
    
    console.log(`🔍 Tunnel request: ${subdomain}.${region}.tunlify.biz.id`);
    console.log(`🔍 Headers:`, {
      subdomain,
      region,
      'x-real-ip': req.headers['x-real-ip'],
      'user-agent': req.headers['user-agent']
    });
    
    if (!subdomain || !region) {
      console.log('❌ Missing subdomain or region headers');
      return res.status(400).json({ 
        message: 'Invalid tunnel request',
        error: 'Missing subdomain or region headers',
        received_headers: {
          subdomain,
          region
        }
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
        status: 'client_disconnected'
      });
    }

    // For ngrok-style tunneling, we need to get the target from active client connection
    // Since we don't have WebSocket implementation yet, we'll return a helpful message
    console.log(`🔄 Tunnel proxy not fully implemented yet`);
    return res.status(502).json({
      message: 'Tunnel proxy not fully implemented',
      subdomain: subdomain,
      region: region,
      tunnel_id: tunnel.id,
      status: 'implementation_pending',
      help: 'WebSocket-based proxy forwarding is coming soon',
      current_implementation: 'Database lookup working, proxy forwarding pending'
    });

    // TODO: Implement WebSocket-based proxy forwarding
    // This would involve:
    // 1. WebSocket connection between client and server
    // 2. Real-time request forwarding
    // 3. Response streaming back to browser
    
    /*
    // Future implementation would look like this:
    const targetUrl = `http://${tunnel.target_ip}:${tunnel.target_port}`;
    
    const proxy = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      ws: true,
      onError: (err, req, res) => {
        console.error(`❌ Proxy error for ${subdomain}.${region}:`, err.message);
        res.status(502).json({
          message: 'Bad Gateway',
          error: 'Unable to connect to target server',
          tunnel: `${subdomain}.${region}.tunlify.biz.id`,
          target: targetUrl
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('X-Forwarded-For', req.ip);
        proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
        proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
        proxyReq.setHeader('X-Tunnel-User', tunnel.users?.email || 'unknown');
      },
      onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['X-Tunnel-Subdomain'] = subdomain;
        proxyRes.headers['X-Tunnel-Region'] = region;
        proxyRes.headers['X-Powered-By'] = 'Tunlify';
      }
    });

    proxy(req, res, next);
    */

  } catch (error) {
    console.error('❌ Tunnel proxy error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;