"use client";
import React, { useState, useEffect } from 'react';
import { ChevronRight, Bell, User, Home, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveTeams, useUpcomingTeams } from '@/hooks/useLiveGames';
import { useTeamPlayers } from '@/hooks/useGamePlayers';
import { usePlayerMomentum } from '@/hooks/usePlayerMomentum';
import { useTeamMomentum } from '@/hooks/useTeamMomentum';
import GamesSidebar from '@/components/GamesSidebar';
import GameView from '@/components/GameView';
import TeamView from '@/components/TeamView';
import PlayerView from '@/components/PlayerView';
import Image from 'next/image';

type ViewLevel = 'game' | 'team' | 'player';

// Team color mappings for momentum effects
const teamColors: Record<string, { primary: string; secondary: string; glow: string }> = {
  "Oklahoma City Thunder": { primary: "#007AC1", secondary: "#EF3B24", glow: "rgba(0, 122, 193, 0.6)" },
  "Indiana Pacers": { primary: "#002D62", secondary: "#FDBB30", glow: "rgba(0, 45, 98, 0.6)" },
  "Los Angeles Lakers": { primary: "#552583", secondary: "#FDB927", glow: "rgba(85, 37, 131, 0.6)" },
  "Boston Celtics": { primary: "#007A33", secondary: "#BA9653", glow: "rgba(0, 122, 51, 0.6)" },
  "Golden State Warriors": { primary: "#006BB6", secondary: "#FFC72C", glow: "rgba(0, 107, 182, 0.6)" },
  "Miami Heat": { primary: "#98002E", secondary: "#F9A01B", glow: "rgba(152, 0, 46, 0.6)" },
  "Default": { primary: "#3B82F6", secondary: "#F59E0B", glow: "rgba(59, 130, 246, 0.6)" }
};

