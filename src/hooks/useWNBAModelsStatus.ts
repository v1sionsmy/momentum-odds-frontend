import { useQuery } from '@tanstack/react-query';

// Use the same hardcoded URL as the main API
const WNBA_API_BASE_URL = 'https://nba-analytics-api.onrender.com';

// Define WNBA models status response type
interface WNBAModelsStatusResponse {
  success: boolean;
  status: {
    wnba_monitoring: string;
    wnba_models: string;
    wnba_models_trained: boolean;
    wnba_odds_service: string;
    last_update?: string;
  };
  models_info?: {
    win_probability: { trained: boolean; accuracy?: number };
    margin_prediction: { trained: boolean; accuracy?: number };
    total_points: { trained: boolean; accuracy?: number };
    player_stats: { trained: boolean; accuracy?: number };
  };
}

const fetchWNBAModelsStatus = async (): Promise<WNBAModelsStatusResponse> => {
  try {
    console.log('📊 Fetching WNBA models status...');
    const response = await fetch(`${WNBA_API_BASE_URL}/api/v1/wnba/models/status`, {
      headers: {
        'X-API-Key': 'momentum-ignition-2025',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ WNBA models status fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch WNBA models status:', error);
    throw error;
  }
};

export function useWNBAModelsStatus() {
  return useQuery({
    queryKey: ['wnba-models-status'],
    queryFn: fetchWNBAModelsStatus,
    refetchInterval: 60000, // Refetch every minute for status updates
    retry: 3,
    retryDelay: 2000
  });
} 