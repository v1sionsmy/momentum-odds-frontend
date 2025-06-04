import { useState, useCallback, useEffect, useRef } from 'react';
import { useUpdatesWebSocket, UpdateMessage } from './useUpdatesWebSocket';

interface OddsMovement {
  direction: 'up' | 'down' | 'neutral';
  value: number;
  timestamp: string;
}

interface OddsItem {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  market: 'moneyline' | 'spread' | 'total';
  odds: {
    home: number;
    away: number;
  };
  movement: {
    home: OddsMovement;
    away: OddsMovement;
  };
  timestamp: string;
}

interface GameOdds {
  id: string;
  homeTeam: {
    name: string;
    logo: string;
    color: string;
  };
  awayTeam: {
    name: string;
    logo: string;
    color: string;
  };
  sport: string;
  period: string;
  timeRemaining: string;
  markets: {
    moneyline: {
      home: { odds: number; movement: OddsMovement };
      away: { odds: number; movement: OddsMovement };
    };
    spread: {
      points: number;
      home: { odds: number; movement: OddsMovement };
      away: { odds: number; movement: OddsMovement };
    };
    total: {
      points: number;
      over: { odds: number; movement: OddsMovement };
      under: { odds: number; movement: OddsMovement };
    };
  };
  lastUpdate: string;
}

interface UseOddsWebSocketOptions {
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
}

interface UseOddsWebSocketResult {
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  tickerOdds: OddsItem[];
  gameOdds: Record<string, GameOdds>;
  selectedGame: GameOdds | null;
  selectGame: (gameId: string) => void;
  reconnect: () => Promise<void>;
}

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds

