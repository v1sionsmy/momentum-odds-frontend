import { useState, useEffect, useRef, useCallback } from 'react';

export type GameMomentumData = {
  teamMomentum: Record<string, number>;
  playerMomentum: Record<string, number>;
};

export type FlashPattern = {
  teamId: string;
  color: string;
  colorType: 'primary' | 'secondary';
  duration: number;
}[];

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketMessage {
  type: 'momentum' | 'error' | 'heartbeat';
  data?: GameMomentumData;
  error?: string;
  timestamp?: string;
}

// WebSocket configuration
const WS_CONFIG = {
  development: 'wss://nba-analytics-api.onrender.com',
  production: 'wss://nba-analytics-api.onrender.com'
};

const WS_BASE_URL = WS_CONFIG[process.env.NODE_ENV as keyof typeof WS_CONFIG] || WS_CONFIG.development;

export const useGameMomentumWebSocket = (gameId: number | null) => {
  const [momentumData, setMomentumData] = useState<GameMomentumData | null>(null);
  const [flashPattern, setFlashPattern] = useState<FlashPattern>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const retryCountRef = useRef(0);
  const lastGameIdRef = useRef<number | null>(null);

  const MAX_RETRIES = 3; // Reduced from 5 to prevent excessive retries
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds
  const RECONNECT_DELAY = 2000;
  const MAX_RECONNECT_DELAY = 30000; // Max 30 seconds between retries

  // Calculate flash pattern from momentum data
  const calculateFlashPattern = useCallback((teamMomentum: Record<string, number>): FlashPattern => {
    const teams = Object.entries(teamMomentum);
    if (teams.length !== 2) return [];

    const [team1, team2] = teams;
    const [team1Id, team1Value] = team1;
    const [team2Id, team2Value] = team2;

    const total = team1Value + team2Value;
    const team1Ratio = team1Value / total;

    const patternLength = 10;
    const team1Flashes = Math.round(team1Ratio * patternLength);
    const team2Flashes = patternLength - team1Flashes;

    const shuffledPattern: FlashPattern = [];
    let team1Count = 0;
    let team2Count = 0;
    let team1ColorToggle = true;
    let team2ColorToggle = true;
    
    for (let i = 0; i < patternLength; i++) {
      const shouldUseTeam1 = (team1Count / team1Flashes) <= (team2Count / team2Flashes) && team1Count < team1Flashes;
      
      if (shouldUseTeam1) {
        const teamColors = getTeamColors(team1Id);
        shuffledPattern.push({
          teamId: team1Id,
          color: team1ColorToggle ? teamColors.primary : teamColors.secondary,
          colorType: team1ColorToggle ? 'primary' : 'secondary',
          duration: 500
        });
        team1Count++;
        team1ColorToggle = !team1ColorToggle;
      } else if (team2Count < team2Flashes) {
        const teamColors = getTeamColors(team2Id);
        shuffledPattern.push({
          teamId: team2Id,
          color: team2ColorToggle ? teamColors.primary : teamColors.secondary,
          colorType: team2ColorToggle ? 'primary' : 'secondary',
          duration: 500
        });
        team2Count++;
        team2ColorToggle = !team2ColorToggle;
      } else {
        const teamColors = getTeamColors(team1Id);
        shuffledPattern.push({
          teamId: team1Id,
          color: team1ColorToggle ? teamColors.primary : teamColors.secondary,
          colorType: team1ColorToggle ? 'primary' : 'secondary',
          duration: 500
        });
        team1Count++;
        team1ColorToggle = !team1ColorToggle;
      }
    }

    return shuffledPattern;
  }, []);

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
      const wsUrl = `${WS_BASE_URL}/ws/games/${gameId}`;
      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.warn('⚠️ WebSocket connection timeout');
          ws.close();
        }
      }, 10000); // 10 second timeout

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('✅ WebSocket connected');
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
              if (message.data) {
                console.log('📊 Received momentum update:', message.data);
                setMomentumData(message.data);
                
                // Calculate new flash pattern
                if (message.data.teamMomentum) {
                  const pattern = calculateFlashPattern(message.data.teamMomentum);
                  setFlashPattern(pattern);
                }
                setIsLoading(false);
              }
              break;
            
            case 'error':
              console.error('❌ WebSocket error:', message.error);
              setError(new Error(message.error || 'WebSocket error'));
              break;
            
            case 'heartbeat':
              // Acknowledge heartbeat
              break;
            
            default:
              console.log('📨 Unknown message type:', message.type);
          }
        } catch (parseError) {
          console.error('❌ Failed to parse WebSocket message:', parseError);
          setError(new Error('Failed to parse WebSocket message'));
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }
        
        console.log('🔌 WebSocket closed:', event.code, event.reason);
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
          
          console.log(`🔄 Retrying connection in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('❌ Max reconnection attempts reached, switching to fallback mode');
          setError(new Error('WebSocket connection failed - using fallback polling'));
          setConnectionStatus('error');
          setIsLoading(false); // Ensure we're not stuck in loading state
        }
      };

      ws.onerror = (errorEvent) => {
        console.error('❌ WebSocket error:', errorEvent);
        
        // Set a more informative error message
        const errorMsg = retryCountRef.current >= MAX_RETRIES 
          ? 'WebSocket connection failed after multiple attempts - using fallback polling'
          : 'WebSocket connection error - will retry automatically';
        
        setError(new Error(errorMsg));
        setConnectionStatus('error');
      };

    } catch (err) {
      console.error('❌ Failed to create WebSocket:', err);
      setError(new Error('Failed to create WebSocket connection'));
      setConnectionStatus('error');
      setIsLoading(false);
    }
  }, [gameId, cleanup, calculateFlashPattern, resetRetries]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    retryCountRef.current = 0;
    connect();
  }, [connect]);

  // Effect to manage connection based on gameId
  useEffect(() => {
    if (gameId) {
      connect();
    } else {
      cleanup();
      setMomentumData(null);
      setFlashPattern([]);
      setIsLoading(false);
      lastGameIdRef.current = null;
    }

    return cleanup;
  }, [gameId, connect, cleanup]);

  return {
    momentumData,
    flashPattern,
    connectionStatus,
    error,
    isLoading,
    reconnect,
    isConnected: connectionStatus === 'connected'
  };
};

// Helper function to get team colors by ID
type TeamColors = {
  primary: string;
  secondary: string;
};

const getTeamColors = (teamId: string): TeamColors => {
  const TEAM_COLORS_BY_ID: Record<string, TeamColors> = {
    // Atlantic Division
    '1': { primary: '#007A33', secondary: '#BA9653' },   // Boston Celtics
    '2': { primary: '#006BB6', secondary: '#F58426' },   // New York Knicks
    '3': { primary: '#000000', secondary: '#FFFFFF' },   // Brooklyn Nets
    '4': { primary: '#006BB6', secondary: '#ED174C' },   // Philadelphia 76ers
    '5': { primary: '#CE1141', secondary: '#000000' },   // Toronto Raptors
    
    // Central Division
    '6': { primary: '#CE1141', secondary: '#000000' },   // Chicago Bulls
    '7': { primary: '#6F263D', secondary: '#FDBB30' },   // Cleveland Cavaliers
    '8': { primary: '#C8102E', secondary: '#006BB6' },   // Detroit Pistons
    '9': { primary: '#FDBB30', secondary: '#002D62' },   // Indiana Pacers
    '10': { primary: '#00471B', secondary: '#EEE1C6' },  // Milwaukee Bucks
    
    // Southeast Division
    '11': { primary: '#E03A3E', secondary: '#C1D32F' },  // Atlanta Hawks
    '12': { primary: '#1D1160', secondary: '#00788C' },  // Charlotte Hornets
    '13': { primary: '#98002E', secondary: '#F9A01B' },  // Miami Heat
    '14': { primary: '#0077C0', secondary: '#C4CED4' },  // Orlando Magic
    '15': { primary: '#002B5C', secondary: '#E31837' },  // Washington Wizards
    
    // Northwest Division
    '16': { primary: '#0E2240', secondary: '#FEC524' },  // Denver Nuggets
    '17': { primary: '#0C2340', secondary: '#78BE20' },  // Minnesota Timberwolves
    '18': { primary: '#007AC1', secondary: '#EF3B24' },  // Oklahoma City Thunder
    '19': { primary: '#E03A3E', secondary: '#000000' },  // Portland Trail Blazers
    '20': { primary: '#002B5C', secondary: '#00471B' },  // Utah Jazz
    
    // Pacific Division
    '21': { primary: '#1D428A', secondary: '#FFC72C' },  // Golden State Warriors
    '22': { primary: '#C8102E', secondary: '#1D428A' },  // Los Angeles Clippers
    '23': { primary: '#552583', secondary: '#FDB927' },  // Los Angeles Lakers
    '24': { primary: '#1D1160', secondary: '#E56020' },  // Phoenix Suns
    '25': { primary: '#5A2D81', secondary: '#63727A' },  // Sacramento Kings
    
    // Southwest Division
    '26': { primary: '#00538C', secondary: '#002F5F' },  // Dallas Mavericks
    '27': { primary: '#CE1141', secondary: '#000000' },  // Houston Rockets
    '28': { primary: '#5D76A9', secondary: '#12173F' },  // Memphis Grizzlies
    '29': { primary: '#0C2340', secondary: '#C8102E' },  // New Orleans Pelicans
    '30': { primary: '#C4CED4', secondary: '#000000' },  // San Antonio Spurs
  };

  return TEAM_COLORS_BY_ID[teamId] || { primary: '#888888', secondary: '#666666' };
}; 