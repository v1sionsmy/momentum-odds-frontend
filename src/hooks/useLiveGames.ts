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
    console.error('❌ Failed to fetch games:', error);
    throw error;
  }
};

const fetchUpcomingGames = async (): Promise<Game[]> => {
  try {
    // Use the same recent games endpoint but filter for upcoming games
    const data = await api.getRecentGames(20); // Get more games to find upcoming ones
    console.log('📅 API Response for Upcoming Games:', data);
    
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
      
      const upcomingGames = allTransformed.filter((game: Game) => {
        const gameDate = new Date(game.start_time);
        const isUpcoming = gameDate > now;
        console.log(`📅 Game ${game.home_team} vs ${game.away_team}:`, {
          start_time: game.start_time,
          gameDate: gameDate.toISOString(),
          isUpcoming,
          status: game.status
        });
        return isUpcoming;
      });
      
      console.log('📅 Filtered upcoming games:', upcomingGames);
      
      // If no upcoming games found, create a mock one for testing
      if (upcomingGames.length === 0) {
        console.log('📅 No upcoming games found, getting featured game instead...');
        
        try {
          // Get the featured game from the API instead of creating mock data
          const featuredData = await api.getFeaturedGame();
          console.log('🎯 Featured game data:', featuredData);
          
          if (featuredData.success && featuredData.games && featuredData.games.length > 0) {
            const featuredGame = featuredData.games[0]; // Get the first (most recent) game
            const game: Game = {
              id: featuredGame.id,
              api_game_id: featuredGame.id,
              home_team: featuredGame.home_team,
              away_team: featuredGame.away_team,
              home_abbr: featuredGame.home_abbr,
              away_abbr: featuredGame.away_abbr,
              home_score: featuredGame.home_score,
              away_score: featuredGame.away_score,
              status: "FINAL",
              date: featuredGame.start_time,
              start_time: featuredGame.start_time
            };
            
            console.log('🎯 Using featured game instead of mock:', game);
            return [game];
          }
        } catch (error) {
          console.error('❌ Failed to get featured game:', error);
        }
        
        // Fallback: if featured game fails, use the most recent completed game
        if (allTransformed.length > 0) {
          console.log('📅 Using most recent completed game as fallback...');
          const mostRecent = allTransformed[0]; // Games are already sorted by date DESC
          return [mostRecent];
        }
        
        // Last resort: empty array
        console.log('📅 No games available at all');
        return [];
      }
      
      return upcomingGames;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch upcoming games:', error);
    throw error;
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
  
  console.log('🔮 useUpcomingGames result:', {
    data: result.data,
    isLoading: result.isLoading,
    error: result.error,
    dataLength: result.data?.length
  });
  
  return result;
}

export function useLiveGames() {
  const { data, isLoading, error } = useAllGames();
  
  // Filter for games with "LIVE" status or games currently in progress
  const filtered = (Array.isArray(data) ? data : []).filter((g) => {
    // A game is considered "live" if it has started but not finished
    // and has some score progression
    const hasStarted = g.home_score > 0 || g.away_score > 0;
    const gameDate = new Date(g.start_time);
    const now = new Date();
    const isWithinGameWindow = Math.abs(now.getTime() - gameDate.getTime()) < 4 * 60 * 60 * 1000; // Within 4 hours
    
    const isLive = g.status === "LIVE" || (hasStarted && isWithinGameWindow && g.status !== "FINAL");
    
    return isLive;
  });
  
  return {
    data: filtered,
    isLoading,
    error,
  };
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