import axios from "axios";
import { Game } from "../types/game";

const api = axios.create({
  baseURL: "https://momentum-ignition-backend.onrender.com", // Updated to use deployed backend
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
  const url = `https://momentum-ignition-backend.onrender.com/api/stream/${gameId}`;
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