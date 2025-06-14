const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const REGION = process.env.REGION || 'sg';

// Supabase client (shared database)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    region: REGION,
    timestamp: new Date().toISOString()
  });
});

// Tunnel proxy handler
app.use('*', async (req, res, next) => {
  try {
    const subdomain = req.headers['x-tunnel-subdomain'];
    const region = req.headers['x-tunnel-region'];
    
    if (!subdomain || region !== REGION) {
      return res.status(400).json({ 
        message: 'Invalid tunnel request',
        expected_region: REGION,
        received_region: region
      });
    }

    // Find tunnel in shared database
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

    console.log(`[${REGION}] Tunnel access: ${subdomain}.${region}.${process.env.TUNNEL_BASE_DOMAIN} -> ${targetUrl}`);

    // Create proxy middleware
    const proxy = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      ws: true,
      onError: (err, req, res) => {
        console.error(`[${REGION}] Proxy error for ${subdomain}:`, err.message);
        res.status(502).json({
          message: 'Bad Gateway',
          error: 'Unable to connect to target server',
          tunnel: `${subdomain}.${region}.${process.env.TUNNEL_BASE_DOMAIN}`,
          target: targetUrl,
          region: REGION
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('X-Forwarded-For', req.ip);
        proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
        proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
        proxyReq.setHeader('X-Tunnel-User', tunnel.users?.email || 'unknown');
        proxyReq.setHeader('X-Tunnel-Region', REGION);
      },
      onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['X-Tunnel-Subdomain'] = subdomain;
        proxyRes.headers['X-Tunnel-Region'] = REGION;
        proxyRes.headers['X-Powered-By'] = 'Tunlify';
      }
    });

    proxy(req, res, next);

  } catch (error) {
    console.error(`[${REGION}] Tunnel proxy error:`, error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      region: REGION
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Tunlify ${REGION.toUpperCase()} Tunnel Server running on port ${PORT}`);
  console.log(`📍 Region: ${REGION}`);
  console.log(`🌐 Handling: *.${REGION}.${process.env.TUNNEL_BASE_DOMAIN}`);
});

module.exports = app;