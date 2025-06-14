import axios from "axios";
import { Game } from "../types/game";

// Environment-based API configuration for legacy momentum endpoints
const LEGACY_API_CONFIG = {
  development: "http://localhost:8001", // Different port for legacy API
  production: "https://nba-analytics-api.onrender.com" // FIXED: Use correct backend
};

const LEGACY_BASE_URL = LEGACY_API_CONFIG[process.env.NODE_ENV as keyof typeof LEGACY_API_CONFIG] || LEGACY_API_CONFIG.development;

const api = axios.create({
  baseURL: LEGACY_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Momentum snapshot type
export type MomentumSnapshot = {
  id: number;
  period: number;
  clock: string;
  data: Record<string, number>;
};

/** Get momentum snapshots for a game - using momentum timeline endpoint */
export const getSnapshots = async (gameId: number, limit: number = 50): Promise<MomentumSnapshot[]> => {
  const { data } = await api.get(`/api/v1/games/${gameId}/momentum-timeline`, { 
    params: { limit } 
  });
  // Convert timeline data to snapshot format if needed
  return data.snapshots || data || [];
};

/** Open a live momentum stream for a game - using WebSocket instead */
export const openSnapshotStream = (gameId: number): EventSource => {
  // Note: Backend uses WebSocket, not EventSource. This is a fallback.
  const url = `${LEGACY_BASE_URL}/ws/games/${gameId}`;
  console.warn('EventSource not supported by backend. Use WebSocket instead:', url);
  return new EventSource(url); // This will likely fail - use WebSocket hook instead
};

/** Get upcoming games schedule */
export const getUpcomingGames = async (days: number = 7): Promise<Game[]> => {
  const { data } = await api.get(`/api/v1/games/scheduled`, { params: { limit: days * 5 } });
  return data.games || data || [];
};

/** Get today's games - using live games endpoint */
export const getTodayGames = async (): Promise<Game[]> => {
  const { data } = await api.get('/api/v1/games/live');
  return data.games || data || [];
}; 