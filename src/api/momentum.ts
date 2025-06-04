import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // Updated to use backend at localhost:8000
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Keep for reference but not currently used
export type MomentumSnapshot = {
  id: number;
  period: number;
  clock: string;
  data: Record<string, number>;
};

/** Get upcoming games schedule */
export const getUpcomingGames = async (days: number = 7): Promise<any[]> => {
  const { data } = await api.get(`/api/games/upcoming`, { params: { days } });
  return data;
};

/** Get today's games */
export const getTodayGames = async (): Promise<any[]> => {
  const { data } = await api.get('/api/games/today');
  return data;
}; 