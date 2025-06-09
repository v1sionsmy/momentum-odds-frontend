import React from 'react';
import { MiniLine } from './MiniLine';

// Enhanced pulse calculation with cubic easing
const calculateFlashDuration = (momentum_abs) => {
  const maxHz = 2.5;        // 2.5 pulses/sec when momentum is huge
  const minHz = 0.25;       // 1 pulse every 4 sec when momentum ≈0
  const clampedMomentum = Math.max(0, Math.min(100, momentum_abs));
  
  // Cubic easing for dramatic feel at high momentum
  const normalizedMomentum = clampedMomentum / 100;
  const easedMomentum = Math.sin((Math.PI / 2) * normalizedMomentum);
  const hz = minHz + (maxHz - minHz) * easedMomentum;
  const durationMs = 1000 / hz;
  
  return durationMs;
};

// Get momentum band properties
const getMomentumBand = (momentum_abs) => {
  if (momentum_abs >= 60) {
    return {
      band: 'high',
      flashMin: 0.6,
      flashMax: 1.0,
      extraEffects: ['border-glow', 'rpm-gauge'],
      bobAnimation: false
    };
  } else if (momentum_abs >= 20) {
    return {
      band: 'medium',
      flashMin: 0.5,
      flashMax: 0.9,
      extraEffects: ['drop-shadow', 'subtle-bob'],
      bobAnimation: true
    };
  } else {
    return {
      band: 'low',
      flashMin: 0.4,
      flashMax: 0.6,
      extraEffects: ['thin-border'],
      bobAnimation: false
    };
  }
};

/**
 * PlayerPulseCard - Enhanced card component with momentum bands and multi-layer effects
 * @param {Object} props
 * @param {Object} props.player - Player data object
 * @param {string} props.className - Additional CSS classes
 */
