# 🏗️ Tunlify Architecture Overview

## Server Setup

### Server A (70.153.208.184) - Backend + Tunnels
**Handles:**
- Backend API: `api.tunlify.biz.id`
- Tunnel subdomains: `*.id.tunlify.biz.id`, `*.sg.tunlify.biz.id`, etc.

**Services:**
- Node.js Backend API (Port 3001)
- Caddy (Port 80/443)
- Supabase (External)
- Redis (External)

**DNS Records:**
```
A     api.tunlify.biz.id      -> 70.153.208.184
A     *.id.tunlify.biz.id     -> 70.153.208.184
A     *.sg.tunlify.biz.id     -> 70.153.208.184
A     *.us.tunlify.biz.id     -> 70.153.208.184
```

### Server B (70.153.208.190) - Frontend
**Handles:**
- Main website: `tunlify.biz.id`

**Services:**
- Next.js Frontend (Port 3000)
- Nginx/Caddy (Port 80/443)

**DNS Records:**
```
A     tunlify.biz.id          -> 70.153.208.190
```

## Data Flow

### 1. User visits website
```
User -> tunlify.biz.id (Server B) -> Frontend
```

### 2. Frontend API calls
```
Frontend (Server B) -> api.tunlify.biz.id (Server A) -> Backend API
```

### 3. Tunnel access
```
User -> myapp.id.tunlify.biz.id (Server A) -> Caddy -> Backend -> Target App
```

## Current Status

### ✅ Completed
- Backend API running on Server A (70.153.208.184:3001)
- Database schema deployed to Supabase
- Authentication system working
- Admin panel functional
- Tunnel management API ready

### 🔧 Next Steps

#### Server A (Backend)
1. **Setup Caddy for SSL**
   ```bash
   # Install Caddy
   sudo apt install caddy
   
   # Copy Caddyfile
   sudo cp backend/Caddyfile /etc/caddy/Caddyfile
   
   # Start Caddy
   sudo systemctl enable caddy
   sudo systemctl start caddy
   ```

2. **Configure Environment**
   ```bash
   # Update backend/.env with correct FRONTEND_URL
   FRONTEND_URL=https://tunlify.biz.id
   ```

#### Server B (Frontend)
1. **Update Environment**
   ```bash
   # Update .env.local
   NEXT_PUBLIC_BACKEND_URL=https://api.tunlify.biz.id
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

3. **Setup Reverse Proxy**
   ```bash
   # Setup Nginx/Caddy to serve frontend
   ```

## Security Considerations

### ✅ Implemented
- JWT authentication
- CORS protection
- Rate limiting
- Input validation
- Password hashing
- Environment variables

### 🔒 SSL/TLS
- Caddy will automatically handle SSL certificates
- Let's Encrypt integration
- HTTPS enforcement

## Monitoring

### Logs Location
- Backend API: `/var/log/pm2/tunlify-backend.log`
- Caddy Access: `/var/log/caddy/tunlify-api.log`
- Tunnel Access: `/var/log/caddy/tunlify-tunnels-*.log`

### Health Checks
- Backend: `https://api.tunlify.biz.id/health`
- Frontend: `https://tunlify.biz.id`

## Tunnel System

### How it works
1. User creates tunnel in dashboard
2. Tunnel config stored in Supabase
3. Caddy catches subdomain requests
4. Backend looks up tunnel target
5. Request proxied to user's local app

### Example
```
User creates: myapp.id.tunlify.biz.id -> 127.0.0.1:3000
Caddy receives: https://myapp.id.tunlify.biz.id/api/users
Backend finds: target_ip=127.0.0.1, target_port=3000
Proxies to: http://127.0.0.1:3000/api/users
```

## Default Credentials
- **Admin**: admin@tunlify.net / admin123
- **Test User**: user@tunlify.net / 123456