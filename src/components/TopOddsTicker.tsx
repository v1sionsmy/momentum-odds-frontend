import React from "react";
import { formatSpread, formatTotal, formatAmericanOdds } from '@/lib/utils';

interface GameOdds {
  gameId: number;
  homeTeam: string;
  awayTeam: string;
  markets: {
    moneyline: {
      home: number;
      away: number;
    };
    spread: {
      points: number;
      home: number;
      away: number;
    };
    total: {
      points: number;
      over: number;
      under: number;
    };
  };
  lastUpdate: string;
}

interface TopOddsTickerProps {
  selectedGameId: number | null;
  oddsData: GameOdds | null;
}

function TopOddsTicker({ selectedGameId, oddsData }: TopOddsTickerProps) {
  if (!selectedGameId || !oddsData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <div className="text-gray-400 text-sm">Select a game to view odds</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center bg-gray-800 px-4 overflow-x-auto">
      <div className="flex items-center space-x-8 whitespace-nowrap">
        {/* Game Info */}
        <div className="text-sm font-medium text-white">
          {oddsData.homeTeam} vs {oddsData.awayTeam}
        </div>
        
        {/* Moneyline */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">ML:</span>
          <span className="text-sm text-green-400">
            {formatAmericanOdds(oddsData.markets.moneyline.home)}
          </span>
          <span className="text-sm text-red-400">
            {formatAmericanOdds(oddsData.markets.moneyline.away)}
          </span>
        </div>

        {/* Spread */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Spread:</span>
          <span className="text-sm text-green-400">
            {formatSpread(oddsData.markets.spread.points)}
          </span>
          <span className="text-sm text-gray-300">
            ({formatAmericanOdds(oddsData.markets.spread.home)})
          </span>
        </div>

        {/* Total */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Total:</span>
          <span className="text-sm text-blue-400">
            {formatTotal(oddsData.markets.total.points)}
          </span>
          <span className="text-sm text-gray-300">
            ({formatAmericanOdds(oddsData.markets.total.over)}/{formatAmericanOdds(oddsData.markets.total.under)})
          </span>
        </div>

        {/* Last Update */}
        <div className="text-xs text-gray-500">
          Updated: {oddsData.lastUpdate}
        </div>
      </div>
    </div>
  );
}

export default TopOddsTicker; 