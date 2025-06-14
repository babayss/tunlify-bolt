# 🚀 Run Tunnel Client - Step by Step Guide

## 🔍 Current Issue

Your tunnel shows `client_connected: true` in database but WebSocket server has `Active tunnels: 0`. This is a sync issue.

## 📋 Step 1: Reset Connection Status

```bash
node fix-websocket-sync.js
```

This will reset all tunnel connections to sync database with WebSocket server.

## 📋 Step 2: Get Your Connection Token

1. Open: https://tunlify.biz.id/dashboard
2. Login with your account
3. Find tunnel: `steptest.id.tunlify.biz.id`
4. Copy the connection token (starts with `3a0dd1f9...`)

## 📋 Step 3: Start Local Application

Make sure you have something running on port 3000:

```bash
# Option 1: Simple HTTP server
python3 -m http.server 3000

# Option 2: Node.js app
cd your-app
npm start

# Option 3: Any other app on localhost:3000
```

## 📋 Step 4: Run Tunnel Client

### Option A: Use Existing Node.js Client

```bash
cd nodejs-client
npm install
node index.js -t 3a0dd1f97095dffa864bfa5e1ff859804ba802b2a61fd772e720a8571da4d844 -l 127.0.0.1:3000
```

### Option B: Install Global Client

```bash
npm install -g tunlify-client
tunlify -t 3a0dd1f97095dffa864bfa5e1ff859804ba802b2a61fd772e720a8571da4d844 -l 127.0.0.1:3000
```

## 📋 Step 5: Verify Connection

After running client, you should see:

```
✅ WebSocket connected
✅ Local address confirmed: 127.0.0.1:3000
💓 Heartbeat - Tunnel active: https://steptest.id.tunlify.biz.id
```

## 📋 Step 6: Test Tunnel

Open browser and go to: https://steptest.id.tunlify.biz.id

You should see your local application instead of 502 error!

## 🎯 Expected Flow

1. ✅ Client connects to WebSocket server
2. ✅ Database updated: `client_connected: true`
3. ✅ WebSocket server shows: `Active tunnels: 1`
4. ✅ Requests forwarded to your local app
5. ✅ 502 error disappears!

## 💡 Troubleshooting

### If client fails to connect:
- Check internet connection
- Verify connection token is correct
- Make sure backend is running: `pm2 status`

### If local app not accessible:
- Check if app is running on port 3000
- Test manually: `curl http://127.0.0.1:3000`
- Try different port if needed

### If still 502 error:
- Check client logs for errors
- Verify WebSocket connection established
- Check backend logs: `pm2 logs tunlify-backend`

## 🚀 Quick Commands

```bash
# 1. Reset connections
node fix-websocket-sync.js

# 2. Start local app
python3 -m http.server 3000

# 3. Run client (in new terminal)
cd nodejs-client
node index.js -t YOUR_TOKEN -l 127.0.0.1:3000

# 4. Test tunnel
curl https://steptest.id.tunlify.biz.id
```