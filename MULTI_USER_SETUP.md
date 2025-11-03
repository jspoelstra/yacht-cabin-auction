# Multi-User Setup Guide

## Problem Fixed
The application now supports **multiple concurrent users** accessing from different browsers/devices simultaneously. Previously, the app used localStorage which is isolated per browser, preventing users from seeing shared auction state.

## Solution Implemented
- **Backend WebSocket Server**: Added Express.js server with WebSocket support for real-time state synchronization
- **Shared State Hook**: Replaced `useKV` (localStorage) with `useSharedKV` (WebSocket-based)
- **Real-time Updates**: All connected clients receive instant updates when auction state changes

## Running the Application

### Production Mode (Recommended for Testing)
```bash
# Build the application
npm run build

# Start the server (uses port 5001 to avoid macOS Control Center)
PORT=5001 npm start
```

Then open multiple browsers at: `http://localhost:5001`

### Development Mode
```bash
# Run both frontend (Vite) and backend simultaneously
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

Or run them separately:
```bash
# Terminal 1: Backend server
npm run dev:backend

# Terminal 2: Frontend dev server
npm run dev:frontend
```

### Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost:5001
```

## Testing Multi-User Functionality

1. **Start the server** (production mode recommended):
   ```bash
   npm run build
   PORT=5001 npm start
   ```

2. **Open multiple browser windows**:
   - Chrome: `http://localhost:5001`
   - Firefox: `http://localhost:5001`
   - Safari: `http://localhost:5001`
   - Chrome Incognito: `http://localhost:5001`

3. **Test the flow**:
   - In Browser 1: Click "Admin Access", enter password (default: "Spoelstra"), set up auction
   - In Browser 2: Refresh if needed - you should now see the participant login screen
   - In Browser 1: Start bidding
   - In Browser 2: Log in as a participant
   - Both browsers should see real-time updates when bids are placed

## WebSocket Connection

The application automatically connects to the WebSocket server:
- **Development**: `ws://localhost:5000`
- **Production**: Uses the same host/port as the web page (supports `wss://` for HTTPS)

## Health Check

Check server status:
```bash
curl http://localhost:5001/api/health
```

Response:
```json
{
  "status": "ok",
  "clients": 2,
  "hasAuctionState": true
}
```

## Architecture

```
┌─────────────┐         WebSocket        ┌─────────────┐
│  Browser 1  │ ←──────────────────────→ │             │
├─────────────┤                          │   Node.js   │
│  Browser 2  │ ←──────────────────────→ │   Express   │
├─────────────┤                          │   Server    │
│  Browser 3  │ ←──────────────────────→ │             │
└─────────────┘                          └─────────────┘
                                               │
                                         ┌─────▼─────┐
                                         │  Auction  │
                                         │   State   │
                                         │ (In-Memory)│
                                         └───────────┘
```

## Files Changed

1. **`server.js`** (new): Express + WebSocket server
2. **`src/hooks/use-shared-kv.ts`** (new): WebSocket-based state management hook
3. **`src/App.tsx`**: Updated to use `useSharedKV` instead of `useKV`
4. **`package.json`**: Added `express` and `ws` dependencies, updated scripts
5. **`Dockerfile`**: Changed to run Node.js server instead of static file server
6. **`vite.config.ts`**: Added proxy configuration for development
7. **`dev.js`** (new): Development script to run both servers

## Notes

- Port 5000 conflicts with macOS Control Center (AirPlay), use port 5001
- WebSocket automatically reconnects if connection is lost
- State is stored in-memory on the server (will reset if server restarts)
- For production with persistence, consider adding a database
