import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface MomentumSnapshot {
  id: number;
  game_id: number;
  timestamp: string;
  momentum_data: {
    game_info: {
      game_id: number;
      date: string;
      home_team: string;
      away_team: string;
      final_score: string;
    };
    team_momentum: {
      home_team: {
        team_id: number;
        name: string;
        abbreviation: string;
        location: string;
        momentum_score: number;
        final_score: number;
      };
      away_team: {
        team_id: number;
        name: string;
        abbreviation: string;
        location: string;
        momentum_score: number;
        final_score: number;
      };
    };
    player_momentum: Array<{
      player_id: number;
      name: string;
      position: string;
      team_id: number;
      momentum_score: number;
      points: number;
      assists: number;
      rebounds: number;
      minutes_played: number;
      field_goal_percentage: number;
      plus_minus: number;
      efficiency_rating: number;
    }>;
  };
  created_at: string;
}

interface TeamMomentumData {
  teamMomentum: Record<string, number>;
  playerMomentum?: Record<string, number>;
}

export function useReplayMomentum(gameId: number | null) {
  const [snapshots, setSnapshots] = useState<MomentumSnapshot[]>([]);
  const [current, setCurrent] = useState<MomentumSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId) {
      setSnapshots([]);
      setCurrent(null);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        // Use the new momentum analysis endpoint
        const data = await api.analyzeMomentum(gameId);
        
        // Handle case where API returns error message
        if (!data.success) {
          console.warn(`API returned error`);
          setError(new Error('Failed to fetch momentum data'));
          return;
        }
        
        // Convert the new API response to snapshot format for compatibility
        const snapshotData = [{
          id: 1,
          game_id: gameId,
          timestamp: data.timestamp,
          momentum_data: {
            game_info: {
              game_id: data.game_info.id,
              date: data.game_info.start_time,
              home_team: data.game_info.home_team,
              away_team: data.game_info.away_team,
              final_score: `${data.game_info.home_score}-${data.game_info.away_score}`
            },
            team_momentum: {
              home_team: {
                team_id: 1,
                name: data.game_info.home_team,
                abbreviation: data.game_info.home_team.substring(0, 3).toUpperCase(),
                location: data.game_info.home_team,
                momentum_score: data.team_momentum[data.game_info.home_team] || 0,
                final_score: data.game_info.home_score
              },
              away_team: {
                team_id: 2,
                name: data.game_info.away_team,
                abbreviation: data.game_info.away_team.substring(0, 3).toUpperCase(),
                location: data.game_info.away_team,
                momentum_score: data.team_momentum[data.game_info.away_team] || 0,
                final_score: data.game_info.away_score
              }
            },
            player_momentum: data.player_momentum.top_players.map((player: { name: string; momentum: number; team: string }, index: number) => ({
              player_id: index + 1,
              name: player.name,
              position: 'G',
              team_id: player.team === data.game_info.home_team ? 1 : 2,
              momentum_score: player.momentum,
              points: 0,
              assists: 0,
              rebounds: 0,
              minutes_played: 0,
              field_goal_percentage: 0,
              plus_minus: 0,
              efficiency_rating: 0
            }))
          },
          created_at: data.timestamp
        }];
        
        if (snapshotData.length === 0) {
          setError(new Error('No momentum snapshots available for this game'));
          return;
        }
        
        setSnapshots(snapshotData);
        setCurrent(snapshotData[0] || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load snapshots'));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [gameId]);

  useEffect(() => {
    if (snapshots.length === 0) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      if (idx >= snapshots.length) {
        clearInterval(interval);
        return;
      }
      setCurrent(snapshots[idx]);
    }, 2000);

    return () => clearInterval(interval);
  }, [snapshots]);

  // Convert the real API data structure to the format expected by MainMomentumBox
  const teamMomentum: TeamMomentumData | null = current?.momentum_data?.team_momentum
    ? {
        teamMomentum: {
          [current.momentum_data.team_momentum.home_team.name]: current.momentum_data.team_momentum.home_team.momentum_score,
          [current.momentum_data.team_momentum.away_team.name]: current.momentum_data.team_momentum.away_team.momentum_score
        },
        playerMomentum: current.momentum_data.player_momentum?.reduce((acc, player) => {
          acc[player.player_id.toString()] = player.momentum_score;
          return acc;
        }, {} as Record<string, number>)
      }
    : null;

  return { teamMomentum, isLoading, error, snapshot: current, snapshots };
} 