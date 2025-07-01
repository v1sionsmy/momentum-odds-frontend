import { useQuery } from '@tanstack/react-query';

// Use the same hardcoded URL as the main API
const WNBA_API_BASE_URL = 'https://nba-analytics-api.onrender.com';

// Define WNBA prediction response types
interface WNBAWinProbabilityResponse {
  success: boolean;
  game_id: number;
  predictions: {
    home_win_probability: number;
    away_win_probability: number;
    confidence: number;
  };
}

interface WNBAMarginResponse {
  success: boolean;
  game_id: number;
  predictions: {
    predicted_margin: number;
    home_advantage: number;
    confidence: number;
  };
}

interface WNBATotalPointsResponse {
  success: boolean;
  game_id: number;
  predictions: {
    predicted_total: number;
    over_under_line: number;
    confidence: number;
  };
}

interface WNBAPlayerStatsResponse {
  success: boolean;
  game_id: number;
  predictions: Array<{
    player_id: number;
    player_name: string;
    predicted_points: number;
    predicted_rebounds: number;
    predicted_assists: number;
    confidence: number;
  }>;
}

const fetchWNBAWinProbability = async (gameId: number): Promise<WNBAWinProbabilityResponse> => {
  try {
    console.log(`🎯 Fetching WNBA win probability for game ${gameId}...`);
    const response = await fetch(`${WNBA_API_BASE_URL}/api/v1/wnba/predict/win-probability`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'momentum-ignition-2025',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_id: gameId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ WNBA win probability fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch WNBA win probability:', error);
    throw error;
  }
};

const fetchWNBAMargin = async (gameId: number): Promise<WNBAMarginResponse> => {
  try {
    console.log(`📊 Fetching WNBA margin prediction for game ${gameId}...`);
    const response = await fetch(`${WNBA_API_BASE_URL}/api/v1/wnba/predict/margin`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'momentum-ignition-2025',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_id: gameId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ WNBA margin prediction fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch WNBA margin prediction:', error);
    throw error;
  }
};

const fetchWNBATotalPoints = async (gameId: number): Promise<WNBATotalPointsResponse> => {
  try {
    console.log(`🎯 Fetching WNBA total points prediction for game ${gameId}...`);
    const response = await fetch(`${WNBA_API_BASE_URL}/api/v1/wnba/predict/total-points`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'momentum-ignition-2025',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_id: gameId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ WNBA total points prediction fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch WNBA total points prediction:', error);
    throw error;
  }
};

const fetchWNBAPlayerStats = async (gameId: number): Promise<WNBAPlayerStatsResponse> => {
  try {
    console.log(`👥 Fetching WNBA player stats prediction for game ${gameId}...`);
    const response = await fetch(`${WNBA_API_BASE_URL}/api/v1/wnba/predict/player-stats`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'momentum-ignition-2025',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_id: gameId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ WNBA player stats prediction fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch WNBA player stats prediction:', error);
    throw error;
  }
};

// Hook for win probability
export function useWNBAWinProbability(gameId: number | null) {
  return useQuery({
    queryKey: ['wnba-win-probability', gameId],
    queryFn: () => fetchWNBAWinProbability(gameId!),
    enabled: !!gameId,
    retry: 2,
    retryDelay: 1000
  });
}

// Hook for margin prediction
export function useWNBAMargin(gameId: number | null) {
  return useQuery({
    queryKey: ['wnba-margin', gameId],
    queryFn: () => fetchWNBAMargin(gameId!),
    enabled: !!gameId,
    retry: 2,
    retryDelay: 1000
  });
}

// Hook for total points prediction
export function useWNBATotalPoints(gameId: number | null) {
  return useQuery({
    queryKey: ['wnba-total-points', gameId],
    queryFn: () => fetchWNBATotalPoints(gameId!),
    enabled: !!gameId,
    retry: 2,
    retryDelay: 1000
  });
}

// Hook for player stats prediction
export function useWNBAPlayerStats(gameId: number | null) {
  return useQuery({
    queryKey: ['wnba-player-stats', gameId],
    queryFn: () => fetchWNBAPlayerStats(gameId!),
    enabled: !!gameId,
    retry: 2,
    retryDelay: 1000
  });
} 