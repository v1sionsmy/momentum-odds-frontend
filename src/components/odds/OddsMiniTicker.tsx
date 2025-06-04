import React, { useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface OddsMovement {
  direction: 'up' | 'down' | 'neutral';
  value: number;
}

interface OddsItem {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  market: 'moneyline' | 'spread' | 'total';
  odds: {
    home: number;
    away: number;
  };
  movement: {
    home: OddsMovement;
    away: OddsMovement;
  };
  timestamp: string;
}

interface OddsMiniTickerProps {
  odds: OddsItem[];
  onOddsClick?: (oddsId: string) => void;
}

export function OddsMiniTicker({ odds, onOddsClick }: OddsMiniTickerProps) {
  const tickerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    let scrollAmount = 0;
    const scrollSpeed = 1; // pixels per frame
    const scrollInterval = 30; // ms

    const scroll = () => {
      if (!ticker) return;
      
      scrollAmount += scrollSpeed;
      if (scrollAmount >= ticker.scrollWidth / 2) {
        scrollAmount = 0;
      }
      ticker.scrollLeft = scrollAmount;
    };

    const intervalId = setInterval(scroll, scrollInterval);

    return () => clearInterval(intervalId);
  }, []);

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

  return (
    <div className="relative w-full overflow-hidden bg-[#0F1318]">
      <div 
        ref={tickerRef}
        className="flex whitespace-nowrap overflow-x-hidden"
        style={{ scrollBehavior: 'smooth' }}
      >
        {odds.map((item) => (
          <div
            key={item.id}
            onClick={() => onOddsClick?.(item.id)}
            className="inline-flex items-center px-4 py-2 border-r border-[#1A1F26] cursor-pointer hover:bg-[#1A1F26]/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-400">{item.sport}</span>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">{item.homeTeam}</span>
                <div className={`flex items-center ${getMovementColor(item.movement.home)}`}>
                  {getMovementIcon(item.movement.home)}
                  <span className="ml-1">{item.odds.home}</span>
                </div>
              </div>

              <span className="text-gray-400">vs</span>

              <div className="flex items-center space-x-2">
                <span className="font-medium">{item.awayTeam}</span>
                <div className={`flex items-center ${getMovementColor(item.movement.away)}`}>
                  {getMovementIcon(item.movement.away)}
                  <span className="ml-1">{item.odds.away}</span>
                </div>
              </div>

              <span className="text-xs text-gray-500">{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 