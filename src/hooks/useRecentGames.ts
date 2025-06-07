import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface RecentGame {
  id: number;
  start_time: string;
  home_team: string;
  away_team: string;
  home_abbr: string;
  away_abbr: string;
  home_score: number;
  away_score: number;
}

export function useRecentGames(limit = 10) {
  const [games, setGames] = useState<RecentGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getRecentGames(limit);
        if (data.success && Array.isArray(data.games)) {
          setGames(data.games);
        } else {
          setGames([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load recent games'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [limit]);

  return { games, isLoading, error };
} 