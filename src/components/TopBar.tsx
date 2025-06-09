import React from 'react';

interface TopBarProps {
  isLive?: boolean;
  gameTime?: string;
  quarter?: string | number;
  onSettingsToggle?: () => void;
  reduceFlashing?: boolean;
  onFlashingToggle?: () => void;
}

export default function TopBar({ 
  isLive = true, 
  gameTime = "12:00", 
  quarter = "Q1",
  onSettingsToggle,
  reduceFlashing = false,
  onFlashingToggle
}: TopBarProps) {
  return (
    <div className="flex justify-between items-center h-12 bg-gray-900/80 backdrop-blur px-4">
      {/* Left: LIVE badge and game info */}
      <div className="flex items-center space-x-3">
        {isLive && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-500 font-semibold text-sm">LIVE</span>
          </div>
        )}
        <div className="text-white text-sm">
          <span className="font-mono">{gameTime}</span>
          <span className="ml-2 text-gray-300">{quarter}</span>
        </div>
      </div>

      {/* Center: Logo or Title */}
      <div className="text-white font-semibold text-lg">
        Momentum Pulse
      </div>

      {/* Right: Quick toggles */}
      <div className="flex items-center space-x-3">
        {/* Reduce Flashing Toggle */}
        <button
          onClick={onFlashingToggle}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            reduceFlashing 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title="Reduce flashing for photosensitive users"
        >
          {reduceFlashing ? '✓ Reduced' : 'Reduce Flash'}
        </button>

        {/* Settings */}
        <button
          onClick={onSettingsToggle}
          className="text-gray-300 hover:text-white transition-colors"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
} 