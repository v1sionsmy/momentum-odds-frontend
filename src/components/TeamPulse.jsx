import React from 'react';

// Enhanced pulse calculation with cubic easing (ease-in-sine)
const calculatePulseDuration = (momentum_abs) => {
  const maxHz = 3;          // 3 pulses/sec when momentum is huge
  const minHz = 0.25;       // 1 pulse every 4 sec when momentum ≈0
  const clampedMomentum = Math.max(0, Math.min(100, momentum_abs));
  
  // Cubic easing: tempo = minHz + (maxHz - minHz) * sin((π/2) * momentumAbs/100)
  const normalizedMomentum = clampedMomentum / 100;
  const easedMomentum = Math.sin((Math.PI / 2) * normalizedMomentum);
  const hz = minHz + (maxHz - minHz) * easedMomentum;
  const durationMs = 1000 / hz;
  
  return durationMs;
};

// Calculate ring properties based on momentum
const getRingProperties = (momentum_abs) => {
  const thickness = Math.max(1, Math.min(5, 1 + (momentum_abs / 100) * 4)); // 1px → 5px
  const glowOpacity = Math.max(0.3, Math.min(0.9, 0.3 + (momentum_abs / 100) * 0.6)); // 30% → 90%
  return { thickness, glowOpacity };
};

/**
 * TeamPulse - Enhanced circular pulsing component with multi-layer animations
 * @param {Object} props
 * @param {Object} props.team - Team data with momentum, name, and color
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
export function TeamPulse({ team, className = '', style = {}, ...props }) {
  if (!team) {
    return null;
  }

  const { momentum, momentum_abs, team_name, team_color } = team;
  const durationMs = calculatePulseDuration(momentum_abs);
  const { thickness, glowOpacity } = getRingProperties(momentum_abs);
  
  // Format momentum display
  const momentumDisplay = momentum >= 0 ? `+${momentum.toFixed(1)}` : momentum.toFixed(1);
  
  // Determine number of rings based on momentum intensity
  const numRings = momentum_abs > 70 ? 3 : momentum_abs > 40 ? 2 : 1;
  
  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Team Name */}
      <div className="text-sm font-medium text-gray-300 text-center">
        {team_name}
      </div>
      
      {/* Multi-Layer Pulse System */}
      <div className="relative">
        {/* Layer 1: Core Breathing Circle */}
        <div
          className={`
            relative w-24 h-24 rounded-full flex items-center justify-center
            pulse-core animate-breathe transform transition-all duration-200
            ${className}
          `}
          style={{
            backgroundColor: team_color,
            '--breathe-duration': `${durationMs * 2}ms`, // Breathing is slower than pulse
            boxShadow: `0 0 15px rgba(${hexToRgb(team_color)}, ${glowOpacity})`,
            ...style
          }}
          {...props}
        >
          {/* Momentum Value Overlay */}
          <div className="relative z-20 text-white text-sm font-bold text-center">
            {momentumDisplay}
          </div>
        </div>
        
        {/* Layer 2: Pulse Rings */}
        {Array.from({ length: numRings }).map((_, index) => (
          <div
            key={index}
            className={`
              absolute inset-0 w-24 h-24 rounded-full border
              pulse-ring animate-team-ring-${index + 1}
              pointer-events-none
            `}
            style={{
              borderWidth: `${thickness}px`,
              borderColor: `rgba(${hexToRgb(team_color)}, 0.6)`,
              '--ring-duration': `${durationMs}ms`,
              mixBlendMode: 'screen', // Lighter blend for overlapping rings
              left: '0',
              top: '0'
            }}
          />
        ))}
        
        {/* Layer 3: High Momentum Glow Effect */}
        {momentum_abs > 50 && (
          <div
            className="absolute inset-0 w-24 h-24 rounded-full opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${team_color}40 0%, transparent 70%)`,
              transform: 'scale(1.2)',
              animation: `breathe ${durationMs * 1.5}ms ease-in-out infinite`
            }}
          />
        )}
      </div>
      
      {/* Enhanced Momentum Intensity Indicator */}
      <div className="flex flex-col items-center space-y-1">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                i < Math.floor(momentum_abs / 20) 
                  ? 'bg-white shadow-sm' 
                  : 'bg-gray-600'
              }`}
              style={{
                transform: i < Math.floor(momentum_abs / 20) ? 'scale(1.2)' : 'scale(1)',
                boxShadow: i < Math.floor(momentum_abs / 20) 
                  ? `0 0 3px ${team_color}` 
                  : 'none'
              }}
            />
          ))}
        </div>
        {/* Momentum Hz Display for Debug/Info */}
        {momentum_abs > 0 && (
          <div className="text-xs text-gray-500 font-mono">
            {(1000 / durationMs).toFixed(1)} Hz
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Helper function to convert hex color to RGB values
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  // Fallback to a default color if hex parsing fails
  return '0, 122, 51'; // Default green
}

/**
 * TeamPulseRow - Container for two team pulses side by side
 * @param {Object} props
 * @param {Object} props.homeTeam - Home team data
 * @param {Object} props.awayTeam - Away team data
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.error - Error message
 */
export function TeamPulseRow({ homeTeam, awayTeam, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading team momentum...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-400 text-center">
          <div className="text-sm">Error loading team momentum</div>
          <div className="text-xs text-gray-500 mt-1">{error.message}</div>
        </div>
      </div>
    );
  }

  if (!homeTeam && !awayTeam) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-400 text-center">
          <div className="text-sm">No team momentum data</div>
          <div className="text-xs text-gray-500 mt-1">Select a game to view momentum</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center space-x-16 py-8">
      {/* Home Team */}
      {homeTeam && (
        <div className="transform transition-transform duration-200 hover:scale-110">
          <TeamPulse 
            team={homeTeam}
            className="cursor-pointer"
          />
        </div>
      )}
      
      {/* Enhanced VS Divider */}
      <div className="flex flex-col items-center space-y-2">
        <div className="text-gray-400 font-bold text-lg tracking-wider">VS</div>
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
      </div>
      
      {/* Away Team */}
      {awayTeam && (
        <div className="transform transition-transform duration-200 hover:scale-110">
          <TeamPulse 
            team={awayTeam}
            className="cursor-pointer"
          />
        </div>
      )}
    </div>
  );
} 