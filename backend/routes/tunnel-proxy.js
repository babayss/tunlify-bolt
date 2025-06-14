const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const supabase = require('../config/database');

const router = express.Router();

// Tunnel proxy handler
router.use('*', async (req, res, next) => {
  try {
    const subdomain = req.headers['x-tunnel-subdomain'];
    const region = req.headers['x-tunnel-region'];
    
    if (!subdomain || !region) {
      return res.status(400).json({ 
        message: 'Invalid tunnel request',
        error: 'Missing subdomain or region'
      });
    }

    // Find tunnel in database
    const { data: tunnels, error } = await supabase
      .from('tunnels')
      .select(`
        *,
        users!tunnels_user_id_fkey(email)
      `)
      .eq('subdomain', subdomain)
      .eq('location', region)
      .eq('status', 'active')
      .limit(1);

    if (error || !tunnels || tunnels.length === 0) {
      return res.status(404).json({
        message: 'Tunnel not found',
        subdomain: subdomain,
        region: region
      });
    }

    const tunnel = tunnels[0];
    const targetUrl = `http://${tunnel.target_ip}:${tunnel.target_port}`;

    // Log tunnel access
    console.log(`Tunnel access: ${subdomain}.${region}.tunlify.biz.id -> ${targetUrl}`);

    // Create proxy middleware
    const proxy = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
      onError: (err, req, res) => {
        console.error(`Proxy error for ${subdomain}.${region}:`, err.message);
        res.status(502).json({
          message: 'Bad Gateway',
          error: 'Unable to connect to target server',
          tunnel: `${subdomain}.${region}.tunlify.biz.id`,
          target: targetUrl
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add custom headers
        proxyReq.setHeader('X-Forwarded-For', req.ip);
        proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
        proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
        proxyReq.setHeader('X-Tunnel-User', tunnel.users?.email || 'unknown');
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add tunnel info headers
        proxyRes.headers['X-Tunnel-Subdomain'] = subdomain;
        proxyRes.headers['X-Tunnel-Region'] = region;
        proxyRes.headers['X-Powered-By'] = 'Tunlify';
      }
    });

    // Execute proxy
    proxy(req, res, next);

  } catch (error) {
    console.error('Tunnel proxy error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;