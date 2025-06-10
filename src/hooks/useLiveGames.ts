import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { api } from '../lib/api';

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
    const data = await api.getRecentGames(10);
    console.log('🎮 API Response for Recent Games:', data);
    
    if (data.success && Array.isArray(data.games)) {
      // Transform the API response to match our Game interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedGames = data.games.map((game: any) => ({
        id: game.id,
        api_game_id: game.id,
        home_team: game.home_team,
        away_team: game.away_team,
        home_abbr: game.home_abbr,
        away_abbr: game.away_abbr,
        home_score: game.home_score || 0,
        away_score: game.away_score || 0,
        status: game.home_score > 0 || game.away_score > 0 ? "FINAL" : "SCHEDULED", // Simple status logic
        date: game.start_time,
        start_time: game.start_time
      }));
      
      console.log('🎮 Transformed Games:', transformedGames);
      return transformedGames;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch games from backend:', error);
    throw error; // Don't fallback to mock data - let the app handle the error
  }
};

const fetchUpcomingGames = async (): Promise<Game[]> => {
  try {
    // Use the same recent games endpoint but filter for upcoming games
    const data = await api.getScheduledGames(20); // Use dedicated scheduled games endpoint
    console.log('📅 API Response for Upcoming Games:', data);
    console.log("🔍 API CALL RESULT:", { success: data.success, gamesCount: data.games?.length, data });
    
    if (data.success && Array.isArray(data.games)) {
      const now = new Date();
      console.log('📅 Current time:', now.toISOString());
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allTransformed = data.games.map((game: any) => ({
        id: game.id,
        api_game_id: game.id,
        home_team: game.home_team,
        away_team: game.away_team,
        home_abbr: game.home_abbr,
        away_abbr: game.away_abbr,
        home_score: game.home_score || 0,
        away_score: game.away_score || 0,
        status: game.home_score > 0 || game.away_score > 0 ? "FINAL" : "SCHEDULED",
        date: game.start_time,
        start_time: game.start_time
      }));
      
      console.log('📅 All transformed games:', allTransformed);
      
      // Backend already provides scheduled games - no client-side filtering needed
      
      console.log("📅 Final upcoming games:", allTransformed);
      return allTransformed;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch upcoming games from backend:', error);
    throw error; // No mock data fallback
  }
};

const fetchLiveGames = async (): Promise<Game[]> => {
  try {
    console.log('🔴 Fetching LIVE games from backend...');
    const data = await api.getLiveGames();
    console.log('🔴 Live Games API Response:', data);
    
    if (data.success && Array.isArray(data.live_games)) {
      // Transform live games response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const liveGames = data.live_games.map((game: any) => ({
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
  
  
  return result;
  console.log('🔮 useUpcomingGames result:', result);
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
  const { data: games, isLoading, error } = useLiveGames();
  
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
    error,
  };
}

export function useUpcomingTeams() {
  const { data: games, isLoading, error } = useUpcomingGames();
  
  console.log("🏀 useUpcomingTeams - DEBUG:", { games, isLoading, error, gamesLength: games?.length });
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
    error,
  };
} 