export function useOddsWebSocket(options: UseOddsWebSocketOptions = {}): UseOddsWebSocketResult {
  const [tickerOdds, setTickerOdds] = useState<OddsItem[]>([]);
  const [gameOdds, setGameOdds] = useState<Record<string, GameOdds>>({});
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Add this new state to track token readiness
  const [isTokenReady, setIsTokenReady] = useState(false);

  // Helper to get the WebSocket URL with token
  const getWebSocketUrl = useCallback(() => {
    const base = process.env.NEXT_PUBLIC_ODDS_WS_URL || 'ws://localhost:8000/ws/odds';
    const token = localStorage.getItem('token');
    if (!token) return null;
    // Remove any existing ?token=... from base
    const cleanBase = base.replace(/\?token=.*/, '');
    return `${cleanBase}?token=${token}`;
  }, []);

  // Handler for all update messages
  const handleMessage = useCallback((data: UpdateMessage) => {
    if (data.type === 'ticker') {
      setTickerOdds(data.odds);
      setIsLoading(false);
    } else if (data.type === 'game') {
      setGameOdds(prev => ({
        ...prev,
        [data.gameId]: data.odds
      }));
      setIsLoading(false);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }
  }, []);

  // Connection function with retry logic - slightly simplified
  const connect = useCallback(() => {
    console.log('Attempting to establish WebSocket connection.');
    cleanup(); // Clean up any existing connection

    const url = getWebSocketUrl();
    if (!url) {
      // This case should ideally not be reached if isTokenReady is true
      setError(new Error('Auth token missing for connection'));
      setIsConnected(false);
      return;
    }

    try {
      setError(null);
      console.log('Creating new WebSocket instance with URL:', url);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      // Add a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.warn('WebSocket connection timeout. Closing connection.');
          ws.close(); // This will trigger onclose
        }
      }, 5000); // 5 second timeout

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        retryCountRef.current = 0; // Reset retry count on successful connection
        options.onConnectionChange?.(true);
        console.log('WebSocket connected.');
        setError(null); // Clear any previous errors on successful connect

        // Add a small delay after connection opens
        setTimeout(() => {
          console.log('Delay after connection open finished.');
          // Add any code here that needs to run after the delay
        }, 100); // 100ms delay
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        options.onConnectionChange?.(false);
        console.log('WebSocket closed:', event.code, event.reason);

        // Specific handling for auth errors
        if (event.code === 4001) {
          setError(new Error('WebSocket closed: Invalid or missing token. Please log in again.'));
          // Clear token and trigger re-authentication flow via AuthContext if needed
          localStorage.removeItem('token');
          setIsTokenReady(false); // This should eventually trigger disconnect/no-connect
          return; // Do NOT retry on auth errors
        }

        // Implement exponential backoff retry for other close codes
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = Math.min(
            INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current),
            MAX_RETRY_DELAY
          );
          retryCountRef.current += 1;
          console.log(`Retrying WebSocket connection (attempt ${retryCountRef.current}) in ${delay}ms...`);
          
          retryTimeoutRef.current = setTimeout(() => {
             // Ensure token is still valid before retrying
            if (localStorage.getItem('token')) { // Simple check, can be enhanced
                 connect(); // Call connect directly
            } else {
                setError(new Error('Auth token missing during retry. Please log in.'));
                setIsTokenReady(false);
            }
          }, delay);
        } else {
          setError(new Error(`WebSocket connection failed after ${MAX_RETRIES} attempts.`));
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        // The onerror event is often followed by onclose, handle errors there primarily
        setError(new Error('WebSocket error occurred.'));
        // Optionally close here if needed, but onclose usually follows
        // ws.close(); 
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleMessage(msg);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
          setError(new Error('Failed to parse WebSocket message.'));
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError(new Error('Failed to create WebSocket instance.'));
    }
  }, [getWebSocketUrl, handleMessage, cleanup, options.onConnectionChange]);

  // New effect to check token on mount and react to token changes
  useEffect(() => {
    let mounted = true;
    const checkAndSetTokenStatus = () => {
      const token = localStorage.getItem('token');
      let valid = false;
      console.log('Checking token in localStorage:', token ? 'Found token' : 'No token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiry = payload.exp * 1000; // Convert to milliseconds
          if (expiry > Date.now()) {
            valid = true;
          } else {
             console.log('Token expired.');
             localStorage.removeItem('token'); // Clear expired token
          }
        } catch (e) {
          console.error('Invalid token format in localStorage:', e);
          localStorage.removeItem('token'); // Clear invalid token
        }
      }
      setIsTokenReady(valid);
      console.log('Token readiness status:', valid);
      return valid;
    };

    // Initial check
    checkAndSetTokenStatus();

    // Poll for token status changes (e.g., after login/logout)
    const tokenStatusInterval = setInterval(checkAndSetTokenStatus, 2000); // Check every 2 seconds

    // Cleanup function
    return () => {
      mounted = false;
      clearInterval(tokenStatusInterval);
      cleanup(); // Ensure WebSocket is closed on unmount
    };
  }, [cleanup]); // Dependencies: only cleanup needed here

  // Effect to manage connection based on isTokenReady state
  useEffect(() => {
    console.log('useEffect [isTokenReady, isConnected, ...] triggered.', { isTokenReady, isConnected });
    if (isTokenReady && !isConnected) {
      console.log('Token is ready, attempting to connect WebSocket...');
       // Add a small delay before connecting after token becomes ready
      const connectionDelay = setTimeout(() => {
          connect();
      }, 100); // Small delay
       return () => clearTimeout(connectionDelay);

    } else if (!isTokenReady && isConnected) {
        console.log('Token is no longer ready, disconnecting WebSocket...');
        cleanup(); // Disconnect if token is not ready but we are connected
        setIsLoading(true); // Show loading state again
    }

     // When isConnected changes (e.g., after a connect attempt)
    if (isConnected) {
       setIsLoading(false); // Hide loading once connected
       setError(null); // Clear errors on connect
    }

  }, [isTokenReady, isConnected, connect, cleanup]); // Dependencies

  const selectGame = useCallback((gameId: string) => {
    setSelectedGameId(gameId);
  }, []);

  const reconnect = useCallback(async () => {
    console.log('Manual reconnect triggered.');
    retryCountRef.current = 0; // Reset retry count
    cleanup(); // Close existing connection
    // isTokenReady state will trigger a new connection attempt via useEffect
  }, [cleanup]);

  return {
    isConnected,
    isLoading,
    error,
    tickerOdds,
    gameOdds,
    selectedGame: selectedGameId ? gameOdds[selectedGameId] || null : null,
    selectGame,
    reconnect
  };
} 