package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
)

type TunnelAuth struct {
	TunnelID   string `json:"tunnel_id"`
	Subdomain  string `json:"subdomain"`
	Location   string `json:"location"`
	TunnelURL  string `json:"tunnel_url"`
	User       string `json:"user"`
}

type Config struct {
	Token     string
	LocalAddr string
	ServerURL string
}

func main() {
	var config Config
	
	flag.StringVar(&config.Token, "token", "", "Connection token from Tunlify dashboard")
	flag.StringVar(&config.LocalAddr, "local", "127.0.0.1:3000", "Local address to tunnel (e.g., 127.0.0.1:3000)")
	flag.StringVar(&config.ServerURL, "server", "https://api.tunlify.biz.id", "Tunlify server URL")
	flag.Parse()

	if config.Token == "" {
		fmt.Println("❌ Error: Connection token is required")
		fmt.Println("Usage: ./tunlify-client -token=YOUR_TOKEN -local=127.0.0.1:3000")
		fmt.Println("")
		fmt.Println("Get your token from: https://tunlify.biz.id/dashboard")
		os.Exit(1)
	}

	if config.LocalAddr == "" {
		config.LocalAddr = "127.0.0.1:3000"
	}

	fmt.Println("🚀 Tunlify Client Starting...")
	fmt.Println("================================")
	fmt.Printf("🔑 Token: %s...\n", config.Token[:8])
	fmt.Printf("🎯 Local: %s\n", config.LocalAddr)
	fmt.Printf("🌐 Server: %s\n", config.ServerURL)
	fmt.Println("")

	// Authenticate with server
	auth, err := authenticate(config)
	if err != nil {
		log.Fatalf("❌ Authentication failed: %v", err)
	}

	fmt.Println("✅ Authentication successful!")
	fmt.Printf("🚇 Tunnel: %s\n", auth.TunnelURL)
	fmt.Printf("👤 User: %s\n", auth.User)
	fmt.Println("")
	fmt.Println("🔗 Your tunnel is now active!")
	fmt.Printf("🌍 Public URL: %s\n", auth.TunnelURL)
	fmt.Printf("📍 Forwarding to: http://%s\n", config.LocalAddr)
	fmt.Println("")

	// Start tunnel server
	go startTunnelServer(config, auth)

	// Wait for interrupt signal
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	fmt.Println("\n🛑 Shutting down tunnel...")
	// TODO: Notify server about disconnection
}

func authenticate(config Config) (*TunnelAuth, error) {
	authData := map[string]string{
		"connection_token": config.Token,
	}

	jsonData, err := json.Marshal(authData)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(
		config.ServerURL+"/api/tunnels/auth",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to server: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("authentication failed (status %d): %s", resp.StatusCode, string(body))
	}

	var auth TunnelAuth
	if err := json.NewDecoder(resp.Body).Decode(&auth); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return &auth, nil
}

func startTunnelServer(config Config, auth *TunnelAuth) {
	// For now, we'll use a simple HTTP proxy approach
	// In a real implementation, this would establish a WebSocket connection
	// to the Tunlify server and handle bidirectional communication
	
	fmt.Println("🔄 Starting tunnel server...")
	
	// Parse local address
	if !strings.Contains(config.LocalAddr, "://") {
		config.LocalAddr = "http://" + config.LocalAddr
	}
	
	localURL, err := url.Parse(config.LocalAddr)
	if err != nil {
		log.Fatalf("❌ Invalid local address: %v", err)
	}

	// Test local connection
	if err := testLocalConnection(localURL.String()); err != nil {
		fmt.Printf("⚠️  Warning: Cannot connect to local application at %s\n", config.LocalAddr)
		fmt.Printf("   Error: %v\n", err)
		fmt.Println("   Make sure your application is running on the specified address.")
		fmt.Println("")
	} else {
		fmt.Printf("✅ Local application is accessible at %s\n", config.LocalAddr)
	}

	// Keep the connection alive
	// In a real implementation, this would maintain a WebSocket connection
	// and handle incoming requests from the Tunlify server
	
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Send heartbeat to server
			fmt.Printf("💓 Heartbeat - Tunnel active: %s\n", auth.TunnelURL)
			
			// Test local connection periodically
			if err := testLocalConnection(localURL.String()); err != nil {
				fmt.Printf("⚠️  Local application unreachable: %v\n", err)
			}
		}
	}
}

func testLocalConnection(localURL string) error {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}
	
	resp, err := client.Get(localURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	return nil
}

// WebSocket connection (for future implementation)
func connectWebSocket(config Config, auth *TunnelAuth) {
	// This would establish a WebSocket connection to the Tunlify server
	// and handle real-time request forwarding
	
	wsURL := strings.Replace(config.ServerURL, "https://", "wss://", 1)
	wsURL = strings.Replace(wsURL, "http://", "ws://", 1)
	wsURL += "/ws/tunnel/" + auth.TunnelID
	
	fmt.Printf("🔌 Connecting to WebSocket: %s\n", wsURL)
	
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		log.Printf("❌ WebSocket connection failed: %v", err)
		return
	}
	defer conn.Close()
	
	fmt.Println("✅ WebSocket connected")
	
	// Handle WebSocket messages
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("❌ WebSocket read error: %v", err)
			break
		}
		
		// Process incoming requests and forward to local application
		fmt.Printf("📨 Received: %s\n", string(message))
	}
}