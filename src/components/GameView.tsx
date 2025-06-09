"use client";
import React from 'react';
import { Calendar, Trophy, Users, TrendingUp, Zap, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Team } from '@/hooks/useLiveGames';

interface GameViewProps {
  gameId: number;
  liveTeams: Team[];
  upcomingTeams: Team[];
  onTeamSelect: (teamId: string, teamName: string) => void;
  momentumPulse: Record<string, boolean>;
  teamColors: Record<string, { primary: string; secondary: string; glow: string }>;
}

const GameView: React.FC<GameViewProps> = ({
  gameId,
  liveTeams,
  upcomingTeams,
  onTeamSelect,
  momentumPulse,
  teamColors
}) => {
  const allTeams = [...liveTeams, ...upcomingTeams];
  const gameTeams = allTeams.filter(team => team.gameId === gameId);
  
  if (gameTeams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">No teams found for this game</div>
        <div className="text-gray-500">Game ID: {gameId}</div>
      </div>
    );
  }

  const isLiveGame = gameTeams.some(team => liveTeams.find(liveTeam => liveTeam.id === team.id));
  
  // Get team colors for visual effects
  const getTeamColor = (teamName: string) => {
    return teamColors[teamName] || teamColors.Default;
  };

  // Generate team initials for logo placeholder
  const getTeamInitials = (teamName: string) => {
    return teamName.split(' ').map(word => word[0]).join('').substring(0, 3);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Game Header */}
      <div className="relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 via-green-50/30 to-emerald-50/50 rounded-2xl"></div>
        
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center border border-emerald-200">
                  <Trophy className="w-8 h-8 text-emerald-600" />
                </div>
                {isLiveGame && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {gameTeams.length >= 2 ? `${gameTeams[0].name} vs ${gameTeams[1].name}` : 'Game Analysis'}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
                    isLiveGame 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}>
                    {isLiveGame ? (
                      <>
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-medium text-sm">LIVE NOW</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium text-sm">UPCOMING</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-sm">{gameTeams.length} Teams</span>
                  </div>
            
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium text-sm">Game #{gameId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced analytics preview */}
            <div className="text-right">
              <div className="flex items-center justify-end space-x-3 mb-3">
                <div className="px-3 py-1.5 bg-emerald-100 rounded-lg border border-emerald-200">
                  <span className="text-emerald-700 font-semibold text-sm">AI POWERED</span>
                </div>
                <div className="px-3 py-1.5 bg-green-100 rounded-lg border border-green-200">
                  <span className="text-green-700 font-semibold text-sm">LIVE ANALYSIS</span>
                </div>
              </div>
              <div className="text-gray-600">
                <div className="text-sm font-medium">Real-time momentum tracking & ML predictions</div>
                <div className="text-xs mt-1">Click a team below to see detailed player analytics</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gameTeams.map((team, index) => {
          const colors = getTeamColor(team.name);
          const isPulsing = momentumPulse[`team-${team.id}`];
          const isWinning = index === 0 && team.score !== undefined && gameTeams[1]?.score !== undefined && team.score > gameTeams[1].score;
          
          return (
            <div key={team.id} className="relative group">
              {/* Momentum pulse background */}
              {isPulsing && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/60 via-green-100/40 to-emerald-100/60 rounded-2xl blur-sm"></div>
              )}
              
              {/* Enhanced team card */}
              <div 
                className={`relative transform transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                  isPulsing ? 'shadow-lg shadow-emerald-100' : 'shadow-md'
                }`}
                onClick={() => onTeamSelect(team.id, team.name)}
              >
                <div 
                  className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ${
                    isPulsing 
                      ? 'border-emerald-300 shadow-emerald-100' 
                      : 'border-gray-200 hover:border-emerald-200 hover:shadow-lg'
                  }`}
                >
                  {/* Team Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {/* Team Logo Placeholder */}
                      <div 
                        className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-white text-lg transition-all duration-300 ${
                          isPulsing ? 'shadow-md' : ''
                        }`}
                        style={{
                          backgroundColor: colors.primary
                        }}
                      >
                        {getTeamInitials(team.name)}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
                          {team.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors.primary }}
                          ></div>
                          <span className="text-gray-600 text-sm font-medium">
                            {isLiveGame ? 'Playing Now' : 'Scheduled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score and Status */}
                    <div className="text-right">
                      {team.score !== undefined && (
                        <div className={`text-3xl font-bold mb-2 transition-all duration-300 ${
                          isWinning ? 'text-emerald-600' : 'text-gray-900'
                        }`}>
                          {team.score}
                          {isWinning && <Star className="inline w-5 h-5 ml-2 text-yellow-500" />}
                        </div>
                      )}
                      <div className="text-gray-600 text-sm">
                        {team.status}
                      </div>
                    </div>
                  </div>

                  {/* Momentum Indicators */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-700 font-medium">Team Momentum</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            isPulsing ? 'animate-pulse' : ''
                          }`}
                          style={{ backgroundColor: isPulsing ? colors.primary : '#9CA3AF' }}
                        ></div>
                        <span className={`text-sm font-bold ${isPulsing ? 'text-emerald-700' : 'text-gray-500'}`}>
                          {isPulsing ? 'HIGH' : 'NORMAL'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Momentum bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          isPulsing ? '' : ''
                        }`}
                        style={{
                          width: isPulsing ? '85%' : '60%',
                          backgroundColor: isPulsing ? colors.primary : '#9CA3AF'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Enhanced Call to Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="text-emerald-700 text-xs font-medium">ANALYTICS</span>
                      </div>
                      <div className="px-2 py-1 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-green-700 text-xs font-medium">PREDICTIONS</span>
                      </div>
                      {isPulsing && (
                        <div className="px-2 py-1 bg-yellow-50 rounded-lg border border-yellow-200">
                          <span className="text-yellow-700 text-xs font-medium">MOMENTUM</span>
                        </div>
                      )}
                    </div>
            
                    <Button
                      variant="ghost"
                      className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300"
                    >
                      <span className="font-medium text-sm">Analyze Team</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-all duration-300" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Game Statistics Preview */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 to-green-50/30 rounded-2xl"></div>
        
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center border border-emerald-200">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Game Analytics Preview</h3>
                <p className="text-gray-600">Real-time insights and predictions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700 font-medium text-sm">LIVE TRACKING</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2">Momentum Tracking</h4>
              <p className="text-gray-600 text-sm">Real-time team momentum analysis with visual indicators</p>
            </div>

            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200 hover:border-green-200 hover:bg-green-50/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-6 h-6 text-green-600" />
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2">Player Analysis</h4>
              <p className="text-gray-600 text-sm">Individual player performance and ML predictions</p>
            </div>

            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-6 h-6 text-emerald-600" />
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2">AI Predictions</h4>
              <p className="text-gray-600 text-sm">Advanced machine learning models for game outcomes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameView; 