import { useQuery } from '@tanstack/react-query';

// Use the same hardcoded URL as the main API
const WNBA_API_BASE_URL = 'https://nba-analytics-api.onrender.com';

// Define WNBA API response types - matching the new API structure
interface WNBAAPIGame {
  id: string;
  league: string;
  start_time: string;
  status: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  period: number;
  clock: string;
  venue?: string;
  last_updated: string;
}

interface WNBAAPIResponse {
  success: boolean;
  league: string;
  live_games_count: number;
  games: WNBAAPIGame[];
  timestamp: string;
}

export interface WNBAGame {
  id: string;
  home_team: string;
  away_team: string;
  home_abbr?: string;
  away_abbr?: string;
  home_score: number;
  away_score: number;
  status: string;
  date: string;
  start_time: string;
  clock?: string;
  period?: number;
  venue?: string;
}

const fetchWNBALiveGames = async (): Promise<WNBAGame[]> => {
  try {
    console.log('🏀 Fetching WNBA live games...');
    const response = await fetch(`${WNBA_API_BASE_URL}/leagues/wnba/live`, {
      headers: {
        'X-API-Key': 'momentum-ignition-2025',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: WNBAAPIResponse = await response.json();
    console.log('🏀 WNBA Live Games API Response:', data);
    
    if (data.success && data.games && Array.isArray(data.games)) {
      const games = data.games.map((game: WNBAAPIGame) => ({
        id: game.id,
        home_team: game.home_team,
        away_team: game.away_team,
        home_abbr: game.home_team?.substring(0, 3).toUpperCase(),
        away_abbr: game.away_team?.substring(0, 3).toUpperCase(),
        home_score: game.home_score || 0,
        away_score: game.away_score || 0,
        status: game.status || "status_scheduled",
        date: game.last_updated || game.start_time || new Date().toISOString(),
        start_time: game.start_time || new Date().toISOString(),
        clock: game.clock,
        period: game.period,
        venue: game.venue
      }));
      
      console.log('✅ WNBA live games fetched successfully:', games.length, 'games');
      return games;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch WNBA live games:', error);
    throw error;
  }
};

export function useWNBALiveGames() {
  return useQuery({
    queryKey: ['wnba-live-games'],
    queryFn: fetchWNBALiveGames,
    refetchInterval: 10000, // Refetch every 10 seconds for live data
    retry: 3,
    retryDelay: 1000
  });
} 