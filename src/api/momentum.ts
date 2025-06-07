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

/** Get momentum snapshots for a game */
export const getSnapshots = async (gameId: number, limit: number = 50): Promise<MomentumSnapshot[]> => {
  const { data } = await api.get(`/api/games/${gameId}/snapshots`, { 
    params: { limit } 
  });
  return data;
};

/** Open a live momentum stream for a game */
export const openSnapshotStream = (gameId: number): EventSource => {
  const url = `${LEGACY_BASE_URL}/api/stream/${gameId}`;
  return new EventSource(url);
};

/** Get upcoming games schedule */
export const getUpcomingGames = async (days: number = 7): Promise<Game[]> => {
  const { data } = await api.get(`/api/games/upcoming`, { params: { days } });
  return data;
};

/** Get today's games */
export const getTodayGames = async (): Promise<Game[]> => {
  const { data } = await api.get('/api/games/today');
  return data;
}; 