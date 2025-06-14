# 🚀 Tunlify Deployment Guide

## Server A (Backend Server)

### 1. Setup Database
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE tunlify;
CREATE USER tunlify_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tunlify TO tunlify_user;
\q

# Import schema
sudo -u postgres psql tunlify < backend/database/schema.sql
```

### 2. Setup Backend API
```bash
# Clone dan setup backend
cd /opt
sudo git clone your-repo tunlify-backend
cd tunlify-backend/backend

# Install dependencies
sudo npm install

# Setup environment
sudo cp .env.example .env
sudo nano .env
# Edit dengan konfigurasi yang sesuai

# Test backend
npm start
```

### 3. Setup PM2 (Process Manager)
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

### 4. Setup Caddy
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

## Server B (Frontend Server)

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
# Tambahkan:
# NEXT_PUBLIC_BACKEND_URL=https://api.tunlify.biz.id

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

## DNS Configuration

### Domain Records
```
A     tunlify.biz.id          -> Server A IP
A     api.tunlify.biz.id      -> Server A IP
A     *.id.tunlify.biz.id     -> Server A IP
A     *.sg.tunlify.biz.id     -> Server A IP
A     *.us.tunlify.biz.id     -> Server A IP
A     *.de.tunlify.biz.id     -> Server A IP
A     *.jp.tunlify.biz.id     -> Server A IP
```

## Monitoring & Maintenance

### 1. Check Services
```bash
# Backend (Server A)
sudo pm2 status
sudo systemctl status caddy
sudo systemctl status postgresql

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
- ✅ Database password secured
- ✅ JWT secret generated
- ✅ SMTP credentials secured
- ✅ SSL certificates installed
- ✅ Regular backups scheduled
- ✅ Log rotation configured

## Backup Strategy

### Database Backup
```bash
# Create backup script
sudo nano /opt/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
sudo -u postgres pg_dump tunlify > $BACKUP_DIR/tunlify_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "tunlify_*.sql" -mtime +7 -delete
```

```bash
# Make executable and add to cron
sudo chmod +x /opt/backup-db.sh
sudo crontab -e
# Add: 0 2 * * * /opt/backup-db.sh
```