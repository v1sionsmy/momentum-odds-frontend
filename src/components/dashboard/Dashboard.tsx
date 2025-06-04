import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  User, 
  LogOut,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { OddsMiniTicker } from '../odds/OddsMiniTicker';
import { LiveOddsPanel } from '../odds/LiveOddsPanel';
import { GameSelector } from '../odds/GameSelector';
import { useOddsWebSocket } from '@/hooks/useOddsWebSocket';
import { Card } from '@/components/ui/card';
import { LoadingOverlay } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { MomentumMatchPanel } from '../odds/MomentumMatchPanel';

// Types
interface Team {
  name: string;
  score: number;
  color: string;
  logo: string;
}

interface GameLines {
  moneyline: {
    home: number;
    away: number;
  };
  spread: {
    favorite: string;
    points: number;
    home: number;
    away: number;
  };
  total: {
    over: number;
    under: number;
    overOdds: number;
    underOdds: number;
  };
}

interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  period: string;
  timeRemaining: string;
  isActive: boolean;
  momentum?: number;
  momentumNet?: string;
  lines?: GameLines;
  lineStrength?: {
    home: number;
    away: number;
  };
}

// Sample data for demonstration
const games: Game[] = [
  { 
    id: 'game1', 
    homeTeam: { name: 'BOS', score: 87, color: '#007A33', logo: '🍀' },
    awayTeam: { name: 'NYK', score: 74, color: '#006BB6', logo: '🏙️' },
    period: 'Q3', 
    timeRemaining: '04:37', 
    isActive: true,
    momentum: 0.8, // 0-1 scale
    momentumNet: '+12.7',
    lines: {
      moneyline: { home: -180, away: +165 },
      spread: { favorite: 'BOS', points: 5.5, home: -110, away: -110 },
      total: { over: 212.5, under: 212.5, overOdds: -110, underOdds: -110 }
    },
    lineStrength: { home: 68, away: 32 }
  },
  { 
    id: 'game2', 
    homeTeam: { name: 'LAL', score: 95, color: '#552583', logo: '🏆' },
    awayTeam: { name: 'GSW', score: 92, color: '#1D428A', logo: '🌉' },
    period: 'Q4', 
    timeRemaining: '08:12', 
    isActive: false,
    momentum: 0.4
  },
  { 
    id: 'game3', 
    homeTeam: { name: 'MIA', score: 0, color: '#98002E', logo: '🔥' },
    awayTeam: { name: 'PHI', score: 0, color: '#006BB6', logo: '🔔' },
    period: 'UPCOMING', 
    timeRemaining: '7:30 PM', 
    isActive: false
  }
];

const Dashboard: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const { user, logout, isAuthenticated } = useAuth();
  
  const {
    isConnected,
    tickerOdds,
    gameOdds,
    selectedGame,
    selectGame,
    reconnect,
    isLoading
  } = useOddsWebSocket({
    onError: (error) => {
      console.error('Odds WebSocket error:', error);
      setShowError(error.message);
      // Auto-hide error after 5 seconds
      setTimeout(() => setShowError(null), 5000);
    },
    onConnectionChange: (connected) => {
      console.log('Odds WebSocket connection:', connected ? 'connected' : 'disconnected');
    }
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await reconnect();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh connection every 5 minutes if disconnected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        reconnect();
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isConnected, reconnect]);

  // Show auth container if not authenticated - REMOVED to allow guest access
  
  return (
    <div className="flex h-screen w-full bg-[#0B0E11] text-white font-sans">
      {/* Top Bar with Mini Ticker */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#0B0E11]/95 backdrop-blur-sm border-b border-[#1A1F26] shadow-lg">
          <div className="px-4 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-xl font-bold">Momentum Odds</div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00FF8B]' : 'bg-[#FF3355]'}`} />
                <span className="text-sm text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {!isConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-gray-400 hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Reconnect
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              
              {/* Only show user menu if authenticated */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
                    <User className="w-5 h-5" />
                    <span className="text-sm">{user?.username}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-[#0F1318] rounded-lg shadow-lg py-2 hidden group-hover:block border border-[#1A1F26]">
                    <div className="px-4 py-2 text-sm text-gray-400 border-b border-[#1A1F26]">
                      {user?.email}
                    </div>
                    <button
                      onClick={() => logout()}
                      className="w-full px-4 py-2 text-sm text-gray-400 hover:bg-[#1A1F26] flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="text-sm text-gray-400 hover:text-white px-3 py-1 border border-gray-700 rounded"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          
          {/* Error Toast */}
          {showError && (
            <div className="px-4 py-2 bg-[#FF3355]/10 border-t border-[#FF3355]/20">
              <div className="flex items-center text-[#FF3355]">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">{showError}</span>
              </div>
            </div>
          )}
          
          {/* Odds Mini Ticker */}
          <LoadingOverlay isLoading={isLoading} text="Loading odds...">
            <OddsMiniTicker
              odds={tickerOdds}
              onOddsClick={(oddsId) => {
                const gameId = Object.keys(gameOdds).find(id => 
                  gameOdds[id].markets.moneyline.home.odds === tickerOdds.find(o => o.id === oddsId)?.odds.home
                );
                if (gameId) {
                  selectGame(gameId);
                }
              }}
            />
          </LoadingOverlay>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-24">
        <div className="grid grid-cols-12 gap-4 p-6">
          {/* Game Selector */}
          <div className="col-span-12 lg:col-span-8">
            <GameSelector
              games={games}
              selectedGameId={selectedGame?.id}
              onGameSelect={selectGame}
              className="mb-4"
            />
          </div>

          {/* Live Odds Panel */}
          <div className="col-span-12 lg:col-span-8">
            <LoadingOverlay isLoading={isLoading} text="Loading game data...">
              {selectedGame ? (
                <LiveOddsPanel
                  game={selectedGame}
                />
              ) : (
                <Card className="bg-[#0F1318] border-[#1A1F26] shadow-lg p-8">
                  <div className="text-center text-gray-400">
                    Select a game to view odds
                  </div>
                </Card>
              )}
            </LoadingOverlay>
          </div>

          {/* Momentum Match Panel */}
          <div className="col-span-12 lg:col-span-4">
            {selectedGame ? (
              <MomentumMatchPanel gameId={parseInt(selectedGame.id)} />
            ) : (
              <Card className="bg-[#0F1318] border-[#1A1F26] shadow-lg h-full">
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-400 mb-4">MOMENTUM MATCH</div>
                  <div className="text-center text-gray-400">
                    Select a game to view momentum analysis
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 