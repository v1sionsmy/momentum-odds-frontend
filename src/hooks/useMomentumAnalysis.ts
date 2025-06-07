import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface MomentumAnalysisData {
  success: boolean;
  game_id: number;
  game_info: {
    id: number;
    start_time: string;
    home_team: string;
    away_team: string;
    home_score: number;
    away_score: number;
  };
  team_momentum: Record<string, number>;
  player_momentum: {
    top_players: Array<{
      name: string;
      momentum: number;
      team: string;
    }>;
  };
  key_insights: string[];
  timestamp: string;
}

export function useMomentumAnalysis(gameId: number | null) {
  const [momentumData, setMomentumData] = useState<MomentumAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzeMomentum = useCallback(async (gameId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.analyzeMomentum(gameId);
      setMomentumData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to analyze momentum'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!gameId) {
      setMomentumData(null);
      return;
    }

    analyzeMomentum(gameId);
  }, [gameId, analyzeMomentum]);

  return {
    momentumData,
    isLoading,
    error,
    refetch: gameId ? () => analyzeMomentum(gameId) : undefined
  };
} 