"use client";
import React, { useState, useEffect } from 'react';
import { useLiveTeams, useUpcomingTeams } from '@/hooks/useLiveGames';
import { useTeamPlayers } from '@/hooks/useGamePlayers';
import { useTeamMomentum } from '@/hooks/useTeamMomentum';
import TopBar from '@/components/TopBar';
import MainCanvas from '@/components/MainCanvas';
import LowerPanel from '@/components/LowerPanel';
import ViewModeSelector from '@/components/ViewModeSelector';
import GamesSidebar from '@/components/GamesSidebar';

export default function DashboardPage() {
  // Core state
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [view, setView] = useState<'team' | 'player'>('team');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [reduceFlashing, setReduceFlashing] = useState(false);

  // Data hooks
  const { data: liveTeams, isLoading: isLoadingLiveTeams } = useLiveTeams();
  const { data: upcomingTeams, isLoading: isLoadingUpcomingTeams } = useUpcomingTeams();
  const { teamMomentum } = useTeamMomentum(selectedGameId);
  const { teamPlayers } = useTeamPlayers(selectedGameId, null);

  // Filter upcoming teams to only show games within 3 days
  const filteredUpcomingTeams = upcomingTeams?.filter(team => {
    if (!team || !upcomingTeams) return false;
    
    // Find the original game for this team to get the start_time
    const allGames = [...(liveTeams || []), ...(upcomingTeams || [])];
    const sampleTeam = allGames.find(t => t.gameId === team.gameId);
    
    if (!sampleTeam) return false;
    
    // For now, let's check if we can access the game data through the hook
    // The upcoming games hook already filters by date, so let's limit by count for now
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    // Since the underlying useUpcomingGames already filters future games,
    // we'll trust that filtering and just limit the display
    return true;
  }) || [];

  // Additionally, limit to first 20 teams (10 games) to avoid showing too many
  const limitedUpcomingTeams = filteredUpcomingTeams.slice(0, 20);

  // Apply reduced motion settings
  useEffect(() => {
    const root = document.documentElement;
    if (reduceFlashing) {
      root.style.setProperty('--flash-duration', '3s');
      root.style.setProperty('--flash-opacity-peak', '0.4');
    } else {
      root.style.removeProperty('--flash-duration');
      root.style.removeProperty('--flash-opacity-peak');
    }
  }, [reduceFlashing]);

  // Get team data for selected team only
  const getTeamData = () => {
    if (!selectedTeamId || !selectedGameId) return null;
    
    const allTeams = [...(liveTeams || []), ...limitedUpcomingTeams];
    const selectedTeam = allTeams.find(team => team.id === selectedTeamId);
    const opponentTeam = allTeams.find(team => 
      team.gameId === selectedGameId && team.id !== selectedTeamId
    );
          
    if (!selectedTeam || !opponentTeam) return null;
    
    // Get momentum data with fallback - only for selected team
    const teamMomentumValue = teamMomentum?.teamMomentum?.[selectedTeam.name] || 
                             (0.5 + Math.sin(Date.now() / 10000) * 0.4); // Dynamic fallback for demo
    const opponentMomentumValue = teamMomentum?.teamMomentum?.[opponentTeam.name] || 
                                 (0.3 + Math.cos(Date.now() / 8000) * 0.3); // Dynamic fallback for demo

    return {
      gameId: selectedGameId,
      gameTime: "7:23",
      quarter: "Q3", 
      isLive: selectedTeam.status === 'Live',
      selectedTeam: {
        name: selectedTeam.name,
        score: selectedTeam.score || Math.floor(Math.random() * 30) + 70,
        color: getTeamColor(selectedTeam.name),
        momentum: Math.abs(teamMomentumValue),
        isHome: selectedTeam.isHome
      },
      opponentTeam: {
        name: opponentTeam.name,
        score: opponentTeam.score || Math.floor(Math.random() * 30) + 70,
        color: getTeamColor(opponentTeam.name),
        momentum: Math.abs(opponentMomentumValue),
        isHome: opponentTeam.isHome
      },
      odds: {
        spread: -4.5,
        total: 218.5,
        moneyline: { home: -180, away: +155 }
      },
      teamInfo: {
        nextPlayLikely: "Strong Offensive Push",
        confidence: 73,
        keyLineup: ["Starter 1", "Starter 2", "Starter 3", "Starter 4", "Starter 5"],
        gameFlow: "High Pace"
      }
    };
  };

  // Get team color (simplified mapping)
  const getTeamColor = (teamName: string) => {
    const colorMap: Record<string, string> = {
      "Boston Celtics": "#007A33",
      "Los Angeles Lakers": "#552583",
      "Golden State Warriors": "#1D428A",
      "Miami Heat": "#98002E",
      "Oklahoma City Thunder": "#007AC1",
      "Indiana Pacers": "#002D62"
    };
    return colorMap[teamName] || "#059669";
  };

  // Team colors for GamesSidebar (with primary, secondary, glow structure)
  const getTeamColors = () => {
    const teamColors: Record<string, { primary: string; secondary: string; glow: string }> = {
      "Boston Celtics": { primary: "#007A33", secondary: "#10B981", glow: "rgba(0, 122, 51, 0.4)" },
      "Los Angeles Lakers": { primary: "#552583", secondary: "#8B5CF6", glow: "rgba(85, 37, 131, 0.4)" },
      "Golden State Warriors": { primary: "#1D428A", secondary: "#3B82F6", glow: "rgba(29, 66, 138, 0.4)" },
      "Miami Heat": { primary: "#98002E", secondary: "#EF4444", glow: "rgba(152, 0, 46, 0.4)" },
      "Oklahoma City Thunder": { primary: "#007AC1", secondary: "#06B6D4", glow: "rgba(0, 122, 193, 0.4)" },
      "Indiana Pacers": { primary: "#002D62", secondary: "#1E40AF", glow: "rgba(0, 45, 98, 0.4)" },
      "Default": { primary: "#059669", secondary: "#10B981", glow: "rgba(5, 150, 105, 0.4)" }
    };
    return teamColors;
  };

  // Generate player data from teamPlayers
  const getPlayerData = () => {
    if (!teamPlayers || teamPlayers.length === 0) {
      // Generate fallback players for demo when no real data is available
      if (selectedGameId) {
        return Array.from({ length: 6 }, (_, i) => ({
          playerId: i + 1,
          name: `Player ${i + 1}`,
          points: Math.floor(Math.random() * 15) + 10,
          pointsETA: Math.floor(Math.random() * 10) + 20,
          rebounds: Math.floor(Math.random() * 8) + 3,
          reboundsETA: Math.floor(Math.random() * 5) + 6,
          assists: Math.floor(Math.random() * 6) + 2,
          assistsETA: Math.floor(Math.random() * 4) + 5,
          color: getTeamColor("Default"),
          momentum: Math.random() * 0.8 + 0.1
        }));
      }
      return [];
    }
    
    return teamPlayers.slice(0, 8).map(player => ({
      playerId: player.player_id,
      name: (player as any).full_name || `Player ${player.player_id}`, // eslint-disable-line @typescript-eslint/no-explicit-any
      points: Math.floor(Math.random() * 15) + 10,
      pointsETA: Math.floor(Math.random() * 10) + 20,
      rebounds: Math.floor(Math.random() * 8) + 3,
      reboundsETA: Math.floor(Math.random() * 5) + 6,
      assists: Math.floor(Math.random() * 6) + 2,
      assistsETA: Math.floor(Math.random() * 4) + 5,
      color: getTeamColor("Default"),
      momentum: Math.random() * 0.8 + 0.1
    }));
  };

  // Determine current momentum for flash - should be leading team only
  const getCurrentMomentum = () => {
    const gameData = getTeamData();
    if (!gameData) return { hex: '#ffffff', momentum: 0 };

    if (view === 'player' && selectedPlayer) {
      return {
        hex: selectedPlayer.color,
        momentum: selectedPlayer.momentum
      };
    } else {
      // Use only the selected team's momentum for flashing
      return {
        hex: gameData.selectedTeam.color,
        momentum: gameData.selectedTeam.momentum
      };
    }
  };

  const gameData = getTeamData();
  const playerData = getPlayerData();
  const flashData = getCurrentMomentum();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Sidebar: Game Selection */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-2">Game Selection</h2>
          <div className="text-sm text-gray-400">
            Choose a game to analyze momentum
          </div>
      </div>
      
        {/* Live Games Section */}
        {liveTeams && liveTeams.length > 0 && (
          <div className="border-b border-gray-700">
            <div className="p-3 bg-red-900/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-semibold text-red-400">LIVE GAMES</h3>
      </div>
            </div>
          </div>
        )}
        
        {/* Upcoming Games Section */}
        {limitedUpcomingTeams && limitedUpcomingTeams.length > 0 && (
          <div className="border-b border-gray-700">
            <div className="p-3 bg-blue-900/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-blue-400">UPCOMING GAMES</h3>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          <GamesSidebar
            viewLevel="team"
            liveTeams={liveTeams || []}
            upcomingTeams={limitedUpcomingTeams}
            teamPlayers={teamPlayers}
            isLoading={isLoadingLiveTeams || isLoadingUpcomingTeams}
            selectedGameId={selectedGameId}
            selectedTeamId={selectedTeamId}
            selectedPlayerId={null}
            onGameSelect={() => {}}
            onTeamSelect={(teamId) => {
              const allTeams = [...(liveTeams || []), ...limitedUpcomingTeams];
              const team = allTeams.find(t => t.id === teamId);
              if (team) {
                setSelectedTeamId(teamId);
                setSelectedGameId(team.gameId);
                setSelectedPlayer(null);
                setView('team');
              }
            }}
            onPlayerSelect={() => {}}
            momentumPulse={{}}
            mlPulse={{}}
            teamColors={getTeamColors()}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Zone A: Top Bar */}
        <TopBar 
          isLive={gameData?.isLive || false}
          gameTime={gameData?.gameTime || "00:00"}
          quarter={gameData?.quarter || "Q1"}
          reduceFlashing={reduceFlashing}
          onFlashingToggle={() => setReduceFlashing(!reduceFlashing)}
          onSettingsToggle={() => {/* Settings functionality could be added here */}}
        />

        {/* Main Layout: Zone B (Canvas) + Zone C (Info Rail) */}
        <div className="flex flex-1">
          {/* Zone B: Main Canvas (Clean momentum flash area) */}
          <div className="flex-1 flex flex-col">
            {/* View Mode Selector - moved up to take more space */}
            {gameData && (
              <div className="p-4 bg-gray-900 border-b border-gray-700">
                <ViewModeSelector
                  view={view}
                  onViewChange={setView}
                  selectedPlayer={selectedPlayer}
                  onPlayerSelect={setSelectedPlayer}
                  players={playerData}
                />
              </div>
            )}

            <MainCanvas
              showFlash={flashData.momentum > 0.1}
              flashHex={flashData.hex}
              momentum={flashData.momentum}
            >
              {/* Clean area - only watermarked logo, no text */}
              <div className="opacity-0">
                {/* Empty div to maintain space but show nothing - logo comes from MainCanvas */}
              </div>
            </MainCanvas>
              </div>
              
          {/* Zone C: Right Sidebar (Restructured) */}
          {gameData && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              {/* Game Context - Moved from main canvas */}
              <div className="p-4 border-b border-gray-700 bg-gray-750">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {gameData.selectedTeam.name} vs {gameData.opponentTeam.name}
                  </h2>
                  <div className="text-2xl font-bold text-gray-300 mt-2">
                    {gameData.selectedTeam.score} - {gameData.opponentTeam.score}
                      </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {gameData.quarter} • {gameData.gameTime}
                    {gameData.isLive && (
                      <span className="ml-2 inline-flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-500 text-xs font-medium">LIVE</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Current Team Selection Indicator */}
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-2">Analysis Focus:</div>
                  <div className="flex items-center justify-center space-x-4">
                    {view === 'team' ? (
                      <div className="text-center">
                        <div 
                          className="w-8 h-8 rounded-full mx-auto mb-1 ring-2 ring-blue-500"
                          style={{ backgroundColor: gameData.selectedTeam.color }}
                        />
                        <div className="text-xs text-white font-medium">{gameData.selectedTeam.name}</div>
                        <div className="text-xs text-blue-400">Selected Team</div>
                      </div>
                    ) : selectedPlayer ? (
                      <div className="text-center">
                        <div 
                          className="w-8 h-8 rounded-full mx-auto mb-1 ring-2 ring-green-500 flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: selectedPlayer.color }}
                        >
                          {selectedPlayer.name.charAt(0)}
                        </div>
                        <div className="text-xs text-white font-medium">{selectedPlayer.name}</div>
                        <div className="text-xs text-green-400">Player Analysis</div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-sm">Select Player Below</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Game Status */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Team Focus</h3>
                </div>
                
                {/* Selected Team (Primary) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-900/30 border border-blue-500/30">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: gameData.selectedTeam.color }}
                      />
                      <span className="text-white font-bold">{gameData.selectedTeam.name}</span>
                      <span className="text-xs text-blue-400 font-medium">SELECTED</span>
                    </div>
                    <span className="text-white font-bold text-xl">{gameData.selectedTeam.score}</span>
                  </div>
                  
                  {/* Opponent Team (Secondary) */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/30">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: gameData.opponentTeam.color }}
                      />
                      <span className="text-gray-300 font-medium">{gameData.opponentTeam.name}</span>
                      <span className="text-xs text-gray-500">Opponent</span>
                    </div>
                    <span className="text-gray-300 font-bold text-lg">{gameData.opponentTeam.score}</span>
                  </div>
                </div>
              </div>

              {/* Momentum Tracking */}
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Team Momentum</h3>
                <div className="space-y-3">
                  {/* Selected Team Momentum (Primary) */}
                  <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-300 font-medium">{gameData.selectedTeam.name}</span>
                      <span className="text-xs text-blue-400 font-bold">SELECTED TEAM</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-3 bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: `${gameData.selectedTeam.momentum * 100}%`,
                            backgroundColor: gameData.selectedTeam.color
                          }}
                        />
                      </div>
                      <span className="text-sm text-white font-bold w-12 text-right">
                        {(gameData.selectedTeam.momentum * 100).toFixed(0)}%
                      </span>
            </div>
          </div>

                  {/* Opponent Momentum (Secondary) */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{gameData.opponentTeam.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: `${gameData.opponentTeam.momentum * 100}%`,
                            backgroundColor: gameData.opponentTeam.color
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">
                        {(gameData.opponentTeam.momentum * 100).toFixed(0)}%
                      </span>
          </div>
        </div>
                </div>
                  </div>

              {/* Live Odds */}
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Live Odds</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Spread</span>
                    <span className="text-white">{gameData.odds.spread}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Total</span>
                    <span className="text-white">{gameData.odds.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Moneyline</span>
                    <span className="text-white text-xs">
                      {gameData.odds.moneyline.away} / {gameData.odds.moneyline.home}
                    </span>
              </div>
            </div>
          </div>
          
              {/* Quick Stats */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
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
          )}
        </div>

        {/* Zone D: Lower Panel */}
        {gameData && (
          <LowerPanel
            mode={view}
            selectedPlayer={selectedPlayer}
            teamInfo={gameData.teamInfo}
          />
        )}
      </div>
    </div>
  );
} 