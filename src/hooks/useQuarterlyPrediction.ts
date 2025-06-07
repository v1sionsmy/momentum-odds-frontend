import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface QuarterlyPredictionData {
  success: boolean;
  game_id: number;
  player_id: number;
  player_name: string;
  quarter: number;
  predicted_points: number;
  predicted_rebounds: number;
  predicted_assists: number;
  confidence_score: number;
  using_quarters: number[];
  model_type: string;
  timestamp: string;
}

export function useQuarterlyPrediction() {
  const [predictionData, setPredictionData] = useState<QuarterlyPredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const predictQuarterly = useCallback(async (gameId: number, playerId: number, quarter: number) => {
    // Validate quarter (only 2, 3, or 4 allowed according to docs)
    if (![2, 3, 4].includes(quarter)) {
      setError(new Error('Quarter must be 2, 3, or 4'));
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.predictQuarterly(gameId, playerId, quarter);
      setPredictionData(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to predict quarterly performance'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPrediction = useCallback(() => {
    setPredictionData(null);
    setError(null);
  }, []);

  return {
    predictionData,
    isLoading,
    error,
    predictQuarterly,
    clearPrediction
  };
} 