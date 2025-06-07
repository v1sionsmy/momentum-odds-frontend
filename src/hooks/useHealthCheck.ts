import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface HealthCheckData {
  status: 'healthy' | 'degraded';
  timestamp: string;
  database_connected: boolean;
  model_loaded: boolean;
  cache_connected: boolean;
}

export function useHealthCheck(intervalMs = 30000) { // Default check every 30 seconds
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.getHealth();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check API health'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial health check
    checkHealth();

    // Set up interval for periodic health checks
    const interval = setInterval(checkHealth, intervalMs);

    return () => clearInterval(interval);
  }, [checkHealth, intervalMs]);

  return {
    healthData,
    isLoading,
    error,
    refetch: checkHealth
  };
} 