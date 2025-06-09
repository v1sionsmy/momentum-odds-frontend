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
        {/* Dynamic background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 rounded-3xl blur-3xl animate-pulse"></div>
        
        <div className="relative bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-2xl flex items-center justify-center border border-blue-500/30">
                  <Trophy className="w-8 h-8 text-blue-400" />
                </div>
                {isLiveGame && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {gameTeams.length >= 2 ? `${gameTeams[0].name} vs ${gameTeams[1].name}` : 'Game Analysis'}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                    isLiveGame 
                      ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                      : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                  }`}>
                    {isLiveGame ? (
                      <>
                        <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">LIVE NOW</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">UPCOMING</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{gameTeams.length} Teams</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Game #{gameId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced analytics preview */}
            <div className="text-right">
              <div className="flex items-center justify-end space-x-3 mb-3">
                <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30">
                  <span className="text-green-400 font-bold text-sm">AI POWERED</span>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30">
                  <span className="text-orange-400 font-bold text-sm">LIVE ANALYSIS</span>
                </div>
              </div>
              <div className="text-gray-400">
                <div className="text-sm font-medium">Advanced momentum tracking & ML predictions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {gameTeams.map((team, index) => {
          const colors = getTeamColor(team.name);
          const isPulsing = momentumPulse[`team-${team.id}`];
          const isWinning = index === 0 && team.score !== undefined && gameTeams[1]?.score !== undefined && team.score > gameTeams[1].score;
          
          return (
            <div key={team.id} className="relative group">
              {/* Momentum pulse background */}
              {isPulsing && (
                <div 
                  className="absolute inset-0 rounded-3xl blur-xl opacity-60 animate-pulse"
                  style={{
                    background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`
                  }}
                ></div>
              )}
              
              {/* Enhanced team card */}
              <div 
                className={`relative transform transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
                  isPulsing ? 'shadow-2xl' : 'shadow-xl'
                }`}
                onClick={() => onTeamSelect(team.id, team.name)}
                style={{
                  filter: isPulsing ? `drop-shadow(0 0 20px ${colors.glow})` : undefined
                }}
              >
                <div 
                  className="bg-gradient-to-br from-gray-900/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-500 group-hover:border-blue-500/50"
                  style={{
                    borderColor: isPulsing ? colors.primary : undefined,
                    background: isPulsing 
                      ? `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}05)` 
                      : undefined
                  }}
                >
                  {/* Team Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {/* Team Logo Placeholder */}
                      <div 
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-lg transition-all duration-500 ${
                          isPulsing ? 'shadow-lg animate-pulse' : ''
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                          boxShadow: isPulsing ? `0 0 20px ${colors.glow}` : undefined
                        }}
                      >
                        {getTeamInitials(team.name)}
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                          {team.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors.primary }}
                          ></div>
                          <span className="text-gray-400 text-sm font-medium">
                            {isLiveGame ? 'Playing Now' : 'Scheduled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score and Status */}
                    <div className="text-right">
                      {team.score !== undefined && (
                        <div className={`text-4xl font-bold mb-2 transition-all duration-500 ${
                          isWinning ? 'text-green-400 scale-110' : 'text-white'
                        }`}>
                          {team.score}
                          {isWinning && <Star className="inline w-6 h-6 ml-2 text-yellow-400 animate-pulse" />}
                        </div>
                      )}
                      <div className="text-gray-400 text-sm">
                        {team.status}
                      </div>
                    </div>
                  </div>

                  {/* Momentum Indicators */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 font-medium">Team Momentum</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            isPulsing ? 'animate-pulse' : ''
                          }`}
                          style={{ backgroundColor: isPulsing ? colors.primary : '#6B7280' }}
                        ></div>
                        <span className={`text-sm font-bold ${isPulsing ? 'text-green-400' : 'text-gray-400'}`}>
                          {isPulsing ? 'HIGH' : 'NORMAL'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Momentum bar */}
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          isPulsing ? 'animate-pulse' : ''
                        }`}
                        style={{
                          width: isPulsing ? '85%' : '60%',
                          background: isPulsing 
                            ? `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`
                            : 'linear-gradient(90deg, #6B7280, #9CA3AF)'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Enhanced Call to Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                        <span className="text-blue-400 text-xs font-medium">ANALYTICS</span>
                      </div>
                      <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                        <span className="text-purple-400 text-xs font-medium">PREDICTIONS</span>
                      </div>
                      {isPulsing && (
                        <div className="px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30 animate-pulse">
                          <span className="text-green-400 text-xs font-medium">MOMENTUM</span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      className="group/btn bg-gray-800/50 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300"
                    >
                      <span className="text-blue-400 group-hover/btn:text-blue-300 font-medium">Analyze Team</span>
                      <ChevronRight className="w-4 h-4 ml-2 text-blue-400 group-hover/btn:text-blue-300 group-hover/btn:translate-x-1 transition-all duration-300" />
                    </Button>
                  </div>

                  {/* Enhanced hover effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:via-purple-600/5 group-hover:to-blue-600/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Game Statistics Preview */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
        
        <div className="relative bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Game Analytics Preview</h3>
                <p className="text-gray-400">Real-time insights and predictions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-400 font-medium text-sm">LIVE TRACKING</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/30 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse group-hover:animate-spin"></div>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Momentum Tracking</h4>
              <p className="text-gray-400 text-sm">Real-time team momentum analysis with visual indicators</p>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/30 hover:border-green-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-green-400" />
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse group-hover:animate-bounce"></div>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Player Analysis</h4>
              <p className="text-gray-400 text-sm">Individual player performance and ML predictions</p>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8 text-purple-400" />
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse group-hover:animate-ping"></div>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">AI Predictions</h4>
              <p className="text-gray-400 text-sm">Advanced machine learning models for game outcomes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameView; 