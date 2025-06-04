import { useMemo } from 'react';

// Types for different momentum contexts
export interface MomentumContext {
  type: 'player' | 'team';
  category?: 'points' | 'rebounds' | 'assists' | 'blocks' | 'steals' | 'overall';
  value: number;
  gameTime?: string;
  period?: string;
}

// Generate realistic recent activity descriptions - converted to regular function
export const getMomentumActivity = (context: MomentumContext): string => {
  const { type, category, value } = context;
  
  if (type === 'player') {
    switch (category) {
      case 'points':
        if (value > 4) return "12 PTS in last 4 mins";
        if (value > 2.5) return "8 straight in Q2 surge";
        if (value > 1.5) return "2/3 from three recently";
        return "1/5 FG in last 6 mins";
        
      case 'rebounds':
        if (value > 3.5) return "5 consecutive defensive rebounds";
        if (value > 2.5) return "3 offensive boards this quarter";
        if (value > 1.5) return "Out-rebounding opponents 3:1";
        return "Only 1 rebound in 8 mins";
        
      case 'assists':
        if (value > 3.5) return "6 assists, 0 turnovers this half";
        if (value > 2.5) return "Setting up teammates consistently";
        if (value > 1.5) return "3 assists in last possession run";
        return "2 turnovers, 1 assist recent";
        
      case 'blocks':
        if (value > 2.5) return "3 blocks in clutch time";
        if (value > 1.5) return "Rim protection causing misses";
        if (value > 1) return "1 block altered 3 shots";
        return "Getting beat at the rim";
        
      case 'steals':
        if (value > 2.5) return "2 steals leading to 6 points";
        if (value > 1.5) return "Disrupting passing lanes";
        if (value > 1) return "Active hands, 1 deflection";
        return "0 steals, beaten backdoor";
        
      default:
        return "Active in multiple categories";
    }
  } else {
    // Team momentum
    if (value > 6) return "On a 12-2 scoring run";
    if (value > 4) return "Outscoring by 8 in last 5 mins";
    if (value > 2.5) return "Trading baskets evenly";
    if (value > 1.5) return "Behind by 6 in quarter";
    return "Struggling on both ends";
  }
};

// Normalize momentum values to percentage scale
export const normalizeMomentum = (value: number, min: number = 0, max: number = 10): number => {
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
};

// Get momentum status with appropriate colors and descriptions
export const getMomentumStatus = (percentage: number): { text: string; color: string; emoji: string } => {
  if (percentage >= 80) return { text: "Hot stat", color: "#FF6B35", emoji: "🔥" };
  if (percentage >= 60) return { text: "Driving momentum", color: "#00FF8B", emoji: "📈" };
  if (percentage >= 40) return { text: "Contributing to live line shift", color: "#FFD700", emoji: "⚡" };
  if (percentage >= 20) return { text: "Building momentum", color: "#6B73FF", emoji: "📊" };
  return { text: "Neutral", color: "#9CA3AF", emoji: "😴" };
};

// Explanation texts for different momentum categories
export const getMomentumExplanation = (category: string) => {
  const explanations = {
    points: "Points momentum reflects how scoring swings the betting line. Higher values indicate big buckets during critical runs.",
    rebounds: "Rebounding momentum shows control of the glass. Critical for second-chance opportunities and tempo control.",
    assists: "Assist momentum indicates ball movement and team chemistry. High values suggest offensive flow and line movement.",
    blocks: "Defensive momentum from rim protection. Blocks create energy shifts and can swing betting odds significantly.",
    steals: "Steals momentum captures defensive pressure leading to fast breaks. High values indicate game-changing defensive plays.",
    team: "Overall team momentum calculated from player performance, scoring runs, and defensive stops. This directly impacts live betting odds.",
    overall: "Combined momentum from all statistical categories, weighted by their correlation to betting line movement."
  };
  
  return explanations[category as keyof typeof explanations] || "Momentum metric that influences betting odds and game flow.";
}; 