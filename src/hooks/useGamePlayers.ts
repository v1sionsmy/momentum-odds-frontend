import { useState, useEffect } from "react";
import { api } from "../lib/api";

// Types for game players data
interface Player {
  player_id: number;
  full_name: string;
  position: string;
  points: number;
  rebounds: number;
  assists: number;
  minutes_played: number;
  team_name: string;
  team_abbr: string;
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
        const data = await api.getGamePlayers(gameId, minMinutes);
        if (!cancelled) {
          if (data.success && Array.isArray(data.players)) {
            setGamePlayers(data.players);
          } else {
            setGamePlayers([]);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Unknown error'));
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
      if (!gameId || !teamName) {
        setTeamPlayers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await api.getGamePlayers(gameId, minMinutes);
        if (!cancelled) {
          if (data.success && Array.isArray(data.players)) {
            // Filter players by team name
            const filteredPlayers = data.players.filter((player: Player) => 
              player.team_name === teamName
            );
            setTeamPlayers(filteredPlayers);
          } else {
            setTeamPlayers([]);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Unknown error'));
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