export default function LiveGamesPage() {
  // Navigation state
  const [viewLevel, setViewLevel] = useState<ViewLevel>('game');
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);
  const [showQuarterlyPrediction, setShowQuarterlyPrediction] = useState(false);

  // Momentum pulse state
  const [momentumPulse, setMomentumPulse] = useState<Record<string, boolean>>({});
  const [mlPulse, setMlPulse] = useState<Record<string, { speed: number; active: boolean }>>({});

  const { data: liveTeams, isLoading: isLoadingLiveTeams } = useLiveTeams();
  const { data: upcomingTeams, isLoading: isLoadingUpcomingTeams } = useUpcomingTeams();
  
  // Check if selected team is upcoming
  const selectedTeam = [...(liveTeams || []), ...(upcomingTeams || [])].find(team => team.id === selectedTeamId);
  const isSelectedTeamUpcoming = selectedTeam?.status === 'Scheduled';
  
  // Only fetch live data if the selected game is not upcoming
  const shouldFetchLiveData = selectedGameId && !isSelectedTeamUpcoming;
  
  const { teamMomentum, isLoadingTeamMom, errorTeamMom } = useTeamMomentum(shouldFetchLiveData ? selectedGameId : null);
  const { teamPlayers } = useTeamPlayers(shouldFetchLiveData ? selectedGameId : null, shouldFetchLiveData ? selectedTeamName : null);
  const { playerMomentum, correlations, currentStats, propLines, isLoadingPM, errorPM } = usePlayerMomentum(shouldFetchLiveData ? selectedGameId : null, shouldFetchLiveData ? selectedPlayerId : null);

  // Momentum pulse effects
  useEffect(() => {
    const interval = setInterval(() => {
      setMomentumPulse(prev => {
        const newPulse: Record<string, boolean> = {};
        
        // Team momentum pulses - use real data when available
        if (teamMomentum && selectedGameId) {
          const allTeams = [...(liveTeams || []), ...(upcomingTeams || [])];
          const gameTeams = allTeams.filter(team => team.gameId === selectedGameId);
          
          gameTeams.forEach(team => {
            let momentum = 0.5; // Default neutral momentum
            
            // Try to get real momentum data
            if (teamMomentum.teamMomentum) {
              // Look for momentum by team name, team ID, or any available key
              const teamMomentumValue = teamMomentum.teamMomentum[team.name] || 
                                      teamMomentum.teamMomentum[team.id] ||
                                      Object.values(teamMomentum.teamMomentum)[0]; // Use first available
              
              if (typeof teamMomentumValue === 'number') {
                momentum = Math.abs(teamMomentumValue); // Use absolute value for pulse determination
              }
            }
            
            // Fall back to mock data for demonstration if no real data
            if (momentum === 0.5) {
              momentum = Math.random() * 0.8 + 0.2; // Mock momentum for demo
            }
            
            const shouldPulse = momentum > 0.6; // Pulse when momentum is high
            newPulse[`team-${team.id}`] = shouldPulse ? !prev[`team-${team.id}`] : false;
          });
        }

        // Player momentum pulses - use real data when available
        if (teamPlayers) {
          teamPlayers.forEach(player => {
            let momentum = 0.5; // Default neutral momentum
            
            // Try to get real momentum data
            if (teamMomentum?.playerMomentum) {
              const playerMomentumValue = teamMomentum.playerMomentum[player.player_id] ||
                                         teamMomentum.playerMomentum[player.player_id.toString()];
              
              if (typeof playerMomentumValue === 'number') {
                momentum = Math.abs(playerMomentumValue); // Use absolute value for pulse determination
              }
            }
            
            // Fall back to mock data for demonstration if no real data
            if (momentum === 0.5) {
              momentum = Math.random() * 0.9 + 0.1; // Mock momentum
            }
            
            const shouldPulse = momentum > 0.5;
            newPulse[`player-${player.player_id}`] = shouldPulse ? !prev[`player-${player.player_id}`] : false;
          });
        }

        return { ...prev, ...newPulse };
      });
    }, 800); // Base pulse rate

    return () => clearInterval(interval);
  }, [teamMomentum, selectedGameId, liveTeams, upcomingTeams, teamPlayers]);

  // ML prediction pulse effects
  useEffect(() => {
    const interval = setInterval(() => {
      setMlPulse(prev => {
        const newPulse: Record<string, { speed: number; active: boolean }> = {};
        
        if (teamPlayers) {
          teamPlayers.forEach(player => {
            // Mock ML prediction improvement for demonstration (0-1, higher = better prediction)
            // In real implementation, this would come from ML prediction confidence scores
            const mlImprovement = Math.random();
            const speed = mlImprovement > 0.8 ? 300 : mlImprovement > 0.6 ? 600 : 1000;
            const shouldPulse = mlImprovement > 0.4;
            
            ['pts', 'reb', 'ast'].forEach(stat => {
              const key = `${player.player_id}-${stat}`;
              newPulse[key] = {
                speed,
                active: shouldPulse ? !prev[key]?.active : false
              };
            });
          });
        }

        return { ...prev, ...newPulse };
      });
    }, 200); // Fast update for ML effects

    return () => clearInterval(interval);
  }, [teamPlayers]);

  // Navigation handlers
  const handleGameSelect = (gameId: number) => {
    setSelectedGameId(gameId);
    setViewLevel('game');
    // Reset lower levels
    setSelectedTeamId(null);
    setSelectedTeamName(null);
    setSelectedPlayerId(null);
    setSelectedPlayerName(null);
    setShowQuarterlyPrediction(false);
  };

  const handleTeamSelect = (teamId: string, teamName: string) => {
    console.log('🏀 Team selected:', { teamId, teamName, gameId: selectedGameId });
    
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName);
    setViewLevel('team');
    // Reset player level
    setSelectedPlayerId(null);
    setSelectedPlayerName(null);
    setShowQuarterlyPrediction(false);
  };

  const handlePlayerSelect = (playerId: string, playerName?: string) => {
    setSelectedPlayerId(playerId);
    setSelectedPlayerName(playerName || null);
    setViewLevel('player');
    setShowQuarterlyPrediction(false);
  };

  const handleBackNavigation = () => {
    if (viewLevel === 'player') {
      setViewLevel('team');
      setSelectedPlayerId(null);
      setSelectedPlayerName(null);
      setShowQuarterlyPrediction(false);
    } else if (viewLevel === 'team') {
      setViewLevel('game');
      setSelectedTeamId(null);
      setSelectedTeamName(null);
    }
  };

  const isLoading = isLoadingLiveTeams || isLoadingUpcomingTeams;
  const liveCount = liveTeams?.length || 0;
  const upcomingCount = upcomingTeams?.length || 0;

  // Get game info for breadcrumb
  const getGameInfo = () => {
    if (!selectedGameId) return null;
    const allTeams = [...(liveTeams || []), ...(upcomingTeams || [])];
    const gameTeams = allTeams.filter(team => team.gameId === selectedGameId);
    if (gameTeams.length >= 2) {
      return `${gameTeams[0].name} vs ${gameTeams[1].name}`;
    }
    return `Game ${selectedGameId}`;
  };

  // Get team colors for selected game
  const getTeamColors = () => {
    if (!selectedGameId) return [];
    const allTeams = [...(liveTeams || []), ...(upcomingTeams || [])];
    const gameTeams = allTeams.filter(team => team.gameId === selectedGameId);
    return gameTeams.map(team => teamColors[team.name] || teamColors.Default);
  };

  const colors = getTeamColors();

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-hidden relative">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] animate-pulse"></div>
      </div>

      {/* Floating Logo */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
          
          {/* Logo container */}
          <div className="relative bg-gradient-to-r from-gray-900/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
            <Image 
              src="/MomentumoddsLogo.png" 
              alt="Momentumodds" 
              width={220} 
              height={55}
              className="h-10 w-auto drop-shadow-2xl"
              priority
            />
            
            {/* Momentum indicator */}
            <div className="absolute -top-2 -right-2 flex items-center space-x-1">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <div className="text-xs font-bold text-green-400 tracking-wide">LIVE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout with top spacing for floating logo */}
      <div className="flex w-full pt-24">
        {/* Enhanced Left Sidebar */}
        <div className="w-1/4 bg-gradient-to-b from-gray-900/90 to-slate-900/90 backdrop-blur-xl border-r border-gray-700/30 flex flex-col h-full relative">
          {/* Sidebar glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 pointer-events-none"></div>
          
          {/* Header */}
          <div className="relative flex-shrink-0 p-4 border-b border-gray-700/30">
            <div className="bg-gradient-to-r from-gray-800/80 to-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {viewLevel === 'game' ? '🏀 Live Games' : viewLevel === 'team' ? '🏈 Team Analysis' : '👤 Player Insights'}
                </h2>
                {(viewLevel === 'team' || viewLevel === 'player') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBackNavigation}
                    className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back
                  </Button>
                )}
              </div>
              
              <div className="text-sm text-gray-400">
                {viewLevel === 'game' && (
                  <div className="flex items-center space-x-4">
                    {liveCount > 0 && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-medium">{liveCount} live</span>
                      </div>
                    )}
                    {upcomingCount > 0 && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-400 font-medium">{upcomingCount} upcoming</span>
                      </div>
                    )}
                  </div>
                )}
                {viewLevel === 'team' && selectedGameId && (
                  <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-blue-400 font-medium">
                    Game {selectedGameId} Analysis
                  </div>
                )}
                {viewLevel === 'player' && selectedTeamName && (
                  <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 text-purple-400 font-medium">
                    {selectedTeamName} Roster
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <GamesSidebar
              viewLevel={viewLevel}
              liveTeams={liveTeams || []}
              upcomingTeams={upcomingTeams || []}
              teamPlayers={teamPlayers}
              isLoading={isLoading}
              selectedGameId={selectedGameId}
              selectedTeamId={selectedTeamId}
              selectedPlayerId={selectedPlayerId}
              onGameSelect={handleGameSelect}
              onTeamSelect={handleTeamSelect}
              onPlayerSelect={handlePlayerSelect}
              momentumPulse={momentumPulse}
              mlPulse={mlPulse}
              teamColors={teamColors}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="w-3/4 flex flex-col h-full relative">
          {/* Dynamic background based on selected teams */}
          {colors.length > 0 && (
            <div 
              className="absolute inset-0 opacity-10 transition-all duration-1000"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${colors[0]?.glow || 'rgba(59, 130, 246, 0.3)'} 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${colors[1]?.glow || colors[0]?.glow || 'rgba(147, 51, 234, 0.3)'} 0%, transparent 50%)`
              }}
            ></div>
          )}
          
          {/* Enhanced Breadcrumb Bar */}
          <div className="relative flex-shrink-0 bg-gray-900/30 backdrop-blur-xl border-b border-gray-700/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <Home className="w-4 h-4 text-blue-400" />
                  <ChevronRight className="w-3 h-3 text-gray-600" />
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-medium">Live Analytics</span>
                </div>
                
                {selectedGameId && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700/30">
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-300 font-medium">{getGameInfo()}</span>
                  </div>
                )}
                
                {selectedTeamName && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700/30">
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-300">{selectedTeamName}</span>
                  </div>
                )}
                
                {selectedPlayerName && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700/30">
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-300">{selectedPlayerName}</span>
                  </div>
                )}
              </div>

              {/* Enhanced Action Controls */}
              <div className="flex items-center space-x-3">
                {viewLevel === 'player' && selectedPlayerId && selectedPlayerName && !isSelectedTeamUpcoming && (
                  <Button
                    onClick={() => setShowQuarterlyPrediction(!showQuarterlyPrediction)}
                    size="sm"
                    className={`relative overflow-hidden transition-all duration-300 ${
                      showQuarterlyPrediction 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : 'bg-gray-800/50 hover:bg-gray-700/50 border border-blue-500/50'
                    }`}
                  >
                    {showQuarterlyPrediction && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                    )}
                    <Zap className="w-3 h-3 mr-1" />
                    <span className="relative z-10 text-xs font-medium">
                      {showQuarterlyPrediction ? "Live Stats" : "Q4 Prediction"}
                    </span>
                  </Button>
                )}
                
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300">
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full flex items-start justify-center p-6">
              {!selectedGameId ? (
                <div className="text-gray-400 text-center flex-1 flex items-center justify-center">
                  <div className="max-w-md relative">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl animate-pulse"></div>
                    
                    <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30">
                      <div className="mb-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <Home className="w-10 h-10 text-blue-400" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Welcome to Live Analytics
                      </div>
                      <div className="text-gray-400 mb-8 leading-relaxed">
                        Select a game from the sidebar to access real-time momentum tracking, AI-powered player predictions, and advanced analytics.
                      </div>
                      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/30">
                        <div className="text-gray-300 mb-4 font-medium">🚀 Advanced Features:</div>
                        <ul className="text-left space-y-3 text-gray-400">
                          <li className="flex items-center">
                            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-3 animate-pulse"></div>
                            Real-time momentum tracking with visual pulse effects
                          </li>
                          <li className="flex items-center">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-3 animate-pulse"></div>
                            AI-powered player prediction models
                          </li>
                          <li className="flex items-center">
                            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3 animate-pulse"></div>
                            Dynamic team color-coded analytics
                          </li>
                          <li className="flex items-center">
                            <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mr-3 animate-pulse"></div>
                            ML prediction confidence indicators
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isSelectedTeamUpcoming ? (
                <div className="text-gray-400 text-center flex-1 flex items-center justify-center">
                  <div className="max-w-md relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 rounded-3xl blur-3xl animate-pulse"></div>
                    
                    <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30">
                      <div className="mb-6">
                        <div className="text-8xl mb-4 animate-bounce">🏀</div>
                      </div>
                      <div className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Game Preview
                      </div>
                      <div className="text-xl mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                        {getGameInfo()}
                      </div>
                      <div className="text-gray-400 mb-8 leading-relaxed">
                        This game hasn&apos;t started yet. Live momentum data, player statistics, and predictive analytics will be available once the game begins.
                      </div>
                      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/30">
                        <div className="text-gray-300 mb-4 font-medium">⚡ Coming Soon:</div>
                        <ul className="text-left space-y-3 text-gray-400">
                          <li className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                            Live momentum tracking with team colors
                          </li>
                          <li className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                            Player prediction models with ML confidence
                          </li>
                          <li className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                            Quarterly performance analytics
                          </li>
                          <li className="flex items-center">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                            Enhanced team analysis with visual effects
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) :
                <div className="w-full max-w-7xl">
                  {viewLevel === 'game' && (
                    <GameView 
                      gameId={selectedGameId}
                      liveTeams={liveTeams || []}
                      upcomingTeams={upcomingTeams || []}
                      onTeamSelect={handleTeamSelect}
                      momentumPulse={momentumPulse}
                      teamColors={teamColors}
                    />
                  )}
                  
                  {viewLevel === 'team' && (
                    <TeamView
                      gameId={selectedGameId}
                      teamName={selectedTeamName}
                      teamMomentum={teamMomentum}
                      isLoading={isLoadingTeamMom}
                      error={errorTeamMom?.message || null}
                      teamPlayers={teamPlayers}
                      onPlayerSelect={handlePlayerSelect}
                      momentumPulse={momentumPulse}
                      mlPulse={mlPulse}
                      teamColors={teamColors}
                    />
                  )}
                  
                  {viewLevel === 'player' && (
                    <PlayerView
                      gameId={selectedGameId}
                      playerId={selectedPlayerId}
                      playerName={selectedPlayerName}
                      playerMomentum={playerMomentum}
                      correlations={correlations}
                      currentStats={currentStats}
                      propLines={propLines}
                      isLoading={isLoadingPM}
                      error={errorPM?.message || null}
                      showQuarterlyPrediction={showQuarterlyPrediction}
                    />
                  )}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 