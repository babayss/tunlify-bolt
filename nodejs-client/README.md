# Tunlify Client (Node.js)

Node.js client untuk menghubungkan aplikasi lokal ke Tunlify tunnel.

## 🚀 Installation

### Option 1: NPM Global Install (Recommended)
```bash
npm install -g tunlify-client
tunlify --help
```

### Option 2: Download Binary
Download executable untuk OS Anda:
- **Windows**: `tunlify-win.exe`
- **macOS**: `tunlify-macos`
- **Linux**: `tunlify-linux`

### Option 3: Run with NPX (No Install)
```bash
npx tunlify-client -t YOUR_TOKEN -l 127.0.0.1:3000
```

## 📖 Usage

### Basic Usage
```bash
tunlify -t YOUR_TOKEN -l 127.0.0.1:3000
```

### Full Options
```bash
tunlify \
  --token YOUR_CONNECTION_TOKEN \
  --local 127.0.0.1:3000 \
  --server https://api.tunlify.biz.id
```

### Examples

#### Web Application (React, Vue, etc.)
```bash
# Development server di port 3000
tunlify -t abc123... -l 127.0.0.1:3000
```

#### API Server (Express, FastAPI, etc.)
```bash
# API server di port 8080
tunlify -t abc123... -l 127.0.0.1:8080
```

#### Database (MySQL, PostgreSQL, etc.)
```bash
# Database di port 5432
tunlify -t abc123... -l 127.0.0.1:5432
```

#### Custom Host
```bash
# Aplikasi di host lain
tunlify -t abc123... -l 192.168.1.100:3000
```

## 🎯 How to Get Token

1. Buka [Tunlify Dashboard](https://tunlify.biz.id/dashboard)
2. Login ke akun Anda
3. Klik **"Create New Tunnel"**
4. Pilih subdomain dan lokasi
5. Copy **connection token** yang diberikan
6. Jalankan client dengan token tersebut

## 🔧 Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--token` | `-t` | Connection token (required) | - |
| `--local` | `-l` | Local address to tunnel | `127.0.0.1:3000` |
| `--server` | `-s` | Tunlify server URL | `https://api.tunlify.biz.id` |
| `--help` | `-h` | Show help | - |
| `--version` | `-V` | Show version | - |

## 🛠️ Troubleshooting

### "Authentication failed"
- ✅ Pastikan connection token benar
- ✅ Check koneksi internet
- ✅ Pastikan tunnel masih aktif di dashboard

### "Cannot connect to local application"
- ✅ Pastikan aplikasi lokal running
- ✅ Check alamat dan port benar
- ✅ Test manual: `curl http://127.0.0.1:3000`

### "Network error"
- ✅ Check firewall settings
- ✅ Pastikan port tidak diblokir
- ✅ Try restart client

## 🏗️ Development

### Setup
```bash
git clone https://github.com/tunlify/nodejs-client.git
cd nodejs-client
npm install
```

### Run Development
```bash
node index.js -t YOUR_TOKEN -l 127.0.0.1:3000
```

### Build Executables
```bash
# Build untuk semua platform
npm run build-all

# Output di folder dist/
# - tunlify-linux
# - tunlify-win.exe  
# - tunlify-macos
```

## 📦 Distribution

### NPM Package
```bash
npm publish
```

### GitHub Releases
Upload executables ke GitHub releases untuk easy download.

## 🆚 Advantages vs Golang

| Feature | Node.js Client | Golang Client |
|---------|----------------|---------------|
| **Installation** | `npm install -g` | Download binary |
| **User Base** | Most developers have Node | Need to download |
| **Size** | ~50MB | ~10MB |
| **Startup** | ~1s | ~0.1s |
| **Cross-platform** | ✅ Easy | ✅ Easy |
| **Dependencies** | Node.js required | None |

## 🎯 Why Node.js Client?

1. **🚀 Easy Installation**: `npm install -g tunlify-client`
2. **👥 Wide Adoption**: Most developers already have Node.js
3. **📦 Package Manager**: Easy updates via npm
4. **🔧 Development**: Easier to modify and contribute
5. **🌐 Ecosystem**: Rich npm ecosystem for features

## 📄 License

MIT License - see LICENSE file for details.