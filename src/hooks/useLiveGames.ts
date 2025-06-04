import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export interface Game {
  id: number;
  api_game_id: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: string;
  date: string;
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
  const token = localStorage.getItem('token');
  console.log('Auth token:', token); // Debug token

  const headers: Record<string, string> = {};
  if (token && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  console.log('Request headers:', headers); // Debug headers

  // Updated to use demo endpoint that returns the most relevant game
  const apiUrl = `http://localhost:8000/api/games/demo`;
  console.log('API URL:', apiUrl); // Debug API URL

  const res = await fetch(apiUrl, {
    headers,
  });
  
  if (!res.ok) {
    console.error('API Error:', res.status, res.statusText); // Debug API errors
    throw new Error(`Failed to fetch games: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  console.log('API Response:', data); // Debug API response
  
  // Since /demo returns a single game object, wrap it in an array
  return Array.isArray(data) ? data : [data];
};

const fetchUpcomingGames = async (): Promise<Game[]> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const apiUrl = `http://localhost:8000/api/games/demo`;
  const res = await fetch(apiUrl, {
    headers,
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch upcoming games: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  console.log('Upcoming Games API Response:', data);
  
  // Transform the demo response to match our Game interface
  if (data.details) {
    const game: Game = {
      id: data.gameId || data.details.id,
      api_game_id: data.gameId || data.details.id,
      home_team: data.details.home_team,
      away_team: data.details.away_team,
      home_score: 0, // Upcoming games have no score
      away_score: 0,
      status: data.details.status, // "Scheduled"
      date: data.details.date
    };
    return [game];
  }
  
  return [];
};

export function useAllGames() {
  return useQuery<Game[], Error>({
    queryKey: ['all-games'],
    queryFn: fetchGames,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (replaces cacheTime in newer versions)
    refetchOnWindowFocus: true,
  });
}

export function useUpcomingGames() {
  return useQuery<Game[], Error>({
    queryKey: ['upcoming-games'],
    queryFn: fetchUpcomingGames,
    staleTime: 5 * 60 * 1000, // 5 minutes - upcoming games don't change as frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useLiveGames() {
  const { data, isLoading, error } = useAllGames();
  console.log('useLiveGames - Raw data:', data);
  console.log('useLiveGames - isLoading:', isLoading);
  console.log('useLiveGames - error:', error);
  
  // Filter for games with "LIVE" status as expected by LiveTeamsSidebar
  const filtered = (Array.isArray(data) ? data : []).filter((g) => {
    const isLive = g.status === "LIVE";
    
    console.log(`Game ${g.id} (${g.home_team} vs ${g.away_team}):`, {
      status: g.status,
      isLive
    });
    
    return isLive;
  });
  
  console.log('useLiveGames - Filtered games:', filtered);
  
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
    
    console.log('useLiveTeams - Teams:', teamsArray);
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
    const teamsArray: Team[] = [];
    
    if (Array.isArray(games)) {
      games.forEach(game => {
        // Only add one entry per game to avoid duplicates for upcoming games
        teamsArray.push({
          id: `${game.id}-upcoming`,
          name: game.home_team,
          gameId: game.id,
          isHome: true,
          score: game.home_score,
          opponentScore: game.away_score,
          opponent: game.away_team,
          status: game.status
        });
      });
    }
    
    console.log('useUpcomingTeams - Teams:', teamsArray);
    return teamsArray;
  }, [games]);
  
  return {
    data: teams,
    isLoading,
    error,
  };
} 