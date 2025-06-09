import { useState, useEffect, useRef, useCallback } from 'react';

// Types for team momentum data
interface TeamMomentum {
  teamMomentum: Record<string, number>;
  playerMomentum?: Record<string, number>;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketMessage {
  type: 'momentum' | 'team_momentum' | 'error' | 'heartbeat';
  data?: TeamMomentum;
  error?: string;
  timestamp?: string;
}

// WebSocket configuration
const WS_CONFIG = {
  development: 'ws://localhost:8000',
  production: 'wss://nba-analytics-api.onrender.com'
};

const WS_BASE_URL = WS_CONFIG[process.env.NODE_ENV as keyof typeof WS_CONFIG] || WS_CONFIG.development;

export function useTeamMomentumWebSocket(gameId: number | null) {
  const [teamMomentum, setTeamMomentum] = useState<TeamMomentum | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const retryCountRef = useRef(0);
  const lastGameIdRef = useRef<number | null>(null);

  const MAX_RETRIES = 3; // Reduced from 5 to prevent excessive retries
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds
  const RECONNECT_DELAY = 2000; // 2 seconds base delay
  const MAX_RECONNECT_DELAY = 30000; // Max 30 seconds between retries

  // Cleanup function
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    setConnectionStatus('disconnected');
  }, []);

  // Reset retry count when game changes
  const resetRetries = useCallback(() => {
    retryCountRef.current = 0;
    setError(null);
  }, []);

  // WebSocket connection with retry logic
  const connect = useCallback(() => {
    if (!gameId) return;

    // Reset retries if this is a new game
    if (lastGameIdRef.current !== gameId) {
      resetRetries();
      lastGameIdRef.current = gameId;
    }

    cleanup();
    setConnectionStatus('connecting');
    setError(null);

    try {
      // Fix: Use the correct WebSocket endpoint that matches the backend
      const wsUrl = `${WS_BASE_URL}/ws/games/${gameId}`;
      console.log(`🔌 Connecting to Team Momentum WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.warn('⚠️ Team Momentum WebSocket connection timeout');
          ws.close();
        }
      }, 10000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('✅ Team Momentum WebSocket connected');
        setConnectionStatus('connected');
        setError(null);
        setIsLoading(false);
        retryCountRef.current = 0;

        // Request initial momentum data
        try {
          ws.send(JSON.stringify({ type: 'request_update' }));
        } catch (sendError) {
          console.warn('⚠️ Failed to request initial momentum data:', sendError);
        }

        // Start heartbeat
        const sendHeartbeat = () => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: 'ping' }));
              heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, HEARTBEAT_INTERVAL);
            } catch (heartbeatError) {
              console.warn('⚠️ Heartbeat send failed:', heartbeatError);
            }
          }
        };
        sendHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'momentum':
            case 'team_momentum':
              if (message.data) {
                console.log('🏀 Received team momentum update:', message.data);
                setTeamMomentum(message.data);
                setIsLoading(false);
              }
              break;
            
            case 'error':
              console.error('❌ Team Momentum WebSocket error:', message.error);
              setError(new Error(message.error || 'WebSocket error'));
              break;
            
            case 'heartbeat':
              // Acknowledge heartbeat
              break;
            
            default:
              console.log('📨 Unknown team momentum message type:', message.type);
          }
        } catch (parseError) {
          console.error('❌ Failed to parse team momentum WebSocket message:', parseError);
          setError(new Error('Failed to parse WebSocket message'));
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }
        
        console.log('🔌 Team Momentum WebSocket closed:', event.code, event.reason);
        setConnectionStatus('disconnected');

        // Handle different close codes
        if (event.code === 1000 || event.code === 1001) {
          // Normal closure or going away - don't retry
          console.log('✅ WebSocket closed normally, not retrying');
          return;
        }

        // Enhanced retry logic with backoff cap
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = Math.min(
            RECONNECT_DELAY * Math.pow(2, retryCountRef.current),
            MAX_RECONNECT_DELAY
          );
          retryCountRef.current += 1;
          
          console.log(`🔄 Retrying team momentum connection in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('❌ Max team momentum reconnection attempts reached, switching to fallback mode');
          setError(new Error('WebSocket connection failed - using fallback polling'));
          setConnectionStatus('error');
          setIsLoading(false); // Ensure we're not stuck in loading state
        }
      };

      ws.onerror = (errorEvent) => {
        console.error('❌ Team Momentum WebSocket error:', errorEvent);
        
        // Set a more informative error message
        const errorMsg = retryCountRef.current >= MAX_RETRIES 
          ? 'WebSocket connection failed after multiple attempts - using fallback polling'
          : 'WebSocket connection error - will retry automatically';
        
        setError(new Error(errorMsg));
        setConnectionStatus('error');
      };

    } catch (err) {
      console.error('❌ Failed to create team momentum WebSocket:', err);
      setError(new Error('Failed to create WebSocket connection'));
      setConnectionStatus('error');
      setIsLoading(false);
    }
  }, [gameId, cleanup, resetRetries]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual team momentum reconnect triggered');
    retryCountRef.current = 0;
    connect();
  }, [connect]);

  // Effect to manage connection based on gameId
  useEffect(() => {
    if (gameId) {
      connect();
    } else {
      cleanup();
      setTeamMomentum(null);
      setIsLoading(false);
      lastGameIdRef.current = null;
    }

    return cleanup;
  }, [gameId, connect, cleanup]);

  return { 
    teamMomentum, 
    connectionStatus,
    isLoadingTeamMom: isLoading, 
    errorTeamMom: error,
    reconnect,
    isConnected: connectionStatus === 'connected'
  };
} 