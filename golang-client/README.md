# Tunlify Client

Golang client untuk menghubungkan aplikasi lokal ke Tunlify tunnel.

## Installation

### Download Binary
Download binary sesuai OS Anda dari [releases page](https://github.com/tunlify/client/releases/latest):

- **Windows**: `tunlify-client-windows.exe`
- **macOS**: `tunlify-client-macos`
- **Linux**: `tunlify-client-linux`

### Build from Source
```bash
git clone https://github.com/tunlify/client.git
cd client
go build -o tunlify-client main.go
```

## Usage

1. **Buat tunnel** di [Tunlify Dashboard](https://tunlify.biz.id/dashboard)
2. **Copy connection token** dari dashboard
3. **Jalankan client**:

```bash
# Windows
./tunlify-client.exe -token=YOUR_TOKEN -local=127.0.0.1:3000

# macOS/Linux
./tunlify-client -token=YOUR_TOKEN -local=127.0.0.1:3000
```

## Parameters

- `-token`: Connection token dari dashboard (required)
- `-local`: Alamat aplikasi lokal (default: 127.0.0.1:3000)
- `-server`: Server Tunlify (default: https://api.tunlify.biz.id)

## Examples

### Web Application
```bash
# Aplikasi web di port 3000
./tunlify-client -token=abc123... -local=127.0.0.1:3000
```

### API Server
```bash
# API server di port 8080
./tunlify-client -token=abc123... -local=127.0.0.1:8080
```

### Custom Host
```bash
# Aplikasi di host lain
./tunlify-client -token=abc123... -local=192.168.1.100:3000
```

## How It Works

1. Client authenticate dengan server menggunakan connection token
2. Server memberikan informasi tunnel (subdomain, region)
3. Client menjaga koneksi ke server
4. Traffic dari `subdomain.region.tunlify.biz.id` di-forward ke aplikasi lokal

## Troubleshooting

### "Authentication failed"
- Pastikan connection token benar
- Check koneksi internet
- Pastikan tunnel masih aktif di dashboard

### "Cannot connect to local application"
- Pastikan aplikasi lokal running
- Check alamat dan port benar
- Test akses manual: `curl http://127.0.0.1:3000`

### "Connection timeout"
- Check firewall settings
- Pastikan port tidak diblokir
- Try restart client

## Development

### Build for All Platforms
```bash
# Windows
GOOS=windows GOARCH=amd64 go build -o tunlify-client-windows.exe main.go

# macOS
GOOS=darwin GOARCH=amd64 go build -o tunlify-client-macos main.go

# Linux
GOOS=linux GOARCH=amd64 go build -o tunlify-client-linux main.go
```

### Dependencies
```bash
go mod tidy
```

## License

MIT License - see LICENSE file for details.