export function PlayerPulseCard({ player, className = '' }) {
  if (!player) {
    return null;
  }

  const { 
    playerId, 
    name, 
    teamId, 
    momentum_abs, 
    momentum, 
    proj, 
    headshot, 
    momentumTrend = [] 
  } = player;

  const durationMs = calculateFlashDuration(momentum_abs);
  const momentumBand = getMomentumBand(momentum_abs);
  
  // Determine background color based on momentum direction
  const getBgColor = () => {
    if (momentum > 0) return 'bg-green-600'; // Positive momentum
    if (momentum < 0) return 'bg-red-600';   // Negative momentum
    return 'bg-gray-600'; // Neutral momentum
  };

  const getTextColor = () => {
    if (momentum > 0) return 'text-green-200';
    if (momentum < 0) return 'text-red-200';
    return 'text-gray-200';
  };

  return (
    <div className="relative">
      {/* Main Card with Multi-Layer Effects */}
      <div
        className={`
          relative p-4 rounded-xl border-2 flash-card
          transform transition-all duration-200 hover:scale-105
          animate-player-flash
          ${getBgColor()}
          ${momentumBand.bobAnimation ? 'animate-subtle-bob' : ''}
          ${momentumBand.extraEffects.includes('drop-shadow') ? 'drop-shadow-lg' : ''}
          ${className}
        `}
        style={{
          '--flash-duration': `${durationMs}ms`,
          '--flash-min': momentumBand.flashMin,
          '--flash-max': momentumBand.flashMax,
          '--bob-duration': `${durationMs * 1.5}ms`,
          borderColor: momentumBand.extraEffects.includes('thin-border') 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(255, 255, 255, 0.4)'
        }}
      >
        {/* Border Glow Effect for High Momentum */}
        {momentumBand.extraEffects.includes('border-glow') && (
          <div
            className="absolute inset-0 rounded-xl border-2 animate-border-glow pointer-events-none"
            style={{
              '--glow-duration': `${durationMs}ms`
            }}
          />
        )}

        {/* Player Header */}
        <div className="flex items-start justify-between mb-3">
          {/* Player Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Player Headshot */}
            <div className="relative w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-600 overflow-hidden flex-shrink-0">
              <img
                src={headshot}
                alt={`${name} headshot`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback initials */}
              <div 
                className="absolute inset-0 bg-gray-700 flex items-center justify-center text-xs font-bold text-white"
                style={{ display: 'none' }}
              >
                {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            </div>
            
            {/* Player Name */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {name}
              </div>
              <div className="text-xs text-gray-300">
                Team {teamId}
              </div>
            </div>
          </div>
          
          {/* Momentum Value with Band Indicator */}
          <div className="text-right flex-shrink-0">
            <div className={`text-lg font-bold ${getTextColor()}`}>
              {momentum >= 0 ? '+' : ''}{momentum.toFixed(1)}
            </div>
            <div className="text-xs text-gray-300">
              {momentumBand.band}
            </div>
          </div>
        </div>

        {/* Live Prediction */}
        <div className="mb-3">
          <div className="text-xs text-gray-300 mb-1">Live Prediction:</div>
          <div className="text-sm font-medium text-white bg-black/20 rounded px-2 py-1">
            {proj}
          </div>
        </div>

        {/* Momentum Trend & Stats */}
        <div className="flex items-end justify-between">
          {/* Mini Sparkline */}
          <div className="flex-1">
            <div className="text-xs text-gray-300 mb-1">Trend:</div>
            <MiniLine 
              data={momentumTrend}
              width={50}
              height={16}
              color="rgba(255, 255, 255, 0.8)"
              strokeWidth={1.5}
            />
          </div>
          
          {/* Momentum Intensity Bars */}
          <div className="flex flex-col items-end space-y-1">
            <div className="text-xs text-gray-300">Intensity</div>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-4 rounded-sm transition-all duration-300 ${
                    i < Math.floor(momentum_abs / 33) ? 'bg-white shadow-sm' : 'bg-gray-600'
                  }`}
                  style={{
                    transform: i < Math.floor(momentum_abs / 33) ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: i < Math.floor(momentum_abs / 33) 
                      ? '0 0 2px rgba(255, 255, 255, 0.5)' 
                      : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* High Momentum Effects */}
        {momentum_abs > 70 && (
          <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
            {/* Enhanced Glow Effect */}
            <div 
              className="absolute inset-0 rounded-xl opacity-15"
              style={{
                background: `radial-gradient(circle at center, ${momentum > 0 ? '#22c55e' : '#ef4444'} 0%, transparent 70%)`
              }}
            />
          </div>
        )}
      </div>

      {/* RPM Gauge for High Momentum (60-100) */}
      {momentumBand.extraEffects.includes('rpm-gauge') && (
        <div className="mt-2">
          <div className="text-xs text-gray-400 mb-1">Momentum RPM</div>
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-white animate-rpm-fill rounded-full"
              style={{
                '--rpm-duration': `${durationMs}ms`
              }}
            />
          </div>
        </div>
      )}
      
      {/* Debug Info (removable in production) */}
      {momentum_abs > 0 && (
        <div className="mt-1 text-xs text-gray-500 font-mono text-center">
          {(1000 / durationMs).toFixed(1)} Hz
        </div>
      )}
    </div>
  );
}

/**
 * PlayerPulseGrid - Container for player pulse cards with responsive grid
 * @param {Object} props
 * @param {Array} props.players - Array of player data
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.error - Error message
 * @param {number} props.maxPlayers - Maximum number of players to display
 */
export function PlayerPulseGrid({ players = [], isLoading, error, maxPlayers = 12 }) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading player momentum...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-400 text-center">
          <div className="text-sm">Error loading player momentum</div>
          <div className="text-xs text-gray-500 mt-1">{error.message}</div>
        </div>
      </div>
    );
  }

  const displayPlayers = players.slice(0, maxPlayers);

  if (displayPlayers.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-400 text-center">
          <div className="text-sm">No player momentum data</div>
          <div className="text-xs text-gray-500 mt-1">Data will appear when available</div>
        </div>
      </div>
    );
  }

  // Group players by momentum band for better visual organization
  const groupedPlayers = {
    high: displayPlayers.filter(p => p.momentum_abs >= 60),
    medium: displayPlayers.filter(p => p.momentum_abs >= 20 && p.momentum_abs < 60),
    low: displayPlayers.filter(p => p.momentum_abs < 20)
  };

  return (
    <div className="space-y-6">
      {/* High Momentum Players */}
      {groupedPlayers.high.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h4 className="text-sm font-medium text-white">High Momentum ({groupedPlayers.high.length})</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedPlayers.high.map((player) => (
              <PlayerPulseCard
                key={player.playerId}
                player={player}
                className="min-w-[140px]"
              />
            ))}
          </div>
        </div>
      )}

      {/* Medium Momentum Players */}
      {groupedPlayers.medium.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <h4 className="text-sm font-medium text-white">Medium Momentum ({groupedPlayers.medium.length})</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedPlayers.medium.map((player) => (
              <PlayerPulseCard
                key={player.playerId}
                player={player}
                className="min-w-[140px]"
              />
            ))}
          </div>
        </div>
      )}

      {/* Low Momentum Players */}
      {groupedPlayers.low.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <h4 className="text-sm font-medium text-white">Low Momentum ({groupedPlayers.low.length})</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedPlayers.low.map((player) => (
              <PlayerPulseCard
                key={player.playerId}
                player={player}
                className="min-w-[140px]"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 