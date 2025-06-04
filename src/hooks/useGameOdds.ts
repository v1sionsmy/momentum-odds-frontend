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

// API utility for backend calls
const api = {
  get: async (url: string) => {
    const response = await fetch(`https://momentum-ignition-backend.onrender.com/api${url}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: await response.json() };
  }
};

export function useGameOdds(gameId: number | null) {
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
        const resp = await api.get(`/games/${gameId}/odds`);
        if (!cancelled) {
          setOddsData(resp.data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOdds();
    const interval = setInterval(fetchOdds, 10000); // Poll every 10 seconds for odds
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [gameId]);

  return { oddsData, isLoadingOdds: isLoading, errorOdds: error };
} 