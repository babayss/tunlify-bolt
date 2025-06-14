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
        localAddress: null // Will be set by client
      });

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
              }
              break;

            case 'response':
              // Client sends response back to browser
              // TODO: Forward to waiting HTTP request
              console.log('📤 Response from client:', data.requestId);
              break;

            case 'heartbeat':
              // Client heartbeat
              ws.send(JSON.stringify({ type: 'heartbeat_ack' }));
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
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        tunnel: {
          id: tunnel.id,
          subdomain: tunnel.subdomain,
          location: tunnel.location,
          url: `https://${tunnel.subdomain}.${tunnel.location}.tunlify.biz.id`
        }
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
      const requestId = Date.now().toString();
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000); // 30 second timeout

      // Listen for response
      const responseHandler = (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'response' && data.requestId === requestId) {
            clearTimeout(timeout);
            connection.ws.removeListener('message', responseHandler);
            resolve(data);
          }
        } catch (error) {
          // Ignore parsing errors for other messages
        }
      };

      connection.ws.on('message', responseHandler);

      // Send request to client
      connection.ws.send(JSON.stringify({
        type: 'request',
        requestId,
        ...requestData
      }));
    });
  };

  return { activeTunnels, forwardRequest };
}

module.exports = { setupWebSocketServer };