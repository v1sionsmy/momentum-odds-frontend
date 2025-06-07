import { useState, useEffect } from "react";

// Types for player momentum data
interface PlayerMomentum {
  ptsMom: number;
  rebMom: number;
  astMom: number;
  blkMom: number;
  stlMom: number;
}

interface Correlations {
  ptsMom: boolean;
  rebMom: boolean;
  astMom: boolean;
  blkMom: boolean;
  stlMom: boolean;
}

interface CurrentStats {
  points: number;
  rebounds: number;
  assists: number;
  blocks: number;
  steals: number;
}

interface PropLines {
  points: number;
  rebounds: number;
  assists: number;
  blocks: number;
  steals: number;
}

// Environment-based API configuration for legacy momentum endpoints
const LEGACY_API_CONFIG = {
  development: "http://localhost:8000", // Different port for legacy API
  production: "https://momentum-ignition-backend.onrender.com"
};

const LEGACY_BASE_URL = LEGACY_API_CONFIG[process.env.NODE_ENV as keyof typeof LEGACY_API_CONFIG] || LEGACY_API_CONFIG.development;

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

export function usePlayerMomentum(gameId: number | null, playerId: string | null) {
  const [playerMomentum, setPlayerMomentum] = useState<PlayerMomentum | null>(null);
  const [correlations, setCorrelations] = useState<Correlations | null>(null);
  const [currentStats, setCurrentStats] = useState<CurrentStats | null>(null);
  const [propLines, setPropLines] = useState<PropLines | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId || !playerId) {
      setPlayerMomentum(null);
      setCorrelations(null);
      setCurrentStats(null);
      setPropLines(null);
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchPlayerMom = async () => {
      setLoading(true);
      try {
        const resp = await api.get(`/games/${gameId}/players/${playerId}/momentum`);
        if (!cancelled) {
          setPlayerMomentum(resp.data.playerMomentum);
          setCorrelations(resp.data.correlations);
          setCurrentStats(resp.data.currentStats);
          setPropLines(resp.data.propLines);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlayerMom();
    const interval = setInterval(fetchPlayerMom, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [gameId, playerId]);

  return { 
    playerMomentum, 
    correlations, 
    currentStats, 
    propLines, 
    isLoadingPM: isLoading, 
    errorPM: error 
  };
} 