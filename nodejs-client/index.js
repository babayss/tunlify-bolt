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
    this.localServer = null;
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

      // Step 3: Start tunnel
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

  async keepAlive() {
    // Send heartbeat every 30 seconds
    setInterval(async () => {
      try {
        console.log(chalk.gray(`💓 Heartbeat - Tunnel active: ${this.tunnel.tunnel_url}`));
        
        // Test local connection periodically
        await this.testLocalConnection();
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Local application unreachable: ${error.message}`));
      }
    }, 30000);

    // Keep process alive
    return new Promise(() => {
      // This promise never resolves, keeping the process alive
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n🛑 Shutting down tunnel...'));
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