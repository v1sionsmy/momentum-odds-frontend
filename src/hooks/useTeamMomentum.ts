import { useState, useEffect, useCallback } from "react";
import { useTeamMomentumWebSocket } from "./useTeamMomentumWebSocket";

// Types for team momentum data
interface TeamMomentum {
  teamMomentum: Record<string, number>;
  playerMomentum?: Record<string, number>;
}

// Fallback API configuration
const API_CONFIG = {
  development: 'http://localhost:8000',
  production: "https://nba-analytics-api.onrender.com"
};

const LEGACY_BASE_URL = API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG] || API_CONFIG.development;

// API utility for fallback calls
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
  // Primary WebSocket connection
  const {
    teamMomentum: wsTeamMomentum,
    connectionStatus,
    isLoadingTeamMom: wsLoading,
    errorTeamMom: wsError,
    reconnect: wsReconnect,
    isConnected: wsConnected
  } = useTeamMomentumWebSocket(gameId);

  // Fallback polling states
  const [fallbackData, setFallbackData] = useState<TeamMomentum | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState<Error | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Determine which data source to use
  const shouldUseFallback = !wsConnected && connectionStatus !== 'connecting';
  const teamMomentum = shouldUseFallback ? fallbackData : wsTeamMomentum;
  const isLoadingTeamMom = shouldUseFallback ? fallbackLoading : wsLoading;
  const errorTeamMom = shouldUseFallback ? fallbackError : wsError;

  // Fallback API call
  const fetchFallbackData = useCallback(async (gameId: number) => {
    try {
      setFallbackLoading(true);
      setFallbackError(null);
      const resp = await api.get(`/games/${gameId}/momentum`);
      setFallbackData(resp.data);
    } catch (e) {
      setFallbackError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setFallbackLoading(false);
    }
  }, []);

  // Fallback polling effect
  useEffect(() => {
    if (!gameId || !shouldUseFallback) {
      setUsingFallback(false);
      return;
    }

    console.log('🔄 Using fallback polling for team momentum');
    setUsingFallback(true);

    // Initial fetch
    fetchFallbackData(gameId);
    
    // Conservative polling - 60 seconds for team momentum fallback
    const interval = setInterval(() => {
      fetchFallbackData(gameId);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [gameId, shouldUseFallback, fetchFallbackData]);

  return { 
    teamMomentum, 
    isLoadingTeamMom, 
    errorTeamMom,
    connectionStatus,
    isConnected: wsConnected,
    usingFallback,
    reconnect: wsReconnect
  };
} 