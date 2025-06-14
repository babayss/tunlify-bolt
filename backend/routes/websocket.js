const WebSocket = require('ws');
const url = require('url');
const supabase = require('../config/database');

// WebSocket server for tunnel connections
function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws/tunnel'
  });

  // Store active tunnel connections
  const activeTunnels = new Map();
  
  // Store pending requests waiting for responses
  const pendingRequests = new Map();

  wss.on('connection', async (ws, req) => {
    const query = url.parse(req.url, true).query;
    const connectionToken = query.token;

    console.log('🔌 WebSocket connection attempt with token:', connectionToken?.substring(0, 8) + '...');

    if (!connectionToken) {
      console.log('❌ WebSocket: No connection token provided');
      ws.close(1008, 'Connection token required');
      return;
    }

    try {
      // Authenticate tunnel
      const { data: tunnel, error } = await supabase
        .from('tunnels')
        .select(`
          *,
          users!tunnels_user_id_fkey(email, name)
        `)
        .eq('connection_token', connectionToken)
        .single();

      if (error || !tunnel) {
        console.log('❌ WebSocket: Invalid connection token');
        ws.close(1008, 'Invalid connection token');
        return;
      }

      console.log(`✅ WebSocket: Client connected for tunnel ${tunnel.subdomain}.${tunnel.location}`);
      console.log(`👤 User: ${tunnel.users.email}`);

      // Update tunnel status
      await supabase
        .from('tunnels')
        .update({ 
          client_connected: true, 
          status: 'active',
          last_connected: new Date().toISOString()
        })
        .eq('id', tunnel.id);

      // Store connection
      const tunnelKey = `${tunnel.subdomain}.${tunnel.location}`;
      activeTunnels.set(tunnelKey, {
        ws,
        tunnel,
        localAddress: null,
        connected: true,
        lastHeartbeat: Date.now()
      });

      console.log(`📊 Active tunnels: ${activeTunnels.size}`);

      // Handle messages from client
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          console.log('📨 WebSocket message from client:', data.type);

          switch (data.type) {
            case 'set_local_address':
              // Client tells us their local address
              const connection = activeTunnels.get(tunnelKey);
              if (connection) {
                connection.localAddress = data.address;
                console.log(`🎯 Local address set: ${data.address} for ${tunnelKey}`);
                
                // Send acknowledgment
                ws.send(JSON.stringify({
                  type: 'local_address_ack',
                  address: data.address
                }));
              }
              break;

            case 'response':
              // Client sends response back to browser
              const requestId = data.requestId;
              console.log(`📤 Response from client for request: ${requestId}`);
              
              if (pendingRequests.has(requestId)) {
                const { resolve } = pendingRequests.get(requestId);
                pendingRequests.delete(requestId);
                resolve(data);
              } else {
                console.log(`⚠️  No pending request found for ID: ${requestId}`);
              }
              break;

            case 'heartbeat':
              // Client heartbeat
              const conn = activeTunnels.get(tunnelKey);
              if (conn) {
                conn.lastHeartbeat = Date.now();
              }
              ws.send(JSON.stringify({ type: 'heartbeat_ack' }));
              break;

            case 'error':
              // Client error
              console.log(`❌ Client error: ${data.message}`);
              if (data.requestId && pendingRequests.has(data.requestId)) {
                const { reject } = pendingRequests.get(data.requestId);
                pendingRequests.delete(data.requestId);
                reject(new Error(data.message));
              }
              break;
          }
        } catch (error) {
          console.error('❌ WebSocket message error:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', async () => {
        console.log(`🔌 WebSocket: Client disconnected for tunnel ${tunnelKey}`);
        
        // Update tunnel status
        await supabase
          .from('tunnels')
          .update({ 
            client_connected: false, 
            status: 'inactive'
          })
          .eq('id', tunnel.id);

        // Remove from active connections
        activeTunnels.delete(tunnelKey);
        
        // Reject any pending requests
        for (const [requestId, { reject }] of pendingRequests.entries()) {
          reject(new Error('Client disconnected'));
          pendingRequests.delete(requestId);
        }
        
        console.log(`📊 Active tunnels: ${activeTunnels.size}`);
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for ${tunnelKey}:`, error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        tunnel: {
          id: tunnel.id,
          subdomain: tunnel.subdomain,
          location: tunnel.location,
          url: `https://${tunnel.subdomain}.${tunnel.location}.tunlify.biz.id`
        },
        message: 'WebSocket connection established successfully'
      }));

    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  });

  // Function to forward HTTP request to client
  const forwardRequest = async (tunnelKey, requestData) => {
    const connection = activeTunnels.get(tunnelKey);
    
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Tunnel client not connected');
    }

    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set timeout
      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId);
        reject(new Error('Request timeout - local application did not respond'));
      }, 30000); // 30 second timeout

      // Store pending request
      pendingRequests.set(requestId, { 
        resolve: (data) => {
          clearTimeout(timeout);
          resolve(data);
        }, 
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });

      // Send request to client
      const message = {
        type: 'request',
        requestId,
        method: requestData.method,
        url: requestData.url,
        headers: requestData.headers,
        body: requestData.body
      };

      console.log(`📤 Sending request to client: ${requestId} ${requestData.method} ${requestData.url}`);
      
      try {
        connection.ws.send(JSON.stringify(message));
      } catch (error) {
        clearTimeout(timeout);
        pendingRequests.delete(requestId);
        reject(new Error('Failed to send request to client'));
      }
    });
  };

  // Cleanup function for stale connections
  const cleanupStaleConnections = () => {
    const now = Date.now();
    const staleTimeout = 5 * 60 * 1000; // 5 minutes
    
    for (const [tunnelKey, connection] of activeTunnels.entries()) {
      if (now - connection.lastHeartbeat > staleTimeout) {
        console.log(`🧹 Cleaning up stale connection: ${tunnelKey}`);
        connection.ws.close();
        activeTunnels.delete(tunnelKey);
      }
    }
  };

  // Run cleanup every 2 minutes
  setInterval(cleanupStaleConnections, 2 * 60 * 1000);

  return { activeTunnels, forwardRequest };
}

module.exports = { setupWebSocketServer };