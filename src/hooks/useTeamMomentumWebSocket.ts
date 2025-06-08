import { useState, useEffect, useRef, useCallback } from 'react';

// Types for team momentum data
interface TeamMomentum {
  teamMomentum: Record<string, number>;
  playerMomentum?: Record<string, number>;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketMessage {
  type: 'team_momentum' | 'error' | 'heartbeat';
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

  const MAX_RETRIES = 5;
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds
  const RECONNECT_DELAY = 2000; // 2 seconds base delay

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

  // WebSocket connection with retry logic
  const connect = useCallback(() => {
    if (!gameId) return;

    cleanup();
    setConnectionStatus('connecting');
    setError(null);

    try {
      const wsUrl = `${WS_BASE_URL}/ws/games/${gameId}/team-momentum`;
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

        // Start heartbeat
        const sendHeartbeat = () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
            heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, HEARTBEAT_INTERVAL);
          }
        };
        sendHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
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
        if (event.code === 1000) {
          // Normal closure - don't retry
          return;
        }

        // Retry with exponential backoff
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = RECONNECT_DELAY * Math.pow(2, retryCountRef.current);
          retryCountRef.current += 1;
          
          console.log(`🔄 Retrying team momentum connection in ${delay}ms (attempt ${retryCountRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('❌ Max team momentum reconnection attempts reached');
          setError(new Error('Connection failed after multiple attempts'));
          setConnectionStatus('error');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Team Momentum WebSocket error:', error);
        setError(new Error('WebSocket connection error'));
        setConnectionStatus('error');
      };

    } catch (err) {
      console.error('❌ Failed to create team momentum WebSocket:', err);
      setError(new Error('Failed to create WebSocket connection'));
      setConnectionStatus('error');
    }
  }, [gameId, cleanup]);

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