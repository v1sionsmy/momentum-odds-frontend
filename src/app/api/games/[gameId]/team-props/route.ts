import { NextRequest, NextResponse } from 'next/server';

interface BettingMarket {
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

interface TeamBettingData {
  [teamId: string]: BettingMarket[];
}

// Helper function to convert American odds to implied probability
function oddsToImpliedProbability(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100) * 100;
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100) * 100;
  }
}

// Helper function to calculate movement magnitude
function calculateMovement(current: number, opening: number): number {
  const currentProb = oddsToImpliedProbability(current);
  const openingProb = oddsToImpliedProbability(opening);
  return Math.abs(currentProb - openingProb);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId: gameIdParam } = await params;
    const gameId = parseInt(gameIdParam);
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    // Mock betting market data - in a real app, this would fetch from sportsbook APIs
    const mockBettingMarkets: TeamBettingData = {
      "18": [
        {
          team_id: 18,
          team_name: "Boston Celtics",
          market_type: "moneyline",
          current_odds: -165,
          opening_odds: -145,
          surging: true,
          movement_direction: 'down', // odds getting better (more negative = more favored)
          movement_magnitude: calculateMovement(-165, -145),
          implied_probability: oddsToImpliedProbability(-165),
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
          movement_direction: 'down', // spread increased against them
          movement_magnitude: 1.0,
          implied_probability: oddsToImpliedProbability(-110),
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
          movement_direction: 'up', // total increased (good for over)
          movement_magnitude: 1.0,
          implied_probability: oddsToImpliedProbability(-115),
          market_confidence: 'high'
        },
        {
          team_id: 18,
          team_name: "Boston Celtics",
          market_type: "race_to_points",
          current_odds: -180,
          opening_odds: -120,
          surging: true,
          movement_direction: 'down', // becoming more favored
          movement_magnitude: calculateMovement(-180, -120),
          implied_probability: oddsToImpliedProbability(-180),
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
          movement_direction: 'down', // more likely to score next
          movement_magnitude: calculateMovement(-140, -110),
          implied_probability: oddsToImpliedProbability(-140),
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
          movement_direction: 'up', // odds getting worse (less favored)
          movement_magnitude: calculateMovement(+145, +125),
          implied_probability: oddsToImpliedProbability(+145),
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
          movement_direction: 'up', // spread moved in their favor
          movement_magnitude: 1.0,
          implied_probability: oddsToImpliedProbability(-110),
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
          movement_direction: 'up', // total increased slightly
          movement_magnitude: 1.0,
          implied_probability: oddsToImpliedProbability(-105),
          market_confidence: 'low'
        },
        {
          team_id: 19,
          team_name: "New York Knicks",
          market_type: "race_to_points",
          current_odds: +160,
          opening_odds: +110,
          surging: false,
          movement_direction: 'up', // becoming less favored
          movement_magnitude: calculateMovement(+160, +110),
          implied_probability: oddsToImpliedProbability(+160),
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
          movement_direction: 'up', // less likely to score next
          movement_magnitude: calculateMovement(+120, +100),
          implied_probability: oddsToImpliedProbability(+120),
          market_confidence: 'low'
        }
      ]
    };

    return NextResponse.json(mockBettingMarkets);
    
  } catch (error) {
    console.error('Error fetching betting markets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 