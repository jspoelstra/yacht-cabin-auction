import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5000;

// In-memory storage for auction state
let auctionState = null;

// Store connected clients
const clients = new Set();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);

  // Send current auction state to new client
  if (auctionState) {
    ws.send(JSON.stringify({
      type: 'state-update',
      state: auctionState
    }));
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'get-state':
          // Send current state to requesting client
          ws.send(JSON.stringify({
            type: 'state-update',
            state: auctionState
          }));
          break;
          
        case 'set-state':
          // Update auction state
          auctionState = data.state;
          
          // Broadcast to all connected clients
          broadcastState();
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast auction state to all connected clients
function broadcastState() {
  const message = JSON.stringify({
    type: 'state-update',
    state: auctionState
  });

  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

// REST API endpoints (optional, for debugging)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    clients: clients.size,
    hasAuctionState: auctionState !== null
  });
});

app.get('/api/state', (req, res) => {
  res.json({ state: auctionState });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
