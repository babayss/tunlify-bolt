#!/bin/bash

echo "🔍 Checking Backend Status - 502 Error Debug"
echo "============================================="
echo ""

echo "📋 Step 1: Check if backend is running..."
if curl -s https://api.tunlify.biz.id/health > /dev/null; then
    echo "   ✅ Backend is responding"
    echo "   📊 Health check:"
    curl -s https://api.tunlify.biz.id/health | jq '.' 2>/dev/null || curl -s https://api.tunlify.biz.id/health
else
    echo "   ❌ Backend not responding"
    echo "   💡 Check if PM2 is running: pm2 status"
    exit 1
fi

echo ""
echo "📋 Step 2: Check PM2 status..."
pm2 status

echo ""
echo "📋 Step 3: Check recent backend logs..."
echo "Last 20 lines from backend:"
pm2 logs tunlify-backend --lines 20

echo ""
echo "📋 Step 4: Check Caddy status..."
sudo systemctl status caddy --no-pager

echo ""
echo "📋 Step 5: Check Caddy logs..."
echo "Recent Caddy logs:"
sudo journalctl -u caddy --lines 10 --no-pager

echo ""
echo "📋 Step 6: Test tunnel proxy endpoint..."
echo "Testing tunnel proxy with sample headers:"
curl -v -H "X-Tunnel-Subdomain: test" -H "X-Tunnel-Region: id" https://api.tunlify.biz.id/tunnel-proxy

echo ""
echo "============================================="
echo "🎯 Analysis Complete"
echo ""
echo "💡 Common 502 Causes:"
echo "   1. Backend not running (PM2 stopped)"
echo "   2. Caddy not forwarding properly"
echo "   3. WebSocket client not connected"
echo "   4. Database connection issues"
echo ""
echo "🚀 Next Steps:"
echo "   1. Check PM2 status above"
echo "   2. Check Caddy status above"
echo "   3. Run tunnel client if backend is OK"
echo "   4. Check specific error in tunnel proxy test"