"use client";
import React, { useState } from 'react';
import { ChevronRight, Bell, User, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveTeams, useUpcomingTeams } from '@/hooks/useLiveGames';
import { useTeamPlayers } from '@/hooks/useGamePlayers';
import { usePlayerMomentum } from '@/hooks/usePlayerMomentum';
import { useTeamMomentum } from '@/hooks/useTeamMomentum';
import GamesSidebar from '@/components/GamesSidebar';
import GameView from '@/components/GameView';
import TeamView from '@/components/TeamView';
import PlayerView from '@/components/PlayerView';

type ViewLevel = 'game' | 'team' | 'player';

export default function LiveGamesPage() {
  // Navigation state
  const [viewLevel, setViewLevel] = useState<ViewLevel>('game');
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);
  const [showQuarterlyPrediction, setShowQuarterlyPrediction] = useState(false);

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
  const totalTeams = (liveTeams?.length || 0) + (upcomingTeams?.length || 0);
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

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white mb-2">
            {viewLevel === 'game' ? 'Games' : viewLevel === 'team' ? 'Teams' : 'Players'}
          </h2>
          <div className="text-sm text-gray-400">
            {viewLevel === 'game' && (
              <>
                {liveCount > 0 && `${liveCount} live`}
                {liveCount > 0 && upcomingCount > 0 && ' • '}
                {upcomingCount > 0 && `${upcomingCount} upcoming`}
                {totalTeams === 0 && 'No games available'}
              </>
            )}
            {viewLevel === 'team' && selectedGameId && `Game ${selectedGameId} teams`}
            {viewLevel === 'player' && selectedTeamName && `${selectedTeamName} players`}
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
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 flex flex-col h-full">
        {/* Top Bar */}
        <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            {/* Navigation Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
              <ChevronRight className="w-4 h-4 text-gray-600" />
              <span className="text-white">Live Analytics</span>
              
              {/* Back Navigation */}
              {(viewLevel === 'team' || viewLevel === 'player') && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBackNavigation}
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                </>
              )}
            </div>

            {/* Context Info & Controls */}
            <div className="flex items-center space-x-6">
              {selectedGameId && (
                <div className="flex items-center space-x-4">
                  <div className="text-white font-medium text-sm flex items-center">
                    {getGameInfo()}
                    {isSelectedTeamUpcoming && (
                      <span className="ml-2 px-2 py-1 bg-yellow-500 text-black text-xs rounded">
                        UPCOMING
                      </span>
                    )}
                  </div>
                  
                  {/* Enhanced Analytics Toggle for Player Level */}
                  {viewLevel === 'player' && selectedPlayerId && selectedPlayerName && !isSelectedTeamUpcoming && (
                    <Button
                      onClick={() => setShowQuarterlyPrediction(!showQuarterlyPrediction)}
                      size="sm"
                      variant={showQuarterlyPrediction ? "default" : "outline"}
                      className="text-xs"
                    >
                      {showQuarterlyPrediction ? "Live Stats" : "Q4 Prediction"}
                    </Button>
                  )}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-900">
          <div className="min-h-full flex items-start justify-center p-4">
            {!selectedGameId ? (
              <div className="text-gray-400 text-center flex-1 flex items-center justify-center">
                <div>
                  <div className="text-xl mb-2">Select a game to view analytics</div>
                  <div className="text-sm">Choose a game from the sidebar to see team momentum and predictive models</div>
                </div>
              </div>
            ) : isSelectedTeamUpcoming ? (
              <div className="text-gray-400 text-center flex-1 flex items-center justify-center">
                <div className="max-w-md">
                  <div className="text-xl mb-4">🏀 Game Preview</div>
                  <div className="text-lg mb-2 text-white">{getGameInfo()}</div>
                  <div className="text-sm mb-6 leading-relaxed">
                    This game hasn&apos;t started yet. Live momentum data, player statistics, and predictive analytics will be available once the game begins.
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-sm">
                    <div className="text-gray-300 mb-2">Coming Soon:</div>
                    <ul className="text-left space-y-1 text-gray-400">
                      <li>• Real-time momentum tracking</li>
                      <li>• Player prediction models</li>
                      <li>• Quarterly performance analytics</li>
                      <li>• Team momentum analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-6xl">
                {viewLevel === 'game' && (
                  <GameView 
                    gameId={selectedGameId}
                    liveTeams={liveTeams || []}
                    upcomingTeams={upcomingTeams || []}
                    onTeamSelect={handleTeamSelect}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 