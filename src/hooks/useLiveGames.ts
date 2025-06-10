import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { api } from '@/lib/api';

// Define API response types
interface APIGame {
  id: number;
  home_team: string;
  away_team: string;
  home_abbr?: string;
  away_abbr?: string;
  home_score: number;
  away_score: number;
  start_time: string;
  last_momentum_update?: string;
}

export interface Game {
  id: number;
  api_game_id: number;
  home_team: string;
  away_team: string;
  home_abbr?: string;
  away_abbr?: string;
  home_score: number;
  away_score: number;
  status: string;
  date: string;
  start_time: string;
}

export interface Team {
  id: string;
  name: string;
  gameId: number;
  isHome: boolean;
  score: number;
  opponentScore: number;
  opponent: string;
  status?: string;
}

const fetchGames = async (): Promise<Game[]> => {
  try {
    console.log('🔄 Fetching all games...');
    const data = await api.getRecentGames(20);
    console.log('🔄 All Games API Response:', data);
    
    if (data.success && Array.isArray(data.games)) {
      const games = data.games.map((game: APIGame) => ({
        id: game.id,
        api_game_id: game.id,
        home_team: game.home_team,
        away_team: game.away_team,
        home_abbr: game.home_abbr,
        away_abbr: game.away_abbr,
        home_score: game.home_score || 0,
        away_score: game.away_score || 0,
        status: "completed",
        date: game.start_time,
        start_time: game.start_time
      }));
      
      console.log('✅ All games fetched successfully:', games.length, 'games');
      return games;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('❌ Failed to fetch all games:', error);
    throw error;
  }
};

const fetchUpcomingGames = async (): Promise<Game[]> => {
  try {
    console.log('📅 Fetching upcoming games...');
    const data = await api.getScheduledGames(10);
    console.log('📅 Upcoming Games API Response:', data);
    
    if (data.success && Array.isArray(data.games)) {
      const games = data.games.map((game: APIGame) => ({
        id: game.id,
        api_game_id: game.id,
        home_team: game.home_team,
        away_team: game.away_team,
        home_abbr: game.home_abbr,
        away_abbr: game.away_abbr,
        home_score: game.home_score || 0,
        away_score: game.away_score || 0,
        status: "SCHEDULED",
        date: game.start_time,
        start_time: game.start_time
      }));
      
      console.log('✅ Upcoming games fetched successfully:', games.length, 'games');
      return games;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('❌ Failed to fetch upcoming games, trying fallback:', error);
    
    // Fallback: try to get upcoming games from recent endpoint
    try {
      const fallbackData = await api.getRecentGames(30);
      
      if (fallbackData.success && Array.isArray(fallbackData.games)) {
        const now = new Date();
        
        const upcomingOnly = fallbackData.games.filter((game: APIGame) => {
          const gameDate = new Date(game.start_time);
          return gameDate > now;
        }).map((game: APIGame) => ({
          id: game.id,
          api_game_id: game.id,
          home_team: game.home_team,
          away_team: game.away_team,
          home_abbr: game.home_abbr,
          away_abbr: game.away_abbr,
          home_score: game.home_score || 0,
          away_score: game.away_score || 0,
          status: "SCHEDULED",
          date: game.start_time,
          start_time: game.start_time
        }));
        
        console.log('📅 Fallback upcoming games:', upcomingOnly);
        return upcomingOnly;
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
    
    // Final fallback: return empty array instead of throwing
    return [];
  }
};

const fetchLiveGames = async (): Promise<Game[]> => {
  try {
    console.log('🔴 Fetching LIVE games from backend...');
    const data = await api.getLiveGames();
    console.log('🔴 Live Games API Response:', data);
    
    if (data.success && Array.isArray(data.live_games)) {
      // Transform live games response
      const liveGames = data.live_games.map((game: APIGame) => ({
        id: game.id,
        api_game_id: game.id,
        home_team: game.home_team,
        away_team: game.away_team,
        home_abbr: game.home_abbr || game.home_team?.substring(0, 3).toUpperCase(),
        away_abbr: game.away_abbr || game.away_team?.substring(0, 3).toUpperCase(),
        home_score: game.home_score || 0,
        away_score: game.away_score || 0,
        status: "LIVE",
        date: game.last_momentum_update || new Date().toISOString(),
        start_time: game.start_time || new Date().toISOString()
      }));
      
      console.log('🔴 Transformed Live Games:', liveGames);
      return liveGames;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch live games from backend:', error);
    throw error; // No fallback - let the app handle errors properly
  }
};

export function useAllGames() {
  return useQuery<Game[], Error>({
    queryKey: ['all-games'],
    queryFn: fetchGames,
    staleTime: 2 * 60 * 1000, // 2 minutes - games don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false, // Stop aggressive refetching
    refetchInterval: 60 * 1000, // Only refetch every 60 seconds if needed
  });
}

export function useUpcomingGames() {
  const result = useQuery<Game[], Error>({
    queryKey: ['upcoming-games'],
    queryFn: fetchUpcomingGames,
    staleTime: 10 * 60 * 1000, // 10 minutes - upcoming games change even less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Only refetch every 5 minutes
  });
  
  console.log('🔮 useUpcomingGames result:', result);
  return result;
}

export function useLiveGames() {
  return useQuery<Game[], Error>({
    queryKey: ['live-games'],
    queryFn: fetchLiveGames,
    staleTime: 30 * 1000, // 30 seconds - live games change frequently
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for live data
  });
}

export function useLiveTeams() {
  const { data: games, isLoading } = useLiveGames();
  
  const teams: Team[] = useMemo(() => {
    const teamsArray: Team[] = [];
    
    if (Array.isArray(games)) {
      games.forEach(game => {
        // Add home team
        teamsArray.push({
          id: `${game.id}-home`,
          name: game.home_team,
          gameId: game.id,
          isHome: true,
          score: game.home_score,
          opponentScore: game.away_score,
          opponent: game.away_team,
          status: game.status
        });
        
        // Add away team
        teamsArray.push({
          id: `${game.id}-away`,
          name: game.away_team,
          gameId: game.id,
          isHome: false,
          score: game.away_score,
          opponentScore: game.home_score,
          opponent: game.home_team,
          status: game.status
        });
    });
    }
    
    return teamsArray;
  }, [games]);
  
  return {
    data: teams,
    isLoading,
  };
}

export function useUpcomingTeams() {
  const { data: games, isLoading } = useUpcomingGames();
  
  console.log("🏀 useUpcomingTeams - DEBUG:", { games, isLoading, gamesLength: games?.length });
  const teams: Team[] = useMemo(() => {
    console.log('🏀 useUpcomingTeams - processing games:', games);
    
    const teamsArray: Team[] = [];
    
    if (Array.isArray(games)) {
      games.forEach(game => {
        // Add home team
        teamsArray.push({
          id: `${game.id}-home`,
          name: game.home_team,
          gameId: game.id,
          isHome: true,
          score: game.home_score,
          opponentScore: game.away_score,
          opponent: game.away_team,
          status: game.status
        });
        
        // Add away team
        teamsArray.push({
          id: `${game.id}-away`,
          name: game.away_team,
          gameId: game.id,
          isHome: false,
          score: game.away_score,
          opponentScore: game.home_score,
          opponent: game.home_team,
          status: game.status
        });
    });
    }
    
    console.log('🏀 useUpcomingTeams - final teams:', teamsArray);
    return teamsArray;
  }, [games]);
  
  return {
    data: teams,
    isLoading,
  };
}

// Simple hook for upcoming games (returns games, not teams)
export function useUpcomingGamesSimple() {
  const { data: games, isLoading } = useUpcomingGames();
  
  const formattedGames = useMemo(() => {
    if (!Array.isArray(games)) return [];
    
    return games.map(game => ({
      ...game,
      formattedDate: formatGameDate(game.start_time),
      timeUntilGame: getTimeUntilGame(game.start_time)
    }));
  }, [games]);
  
  return {
    data: formattedGames,
    isLoading,
  };
}

// Simple hook for live games (returns games, not teams)  
export function useLiveGamesSimple() {
  const { data: games, isLoading } = useLiveGames();
  
  return {
    data: games || [],
    isLoading,
  };
}

// Helper function to format game date
const formatGameDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    }
    
    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    }
    
    // Otherwise show date and time
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'TBD';
  }
};

// Helper function to get time until game
const getTimeUntilGame = (dateString: string): string => {
  try {
    const gameDate = new Date(dateString);
    const now = new Date();
    const diffMs = gameDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Started';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m`;
    }
  } catch (error) {
    return 'TBD';
  }
}; 