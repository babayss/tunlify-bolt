#!/bin/bash

echo "🚀 Quick Fix 502 Error"
echo "======================"
echo ""

echo "📋 Step 1: Check backend status..."
if curl -s https://api.tunlify.biz.id/health > /dev/null; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend not responding"
    echo "   🔧 Restarting backend..."
    pm2 restart tunlify-backend
    sleep 3
fi

echo ""
echo "📋 Step 2: Check if you have tunnels..."
echo "   Go to: https://tunlify.biz.id/dashboard"
echo "   Login and check if you have any tunnels created"

echo ""
echo "📋 Step 3: Get your connection token..."
echo "   1. Open dashboard: https://tunlify.biz.id/dashboard"
echo "   2. Click on your tunnel"
echo "   3. Copy the connection token"

echo ""
echo "📋 Step 4: Run tunnel client..."
echo "   Replace YOUR_TOKEN with your actual token:"
echo ""
echo "   Option A: Node.js client"
echo "   cd nodejs-client"
echo "   npm install"
echo "   node index.js -t YOUR_TOKEN -l 127.0.0.1:3000"
echo ""
echo "   Option B: Global client"
echo "   npm install -g tunlify-client"
echo "   tunlify -t YOUR_TOKEN -l 127.0.0.1:3000"

echo ""
echo "📋 Step 5: Make sure local app is running..."
echo "   Example: python3 -m http.server 3000"
echo "   Or any app on localhost:3000"

echo ""
echo "🎉 After running client, 502 error should be fixed!"
echo "   Your tunnel will forward requests to your local app."

echo ""
echo "🔍 For detailed diagnosis, run:"
echo "   node debug-502-fixed.js"