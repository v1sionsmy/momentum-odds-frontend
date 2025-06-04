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
    if (!gameId) {
      setTeamProps({});
      return;
    }

    const fetchTeamProps = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8000/api/games/${gameId}/team-props`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch betting markets: ${response.status}`);
        }
        
        const data = await response.json();
        setTeamProps(data);
      } catch (err) {
        console.error('Error fetching betting markets:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // Mock betting market data for development
        const mockData: TeamBettingData = {
          "18": [
            {
              team_id: 18,
              team_name: "Boston Celtics",
              market_type: "moneyline",
              current_odds: -165,
              opening_odds: -145,
              surging: true,
              movement_direction: 'down',
              movement_magnitude: 4.2,
              implied_probability: 62.3,
              market_confidence: 'high'
            },
            {
              team_id: 18,
              team_name: "Boston Celtics",
              market_type: "spread",
              current_odds: -110,
              opening_odds: -110,
              line: -4.5,
              opening_line: -3.5,
              surging: false,
              movement_direction: 'down',
              movement_magnitude: 1.0,
              implied_probability: 52.4,
              market_confidence: 'medium'
            },
            {
              team_id: 18,
              team_name: "Boston Celtics",
              market_type: "team_total",
              current_odds: -115,
              opening_odds: -110,
              line: 108.5,
              opening_line: 107.5,
              surging: true,
              movement_direction: 'up',
              movement_magnitude: 1.0,
              implied_probability: 53.5,
              market_confidence: 'high'
            },
            {
              team_id: 18,
              team_name: "Boston Celtics",
              market_type: "race_to_points",
              current_odds: -180,
              opening_odds: -120,
              surging: true,
              movement_direction: 'down',
              movement_magnitude: 9.4,
              implied_probability: 64.3,
              market_confidence: 'high',
              specialty_target: 20
            },
            {
              team_id: 18,
              team_name: "Boston Celtics",
              market_type: "next_score",
              current_odds: -140,
              opening_odds: -110,
              surging: true,
              movement_direction: 'down',
              movement_magnitude: 6.1,
              implied_probability: 58.3,
              market_confidence: 'medium'
            }
          ],
          "19": [
            {
              team_id: 19,
              team_name: "New York Knicks",
              market_type: "moneyline",
              current_odds: +145,
              opening_odds: +125,
              surging: false,
              movement_direction: 'up',
              movement_magnitude: 3.7,
              implied_probability: 40.8,
              market_confidence: 'low'
            },
            {
              team_id: 19,
              team_name: "New York Knicks",
              market_type: "spread",
              current_odds: -110,
              opening_odds: -110,
              line: +4.5,
              opening_line: +3.5,
              surging: true,
              movement_direction: 'up',
              movement_magnitude: 1.0,
              implied_probability: 52.4,
              market_confidence: 'medium'
            },
            {
              team_id: 19,
              team_name: "New York Knicks",
              market_type: "team_total",
              current_odds: -105,
              opening_odds: -110,
              line: 103.5,
              opening_line: 102.5,
              surging: false,
              movement_direction: 'up',
              movement_magnitude: 1.0,
              implied_probability: 51.2,
              market_confidence: 'low'
            },
            {
              team_id: 19,
              team_name: "New York Knicks",
              market_type: "race_to_points",
              current_odds: +160,
              opening_odds: +110,
              surging: false,
              movement_direction: 'up',
              movement_magnitude: 8.1,
              implied_probability: 38.5,
              market_confidence: 'low',
              specialty_target: 20
            },
            {
              team_id: 19,
              team_name: "New York Knicks",
              market_type: "next_score",
              current_odds: +120,
              opening_odds: +100,
              surging: false,
              movement_direction: 'up',
              movement_magnitude: 4.5,
              implied_probability: 45.5,
              market_confidence: 'low'
            }
          ]
        };
        setTeamProps(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamProps();
  }, [gameId]);

  return { teamProps, isLoading, error };
} 