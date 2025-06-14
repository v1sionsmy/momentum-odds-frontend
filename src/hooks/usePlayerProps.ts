import { useState, useEffect } from 'react';

interface PlayerPropsOdds {
  playerId: string;
  playerName: string;
  markets: {
    points: {
      line: number;
      over: number;
      under: number;
    };
    rebounds: {
      line: number;
      over: number;
      under: number;
    };
    assists: {
      line: number;
      over: number;
      under: number;
    };
  };
  lastUpdate: string;
}

interface PlayerPropsResponse {
  playerProps: Record<string, any>;
  lastUpdate: string;
  error?: string;
}

// API configuration
const API_CONFIG = {
  development: 'https://nba-analytics-api.onrender.com',
  production: "https://nba-analytics-api.onrender.com"
};

const BASE_URL = API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG] || API_CONFIG.development;

export function usePlayerProps(gameId: number | null) {
  const [playerPropsData, setPlayerPropsData] = useState<PlayerPropsOdds[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setPlayerPropsData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchPlayerProps = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${BASE_URL}/api/games/${gameId}/props`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const propsResponse: PlayerPropsResponse = await response.json();
        
        if (propsResponse.error) {
          throw new Error(propsResponse.error);
        }
        
        if (!cancelled) {
          // Transform the backend response to our frontend format
          const transformedProps: PlayerPropsOdds[] = [];
          
          if (propsResponse.playerProps) {
            Object.entries(propsResponse.playerProps).forEach(([playerName, playerData]: [string, any]) => {
              // Get first bookmaker's data
              const bookmakers = Object.keys(playerData);
              if (bookmakers.length > 0) {
                const bookmakerData = playerData[bookmakers[0]];
                
                transformedProps.push({
                  playerId: playerName.replace(/\s+/g, '_').toLowerCase(),
                  playerName: playerName,
                  markets: {
                    points: {
                      line: bookmakerData.points?.Over?.point || 0,
                      over: bookmakerData.points?.Over?.odds || 0,
                      under: bookmakerData.points?.Under?.odds || 0
                    },
                    rebounds: {
                      line: bookmakerData.rebounds?.Over?.point || 0,
                      over: bookmakerData.rebounds?.Over?.odds || 0,
                      under: bookmakerData.rebounds?.Under?.odds || 0
                    },
                    assists: {
                      line: bookmakerData.assists?.Over?.point || 0,
                      over: bookmakerData.assists?.Over?.odds || 0,
                      under: bookmakerData.assists?.Under?.odds || 0
                    }
                  },
                  lastUpdate: propsResponse.lastUpdate || new Date().toISOString()
                });
              }
            });
          }
          
          setPlayerPropsData(transformedProps);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unknown error');
          console.error('Error fetching player props:', e);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchPlayerProps();
    
    // Poll every 2 minutes for prop updates
    const interval = setInterval(fetchPlayerProps, 120000);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [gameId]);

  return { 
    playerPropsData, 
    isLoadingPlayerProps: isLoading, 
    playerPropsError: error 
  };
} 