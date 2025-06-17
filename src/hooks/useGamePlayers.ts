import { useState, useEffect } from "react";
import { api } from "../lib/api";

// Types for game players data
interface Player {
  player_id: number;
  full_name: string;
  name?: string;
  position: string;
  points: number;
  rebounds: number;
  assists: number;
  minutes_played: number;
  team_name: string;
  team_abbr: string;
  field_goal_percentage?: number;
  plus_minus?: number;
  momentum?: number;
}

export function useGamePlayers(gameId: number | null, minMinutes = 15) {
  const [gamePlayers, setGamePlayers] = useState<Player[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId) {
      setGamePlayers([]);
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`🏀 Fetching players for game ${gameId} with min_minutes=${minMinutes}`);
        const data = await api.getGamePlayers(gameId, minMinutes);
        
        if (!cancelled) {
          // Handle new API response format
          if (data && typeof data === 'object' && 'success' in data) {
            console.log(`🏀 New API format - Success: ${data.success}, Source: ${data.source}, Players: ${data.players?.length || 0}`);
            
            if (data.success && Array.isArray(data.players) && data.players.length > 0) {
              // Real player data from API
              setGamePlayers(data.players);
              console.log(`✅ Using ${data.players.length} real players from ${data.source}`);
            } else {
              // No real data available - DON'T show fake data to prevent confusion
              console.log(`❌ No real player data available for game ${gameId}, showing empty list instead of fake data`);
              setGamePlayers([]);
            }
          } else if (Array.isArray(data) && data.length > 0) {
            // Old API format (direct array) - shouldn't happen with new endpoint
            console.log(`🏀 Old API format - ${data.length} players found`);
            setGamePlayers(data);
          } else {
            // No data or empty response - show empty list
            console.log(`❌ No player data in response for game ${gameId}, showing empty list`);
            setGamePlayers([]);
          }
        }
      } catch (e) {
        console.error(`❌ Error fetching players for game ${gameId}:`, e);
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Failed to fetch players'));
          
          // Even on error, show empty list instead of fake data
          console.log(`❌ API error for game ${gameId}, showing empty list instead of fake data`);
          setGamePlayers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlayers();
    
    return () => {
      cancelled = true;
    };
  }, [gameId, minMinutes]);

  return { gamePlayers, isLoadingPlayers: isLoading, errorPlayers: error };
}

export function useTeamPlayers(gameId: number | null, teamName: string | null, minMinutes = 15) {
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPlayers = async () => {
      if (!gameId) {
        setTeamPlayers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log(`🏀 Fetching team players for game ${gameId}, team: ${teamName}, min_minutes=${minMinutes}`);
        const data = await api.getGamePlayers(gameId, minMinutes);
        
        if (!cancelled) {
          let allPlayers: Player[] = [];
          
          // Handle new API response format
          if (data && typeof data === 'object' && 'success' in data) {
            console.log(`🏀 Team players - New API format - Success: ${data.success}, Source: ${data.source}, Players: ${data.players?.length || 0}`);
            
            if (data.success && Array.isArray(data.players) && data.players.length > 0) {
              allPlayers = data.players;
              console.log(`✅ Using ${data.players.length} real players from ${data.source}`);
            } else {
              // No real data - don't generate fake data
              console.log(`❌ No real team player data for game ${gameId}, showing empty list`);
              allPlayers = [];
            }
          } else if (Array.isArray(data) && data.length > 0) {
            // Old API format - shouldn't happen with new endpoint
            allPlayers = data;
            console.log(`🏀 Team players - Old API format - ${data.length} players found`);
          } else {
            // No data, show empty list
            console.log(`❌ No team player data in response for game ${gameId}, showing empty list`);
            allPlayers = [];
          }
          
          // Filter by team if specified and we have real data
          let filteredPlayers = allPlayers;
          if (teamName && allPlayers.length > 0) {
            filteredPlayers = allPlayers.filter(player => 
              player.team_name?.toLowerCase().includes(teamName.toLowerCase()) ||
              player.team_abbr?.toLowerCase().includes(teamName.toLowerCase())
            );
            console.log(`🎯 Filtered to ${filteredPlayers.length} players for team "${teamName}"`);
          }
          
          setTeamPlayers(filteredPlayers);
        }
      } catch (e) {
        console.error(`❌ Error fetching team players for game ${gameId}:`, e);
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Failed to fetch team players'));
          
          // On error, show empty list instead of fake data
          console.log(`❌ API error for team players in game ${gameId}, showing empty list`);
          setTeamPlayers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlayers();
    
    return () => {
      cancelled = true;
    };
  }, [gameId, teamName, minMinutes]);

  return { teamPlayers, isLoadingTeamPlayers: isLoading, errorTeamPlayers: error };
} 