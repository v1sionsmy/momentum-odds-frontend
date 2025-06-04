import { useState, useEffect } from "react";

// Types for game players data
interface Player {
  player_id: string;
  name: string;
  position: string;
  minutes_played: string;
  team_id: string;
}

// API utility for backend calls
const api = {
  get: async (url: string) => {
    const response = await fetch(`http://localhost:8000/api${url}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: await response.json() };
  }
};

export function useGamePlayers(gameId: number | null) {
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
      try {
        const resp = await api.get(`/games/${gameId}/players`);
        if (!cancelled) {
          setGamePlayers(resp.data || []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlayers();
  }, [gameId]);

  return { gamePlayers, isLoadingPlayers: isLoading, errorPlayers: error };
}

export function useTeamPlayers(gameId: number | null, teamName: string | null) {
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
      try {
        const resp = await api.get(`/games/${gameId}/players`);
        if (!cancelled) {
          // Filter players by team - map team names to team IDs
          const getTeamIdByName = (teamName: string): string => {
            const TEAM_NAME_TO_ID: Record<string, string> = {
              'Boston Celtics': '1',
              'New York Knicks': '2',
              'Brooklyn Nets': '3',
              'Philadelphia 76ers': '4',
              'Toronto Raptors': '5',
              'Chicago Bulls': '6',
              'Cleveland Cavaliers': '7',
              'Detroit Pistons': '8',
              'Indiana Pacers': '9',
              'Milwaukee Bucks': '10',
              'Atlanta Hawks': '11',
              'Charlotte Hornets': '12',
              'Miami Heat': '13',
              'Orlando Magic': '14',
              'Washington Wizards': '15',
              'Denver Nuggets': '16',
              'Minnesota Timberwolves': '17',
              'Oklahoma City Thunder': '18',
              'Portland Trail Blazers': '19',
              'Utah Jazz': '20',
              'Golden State Warriors': '21',
              'Los Angeles Clippers': '22',
              'Los Angeles Lakers': '23',
              'Phoenix Suns': '24',
              'Sacramento Kings': '25',
              'Dallas Mavericks': '26',
              'Houston Rockets': '27',
              'Memphis Grizzlies': '28',
              'New Orleans Pelicans': '29',
              'San Antonio Spurs': '30',
            };
            
            return TEAM_NAME_TO_ID[teamName] || '0';
          };

          const selectedTeamId = getTeamIdByName(teamName);
          
          // Filter players to only include those from the selected team
          const filteredPlayers = (resp.data || []).filter((player: Player) => 
            player.team_id === selectedTeamId
          );
          
          setTeamPlayers(filteredPlayers);
          setError(null);
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
  }, [gameId, teamName]);

  return { teamPlayers, isLoadingTeamPlayers: isLoading, errorTeamPlayers: error };
} 