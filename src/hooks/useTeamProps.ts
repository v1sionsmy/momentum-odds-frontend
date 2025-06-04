import { useState, useEffect } from 'react';

export interface BettingMarket {
  team_id: number;
  team_name: string;
  market_type: string; // 'moneyline', 'spread', 'total', 'team_total', 'next_score', 'race_to_points', 'margin_band'
  current_odds: number; // American odds format (+120, -145)
  opening_odds: number;
  line?: number; // For spread/totals (e.g., -3.5, 221.5)
  opening_line?: number;
  surging: boolean; // True if odds are moving favorably
  movement_direction: 'up' | 'down' | 'stable';
  movement_magnitude: number; // How much odds have moved (in percentage)
  implied_probability: number; // Convert odds to probability
  market_confidence: 'high' | 'medium' | 'low'; // Based on line movement
  specialty_target?: number; // For race to X points
  margin_range?: string; // For winning margin (e.g., "1-5 pts")
}

export interface TeamBettingData {
  [teamId: string]: BettingMarket[];
}

export function useTeamProps(gameId: number | null) {
  const [teamProps, setTeamProps] = useState<TeamBettingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTeamProps = async () => {
      if (!gameId) {
        setTeamProps({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`https://momentum-ignition-backend.onrender.com/api/games/${gameId}/team-props`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!cancelled) {
          setTeamProps(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTeamProps();
    
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return { teamProps, isLoading, error };
} 