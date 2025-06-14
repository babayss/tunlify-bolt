const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const supabase = require('../config/database');

const router = express.Router();

// Tunnel proxy handler (ngrok-style)
router.use('*', async (req, res, next) => {
  try {
    const subdomain = req.headers['x-tunnel-subdomain'];
    const region = req.headers['x-tunnel-region'];
    
    if (!subdomain || !region) {
      return res.status(400).json({ 
        message: 'Invalid tunnel request',
        error: 'Missing subdomain or region',
        subdomain: subdomain,
        region: region
      });
    }

    console.log(`🔍 Looking up tunnel: ${subdomain}.${region}.tunlify.biz.id`);

    // Find tunnel in database
    const { data: tunnels, error } = await supabase
      .from('tunnels')
      .select(`
        *,
        users!tunnels_user_id_fkey(email, name)
      `)
      .eq('subdomain', subdomain)
      .eq('location', region)
      .eq('client_connected', true) // Only connected tunnels
      .limit(1);

    if (error || !tunnels || tunnels.length === 0) {
      console.log(`❌ Tunnel not found or not connected: ${subdomain}.${region}`);
      
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tunnel Not Found - Tunlify</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #e74c3c; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
            .tunnel-url { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; margin: 20px 0; }
            .logo { color: #667eea; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Tunlify</div>
            <h1>Tunnel Not Found</h1>
            <div class="tunnel-url">${subdomain}.${region}.tunlify.biz.id</div>
            <p>This tunnel is either:</p>
            <ul style="text-align: left; color: #666;">
              <li>Not configured</li>
              <li>Client not connected</li>
              <li>Temporarily offline</li>
            </ul>
            <p>Please check your tunnel client connection and try again.</p>
          </div>
        </body>
        </html>
      `);
    }

    const tunnel = tunnels[0];
    
    // For ngrok-style tunneling, we need to get the target from the connected client
    // This would typically be stored when the client connects via WebSocket
    // For now, we'll use a placeholder that would be set by the client
    const targetUrl = tunnel.target_url || 'http://127.0.0.1:3000'; // Default fallback

    console.log(`✅ Tunnel found: ${subdomain}.${region} -> ${targetUrl}`);
    console.log(`👤 Owner: ${tunnel.users?.email}`);

    // Create proxy middleware
    const proxy = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
      timeout: 30000, // 30 second timeout
      onError: (err, req, res) => {
        console.error(`❌ Proxy error for ${subdomain}.${region}:`, err.message);
        
        res.status(502).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Service Unavailable - Tunlify</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              h1 { color: #f39c12; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
              .tunnel-url { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; margin: 20px 0; }
              .logo { color: #667eea; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">Tunlify</div>
              <h1>Service Unavailable</h1>
              <div class="tunnel-url">${subdomain}.${region}.tunlify.biz.id</div>
              <p>Unable to connect to the target application.</p>
              <p>Please check that your local application is running and accessible.</p>
              <p><strong>Error:</strong> ${err.message}</p>
            </div>
          </body>
          </html>
        `);
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add custom headers
        proxyReq.setHeader('X-Forwarded-For', req.ip);
        proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
        proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
        proxyReq.setHeader('X-Tunnel-User', tunnel.users?.email || 'unknown');
        proxyReq.setHeader('X-Tunnel-Id', tunnel.id);
        
        console.log(`📡 Proxying: ${req.method} ${req.url} -> ${targetUrl}${req.url}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add tunnel info headers
        proxyRes.headers['X-Tunnel-Subdomain'] = subdomain;
        proxyRes.headers['X-Tunnel-Region'] = region;
        proxyRes.headers['X-Powered-By'] = 'Tunlify';
        proxyRes.headers['X-Tunnel-Id'] = tunnel.id;
      }
    });

    // Execute proxy
    proxy(req, res, next);

  } catch (error) {
    console.error('❌ Tunnel proxy error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;