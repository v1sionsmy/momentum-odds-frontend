import React from 'react';
import Image from 'next/image';

interface Team {
  name: string;
  score: number;
  logo?: string;
  color: string;
  momentum?: number;
}

interface OddsData {
  spread?: number;
  total?: number;
  moneyline?: { home: number; away: number };
}

interface InfoRailProps {
  homeTeam: Team;
  awayTeam: Team;
  odds?: OddsData;
  gameTime?: string;
  quarter?: string;
  className?: string;
}

export default function InfoRail({ 
  homeTeam, 
  awayTeam, 
  odds,
  gameTime = "12:00",
  quarter = "Q1",
  className = ""
}: InfoRailProps) {
  return (
    <div className={`w-40 shrink-0 grid gap-2 p-2 ${className}`}>
      {/* Mini Scoreboard */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="text-xs text-gray-400 text-center mb-2">{quarter} • {gameTime}</div>
        
        {/* Away Team */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {awayTeam.logo && (
              <Image
                src={awayTeam.logo}
                alt={awayTeam.name}
                width={20}
                height={20}
                className="rounded"
              />
            )}
            <span className="text-white text-xs font-medium">{awayTeam.name}</span>
          </div>
          <span className="text-white font-bold">{awayTeam.score}</span>
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {homeTeam.logo && (
              <Image
                src={homeTeam.logo}
                alt={homeTeam.name}
                width={20}
                height={20}
                className="rounded"
              />
            )}
            <span className="text-white text-xs font-medium">{homeTeam.name}</span>
          </div>
          <span className="text-white font-bold">{homeTeam.score}</span>
        </div>
      </div>

      {/* Momentum Indicators */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Momentum</div>
        
        {/* Away Momentum */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-300">{awayTeam.name}</span>
          <div className="flex items-center space-x-1">
            <div className="w-8 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${Math.abs((awayTeam.momentum || 0) * 100)}%`,
                  backgroundColor: awayTeam.color
                }}
              />
            </div>
            <span className="text-xs w-6 text-right">
              {awayTeam.momentum ? (awayTeam.momentum * 100).toFixed(0) : '0'}
            </span>
          </div>
        </div>

        {/* Home Momentum */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">{homeTeam.name}</span>
          <div className="flex items-center space-x-1">
            <div className="w-8 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${Math.abs((homeTeam.momentum || 0) * 100)}%`,
                  backgroundColor: homeTeam.color
                }}
              />
            </div>
            <span className="text-xs w-6 text-right">
              {homeTeam.momentum ? (homeTeam.momentum * 100).toFixed(0) : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Odds */}
      {odds && (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Live Odds</div>
          
          {odds.spread && (
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">Spread</span>
              <span className="text-white">{odds.spread > 0 ? '+' : ''}{odds.spread}</span>
            </div>
          )}
          
          {odds.total && (
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">Total</span>
              <span className="text-white">{odds.total}</span>
            </div>
          )}
          
          {odds.moneyline && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">ML</span>
              <div className="text-white">
                <span className="text-xs">{odds.moneyline.away > 0 ? '+' : ''}{odds.moneyline.away}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-xs">{odds.moneyline.home > 0 ? '+' : ''}{odds.moneyline.home}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Quick Stats</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-300">Lead Changes</span>
            <span className="text-white">7</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Largest Lead</span>
            <span className="text-white">12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Pace</span>
            <span className="text-white">Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
} 