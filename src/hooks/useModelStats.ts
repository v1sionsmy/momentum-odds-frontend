import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface ModelStatsData {
  success: boolean;
  model_info: {
    model_type: string;
    training_data: string;
    features: number;
    expected_accuracy: {
      points_mae: string;
      rebounds_mae: string;
      assists_mae: string;
    };
    training_samples: string;
    temporal_validation: boolean;
    last_updated: string;
  };
}

export function useModelStats() {
  const [modelStats, setModelStats] = useState<ModelStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchModelStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await api.getModelStats();
        setModelStats(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch model statistics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchModelStats();
  }, []);

  return {
    modelStats,
    isLoading,
    error
  };
} 