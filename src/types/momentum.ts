export interface MomentumMetrics {
  overall: number; // 0-1 scale
  netChange: number; // e.g., +12.7
  trend: 'up' | 'down' | 'neutral';
  confidence: number; // 0-1 scale
  lastUpdate: string;
}

export interface TeamMomentum {
  teamId: string;
  teamName: string;
  metrics: {
    offense: MomentumMetrics;
    defense: MomentumMetrics;
    overall: MomentumMetrics;
  };
  keyFactors: {
    factor: string;
    impact: number; // -1 to 1 scale
    description: string;
  }[];
}

export interface GameMomentum {
  gameId: string;
  homeTeam: TeamMomentum;
  awayTeam: TeamMomentum;
  matchupMetrics: {
    homeAdvantage: number; // 0-1 scale
    paceImpact: number; // -1 to 1 scale
    matchupStrength: number; // 0-1 scale
  };
  predictions: {
    winProbability: {
      home: number; // 0-1 scale
      away: number; // 0-1 scale
    };
    expectedScore: {
      home: number;
      away: number;
    };
    confidence: number; // 0-1 scale
  };
  lastUpdate: string;
}

export interface MomentumApiResponse {
  data: GameMomentum;
  error?: string;
  timestamp: string;
} 