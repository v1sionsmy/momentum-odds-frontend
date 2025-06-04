"use client";
import React, { useState } from 'react';
import { ChevronRight, Search, Bell, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveTeams, useUpcomingTeams } from '@/hooks/useLiveGames';
import { useTeamPlayers } from '@/hooks/useGamePlayers';
import { usePlayerMomentum } from '@/hooks/usePlayerMomentum';
import { useTeamMomentum } from '@/hooks/useTeamMomentum';
import { useGameOdds } from '@/hooks/useGameOdds';
import LiveTeamsSidebar from '@/components/LiveTeamsSidebar';
import MainMomentumBox from '@/components/MainMomentumBox';
import PlayerMomentumModule from '@/components/PlayerMomentumModule';

export default function LiveGamesPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const { data: liveTeams, isLoading: isLoadingLiveTeams } = useLiveTeams();
  const { data: upcomingTeams, isLoading: isLoadingUpcomingTeams } = useUpcomingTeams();
  
  // Check if selected team is upcoming
  const selectedTeam = [...(liveTeams || []), ...(upcomingTeams || [])].find(team => team.id === selectedTeamId);
  const isSelectedTeamUpcoming = selectedTeam?.status === 'Scheduled';
  
  // Only fetch live data if the selected game is not upcoming
  const shouldFetchLiveData = selectedGameId && !isSelectedTeamUpcoming;
  
  const { teamMomentum, isLoadingTeamMom, errorTeamMom } = useTeamMomentum(shouldFetchLiveData ? selectedGameId : null);
  const { teamPlayers, isLoadingTeamPlayers } = useTeamPlayers(shouldFetchLiveData ? selectedGameId : null, shouldFetchLiveData ? selectedTeamName : null);
  const { playerMomentum, correlations, currentStats, propLines, isLoadingPM, errorPM } = usePlayerMomentum(shouldFetchLiveData ? selectedGameId : null, shouldFetchLiveData ? selectedPlayerId : null);
  const { oddsData, isLoadingOdds } = useGameOdds(shouldFetchLiveData ? selectedGameId : null);

  const handleTeamSelect = (teamId: string, gameId: number, teamName: string) => {
    setSelectedTeamId(teamId);
    setSelectedGameId(gameId);
    setSelectedTeamName(teamName);
    setSelectedPlayerId(null); // Reset player selection when team changes
  };

  const isLoading = isLoadingLiveTeams || isLoadingUpcomingTeams;
  const totalTeams = (liveTeams?.length || 0) + (upcomingTeams?.length || 0);
  const liveCount = liveTeams?.length || 0;
  const upcomingCount = upcomingTeams?.length || 0;

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Left Sidebar: Live Teams (1/4 width) */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white mb-2">Teams</h2>
          <div className="text-sm text-gray-400">
            {liveCount > 0 && `${liveCount} live`}
            {liveCount > 0 && upcomingCount > 0 && ' • '}
            {upcomingCount > 0 && `${upcomingCount} upcoming`}
            {totalTeams === 0 && 'No teams available'}
          </div>
        </div>

        {/* Teams List */}
        <div className="flex-1 overflow-y-auto p-4">
          <LiveTeamsSidebar
            liveTeams={liveTeams || []}
            upcomingTeams={upcomingTeams || []}
            isLoading={isLoading}
            error={null}
            selectedTeamId={selectedTeamId}
            onSelectTeam={handleTeamSelect}
            onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
            teamPlayers={teamPlayers}
          />
        </div>
      </div>

      {/* Center Content: expanded to 3/4 width */}
      <div className="w-3/4 flex flex-col h-full">
        {/* Top Bar */}
        <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            {/* Simplified Navigation */}
            <div className="flex items-center space-x-2 text-sm">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
              <ChevronRight className="w-4 h-4 text-gray-600" />
              <span className="text-white">Live Betting</span>
            </div>

            {/* Simple Game Info - Just team names */}
            <div className="flex items-center space-x-6">
              {selectedGameId && (
                <div className="text-white font-medium text-sm flex items-center">
                  {isSelectedTeamUpcoming ? (
                    <>
                      {selectedTeamName} vs {selectedTeam?.opponent}
                      <span className="ml-2 px-2 py-1 bg-yellow-500 text-black text-xs rounded">
                        UPCOMING
                      </span>
                    </>
                  ) : (
                    oddsData && `${oddsData.homeTeam} vs ${oddsData.awayTeam}`
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

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-900">
          <div className="min-h-full flex items-start justify-center p-4">
            {isSelectedTeamUpcoming ? (
              <div className="text-gray-400 text-center flex-1 flex items-center justify-center">
                <div className="max-w-md">
                  <div className="text-xl mb-4">🏀 Game Preview</div>
                  <div className="text-lg mb-2 text-white">
                    {selectedTeamName} vs {selectedTeam?.opponent}
                  </div>
                  <div className="text-sm mb-6 leading-relaxed">
                    This game hasn't started yet. Live momentum data, player statistics, and real-time betting markets will be available once the game begins.
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-sm">
                    <div className="text-gray-300 mb-2">Coming Soon:</div>
                    <ul className="text-left space-y-1 text-gray-400">
                      <li>• Real-time momentum tracking</li>
                      <li>• Live betting odds</li>
                      <li>• Player performance metrics</li>
                      <li>• Momentum correlations</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : selectedPlayerId ? (
              <div className="w-full max-w-6xl">
                <PlayerMomentumModule
                  playerMomentum={playerMomentum}
                  correlations={correlations}
                  currentStats={currentStats}
                  propLines={propLines}
                  isLoading={isLoadingPM}
                  error={errorPM}
                />
              </div>
            ) : selectedTeamId ? (
              <div className="w-full max-w-5xl">
                <MainMomentumBox
                  teamMomentum={teamMomentum}
                  isLoading={isLoadingTeamMom}
                  error={errorTeamMom}
                  selectedTeamName={selectedTeamName}
                  selectedGameId={selectedGameId}
                />
              </div>
            ) : (
              <div className="text-gray-400 text-center flex-1 flex items-center justify-center">
                <div>
                  <div className="text-xl mb-2">Select a team to view live betting</div>
                  <div className="text-sm">Choose a team from the sidebar to see momentum and betting markets</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 