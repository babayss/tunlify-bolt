#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');
const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const url = require('url');
const chalk = require('chalk');
const ora = require('ora');

// CLI Configuration
program
  .name('tunlify')
  .description('Tunlify tunneling client - Connect your local apps to the internet')
  .version('1.0.0')
  .requiredOption('-t, --token <token>', 'Connection token from Tunlify dashboard')
  .option('-l, --local <address>', 'Local address to tunnel', '127.0.0.1:3000')
  .option('-s, --server <url>', 'Tunlify server URL', 'https://api.tunlify.biz.id')
  .parse();

const options = program.opts();

// Validate options
if (!options.token) {
  console.error(chalk.red('❌ Error: Connection token is required'));
  console.log(chalk.yellow('Get your token from: https://tunlify.biz.id/dashboard'));
  process.exit(1);
}

// Main client class
class TunlifyClient {
  constructor(config) {
    this.config = config;
    this.tunnel = null;
    this.ws = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async start() {
    console.log(chalk.blue('🚀 Tunlify Client Starting...'));
    console.log(chalk.blue('================================'));
    console.log(chalk.gray(`🔑 Token: ${this.config.token.substring(0, 8)}...`));
    console.log(chalk.gray(`🎯 Local: ${this.config.local}`));
    console.log(chalk.gray(`🌐 Server: ${this.config.server}`));
    console.log('');

    try {
      // Step 1: Authenticate
      const spinner = ora('Authenticating with Tunlify server...').start();
      this.tunnel = await this.authenticate();
      spinner.succeed('Authentication successful!');

      console.log(chalk.green('✅ Tunnel Information:'));
      console.log(chalk.cyan(`🚇 Tunnel URL: ${this.tunnel.tunnel_url}`));
      console.log(chalk.cyan(`👤 User: ${this.tunnel.user}`));
      console.log('');

      // Step 2: Test local connection
      const localSpinner = ora('Testing local application...').start();
      await this.testLocalConnection();
      localSpinner.succeed('Local application is accessible');

      // Step 3: Connect WebSocket
      const wsSpinner = ora('Establishing WebSocket connection...').start();
      await this.connectWebSocket();
      wsSpinner.succeed('WebSocket connection established');

      console.log(chalk.green('🔗 Your tunnel is now active!'));
      console.log(chalk.yellow(`🌍 Public URL: ${this.tunnel.tunnel_url}`));
      console.log(chalk.yellow(`📍 Forwarding to: http://${this.config.local}`));
      console.log('');
      console.log(chalk.gray('Press Ctrl+C to stop the tunnel'));

      // Keep alive
      await this.keepAlive();

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.config.server}/api/tunnels/auth`, {
        connection_token: this.config.token
      }, {
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Authentication failed: ${error.response.data.message || error.response.statusText}`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Tunlify server. Please check your internet connection.');
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
  }

  async testLocalConnection() {
    return new Promise((resolve, reject) => {
      const [host, port] = this.config.local.split(':');
      const options = {
        hostname: host,
        port: parseInt(port),
        timeout: 5000,
        method: 'GET',
        path: '/'
      };

      const req = http.request(options, (res) => {
        resolve();
      });

      req.on('error', (error) => {
        reject(new Error(`Cannot connect to local application at ${this.config.local}. Make sure your application is running.`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Timeout connecting to local application at ${this.config.local}`));
      });

      req.end();
    });
  }

  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.server.replace('https://', 'wss://').replace('http://', 'ws://');
      const fullWsUrl = `${wsUrl}/ws/tunnel?token=${this.config.token}`;
      
      console.log(chalk.gray(`🔌 Connecting to: ${fullWsUrl}`));

      this.ws = new WebSocket(fullWsUrl);

      this.ws.on('open', () => {
        console.log(chalk.green('✅ WebSocket connected'));
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Send local address to server
        this.ws.send(JSON.stringify({
          type: 'set_local_address',
          address: this.config.local
        }));
        
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error(chalk.red('❌ Failed to parse WebSocket message:'), error);
        }
      });

      this.ws.on('close', () => {
        console.log(chalk.yellow('🔌 WebSocket disconnected'));
        this.connected = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(chalk.yellow(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`));
          setTimeout(() => this.connectWebSocket(), 5000);
        } else {
          console.error(chalk.red('❌ Max reconnection attempts reached'));
          process.exit(1);
        }
      });

      this.ws.on('error', (error) => {
        console.error(chalk.red('❌ WebSocket error:'), error.message);
        reject(error);
      });

      // Timeout for initial connection
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'connected':
        console.log(chalk.green(`✅ ${message.message}`));
        break;

      case 'local_address_ack':
        console.log(chalk.green(`✅ Local address confirmed: ${message.address}`));
        break;

      case 'request':
        this.handleIncomingRequest(message);
        break;

      case 'heartbeat_ack':
        // Heartbeat acknowledged
        break;

      default:
        console.log(chalk.gray(`📨 Received: ${message.type}`));
    }
  }

  async handleIncomingRequest(message) {
    const { requestId, method, url: requestUrl, headers } = message;
    
    console.log(chalk.cyan(`📥 ${method} ${requestUrl} (${requestId})`));

    try {
      // Forward request to local application
      const [host, port] = this.config.local.split(':');
      const localUrl = `http://${host}:${port}${requestUrl}`;
      
      const response = await axios({
        method: method.toLowerCase(),
        url: localUrl,
        headers: this.filterHeaders(headers),
        data: message.body,
        timeout: 30000,
        validateStatus: () => true // Accept all status codes
      });

      // Send response back to server
      this.ws.send(JSON.stringify({
        type: 'response',
        requestId,
        statusCode: response.status,
        headers: response.headers,
        body: response.data
      }));

      console.log(chalk.green(`📤 ${response.status} ${method} ${requestUrl}`));

    } catch (error) {
      console.error(chalk.red(`❌ Error forwarding request: ${error.message}`));
      
      // Send error response
      this.ws.send(JSON.stringify({
        type: 'error',
        requestId,
        message: error.message
      }));
    }
  }

  filterHeaders(headers) {
    // Remove headers that shouldn't be forwarded
    const filtered = { ...headers };
    delete filtered['host'];
    delete filtered['x-tunnel-subdomain'];
    delete filtered['x-tunnel-region'];
    delete filtered['x-real-ip'];
    delete filtered['x-forwarded-for'];
    delete filtered['x-forwarded-proto'];
    delete filtered['x-forwarded-host'];
    return filtered;
  }

  async keepAlive() {
    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (this.connected && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
        console.log(chalk.gray(`💓 Heartbeat - Tunnel active: ${this.tunnel.tunnel_url}`));
      }
    }, 30000);

    // Test local connection periodically
    const localTestInterval = setInterval(async () => {
      try {
        await this.testLocalConnection();
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Local application unreachable: ${error.message}`));
      }
    }, 60000); // Every minute

    // Keep process alive
    return new Promise(() => {
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n🛑 Shutting down tunnel...'));
        
        clearInterval(heartbeatInterval);
        clearInterval(localTestInterval);
        
        if (this.ws) {
          this.ws.close();
        }
        
        console.log(chalk.green('✅ Tunnel disconnected. Goodbye!'));
        process.exit(0);
      });
    });
  }
}

// Start the client
const client = new TunlifyClient({
  token: options.token,
  local: options.local,
  server: options.server
});

client.start().catch((error) => {
  console.error(chalk.red(`❌ Fatal error: ${error.message}`));
  process.exit(1);
});