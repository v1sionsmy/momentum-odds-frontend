import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../ui/card';

interface OddsMovement {
  direction: 'up' | 'down' | 'neutral';
  value: number;
  timestamp: string;
}

interface GameOdds {
  id: string;
  homeTeam: {
    name: string;
    logo: string;
    color: string;
  };
  awayTeam: {
    name: string;
    logo: string;
    color: string;
  };
  sport: string;
  period: string;
  timeRemaining: string;
  markets: {
    moneyline: {
      home: { odds: number; movement: OddsMovement };
      away: { odds: number; movement: OddsMovement };
    };
    spread: {
      points: number;
      home: { odds: number; movement: OddsMovement };
      away: { odds: number; movement: OddsMovement };
    };
    total: {
      points: number;
      over: { odds: number; movement: OddsMovement };
      under: { odds: number; movement: OddsMovement };
    };
  };
  lastUpdate: string;
}

interface LiveOddsPanelProps {
  game: GameOdds;
  onMarketSelect?: (market: 'moneyline' | 'spread' | 'total') => void;
}

type MarketType = 'moneyline' | 'spread' | 'total';

export function LiveOddsPanel({ game, onMarketSelect }: LiveOddsPanelProps) {
  const [activeMarket, setActiveMarket] = useState<MarketType>('moneyline');

  const handleMarketChange = (market: MarketType) => {
    setActiveMarket(market);
    onMarketSelect?.(market);
  };

  const getMovementColor = (movement: OddsMovement) => {
    switch (movement.direction) {
      case 'up':
        return 'text-[#00FF8B]';
      case 'down':
        return 'text-[#FF3355]';
      default:
        return 'text-gray-400';
    }
  };

  const getMovementIcon = (movement: OddsMovement) => {
    switch (movement.direction) {
      case 'up':
        return <ArrowUp className="w-3 h-3" />;
      case 'down':
        return <ArrowDown className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const renderMarketContent = () => {
    switch (activeMarket) {
      case 'moneyline':
        return (
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#1A1F26] p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: game.homeTeam.color }}
                  >
                    {game.homeTeam.logo}
                  </div>
                  <span className="font-medium">{game.homeTeam.name}</span>
                </div>
                <div className={`flex items-center ${getMovementColor(game.markets.moneyline.home.movement)}`}>
                  {getMovementIcon(game.markets.moneyline.home.movement)}
                  <span className="ml-1">{game.markets.moneyline.home.odds}</span>
                </div>
              </div>
            </Card>
            <Card className="bg-[#1A1F26] p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: game.awayTeam.color }}
                  >
                    {game.awayTeam.logo}
                  </div>
                  <span className="font-medium">{game.awayTeam.name}</span>
                </div>
                <div className={`flex items-center ${getMovementColor(game.markets.moneyline.away.movement)}`}>
                  {getMovementIcon(game.markets.moneyline.away.movement)}
                  <span className="ml-1">{game.markets.moneyline.away.odds}</span>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'spread':
        return (
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#1A1F26] p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: game.homeTeam.color }}
                  >
                    {game.homeTeam.logo}
                  </div>
                  <span className="font-medium">{game.homeTeam.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">-{game.markets.spread.points}</span>
                  <div className={`flex items-center ${getMovementColor(game.markets.spread.home.movement)}`}>
                    {getMovementIcon(game.markets.spread.home.movement)}
                    <span className="ml-1">{game.markets.spread.home.odds}</span>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="bg-[#1A1F26] p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: game.awayTeam.color }}
                  >
                    {game.awayTeam.logo}
                  </div>
                  <span className="font-medium">{game.awayTeam.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">+{game.markets.spread.points}</span>
                  <div className={`flex items-center ${getMovementColor(game.markets.spread.away.movement)}`}>
                    {getMovementIcon(game.markets.spread.away.movement)}
                    <span className="ml-1">{game.markets.spread.away.odds}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'total':
        return (
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#1A1F26] p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Over</span>
                  <span className="text-gray-400">{game.markets.total.points}</span>
                </div>
                <div className={`flex items-center ${getMovementColor(game.markets.total.over.movement)}`}>
                  {getMovementIcon(game.markets.total.over.movement)}
                  <span className="ml-1">{game.markets.total.over.odds}</span>
                </div>
              </div>
            </Card>
            <Card className="bg-[#1A1F26] p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Under</span>
                  <span className="text-gray-400">{game.markets.total.points}</span>
                </div>
                <div className={`flex items-center ${getMovementColor(game.markets.total.under.movement)}`}>
                  {getMovementIcon(game.markets.total.under.movement)}
                  <span className="ml-1">{game.markets.total.under.odds}</span>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-400">LIVE ODDS</span>
          <span className="text-xs px-2 py-1 bg-[#1A1F26] rounded-full">
            {game.period} - {game.timeRemaining}
          </span>
        </div>
        <span className="text-xs text-gray-500">Updated {game.lastUpdate}</span>
      </div>

      <div className="flex border-b border-[#1A1F26] mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeMarket === 'moneyline'
              ? 'text-white border-b-2 border-[#00FF8B]'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => handleMarketChange('moneyline')}
        >
          Moneyline
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeMarket === 'spread'
              ? 'text-white border-b-2 border-[#00FF8B]'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => handleMarketChange('spread')}
        >
          Spread
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeMarket === 'total'
              ? 'text-white border-b-2 border-[#00FF8B]'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => handleMarketChange('total')}
        >
          Total
        </button>
      </div>

      {renderMarketContent()}
    </div>
  );
} 