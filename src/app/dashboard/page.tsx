"use client";
import React, { useState, useEffect } from 'react';
import { useLiveTeams, useUpcomingTeams, useUpcomingGamesSimple, useLiveGamesSimple } from '@/hooks/useLiveGames';
import { useTeamPlayers } from '@/hooks/useGamePlayers';
import { useGameOdds } from '@/hooks/useGameOdds';
import TopBar from '@/components/TopBar';
import MainCanvas from '@/components/MainCanvas';
import LowerPanel from '@/components/LowerPanel';
import ViewModeSelector from '@/components/ViewModeSelector';
import MomentumOddsHeader from '@/components/MomentumOddsHeader';
import GameCountdown from '@/components/GameCountdown';
import { formatSpread, formatTotal, formatMoneyline, getOddsDataMessage } from '@/lib/utils';

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

  // Handle game selection from header dropdown
  const handleGameSelect = (gameId: number) => {
    setSelectedGameId(gameId);
    // Remove auto-selection to allow users to choose their team
    setSelectedTeamId(null);
    setView('team');
  };

  // Get team data for selected team only
  const getTeamData = () => {
    if (!selectedTeamId || !selectedGameId) return null;
    
    const allTeams = [...(liveTeams || []), ...(upcomingTeams || [])];
    const selectedTeam = allTeams.find(team => team.id === selectedTeamId);
    const opponentTeam = allTeams.find(team => 
      team.gameId === selectedGameId && team.id !== selectedTeamId
    );
          
    if (!selectedTeam || !opponentTeam) return null;
    
    // Get the actual game data from live or upcoming games
    const liveGame = liveGames?.find(game => game.id === selectedGameId);
    const upcomingGame = upcomingGames?.find(game => game.id === selectedGameId);
    const actualGame = liveGame || upcomingGame;
    
    // Check if this is an upcoming game (not live)
    const isUpcomingGame = selectedTeam.status === 'SCHEDULED' || !liveGame;
    
    // For upcoming games, don't show live data
    if (isUpcomingGame) {
      return {
        gameId: selectedGameId,
        gameTime: null,
        quarter: null,
        isLive: false,
        isUpcoming: true,
        gameStartTime: actualGame?.start_time || null,
        selectedTeam: {
          name: selectedTeam.name,
          score: 0,
          color: getTeamColor(selectedTeam.name),
          momentum: 0,
          isHome: selectedTeam.isHome
        },
        opponentTeam: {
          name: opponentTeam.name,
          score: 0,
          color: getTeamColor(opponentTeam.name),
          momentum: 0,
          isHome: opponentTeam.isHome
        },
        odds: {
          spread: -4.5,
          total: 218.5,
          moneyline: { home: -180, away: +155 }
        },
        teamInfo: undefined
      };
    }
    
    // For LIVE games, use REAL ESPN data
    if (liveGame && actualGame) {
      // Get real game time and quarter from the live game data
      // Use the clock and period fields that are now preserved from the backend
      const gameTime = liveGame.clock || "12:00";
      const quarter = liveGame.period ? `Q${liveGame.period}` : "Q1";
      
      // Use REAL scores from ESPN
      const homeScore = actualGame.home_score || 0;
      const awayScore = actualGame.away_score || 0;
      
      // Generate dynamic momentum based on score differential and time
      const scoreDiff = homeScore - awayScore;
      const timeFactor = Math.sin(Date.now() / 15000) * 0.2; // Oscillating momentum
      
      // Calculate momentum based on score lead and add some variation
      const homeMomentum = Math.max(0.1, Math.min(0.9, 0.5 + (scoreDiff * 0.02) + timeFactor));
      const awayMomentum = Math.max(0.1, Math.min(0.9, 0.5 - (scoreDiff * 0.02) - timeFactor));
      
      // Determine which team is selected and assign momentum accordingly
      const selectedMomentum = selectedTeam.isHome ? homeMomentum : awayMomentum;
      const opponentMomentum = selectedTeam.isHome ? awayMomentum : homeMomentum;
      
      return {
        gameId: selectedGameId,
        gameTime: gameTime,
        quarter: quarter,
        isLive: true,
        isUpcoming: false,
        selectedTeam: {
          name: selectedTeam.name,
          score: selectedTeam.isHome ? homeScore : awayScore,
          color: getTeamColor(selectedTeam.name),
          momentum: selectedMomentum,
          isHome: selectedTeam.isHome
        },
        opponentTeam: {
          name: opponentTeam.name,
          score: opponentTeam.isHome ? homeScore : awayScore,
          color: getTeamColor(opponentTeam.name),
          momentum: opponentMomentum,
          isHome: opponentTeam.isHome
        },
        odds: {
          spread: -4.5,
          total: 218.5,
          moneyline: { home: -180, away: +155 }
        },
        teamInfo: {
          nextPlayLikely: scoreDiff > 5 ? "Defensive Stand" : "Offensive Push",
          confidence: Math.floor(Math.abs(selectedMomentum - 0.5) * 100 + 50),
          keyLineup: ["Starter 1", "Starter 2", "Starter 3", "Starter 4", "Starter 5"],
          gameFlow: Math.abs(scoreDiff) > 10 ? "Controlled Pace" : "High Pace"
        }
      };
    }
    
    // Fallback for edge cases
    return null;
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

  // Get game data and odds after functions are defined
  const gameData = getTeamData();
  const { oddsData, isLoadingOdds } = useGameOdds(
    selectedGameId, 
    gameData?.isLive || false, 
    gameData?.isUpcoming || false
  );

  // Generate player data from teamPlayers
  const getPlayerData = () => {
    if (gameData?.isUpcoming) {
      return [];
    }

    // Use real player data from the enhanced hook
    if (teamPlayers && teamPlayers.length > 0) {
      console.log('🏀 Using player data from enhanced hook:', teamPlayers.length, 'players');
      
      return teamPlayers.slice(0, 8).map((player) => {
        // Calculate dynamic momentum based on performance
        const points = player.points || 0;
        const rebounds = player.rebounds || 0;
        const assists = player.assists || 0;
        const minutes = player.minutes_played || 0;
        
        // Performance-based momentum calculation
        const performanceScore = (points * 2 + assists * 1.5 + rebounds * 1.2) / Math.max(minutes / 30, 0.5);
        const momentum = Math.max(0.1, Math.min(0.9, performanceScore / 20));
        
        return {
          playerId: player.player_id,
          name: player.full_name || player.name || `Player ${player.player_id}`,
          points: points,
          pointsETA: Math.floor(points * 1.2 + Math.random() * 5), // Projected final
          rebounds: rebounds,
          reboundsETA: Math.floor(rebounds * 1.3 + Math.random() * 3),
          assists: assists,
          assistsETA: Math.floor(assists * 1.4 + Math.random() * 2),
          color: gameData?.selectedTeam?.color || getTeamColor("Default"),
          momentum: momentum,
          position: player.position || 'G',
          minutes: minutes,
          team: player.team_name || 'Unknown'
        };
      });
    }

    return [];
  };

  // Determine current momentum for flash
  const getCurrentMomentum = () => {
    const gameData = getTeamData();
    if (!gameData) return { hex: '#ffffff', momentum: 0 };

    if (view === 'player' && selectedPlayer) {
      return {
        hex: selectedPlayer.color,
        momentum: selectedPlayer.momentum
      };
    } else {
      // Show the team with higher momentum for more dynamic flashing
      const selectedMomentum = gameData.selectedTeam.momentum || 0;
      const opponentMomentum = gameData.opponentTeam.momentum || 0;
      
      // Enhanced momentum logic for better visual effect
      let flashColor = gameData.selectedTeam.color;
      let flashMomentum = selectedMomentum;
      
      // If opponent has significantly higher momentum (>15% difference), show opponent
      if (opponentMomentum > selectedMomentum && (opponentMomentum - selectedMomentum) > 0.15) {
        flashColor = gameData.opponentTeam.color;
        flashMomentum = opponentMomentum;
      }
      
      // Normalize momentum to 0-1 range and boost for better visual effect
      // Ensure minimum 0.1 for live games to show some activity
      if (gameData.isLive) {
        flashMomentum = Math.max(0.1, Math.min(1.0, flashMomentum));
      } else {
        flashMomentum = Math.max(0, Math.min(1.0, flashMomentum));
      }
      
      // Debug logging
      console.log('🔥 Momentum Flash Debug:', {
        selectedTeam: gameData.selectedTeam.name,
        selectedMomentum: selectedMomentum.toFixed(3),
        opponentTeam: gameData.opponentTeam.name,
        opponentMomentum: opponentMomentum.toFixed(3),
        flashColor,
        flashMomentum: flashMomentum.toFixed(3),
        isLive: gameData.isLive,
        reduceFlashing,
        teamColorValid: /^#[0-9A-F]{6}$/i.test(flashColor)
      });
      
      return {
        hex: flashColor,
        momentum: flashMomentum
      };
    }
  };

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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header with Games Dropdown */}
      <MomentumOddsHeader 
        liveGames={liveGames || []}
        upcomingGames={upcomingGames || []}
        onGameSelect={handleGameSelect}
        selectedGameId={selectedGameId}
      />
      
      {/* Main Dashboard Content */}
      <div className="flex-1 flex flex-col">
        {/* Game Status Bar */}
        <TopBar 
          isLive={gameData?.isLive || false}
          gameTime={gameData?.gameTime || "00:00"}
          quarter={gameData?.quarter || "Q1"}
          reduceFlashing={reduceFlashing}
          onFlashingToggle={() => setReduceFlashing(!reduceFlashing)}
          onSettingsToggle={() => {/* Settings functionality could be added here */}}
          hasGameSelected={!!selectedGameId}
        />

        {/* Main Layout: Canvas + Team Selection (if game selected) */}
        <div className="flex flex-1">
          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* View Mode Selector - only show for live games */}
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
              {!selectedGameId ? (
                /* No Game Selected State */
                <div className="space-y-4 text-center">
                  <h2 className="text-3xl font-bold">Momentum Pulse</h2>
                  <p className="text-gray-300 max-w-md mx-auto">
                    Select a game from the dropdown above to analyze team momentum and player performance in real-time.
                  </p>
                </div>
              ) : !selectedTeamId ? (
                /* Game Selected but No Team Selected State */
                <div className="space-y-4 text-center">
                  <h2 className="text-3xl font-bold">Game Selected</h2>
                  <p className="text-gray-300 max-w-md mx-auto">
                    Choose a team to analyze from the sidebar to begin momentum tracking.
                  </p>
                  <div className="text-sm text-gray-400 mt-4">
                    👉 Look for &ldquo;Analysis Focus&rdquo; in the right panel
                  </div>
                </div>
              ) : gameData?.isUpcoming ? (
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
          
          {/* Right Sidebar - Show when game is selected */}
          {selectedGameId && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              {/* Game Context */}
              <div className="p-4 border-b border-gray-700 bg-gray-750">
                <div className="text-center mb-4">
                  {selectedTeamId && gameData ? (
                    /* Team selected - show full game context */
                    <>
                      <h2 className="text-xl font-bold text-white">
                        {gameData.selectedTeam.name} vs {gameData.opponentTeam.name}
                      </h2>
                      
                      {gameData.isUpcoming ? (
                        <div className="space-y-2 mt-2">
                          <div className="text-lg font-semibold text-blue-400">
                            Game Preview
                          </div>
                          <div className="text-sm text-gray-400">
                            Analytics available when game starts
                          </div>
                        </div>
                      ) : (
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
                    </>
                  ) : (
                    /* No team selected - show basic game info */
                    <>
                      <h2 className="text-xl font-bold text-white">
                        {(() => {
                          const teams = [...(liveTeams || []), ...(upcomingTeams || [])].filter(t => t.gameId === selectedGameId);
                          return teams.length >= 2 ? `${teams[0].name} vs ${teams[1].name}` : 'Game Selected';
                        })()}
                      </h2>
                      <div className="text-sm text-gray-400 mt-2">
                        Select a team below to begin analysis
                      </div>
                    </>
                  )}
                </div>

                {/* Analysis Focus - Team Selection */}
                <div className="p-4 border-b border-gray-700">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-2">Analysis Focus:</div>
                    
                    {!selectedTeamId ? (
                      /* No team selected - show selection options */
                      <div className="space-y-3">
                        <div className="text-sm text-white text-center mb-2">Select Team to Analyze:</div>
                        <div className="space-y-2">
                          {[...(liveTeams || []), ...(upcomingTeams || [])]
                            .filter(team => team.gameId === selectedGameId)
                            .map(team => (
                              <button
                                key={team.id}
                                onClick={() => {
                                  setSelectedTeamId(team.id);
                                  setView('team');
                                }}
                                className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{team.name}</div>
                                  <div className="text-xs opacity-75">
                                    {team.isHome ? 'HOME' : 'AWAY'}
                                  </div>
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    ) : (
                      /* Team selected - show selected team with change option */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-white">Selected Team:</div>
                          <button
                            onClick={() => setSelectedTeamId(null)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Change
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-4">
                          <div className="text-center">
                            <div 
                              className="w-8 h-8 rounded-full mx-auto mb-1 ring-2 ring-blue-500"
                              style={{ backgroundColor: gameData?.selectedTeam.color }}
                            />
                            <div className="text-xs text-white font-medium">{gameData?.selectedTeam.name}</div>
                            <div className="text-xs text-blue-400">Selected Team</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Team Analysis Content - Only show when team is selected */}
              {selectedTeamId && gameData && !gameData.isUpcoming ? (
                <>
                  {/* Momentum Tracking */}
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-3">Team Momentum</h3>
                    <div className="space-y-3">
                      {/* Selected Team Momentum */}
                      <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-blue-300 font-medium">{gameData.selectedTeam.name}</span>
                          <span className="text-xs text-blue-400 font-bold">SELECTED</span>
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

                      {/* Opponent Momentum */}
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
              ) : null}

              {/* Live Odds - Always show when game is selected */}
              <div className="p-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {gameData?.isUpcoming ? 'Opening Odds' : 'Live Odds'}
                </h3>
                {isLoadingOdds ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <div className="text-xs text-gray-400">Loading odds...</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Odds Quality Indicator */}
                    <div className="text-xs text-center py-1 px-2 rounded bg-gray-800 border border-gray-600">
                      {getOddsDataMessage(oddsData, gameData?.isUpcoming)}
                    </div>

                    {/* Spread */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Spread</span>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {oddsData?.markets?.spread?.points !== undefined
                            ? formatSpread(oddsData.markets.spread.points)
                            : formatSpread(gameData?.odds?.spread || -2.5)
                          }
                        </div>
                        <div className="text-xs text-gray-400">
                          {oddsData?.markets?.spread?.home !== undefined
                            ? `(${oddsData.markets.spread.home > 0 ? '+' : ''}${oddsData.markets.spread.home})`
                            : '(-110)'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Total</span>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {formatTotal(
                            oddsData?.markets?.total?.points || 
                            gameData?.odds?.total || 
                            218.5
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {oddsData?.markets?.total?.over !== undefined && oddsData?.markets?.total?.under !== undefined
                            ? `(${oddsData.markets.total.over > 0 ? '+' : ''}${oddsData.markets.total.over}/${oddsData.markets.total.under > 0 ? '+' : ''}${oddsData.markets.total.under})`
                            : '(-110/-110)'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Moneyline */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Moneyline</span>
                      <div className="text-right">
                        <div className="text-white font-medium text-sm">
                          {oddsData?.markets?.moneyline?.away !== undefined && oddsData?.markets?.moneyline?.home !== undefined
                            ? formatMoneyline(oddsData.markets.moneyline.home, oddsData.markets.moneyline.away)
                            : formatMoneyline(
                                gameData?.odds?.moneyline?.home || -125,
                                gameData?.odds?.moneyline?.away || +105
                              )
                          }
                        </div>
                        <div className="text-xs text-gray-400">
                          Away / Home
                        </div>
                      </div>
                    </div>

                    {oddsData?.lastUpdate && (
                      <div className="text-xs text-gray-500 mt-3 text-center border-t border-gray-700 pt-2">
                        Updated: {oddsData.lastUpdate}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Game Countdown for Upcoming Games - Show when game is selected, not just team */}
              {gameData?.isUpcoming && (
                <div className="p-4 flex-1 flex items-center justify-center">
                  <GameCountdown 
                    gameStartTime={gameData.gameStartTime ?? null}
                    className=""
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lower Panel */}
        {gameData && (
          <LowerPanel
            mode={view}
            selectedPlayer={selectedPlayer}
            teamInfo={gameData.teamInfo}
            gameId={selectedGameId || undefined}
          />
        )}
      </div>
    </div>
  );
} 