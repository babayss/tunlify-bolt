# 🚀 Fix 502 Error - Step by Step Guide

## 🔍 Current Situation

You're getting 502 error when accessing tunnel URLs. Let's fix this systematically.

## 📋 Step 1: Run Comprehensive Debug

```bash
node debug-502-comprehensive.js
```

This will show you exactly what's happening with your tunnel system.

## 📋 Step 2: Check Backend Status

```bash
chmod +x check-backend-status.sh
./check-backend-status.sh
```

This will check if all services are running properly.

## 📋 Step 3: Based on Debug Results

### If Backend is Down:
```bash
# Restart backend
pm2 restart tunlify-backend

# Check status
pm2 status
```

### If Caddy is Down:
```bash
# Restart Caddy
sudo systemctl restart caddy

# Check status
sudo systemctl status caddy
```

### If WebSocket Client Not Connected:
```bash
# Go to client directory
cd nodejs-client

# Install dependencies if needed
npm install

# Run client with your token
node index.js -t YOUR_CONNECTION_TOKEN -l 127.0.0.1:3000
```

## 📋 Step 4: Get Your Connection Token

1. Open: https://tunlify.biz.id/dashboard
2. Login with your account
3. Find your tunnel
4. Copy the connection token
5. Use it in the client command above

## 📋 Step 5: Test Local Application

Make sure you have a local application running:

```bash
# Example: Simple HTTP server
python3 -m http.server 3000

# Or Node.js app
npm start

# Or any other app on port 3000
```

## 🎯 Expected Flow

1. ✅ Backend running on port 3001
2. ✅ Caddy forwarding requests
3. ✅ Tunnel found in database
4. ✅ WebSocket client connects
5. ✅ Requests forwarded to local app
6. ✅ 502 error disappears!

## 💡 Common Issues

### Issue 1: "WebSocket client not connected"
**Solution**: Run the tunnel client with your connection token

### Issue 2: "Implementation pending"
**Solution**: The WebSocket proxy is not fully implemented yet

### Issue 3: "Tunnel not found"
**Solution**: Create a tunnel in the dashboard first

### Issue 4: "Backend not responding"
**Solution**: Restart PM2 and check logs

## 🚀 Quick Fix Commands

```bash
# 1. Check everything
node debug-502-comprehensive.js

# 2. Restart services if needed
pm2 restart tunlify-backend
sudo systemctl restart caddy

# 3. Run tunnel client
cd nodejs-client
node index.js -t YOUR_TOKEN -l 127.0.0.1:3000

# 4. Test tunnel
curl https://your-subdomain.id.tunlify.biz.id
```

## 📞 If Still Not Working

Run the debug script and share the output. The script will tell us exactly what's wrong and how to fix it.