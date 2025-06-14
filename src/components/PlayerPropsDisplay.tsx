import React from 'react';
import { usePlayerProps } from '@/hooks/usePlayerProps';

interface PlayerPropsDisplayProps {
  gameId: number;
  playerId: string;
  playerName: string;
  currentStats?: {
    points: number;
    rebounds: number;
    assists: number;
  };
  className?: string;
}

export default function PlayerPropsDisplay({ 
  gameId, 
  playerId, 
  playerName, 
  currentStats,
  className = "" 
}: PlayerPropsDisplayProps) {
  const { playerPropsData, isLoadingPlayerProps, playerPropsError } = usePlayerProps(gameId);

  // Find props for this specific player
  const playerProps = playerPropsData.find(
    p => p.playerName.toLowerCase() === playerName.toLowerCase() ||
         p.playerId === playerId
  );

  if (isLoadingPlayerProps) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-sm text-gray-400">Loading player props...</div>
        </div>
      </div>
    );
  }

  if (playerPropsError) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}>
        <div className="text-center text-sm text-gray-400">
          Player props unavailable
        </div>
      </div>
    );
  }

  if (!playerProps) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}>
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">No props available for</div>
          <div className="text-white font-medium">{playerName}</div>
        </div>
      </div>
    );
  }

  const formatOdds = (odds: number) => {
    if (odds === 0) return 'N/A';
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getProgressColor = (current: number, line: number) => {
    if (current === 0) return '#6B7280'; // gray
    const percentage = (current / line) * 100;
    if (percentage >= 100) return '#10B981'; // green
    if (percentage >= 80) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const PropsStat = ({ 
    label, 
    line, 
    over, 
    under, 
    current 
  }: { 
    label: string; 
    line: number; 
    over: number; 
    under: number; 
    current?: number;
  }) => (
    <div className="bg-gray-700/50 rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-white">{line}</span>
        {current !== undefined && (
          <span 
            className="text-sm font-medium"
            style={{ color: getProgressColor(current, line) }}
          >
            {current}/{line}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-green-900/30 rounded px-2 py-1 text-center">
          <div className="text-green-400">Over</div>
          <div className="text-white font-medium">{formatOdds(over)}</div>
        </div>
        <div className="bg-red-900/30 rounded px-2 py-1 text-center">
          <div className="text-red-400">Under</div>
          <div className="text-white font-medium">{formatOdds(under)}</div>
        </div>
      </div>
      {current !== undefined && line > 0 && (
        <div className="mt-2">
          <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${Math.min((current / line) * 100, 100)}%`,
                backgroundColor: getProgressColor(current, line)
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Player Props</h3>
        <div className="text-xs text-gray-400">
          Updated: {new Date(playerProps.lastUpdate).toLocaleTimeString()}
        </div>
      </div>
      
      <div className="space-y-3">
        <PropsStat
          label="Points"
          line={playerProps.markets.points.line}
          over={playerProps.markets.points.over}
          under={playerProps.markets.points.under}
          current={currentStats?.points}
        />
        
        <PropsStat
          label="Rebounds"
          line={playerProps.markets.rebounds.line}
          over={playerProps.markets.rebounds.over}
          under={playerProps.markets.rebounds.under}
          current={currentStats?.rebounds}
        />
        
        <PropsStat
          label="Assists"
          line={playerProps.markets.assists.line}
          over={playerProps.markets.assists.over}
          under={playerProps.markets.assists.under}
          current={currentStats?.assists}
        />
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-600">
        <div className="text-xs text-gray-400 text-center">
          Live odds from sportsbooks • For entertainment only
        </div>
      </div>
    </div>
  );
} 