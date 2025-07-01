import { useQuery } from '@tanstack/react-query';

// Use the same hardcoded URL as the main API
const WNBA_API_BASE_URL = 'https://nba-analytics-api.onrender.com';

// Define WNBA scheduled game response type - matching the new API structure
interface WNBAScheduledGame {
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
  venue: string;
  last_updated: string;
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

const fetchWNBAScheduledGames = async (limit: number = 10): Promise<WNBAGame[]> => {
  try {
    console.log('🏀 Fetching WNBA scheduled games...');
    const response = await fetch(`${WNBA_API_BASE_URL}/games?league=wnba&status=status_scheduled&limit=${limit}`, {
      headers: {
        'X-API-Key': 'momentum-ignition-2025',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: WNBAScheduledGame[] = await response.json();
    console.log('🏀 WNBA Scheduled Games API Response:', data);
    
    if (Array.isArray(data)) {
      const games = data.map((game: WNBAScheduledGame) => ({
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
      
      console.log('✅ WNBA scheduled games fetched successfully:', games.length, 'games');
      return games;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch WNBA scheduled games:', error);
    throw error;
  }
};

export function useWNBAScheduledGames(limit: number = 10) {
  return useQuery({
    queryKey: ['wnba-scheduled-games', limit],
    queryFn: () => fetchWNBAScheduledGames(limit),
    refetchInterval: 60000, // Refetch every minute for scheduled games
    retry: 3,
    retryDelay: 1000
  });
} 