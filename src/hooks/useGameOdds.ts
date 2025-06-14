import { useState, useEffect } from "react";

// Types for game odds data
interface GameOdds {
  gameId: number;
  homeTeam: string;
  awayTeam: string;
  markets: {
    moneyline: {
      home: number;
      away: number;
    };
    spread: {
      points: number;
      home: number;
      away: number;
    };
    total: {
      points: number;
      over: number;
      under: number;
    };
  };
  lastUpdate: string;
}

// API configuration
const API_CONFIG = {
  development: 'https://nba-analytics-api.onrender.com',
  production: "https://nba-analytics-api.onrender.com"
};

const LEGACY_BASE_URL = API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG] || API_CONFIG.development;

// API utility for backend calls
const api = {
  get: async (url: string) => {
    const response = await fetch(`${LEGACY_BASE_URL}/api${url}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: await response.json() };
  }
};

export function useGameOdds(gameId: number | null, isLive: boolean = false, isUpcoming: boolean = false) {
  const [oddsData, setOddsData] = useState<GameOdds | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId) {
      setOddsData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchOdds = async () => {
      setLoading(true);
      try {
        // ALWAYS use the individual game endpoint as primary method
        // The bulk endpoints (/odds/live and /odds/scheduled) are unreliable due to API quota limits
        const resp = await api.get(`/games/${gameId}/odds`);
        if (!cancelled) {
          setOddsData(resp.data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(`Failed to fetch odds for game ${gameId}:`, e);
          setError(e instanceof Error ? e : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Initial fetch
    fetchOdds();
    
    // Different polling frequencies based on game state
    const pollInterval = isLive ? 30000 : 300000; // 30s for live, 5min for scheduled
    const interval = setInterval(fetchOdds, pollInterval);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [gameId, isLive, isUpcoming]);

  return { oddsData, isLoadingOdds: isLoading, errorOdds: error };
} 