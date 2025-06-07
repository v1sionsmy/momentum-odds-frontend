import { useState, useEffect } from "react";

// Types for team momentum data
interface TeamMomentum {
  teamMomentum: Record<string, number>;
  playerMomentum?: Record<string, number>;
}

// API configuration
const API_CONFIG = {
  development: 'http://localhost:8000',
  production: "https://nba-analytics-api.onrender.com" // FIXED: Use correct backend
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

export function useTeamMomentum(gameId: number | null) {
  const [teamMomentum, setTeamMomentum] = useState<TeamMomentum | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId) {
      setTeamMomentum(null);
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchTeamMomentum = async () => {
      setLoading(true);
      try {
        const resp = await api.get(`/games/${gameId}/momentum`);
        if (!cancelled) {
          setTeamMomentum(resp.data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTeamMomentum();
    const interval = setInterval(fetchTeamMomentum, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [gameId]);

  return { teamMomentum, isLoadingTeamMom: isLoading, errorTeamMom: error };
} 