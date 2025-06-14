#!/bin/bash

echo "🚀 Quick Tunnel Test - Fix 502 Error"
echo "===================================="
echo ""

echo "📋 Step 1: Check if backend is running..."
if curl -s https://api.tunlify.biz.id/health > /dev/null; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend not responding"
    exit 1
fi

echo ""
echo "📋 Step 2: Check Node.js client..."
if [ -d "nodejs-client" ]; then
    echo "   ✅ Node.js client found"
    cd nodejs-client
    
    if [ ! -d "node_modules" ]; then
        echo "   📦 Installing dependencies..."
        npm install
    fi
    
    echo ""
    echo "📋 Step 3: Instructions to fix 502 error:"
    echo ""
    echo "🎯 Run this command to start tunnel client:"
    echo "   node index.js -t YOUR_CONNECTION_TOKEN -l 127.0.0.1:3000"
    echo ""
    echo "📝 Replace YOUR_CONNECTION_TOKEN with token from dashboard:"
    echo "   1. Go to: https://tunlify.biz.id/dashboard"
    echo "   2. Create or view existing tunnel"
    echo "   3. Copy connection token"
    echo "   4. Run command above with your token"
    echo ""
    echo "💡 Example:"
    echo "   node index.js -t abc123def456... -l 127.0.0.1:3000"
    echo ""
    echo "🎉 After running client:"
    echo "   ✅ 502 error will disappear"
    echo "   ✅ Tunnel will work end-to-end"
    echo "   ✅ Requests forwarded to local app"
    
else
    echo "   ❌ Node.js client not found"
    echo "   💡 Create it first or use npm: npm install -g tunlify-client"
fi

echo ""
echo "🔧 Alternative: Install global client"
echo "   npm install -g tunlify-client"
echo "   tunlify -t YOUR_TOKEN -l 127.0.0.1:3000"