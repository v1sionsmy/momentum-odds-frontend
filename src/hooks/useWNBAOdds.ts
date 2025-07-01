import { useQuery } from '@tanstack/react-query';

// Use the same hardcoded URL as the main API
const WNBA_API_BASE_URL = 'https://nba-analytics-api.onrender.com';

// Define WNBA odds response types
interface WNBAOddsResponse {
  success: boolean;
  odds: Array<{
    game_id: number;
    sportsbook: string;
    spread_home: number;
    spread_away: number;
    spread_odds_home: number;
    spread_odds_away: number;
    moneyline_home: number;
    moneyline_away: number;
    total_over: number;
    total_under: number;
    total_line: number;
    timestamp: string;
  }>;
}

interface WNBAOddsHistoryResponse {
  success: boolean;
  game_id: number;
  odds_history: Array<{
    timestamp: string;
    sportsbook: string;
    spread_home: number;
    spread_away: number;
    spread_odds_home: number;
    spread_odds_away: number;
    moneyline_home: number;
    moneyline_away: number;
    total_over: number;
    total_under: number;
    total_line: number;
  }>;
}

const fetchWNBALiveOdds = async (): Promise<WNBAOddsResponse> => {
  try {
    console.log('💰 Fetching WNBA live odds...');
    const response = await fetch(`${WNBA_API_BASE_URL}/api/v1/wnba/odds/live`, {
      headers: {
        'X-API-Key': 'momentum-ignition-2025',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ WNBA live odds fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch WNBA live odds:', error);
    throw error;
  }
};

const fetchWNBAOddsHistory = async (gameId: number): Promise<WNBAOddsHistoryResponse> => {
  try {
    console.log(`📈 Fetching WNBA odds history for game ${gameId}...`);
    const response = await fetch(`${WNBA_API_BASE_URL}/api/v1/wnba/odds/history/${gameId}`, {
      headers: {
        'X-API-Key': 'momentum-ignition-2025',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ WNBA odds history fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch WNBA odds history:', error);
    throw error;
  }
};

const captureWNBAOdds = async (gameId: number): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`📸 Capturing WNBA odds for game ${gameId}...`);
    const response = await fetch(`${WNBA_API_BASE_URL}/api/v1/wnba/odds/capture/${gameId}`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'momentum-ignition-2025',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ WNBA odds captured:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to capture WNBA odds:', error);
    throw error;
  }
};

// Hook for live odds
export function useWNBALiveOdds() {
  return useQuery({
    queryKey: ['wnba-live-odds'],
    queryFn: fetchWNBALiveOdds,
    refetchInterval: 30000, // Refetch every 30 seconds for odds updates
    retry: 3,
    retryDelay: 1000
  });
}

// Hook for odds history
export function useWNBAOddsHistory(gameId: number | null) {
  return useQuery({
    queryKey: ['wnba-odds-history', gameId],
    queryFn: () => fetchWNBAOddsHistory(gameId!),
    enabled: !!gameId,
    retry: 2,
    retryDelay: 1000
  });
}

// Hook for capturing odds (manual trigger)
export function useCaptureWNBAOdds() {
  return {
    captureOdds: captureWNBAOdds
  };
} 