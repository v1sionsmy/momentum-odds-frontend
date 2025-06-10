"use client";
import React, { useState, useEffect } from 'react';
import { useLiveTeams, useUpcomingTeams, useUpcomingGamesSimple, useLiveGamesSimple } from '@/hooks/useLiveGames';
import { useTeamPlayers } from '@/hooks/useGamePlayers';
import { useTeamMomentum } from '@/hooks/useTeamMomentum';
import TopBar from '@/components/TopBar';
import MainCanvas from '@/components/MainCanvas';
import LowerPanel from '@/components/LowerPanel';
import ViewModeSelector from '@/components/ViewModeSelector';

export default function DashboardPage() {
  // Core state
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [view, setView] = useState<'team' | 'player'>('team');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [reduceFlashing, setReduceFlashing] = useState(false);

  // Data hooks - using both simple (for games) and team hooks (for team analysis)
  const { data: liveTeams, isLoading: isLoadingLiveTeams } = useLiveTeams();
  const { data: upcomingTeams, isLoading: isLoadingUpcomingTeams } = useUpcomingTeams();
  const { data: upcomingGames, isLoading: isLoadingUpcomingGames } = useUpcomingGamesSimple();
  const { data: liveGames, isLoading: isLoadingLiveGames } = useLiveGamesSimple();
  const { teamMomentum } = useTeamMomentum(selectedGameId);
  const { teamPlayers } = useTeamPlayers(selectedGameId, null);

  console.log('🎮 Dashboard Debug:', {
    upcomingGames: upcomingGames?.length || 0,
    liveGames: liveGames?.length || 0,
    upcomingTeams: upcomingTeams?.length || 0,
    liveTeams: liveTeams?.length || 0,
    selectedGameId,
    selectedTeamId,
    isLoadingGames: isLoadingUpcomingGames || isLoadingLiveGames,
    isLoadingTeams: isLoadingUpcomingTeams || isLoadingLiveTeams
  });

  // Get team data for selected team only
  const getTeamData = () => {
    if (!selectedTeamId || !selectedGameId) return null;
    
    const allTeams = [...(liveTeams || []), ...(upcomingTeams || [])];
    const selectedTeam = allTeams.find(team => team.id === selectedTeamId);
    const opponentTeam = allTeams.find(team => 
      team.gameId === selectedGameId && team.id !== selectedTeamId
    );
          
    if (!selectedTeam || !opponentTeam) return null;
    
    // Check if this is an upcoming game (not live)
    const isUpcomingGame = selectedTeam.status === 'SCHEDULED';
    
    // For upcoming games, don't show live data
    if (isUpcomingGame) {
      return {
        gameId: selectedGameId,
        gameTime: null, // No game time for upcoming games
        quarter: null,  // No quarter for upcoming games
        isLive: false,
        isUpcoming: true,
        selectedTeam: {
          name: selectedTeam.name,
          score: 0, // No score for upcoming games
          color: getTeamColor(selectedTeam.name),
          momentum: 0, // No momentum for upcoming games
          isHome: selectedTeam.isHome
        },
        opponentTeam: {
          name: opponentTeam.name,
          score: 0, // No score for upcoming games
          color: getTeamColor(opponentTeam.name),
          momentum: 0, // No momentum for upcoming games
          isHome: opponentTeam.isHome
        },
        odds: {
          spread: -4.5,
          total: 218.5,
          moneyline: { home: -180, away: +155 }
        },
        teamInfo: undefined // No live team info for upcoming games
      };
    }
    
    // For live games, get momentum data with fallback - only for selected team
    const teamMomentumValue = teamMomentum?.teamMomentum?.[selectedTeam.name] || 
                             (0.5 + Math.sin(Date.now() / 10000) * 0.4); // Dynamic fallback for demo
    const opponentMomentumValue = teamMomentum?.teamMomentum?.[opponentTeam.name] || 
                                 (0.3 + Math.cos(Date.now() / 8000) * 0.3); // Dynamic fallback for demo

    return {
      gameId: selectedGameId,
      gameTime: "7:23",
      quarter: "Q3", 
      isLive: true,
      isUpcoming: false,
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

  // Generate player data from teamPlayers
  const getPlayerData = () => {
    // Don't show player data for upcoming games
    if (gameData?.isUpcoming) {
      return [];
    }

    if (!teamPlayers || teamPlayers.length === 0) {
      // Generate fallback players for demo when no real data is available - only for live games
      if (selectedGameId && gameData?.isLive) {
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
    
    // Only return real player data for live games
    if (gameData?.isLive) {
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
    }

    return [];
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

  // Reset view to team and clear player selection for upcoming games
  useEffect(() => {
    if (gameData?.isUpcoming) {
      setView('team');
      setSelectedPlayer(null);
    }
  }, [gameData?.isUpcoming]);

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
        {liveGames && liveGames.length > 0 && (
          <div className="border-b border-gray-700">
            <div className="p-3 bg-red-900/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-semibold text-red-400">LIVE GAMES ({liveGames.length})</h3>
      </div>
            </div>
          </div>
        )}
        
        {/* Upcoming Games Section */}
        {upcomingGames && upcomingGames.length > 0 && (
          <div className="border-b border-gray-700">
            <div className="p-3 bg-blue-900/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-semibold text-blue-400">UPCOMING GAMES ({upcomingGames.length})</h3>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* Simple Game List */}
          <div className="space-y-3">
            {/* Live Games */}
            {liveGames && liveGames.map(game => (
              <div
                key={`live-${game.id}`}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedGameId === game.id
                    ? 'border-red-500 bg-red-900/20 shadow-lg'
                    : 'border-gray-600 bg-gray-800/50 hover:border-red-400 hover:bg-red-900/10'
                }`}
                onClick={() => {
                  setSelectedGameId(game.id);
                  // Auto-select first team when selecting a game
                  const teams = [...(liveTeams || [])].filter(t => t.gameId === game.id);
                  if (teams.length > 0) {
                    setSelectedTeamId(teams[0].id);
                  }
                setView('team');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-xs font-bold">LIVE</span>
                  </div>
                  <div className="text-xs text-gray-400">Game #{game.id}</div>
                </div>
                
                <div className="text-center mb-2">
                  <div className="text-white font-bold">
                    {game.away_team} @ {game.home_team}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {game.away_score} - {game.home_score}
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-xs text-gray-400">Click to analyze momentum</span>
                </div>
              </div>
            ))}
            
            {/* Upcoming Games */}
            {upcomingGames && upcomingGames.map(game => (
              <div
                key={`upcoming-${game.id}`}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedGameId === game.id
                    ? 'border-blue-500 bg-blue-900/20 shadow-lg'
                    : 'border-gray-600 bg-gray-800/50 hover:border-blue-400 hover:bg-blue-900/10'
                }`}
                onClick={() => {
                  setSelectedGameId(game.id);
                  // Auto-select first team when selecting a game
                  const teams = [...(upcomingTeams || [])].filter(t => t.gameId === game.id);
                  if (teams.length > 0) {
                    setSelectedTeamId(teams[0].id);
                  }
                  setView('team');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-400 text-xs font-bold">UPCOMING</span>
                  </div>
                  <div className="text-xs text-gray-400">{game.timeUntilGame}</div>
                </div>
                
                <div className="text-center mb-2">
                  <div className="text-white font-bold">
                    {game.away_team} @ {game.home_team}
                  </div>
                  <div className="text-sm text-blue-300 mt-1">
                    {game.formattedDate}
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-xs text-gray-400">Click to analyze</span>
                </div>
              </div>
            ))}
            
            {/* No Games Available */}
            {(!liveGames || liveGames.length === 0) && (!upcomingGames || upcomingGames.length === 0) && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No games available</div>
                <div className="text-sm text-gray-500">
                  {(isLoadingLiveGames || isLoadingUpcomingGames) ? 'Loading...' : 'Check back later'}
                </div>
              </div>
            )}
            
            {/* Team Selector - appears when game is selected */}
            {selectedGameId && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">SELECT TEAM TO ANALYZE</h4>
                <div className="space-y-2">
                  {[...(liveTeams || []), ...(upcomingTeams || [])]
                    .filter(team => team.gameId === selectedGameId)
                    .map(team => (
                      <div
                        key={team.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedTeamId === team.id
                            ? 'border-green-500 bg-green-900/20 shadow-lg'
                            : 'border-gray-600 bg-gray-800/30 hover:border-green-400 hover:bg-green-900/10'
                        }`}
                        onClick={() => {
                          setSelectedTeamId(team.id);
                          setView('team');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-white font-medium">{team.name}</div>
                            {team.isHome && (
                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">HOME</span>
                            )}
                          </div>
                          {/* Only show score for live games, not upcoming */}
                          {liveGames?.some(game => game.id === selectedGameId) && (
                            <div className="text-gray-300 font-bold">{team.score}</div>
                          )}
                        </div>
                        
                        {selectedTeamId === team.id && (
                          <div className="mt-2 pt-2 border-t border-green-500/30">
                            <div className="text-xs text-green-400">
                              ✓ Selected for analysis
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
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
          hasGameSelected={!!selectedGameId}
        />

        {/* Main Layout: Zone B (Canvas) + Zone C (Info Rail) */}
        <div className="flex flex-1">
          {/* Zone B: Main Canvas */}
          <div className="flex-1 flex flex-col">
            {/* View Mode Selector - moved up to take more space */}
            {gameData && !gameData.isUpcoming && (
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
              flashHex={flashData.hex}
              momentum={flashData.momentum}
              showFlash={!reduceFlashing && gameData?.isLive && !gameData?.isUpcoming}
            >
              {gameData?.isUpcoming ? (
                /* Upcoming Game State */
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-bold text-white">
                      {gameData.selectedTeam.name}
                    </h2>
                    <div className="text-xl text-gray-300">vs</div>
                    <h2 className="text-4xl font-bold text-white">
                      {gameData.opponentTeam.name}
                    </h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-2xl font-semibold text-blue-400">
                      🏀 Game Preview
                    </div>
                    <div className="text-gray-300 max-w-md mx-auto">
                      Game analytics will be available once the game starts.
                      Check back when the game goes live!
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="text-sm text-gray-400">
                      Analysis will include live momentum tracking, player stats, and real-time odds
                    </div>
                  </div>
                </div>
              ) : gameData && gameData.isLive ? (
                /* Live Game State */
                <div className="space-y-4 text-center">
                  <h2 className="text-3xl font-bold">Feel the Game</h2>
                  <p className="text-gray-300 max-w-md">
                    Watch the pulse of momentum flow through every play, 
                    every shot, every momentum shift.
                  </p>
                </div>
              ) : (
                /* Default State */
                <div className="space-y-4 text-center">
                  <h2 className="text-3xl font-bold">Momentum Pulse</h2>
                  <p className="text-gray-300 max-w-md">
                    Select a game to analyze team momentum and player performance in real-time.
                  </p>
              </div>
              )}
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
                  
                  {gameData.isUpcoming ? (
                    /* Upcoming Game Display */
                    <div className="space-y-2 mt-2">
                      <div className="text-lg font-semibold text-blue-400">
                        Game Preview
                      </div>
                      <div className="text-sm text-gray-400">
                        Analytics available when game starts
                      </div>
                    </div>
                  ) : (
                    /* Live Game Display */
                    <>
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
                    </>
                  )}
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

              {!gameData.isUpcoming ? (
                /* Live Game Content */
                <>
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
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {view === 'player' && selectedPlayer ? 'Player Momentum' : 'Team Momentum'}
                    </h3>
                <div className="space-y-3">
                      {view === 'player' && selectedPlayer ? (
                        /* Player Momentum Display */
                        <div className="p-3 rounded-lg bg-green-900/20 border border-green-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-green-300 font-medium">{selectedPlayer.name}</span>
                            <span className="text-xs text-green-400 font-bold">SELECTED PLAYER</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 h-3 bg-gray-600 rounded-full overflow-hidden">
                              <div 
                                className="h-full transition-all duration-500"
                                style={{ 
                                  width: `${selectedPlayer.momentum * 100}%`,
                                  backgroundColor: selectedPlayer.color
                                }}
                              />
                            </div>
                            <span className="text-sm text-white font-bold w-12 text-right">
                              {(selectedPlayer.momentum * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-green-300">
                            {selectedPlayer.position} • {selectedPlayer.team}
                          </div>
                        </div>
                      ) : (
                        /* Team Momentum Display */
                        <>
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
                        </>
                      )}
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
                </>
              ) : (
                /* Upcoming Game Content */
                <div className="p-4 flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">⏰</div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">Game Starts Soon</h3>
                      <p className="text-gray-400 text-sm max-w-sm">
                        Live momentum tracking, team stats, and real-time analysis will be available once the game begins.
                      </p>
                    </div>
                    <div className="pt-2">
                      <div className="text-xs text-blue-400">
                        Check back when the game goes live!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Odds - Show for both upcoming and live games */}
              <div className="p-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {gameData.isUpcoming ? 'Opening Odds' : 'Live Odds'}
                </h3>
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