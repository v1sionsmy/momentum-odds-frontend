import React from 'react';

interface Player {
  playerId: number;
  name: string;
  color: string;
  momentum: number;
}

interface ViewModeSelectorProps {
  view: 'team' | 'player';
  onViewChange: (view: 'team' | 'player') => void;
  selectedPlayer: Player | null;
  onPlayerSelect: (player: Player | null) => void;
  players: Player[];
  className?: string;
}

export default function ViewModeSelector({ 
  view, 
  onViewChange, 
  selectedPlayer, 
  onPlayerSelect, 
  players,
  className = ""
}: ViewModeSelectorProps) {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Analysis Mode</h3>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => {
              onViewChange('team');
              onPlayerSelect(null);
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === 'team' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            Team View
          </button>
          <button
            onClick={() => onViewChange('player')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === 'player' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            Player View
          </button>
        </div>
      </div>

      {/* Player Selection for Player View */}
      {view === 'player' && players.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-400">Select Player:</div>
          <div className="grid grid-cols-2 gap-2">
            {players.map((player) => (
              <button
                key={player.playerId}
                onClick={() => onPlayerSelect(player)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  selectedPlayer?.playerId === player.playerId
                    ? 'text-white shadow-lg border-2'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
                style={{
                  backgroundColor: selectedPlayer?.playerId === player.playerId 
                    ? player.color 
                    : undefined,
                  borderColor: selectedPlayer?.playerId === player.playerId 
                    ? player.color 
                    : undefined
                }}
              >
                <div className="font-medium">{player.name}</div>
                <div className="text-xs opacity-75">
                  {(player.momentum * 100).toFixed(0)}% momentum
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Mode Description */}
      <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Current Mode:</div>
        <div className="text-sm text-white">
          {view === 'team' ? (
            <span>Analyzing team-level momentum and game flow patterns</span>
          ) : selectedPlayer ? (
            <span>Deep dive into {selectedPlayer.name}&apos;s performance metrics</span>
          ) : (
            <span>Select a player above to begin individual analysis</span>
          )}
        </div>
      </div>
    </div>
  );
} 