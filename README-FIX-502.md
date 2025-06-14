# 🚀 Fix 502 Error - Tunnel Client Setup

## 📋 Situasi Saat Ini

Sistem tunnel Anda **sudah berfungsi dengan sempurna**! 502 error yang terjadi adalah **expected behavior** karena WebSocket client belum terhubung.

### ✅ Yang Sudah Berfungsi:
- Backend API running di port 3001
- Caddy reverse proxy configured
- WebSocket server implemented
- Database schema complete
- Tunnel management system
- Authentication system

### ❌ Yang Perlu Dilakukan:
- Jalankan tunnel client untuk menghubungkan aplikasi lokal

## 🎯 Cara Mengatasi 502 Error

### Option 1: Node.js Client (Recommended)

```bash
# Install global client
npm install -g tunlify-client

# Run client
tunlify -t YOUR_CONNECTION_TOKEN -l 127.0.0.1:3000
```

### Option 2: Use Local Node.js Client

```bash
# Go to client directory
cd nodejs-client

# Install dependencies
npm install

# Run client
node index.js -t YOUR_CONNECTION_TOKEN -l 127.0.0.1:3000
```

### Option 3: Golang Client

```bash
# Build client
cd golang-client
go build -o tunlify-client main.go

# Run client
./tunlify-client -token=YOUR_CONNECTION_TOKEN -local=127.0.0.1:3000
```

## 📝 Step-by-Step Instructions

### 1. Get Connection Token
1. Buka https://tunlify.biz.id/dashboard
2. Login dengan akun Anda
3. Create tunnel baru atau lihat existing tunnel
4. Copy **connection token**

### 2. Start Local Application
```bash
# Contoh: React app
npm start  # Running di port 3000

# Atau aplikasi lain
python -m http.server 3000
```

### 3. Run Tunnel Client
```bash
# Ganti YOUR_TOKEN dengan token dari dashboard
tunlify -t YOUR_TOKEN -l 127.0.0.1:3000
```

### 4. Test Tunnel
- Akses tunnel URL dari dashboard
- Should work without 502 error!

## 🔍 Troubleshooting

### "Cannot connect to local application"
- Pastikan aplikasi lokal running di port yang benar
- Test manual: `curl http://127.0.0.1:3000`

### "Authentication failed"
- Pastikan connection token benar
- Check tunnel masih aktif di dashboard

### "WebSocket connection failed"
- Check internet connection
- Pastikan firewall tidak memblokir

## 💡 Expected Behavior

### Tanpa Client (Current):
- ❌ 502/503 error
- ❌ "WebSocket client not connected"

### Dengan Client (After fix):
- ✅ Requests forwarded to local app
- ✅ Responses sent back to browser
- ✅ Tunnel works end-to-end

## 🎉 Conclusion

**Sistem tunnel Anda sudah LENGKAP dan SIAP!**

502 error bukan bug, tapi expected behavior ketika client belum connect. Setelah menjalankan tunnel client, semua akan berfungsi dengan sempurna.

## 📞 Support

Jika masih ada masalah setelah menjalankan client:
1. Check backend logs: `pm2 logs tunlify-backend`
2. Check Caddy logs: `sudo journalctl -u caddy -f`
3. Test client connection dengan token yang benar