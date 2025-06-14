const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Check required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

console.log('🔧 Checking environment variables...');
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease check your .env file');
  process.exit(1);
}

console.log('✅ All required environment variables are set');

const authRoutes = require('./routes/auth');
const tunnelRoutes = require('./routes/tunnels');
const tunnelProxyRoutes = require('./routes/tunnel-proxy');
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const serverLocationRoutes = require('./routes/server-locations');

const app = express();
const PORT = process.env.PORT || 3001;

// IMPORTANT: Trust proxy dengan konfigurasi spesifik untuk Caddy
// Hanya trust dari localhost (Caddy) dan private networks
app.set('trust proxy', ['127.0.0.1', '::1', 'loopback', 'linklocal', 'uniquelocal']);

// Security middleware
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting dengan konfigurasi yang aman
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting untuk localhost (development)
  skip: (req) => {
    const ip = req.ip;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  }
});
app.use('/api/', limiter);

// CORS configuration - SINGLE CONFIGURATION ONLY
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://tunlify.biz.id',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    trust_proxy: app.get('trust proxy'),
    client_ip: req.ip
  });
});

// Tunnel proxy routes (handle subdomain requests from Caddy)
app.use('/tunnel-proxy', tunnelProxyRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tunnels', tunnelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/server-locations', serverLocationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Tunlify Backend API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log(`🔧 Supabase URL: ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔒 Trust Proxy: ✅ Specific (localhost + private networks)`);
  console.log(`🌐 CORS: ✅ Single configuration with origin function`);
});

module.exports = app;