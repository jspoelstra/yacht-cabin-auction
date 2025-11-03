import { useState, useEffect, useCallback, useRef } from 'react';

// Get WebSocket URL based on current location
function getWebSocketUrl(): string {
  // In development, Vite runs on 5173 but we want to connect directly to the backend on 5000
  if (window.location.hostname === 'localhost' && window.location.port === '5173') {
    return 'ws://localhost:5000';
  }
  
  // In production, use the same host/port as the current page
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}`;
}

export function useSharedKV<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isSettingStateRef = useRef(false);

  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0;
        
        // Request current state from server
        ws.send(JSON.stringify({ type: 'get-state' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'state-update') {
            // Only update state if we're not currently setting it
            if (!isSettingStateRef.current && data.state !== null) {
              setState(data.state);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        wsRef.current = null;
        
        // Attempt to reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Reconnecting... (attempt ${reconnectAttemptsRef.current})`);
          connectWebSocket();
        }, delay);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const setSharedState = useCallback((value: T | ((prev: T) => T)) => {
    setState((prevState) => {
      const newState = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
      
      // Send state update to server
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        isSettingStateRef.current = true;
        wsRef.current.send(JSON.stringify({
          type: 'set-state',
          state: newState
        }));
        // Reset flag after a short delay
        setTimeout(() => {
          isSettingStateRef.current = false;
        }, 100);
      }
      
      return newState;
    });
  }, []);

  return [state, setSharedState];
}
