import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Card } from '../ui/card';
import { useGameMomentum } from '@/hooks/useGameMomentum';

interface Game {
  id: string;
  homeTeam: {
    name: string;
    score: number;
    color: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    score: number;
    color: string;
    logo: string;
  };
  period: string;
  timeRemaining: string;
  isActive: boolean;
  momentum?: number;
}

interface GameSelectorProps {
  games: Game[];
  selectedGameId?: string;
  onGameSelect: (gameId: string) => void;
  className?: string;
}

export function GameSelector({ games, selectedGameId, onGameSelect, className }: GameSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { momentumData } = useGameMomentum(selectedGameId ? Number(selectedGameId) : null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = games.filter(game => {
    const searchLower = searchQuery.toLowerCase();
    return (
      game.homeTeam.name.toLowerCase().includes(searchLower) ||
      game.awayTeam.name.toLowerCase().includes(searchLower)
    );
  });

  const selectedGame = games.find(game => game.id === selectedGameId);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-[#0F1318] border border-[#1A1F26] rounded-lg flex items-center justify-between hover:bg-[#1A1F26] transition-colors"
      >
        {selectedGame ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{selectedGame.homeTeam.name} vs {selectedGame.awayTeam.name}</span>
            {selectedGame.isActive && (
              <span className="px-2 py-0.5 text-xs bg-[#00FF8B]/10 text-[#00FF8B] rounded-full">
                LIVE
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Select a game</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 bg-[#0F1318] border-[#1A1F26] shadow-lg z-50">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#1A1F26] border border-[#2A2F36] rounded-lg text-sm focus:outline-none focus:border-[#00FF8B]"
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredGames.map((game) => (
              <button
                key={game.id}
                onClick={() => {
                  onGameSelect(game.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-[#1A1F26] transition-colors ${
                  game.id === selectedGameId ? 'bg-[#1A1F26]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {game.homeTeam.name} vs {game.awayTeam.name}
                    </span>
                    {game.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-[#00FF8B]/10 text-[#00FF8B] rounded-full">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {game.period === 'UPCOMING' ? game.timeRemaining : `${game.period} ${game.timeRemaining}`}
                  </div>
                </div>
                {game.id === selectedGameId && momentumData && (
                  <div className="mt-1 text-xs text-gray-400">
                    Momentum: {Math.round(Object.values(momentumData.teamMomentum)[0] * 100)}%
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 