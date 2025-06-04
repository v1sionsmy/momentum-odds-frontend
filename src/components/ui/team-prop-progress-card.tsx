import React from 'react';
import { cn } from '@/lib/utils';

interface BettingMarketCardProps {
  teamName: string;
  marketType: string;
  currentOdds: number;
  openingOdds: number;
  line?: number;
  openingLine?: number;
  surging?: boolean;
  movementDirection: 'up' | 'down' | 'stable';
  movementMagnitude: number;
  impliedProbability: number;
  marketConfidence: 'high' | 'medium' | 'low';
  specialtyTarget?: number;
  marginRange?: string;
  className?: string;
}

// Get appropriate emoji for market type
const getMarketEmoji = (marketType: string): string => {
  switch (marketType.toLowerCase()) {
    case 'moneyline':
      return '💰';
    case 'spread':
      return '📊';
    case 'total':
    case 'team_total':
      return '🎯';
    case 'next_score':
      return '⚡';
    case 'race_to_points':
      return '🏃';
    default:
      return '🎲';
  }
};

// Format odds display
const formatOdds = (odds: number): string => {
  if (odds > 0) {
    return `+${odds}`;
  }
  return `${odds}`;
};

// Format market type for display (simplified)
const formatMarketType = (marketType: string, line?: number): string => {
  switch (marketType.toLowerCase()) {
    case 'moneyline':
      return 'Win';
    case 'spread':
      return `Spread ${line ? (line > 0 ? `+${line}` : line) : ''}`;
    case 'total':
      return `Total ${line || ''}`;
    case 'team_total':
      return `Team Total ${line || ''}`;
    case 'next_score':
      return 'Next Score';
    case 'race_to_points':
      return 'Race to Pts';
    default:
      return marketType;
  }
};

// Get movement indicator (simplified)
const getMovementIndicator = (movementDirection: 'up' | 'down' | 'stable', magnitude: number) => {
  if (movementDirection === 'stable' || magnitude < 1) {
    return { arrow: '', color: '#6B7280' };
  }
  
  if (movementDirection === 'up') {
    return { arrow: '↗', color: '#EF4444' };
  }
  
  return { arrow: '↘', color: '#10B981' };
};

// Determine momentum state and colors
const getMomentumState = (surging: boolean, marketConfidence: 'high' | 'medium' | 'low', movementMagnitude: number) => {
  // Strong momentum: surging with high confidence or high magnitude movement
  if (surging && marketConfidence === 'high') {
    return {
      level: 'strong',
      borderColor: '#00FF8B',
      glowColor: '#00FF8B',
      bgColor: '#00FF8B',
      textColor: '#00FF8B',
      flashDuration: '1s', // Faster flashing for strong momentum
    };
  }
  
  // Medium momentum: high confidence or significant movement
  if (marketConfidence === 'high' || movementMagnitude > 3) {
    return {
      level: 'medium',
      borderColor: '#FFD700',
      glowColor: '#FFD700',
      bgColor: '#FFD700',
      textColor: '#FFD700',
      flashDuration: '2s',
    };
  }
  
  // Low momentum: stable or low confidence
  return {
    level: 'low',
    borderColor: '#4B5563',
    glowColor: '#4B5563',
    bgColor: '#6B7280',
    textColor: '#9CA3AF',
    flashDuration: '3s',
  };
};

export function TeamPropProgressCard({
  teamName,
  marketType,
  currentOdds,
  openingOdds,
  line,
  surging = false,
  movementDirection,
  movementMagnitude,
  impliedProbability,
  marketConfidence,
  className
}: BettingMarketCardProps) {
  const emoji = getMarketEmoji(marketType);
  const movement = getMovementIndicator(movementDirection, movementMagnitude);
  const formattedMarketType = formatMarketType(marketType, line);
  const momentum = getMomentumState(surging, marketConfidence, movementMagnitude);
  
  // Calculate odds change
  const oddsChange = currentOdds - openingOdds;
  const hasSignificantChange = Math.abs(oddsChange) > 5;
    
  return (
    <div 
      className={cn(
        "relative bg-[#1A1F26] rounded-lg p-4 border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer",
        surging && momentum.level === 'strong' && "momentum-glow",
        className
      )}
      style={{
        borderColor: momentum.borderColor,
        boxShadow: surging ? `0 0 20px ${momentum.glowColor}40` : 'none',
        '--glow-color': momentum.glowColor,
      } as React.CSSProperties}
    >
      {/* Enhanced momentum flash overlay - faster and more prominent */}
      {surging && (
        <div
          className={cn(
            "absolute inset-0 rounded-lg pointer-events-none",
            momentum.level === 'strong' ? "momentum-flash-strong" : "momentum-flash-medium"
          )}
          style={{
            background: `linear-gradient(45deg, transparent, ${momentum.glowColor}15, transparent)`,
          }}
        />
      )}

      {/* Header: Market Type & Team */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{emoji}</span>
          <div>
            <div className="text-white font-semibold text-sm">{formattedMarketType}</div>
          </div>
        </div>
        
        {/* Movement indicator */}
        {movement.arrow && (
          <div className="flex items-center space-x-1">
            <span 
              className="text-lg font-bold"
              style={{ color: movement.color }}
            >
              {movement.arrow}
            </span>
            <span className="text-xs text-gray-400">
              {movementMagnitude.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Main Betting Info */}
      <div className="text-center space-y-3">
        {/* Current Odds - Large and prominent */}
        <div>
          <div 
            className="text-3xl font-bold"
            style={{ color: momentum.textColor }}
          >
            {formatOdds(currentOdds)}
          </div>
          <div className="text-gray-300 text-sm">
            {Math.round(impliedProbability)}% chance
          </div>
        </div>

        {/* Momentum Bar - Simplified and more prominent */}
        <div className="relative h-3 bg-[#2A2F36] rounded-full overflow-hidden">
          <div
            className="absolute h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, impliedProbability)}%`,
              backgroundColor: momentum.bgColor,
              boxShadow: surging ? `0 0 12px ${momentum.glowColor}80` : 'none',
            }}
          />
        </div>

        {/* Status - Single line, clear message */}
        <div className="flex items-center justify-center space-x-2">
          {surging && (
            <span 
              className="text-sm font-bold flex items-center space-x-1" 
              style={{ color: momentum.textColor }}
            >
              <span>🔥</span>
              <span>SURGING</span>
            </span>
          )}
          
          {hasSignificantChange && !surging && (
            <span className="text-xs text-gray-400">
              {oddsChange > 0 ? '+' : ''}{oddsChange} from open
            </span>
          )}
          
          {marketConfidence === 'high' && !surging && (
            <span className="text-xs text-green-400 flex items-center space-x-1">
              <span>✓</span>
              <span>High Confidence</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 