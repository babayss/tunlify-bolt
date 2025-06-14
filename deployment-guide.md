# 🚀 Tunlify Deployment Guide

## Prerequisites

### External Services Setup

#### 1. Supabase Database
1. Buat project di [Supabase](https://supabase.com)
2. Copy URL dan Service Role Key
3. Import schema dari `supabase/migrations/20250614102833_yellow_hat.sql`

#### 2. Redis Cloud
1. Buat database di [Redis Cloud](https://redis.io)
2. Copy connection URL
3. Test koneksi

#### 3. Domain & DNS
```
A     tunlify.biz.id          -> Server A IP
A     api.tunlify.biz.id      -> Server A IP  
A     *.id.tunlify.biz.id     -> Server A IP
A     *.sg.tunlify.biz.id     -> Server A IP
A     *.us.tunlify.biz.id     -> Server A IP
A     *.de.tunlify.biz.id     -> Server A IP
A     *.jp.tunlify.biz.id     -> Server A IP
```

## Server A (Backend + Caddy)

### 1. Setup Backend API
```bash
# Clone repository
cd /opt
sudo git clone your-repo tunlify-backend
cd tunlify-backend/backend

# Install dependencies
sudo npm install

# Setup environment
sudo cp .env.example .env
sudo nano .env
```

**Environment Variables (.env):**
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Redis Configuration  
REDIS_URL=redis://default:password@redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=3001
NODE_ENV=production

# Email Configuration (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=https://tunlify.biz.id

# Tunnel Configuration
TUNNEL_BASE_DOMAIN=tunlify.biz.id
```

### 2. Setup PM2 (Process Manager)
```bash
# Install PM2
sudo npm install -g pm2

# Create ecosystem file
sudo nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'tunlify-backend',
    script: 'server.js',
    cwd: '/opt/tunlify-backend/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/tunlify-backend-error.log',
    out_file: '/var/log/pm2/tunlify-backend-out.log',
    log_file: '/var/log/pm2/tunlify-backend.log',
    time: true
  }]
};
```

```bash
# Start dengan PM2
sudo pm2 start ecosystem.config.js
sudo pm2 startup
sudo pm2 save
```

### 3. Setup Caddy
```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Setup Caddyfile
sudo cp backend/Caddyfile /etc/caddy/Caddyfile

# Create log directories
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

# Test dan start Caddy
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl enable caddy
sudo systemctl start caddy
```

## Server B (Frontend)

### 1. Setup Frontend
```bash
# Clone frontend
cd /opt
sudo git clone your-repo tunlify-frontend
cd tunlify-frontend

# Install dependencies
sudo npm install

# Setup environment
sudo nano .env.local
```

**Environment Variables (.env.local):**
```env
NEXT_PUBLIC_BACKEND_URL=https://api.tunlify.biz.id
NEXT_PUBLIC_IPINFO_TOKEN=your_ipinfo_token_here
```

```bash
# Build frontend
sudo npm run build
```

### 2. Setup dengan PM2
```bash
# Install serve untuk static files
sudo npm install -g serve

# Create PM2 config
sudo nano ecosystem.frontend.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'tunlify-frontend',
    script: 'serve',
    args: '-s out -l 3000',
    cwd: '/opt/tunlify-frontend',
    instances: 1,
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/pm2/tunlify-frontend-error.log',
    out_file: '/var/log/pm2/tunlify-frontend-out.log',
    log_file: '/var/log/pm2/tunlify-frontend.log',
    time: true
  }]
};
```

```bash
# Start frontend
sudo pm2 start ecosystem.frontend.config.js
sudo pm2 save
```

### 3. Setup Nginx (untuk frontend)
```bash
# Install Nginx
sudo apt install nginx

# Create config
sudo nano /etc/nginx/sites-available/tunlify-frontend
```

```nginx
server {
    listen 80;
    server_name tunlify.biz.id;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tunlify-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL dengan Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tunlify.biz.id
```

## Testing & Verification

### 1. Test Backend API
```bash
# Health check
curl https://api.tunlify.biz.id/health

# Test login
curl -X POST https://api.tunlify.biz.id/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tunlify.net","password":"123456"}'
```

### 2. Test Frontend
```bash
# Check frontend
curl https://tunlify.biz.id

# Check if API calls work
# Login via frontend dan cek dashboard
```

### 3. Test Tunnel System
```bash
# Create tunnel via dashboard
# Test subdomain: https://test.id.tunlify.biz.id
```

## Monitoring & Maintenance

### 1. Check Services
```bash
# Backend (Server A)
sudo pm2 status
sudo systemctl status caddy

# Frontend (Server B)
sudo pm2 status
sudo systemctl status nginx
```

### 2. Logs
```bash
# Backend logs
sudo pm2 logs tunlify-backend
sudo tail -f /var/log/caddy/tunlify-api.log

# Frontend logs
sudo pm2 logs tunlify-frontend
sudo tail -f /var/log/nginx/access.log
```

### 3. Updates
```bash
# Backend update
cd /opt/tunlify-backend
sudo git pull
cd backend
sudo npm install
sudo pm2 restart tunlify-backend

# Frontend update
cd /opt/tunlify-frontend
sudo git pull
sudo npm install
sudo npm run build
sudo pm2 restart tunlify-frontend
```

## Security Checklist

- ✅ Firewall configured (UFW)
- ✅ SSH key authentication
- ✅ Supabase RLS enabled
- ✅ Redis password protected
- ✅ JWT secret secured
- ✅ SMTP credentials secured
- ✅ SSL certificates installed
- ✅ Environment variables secured

## Default Users

- **Admin**: admin@tunlify.net / 123456
- **User**: user@tunlify.net / 123456

## Architecture Benefits

### ✅ **Separation of Concerns**
- Frontend: Static files + UI logic
- Backend: API + Business logic
- Database: Supabase (managed)
- Cache: Redis Cloud (managed)

### ✅ **Scalability**
- Frontend dapat di-scale horizontal
- Backend dapat di-scale dengan PM2 cluster
- Database dan Redis di-manage oleh provider

### ✅ **Security**
- Database credentials hanya di backend
- JWT secret tidak exposed ke frontend
- CORS protection
- Rate limiting

### ✅ **Maintenance**
- Managed database (Supabase)
- Managed cache (Redis Cloud)
- Automated SSL (Caddy)
- Process management (PM2)