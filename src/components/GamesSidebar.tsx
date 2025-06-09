"use client";
import React from 'react';
import { Calendar, Users, Zap, TrendingUp, Activity, ChevronRight } from 'lucide-react';
import { Team } from '@/hooks/useLiveGames';

// Player interface definition (matching useGamePlayers.ts structure but with flexible name field)
interface Player {
  player_id: number;
  name?: string;
  full_name?: string;
  position?: string;
  points?: number;
  rebounds?: number;
  assists?: number;
  minutes_played?: number;
  team_name?: string;
  team_abbr?: string;
}

interface GamesSidebarProps {
  viewLevel: 'game' | 'team' | 'player';
  liveTeams: Team[];
  upcomingTeams: Team[];
  teamPlayers?: Player[];
  isLoading: boolean;
  selectedGameId: number | null;
  selectedTeamId: string | null;
  selectedPlayerId: string | null;
  onGameSelect: (gameId: number) => void;
  onTeamSelect: (teamId: string, teamName: string) => void;
  onPlayerSelect: (playerId: string, playerName?: string) => void;
  momentumPulse: Record<string, boolean>;
  mlPulse: Record<string, { speed: number; active: boolean }>;
  teamColors: Record<string, { primary: string; secondary: string; glow: string }>;
}

const GamesSidebar: React.FC<GamesSidebarProps> = ({
  viewLevel,
  liveTeams,
  upcomingTeams,
  teamPlayers,
  isLoading,
  selectedGameId,
  selectedTeamId,
  selectedPlayerId,
  onGameSelect,
  onTeamSelect,
  onPlayerSelect,
  momentumPulse,
  mlPulse,
  teamColors
}) => {
  // Get team colors
  const getTeamColor = (teamName: string) => {
    return teamColors[teamName] || teamColors.Default;
  };

  // Generate team initials
  const getTeamInitials = (teamName: string) => {
    return teamName.split(' ').map(word => word[0]).join('').substring(0, 3);
  };

  // Get ML pulse style for stats
  const getMlPulseStyle = (playerId: number, stat: string) => {
    const key = `${playerId}-${stat}`;
    const pulse = mlPulse[key];
    if (!pulse?.active) return {};
    
    const colors = {
      pts: '#EF4444', // red
      reb: '#10B981', // green
      ast: '#3B82F6'  // blue
    };
    
    return {
      boxShadow: `0 0 15px ${colors[stat as keyof typeof colors] || '#6B7280'}`,
      animation: `pulse ${pulse.speed}ms infinite`
    };
  };

  // Helper to get player name (either name or full_name)
  const getPlayerName = (player: Player) => {
    return player.name || player.full_name || `Player ${player.player_id}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="relative">
            {/* Loading shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl animate-pulse"></div>
            
            <div className="relative bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-150 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-3 bg-gray-150 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-150 rounded w-4/5 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (viewLevel === 'game') {
    const allTeams = [...liveTeams, ...upcomingTeams];
    const games = Array.from(new Set(allTeams.map(team => team.gameId)))
      .map(gameId => ({
        gameId,
        teams: allTeams.filter(team => team.gameId === gameId),
        isLive: allTeams.filter(team => team.gameId === gameId).some(team => 
          liveTeams.find(liveTeam => liveTeam.id === team.id)
        )
      }));
    
    // Separate live and upcoming games
    const liveGames = games.filter(game => game.isLive);
    const upcomingGames = games.filter(game => !game.isLive);
    
    const renderGame = (gameData: typeof games[0]) => {
      const { gameId, teams, isLive } = gameData;
      const isSelected = selectedGameId === gameId;
      const gameHasMomentum = teams.some(team => momentumPulse[`team-${team.id}`]);
      
      return (
        <div
          key={gameId}
          className="relative group cursor-pointer"
          onClick={() => onGameSelect(gameId)}
        >
          {/* Selected game indicator */}
          {isSelected && (
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-500 rounded-r-full z-10"></div>
          )}
          
          {/* Momentum glow effect */}
          {gameHasMomentum && (
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 via-green-100/60 to-emerald-100/50 rounded-xl blur-sm"></div>
          )}
          
          <div className={`relative transform transition-all duration-300 ${
            isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
          }`}>
            <div 
              className={`bg-white rounded-xl p-4 border transition-all duration-300 shadow-sm ${
                isSelected 
                  ? 'border-blue-500 shadow-blue-200 bg-blue-50 ring-2 ring-blue-200' 
                  : gameHasMomentum
                    ? 'border-green-200 shadow-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isLive 
                      ? 'bg-emerald-100 border border-emerald-200' 
                      : 'bg-gray-100 border border-gray-200'
                  }`}>
                    {isLive ? (
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    ) : (
                      <Calendar className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  
                  <div>
                    <div className={`text-base font-semibold transition-colors duration-300 ${
                      isSelected 
                        ? 'text-blue-900' 
                        : 'text-gray-900 group-hover:text-emerald-700'
                    }`}>
                      Game #{gameId}
                    </div>
                    <div className={`text-xs font-medium ${
                      isLive ? 'text-emerald-600' : isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {isLive ? 'LIVE' : 'UPCOMING'}
                    </div>
                  </div>
                </div>

                {gameHasMomentum && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-100 rounded-lg border border-emerald-200">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 text-xs font-medium">HIGH</span>
                  </div>
                )}
              </div>
              
              {/* Teams Display */}
              <div className="space-y-2">
                {teams.slice(0, 2).map((team) => {
                  const colors = getTeamColor(team.name);
                  const isPulsing = momentumPulse[`team-${team.id}`];
                  
                  return (
                    <div 
                      key={team.id}
                      className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
                        isPulsing 
                          ? 'bg-emerald-50 border border-emerald-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                            isPulsing ? 'shadow-sm' : ''
                          }`}
                          style={{
                            backgroundColor: colors.primary
                          }}
                        >
                          {getTeamInitials(team.name)}
                        </div>
                        
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${
                            isPulsing ? 'text-emerald-900' : 'text-gray-900'
                          }`}>
                            {team.name}
                          </div>
                          <div className={`text-xs ${
                            isPulsing ? 'text-emerald-600' : 'text-gray-500'
                          }`}>
                            {team.isHome ? 'Home' : 'Away'} • {team.score || 0} pts
                          </div>
                        </div>
                      </div>

                      {isPulsing && (
                        <div className="flex items-center space-x-1">
                          <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action indicator */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">Click to analyze</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors duration-300" />
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-3">
        {liveGames.map(renderGame)}
        {upcomingGames.map(renderGame)}
      </div>
    );
  }

  if (viewLevel === 'team' && selectedGameId) {
    const allTeams = [...liveTeams, ...upcomingTeams];
    const gameTeams = allTeams.filter(team => team.gameId === selectedGameId);
    
    return (
      <div className="space-y-4">
        {gameTeams.map(team => {
          const isSelected = selectedTeamId === team.id;
          const colors = getTeamColor(team.name);
          const isPulsing = momentumPulse[`team-${team.id}`];
          
          return (
          <div
            key={team.id}
              className="relative group cursor-pointer"
            onClick={() => onTeamSelect(team.id, team.name)}
          >
              {/* Team momentum glow */}
              {isPulsing && (
                <div 
                  className="absolute inset-0 rounded-2xl blur-xl opacity-50 animate-pulse"
                  style={{
                    background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`
                  }}
                ></div>
              )}
              
              <div className={`relative transform transition-all duration-500 ${
                isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
              }`}>
                <div 
                  className={`bg-gradient-to-br from-gray-800/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-500 ${
                    isSelected 
                      ? 'border-blue-500/50 shadow-xl shadow-blue-500/20' 
                      : isPulsing
                        ? `border-[${colors.primary}]/30 shadow-lg`
                        : 'border-gray-700/30 hover:border-gray-600/50'
                  }`}
                  style={{
                    borderColor: isPulsing ? colors.primary : undefined,
                    background: isPulsing 
                      ? `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}05)` 
                      : undefined
                  }}
                >
                  {/* Team Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-lg font-bold transition-all duration-500 ${
                        isPulsing ? 'shadow-lg animate-pulse' : ''
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        boxShadow: isPulsing ? `0 0 20px ${colors.glow}` : undefined
                      }}
                    >
                      {getTeamInitials(team.name)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                  {team.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors.primary }}
                        ></div>
                        <span className="text-gray-400 text-sm">
                          {team.status || 'Active'}
                        </span>
                      </div>
                    </div>

                    {team.score !== undefined && (
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">
                          {team.score}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Momentum Indicator */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm font-medium">Team Momentum</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            isPulsing ? 'animate-pulse' : ''
                          }`}
                          style={{ backgroundColor: isPulsing ? colors.primary : '#6B7280' }}
                        ></div>
                        <span className={`text-xs font-bold ${isPulsing ? 'text-green-400' : 'text-gray-400'}`}>
                          {isPulsing ? 'HIGH' : 'NORMAL'}
                </span>
              </div>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${isPulsing ? 'animate-pulse' : ''}`}
                        style={{
                          width: isPulsing ? '85%' : '60%',
                          background: isPulsing 
                            ? `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`
                            : 'linear-gradient(90deg, #6B7280, #9CA3AF)'
                        }}
                      ></div>
              </div>
            </div>
            
                  {/* Action Indicators */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                        <span className="text-blue-400 text-xs font-medium">ROSTER</span>
              </div>
                      {isPulsing && (
                        <div className="px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30 animate-pulse">
                          <span className="text-green-400 text-xs font-medium">MOMENTUM</span>
              </div>
            )}
          </div>
                    
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (viewLevel === 'player' && teamPlayers) {
      return (
      <div className="space-y-4">
        {teamPlayers.map(player => {
          const isSelected = selectedPlayerId === player.player_id.toString();
          const isPulsing = momentumPulse[`player-${player.player_id}`];

    return (
          <div
            key={player.player_id}
              className="relative group cursor-pointer"
              onClick={() => onPlayerSelect(player.player_id.toString(), getPlayerName(player))}
            >
              {/* Player momentum glow */}
              {isPulsing && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-600/30 to-purple-600/20 rounded-2xl blur-xl animate-pulse"></div>
              )}
              
              <div className={`relative transform transition-all duration-500 ${
                isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
              }`}>
                <div 
                  className={`bg-gradient-to-br from-gray-800/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-500 ${
                    isSelected 
                      ? 'border-blue-500/50 shadow-xl shadow-blue-500/20' 
                      : isPulsing
                        ? 'border-green-500/30 shadow-lg shadow-green-500/10'
                        : 'border-gray-700/30 hover:border-gray-600/50'
                  }`}
                >
                  {/* Player Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-xl flex items-center justify-center border border-blue-500/30 ${
                      isPulsing ? 'animate-pulse shadow-lg' : ''
                    }`}>
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                        {getPlayerName(player)}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">#{player.player_id}</span>
                        {isPulsing && (
                          <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30 animate-pulse">
                            <Activity className="w-3 h-3 text-green-400" />
                            <span className="text-green-400 text-xs font-bold">HOT</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Player Stats with ML Pulse Effects */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { stat: 'pts', label: 'PTS', value: Math.floor(Math.random() * 25) + 10 },
                      { stat: 'reb', label: 'REB', value: Math.floor(Math.random() * 12) + 3 },
                      { stat: 'ast', label: 'AST', value: Math.floor(Math.random() * 10) + 2 }
                    ].map(({ stat, label, value }) => {
                      const pulse = mlPulse[`${player.player_id}-${stat}`];
                      
                      return (
                        <div 
                          key={stat}
                          className={`bg-gray-700/50 rounded-xl p-3 text-center transition-all duration-300 ${
                            pulse?.active ? 'shadow-lg' : 'hover:bg-gray-600/50'
                          }`}
                          style={getMlPulseStyle(player.player_id, stat)}
                        >
                          <div className="text-2xl font-bold text-white mb-1">
                            {value}
                          </div>
                          <div className="text-xs text-gray-400 font-medium">
                            {label}
                          </div>
                          {pulse?.active && (
                            <div className={`mt-1 text-xs font-bold ${
                              stat === 'pts' ? 'text-red-400' :
                              stat === 'reb' ? 'text-green-400' : 'text-blue-400'
                            }`}>
                              ML+
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Player Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                        <span className="text-purple-400 text-xs font-medium">ANALYSIS</span>
                      </div>
                      {isPulsing && (
                        <div className="px-3 py-1 bg-orange-500/20 rounded-full border border-orange-500/30 animate-pulse">
                          <span className="text-orange-400 text-xs font-medium">MOMENTUM</span>
                        </div>
                      )}
            </div>
            
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="text-gray-400 mb-4">No data available</div>
      <div className="text-sm text-gray-500">Please check your selection</div>
    </div>
  );
};

export default GamesSidebar; 