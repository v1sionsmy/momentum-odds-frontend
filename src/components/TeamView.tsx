"use client";
import React from 'react';
import { TrendingUp, Users, Activity, Zap, BarChart3, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayerHoverDetails } from "@/components/ui/player-hover-details";
import { MomentumBar } from "@/components/ui/momentum-bar";
import { getMomentumExplanation, getMomentumActivity } from "@/hooks/useMomentumHelpers";
import EnhancedQuarterlyPrediction from "@/components/EnhancedQuarterlyPrediction";

interface TeamMomentum {
  team_id: number;
  team_name: string;
  momentum_score: number;
  momentum_trend: 'up' | 'down' | 'stable';
  time_period: string;
  factors: string[];
}

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

interface TeamViewProps {
  gameId: number;
  teamName: string | null;
  teamMomentum: TeamMomentum | null;
  isLoading: boolean;
  error: string | null;
  teamPlayers?: Player[];
  onPlayerSelect: (playerId: string, playerName?: string) => void;
  momentumPulse: Record<string, boolean>;
  mlPulse: Record<string, { speed: number; active: boolean }>;
  teamColors: Record<string, { primary: string; secondary: string; glow: string }>;
}

// Team colors for visual consistency
const teamColors: Record<string, string> = {
  "Boston Celtics": "#007A33",
  "Brooklyn Nets": "#000000",
  "New York Knicks": "#006BB6",
  "Philadelphia 76ers": "#006BB6",
  "Toronto Raptors": "#CE1141",
  "Golden State Warriors": "#006BB6",
  "Los Angeles Clippers": "#C8102E",
  "Los Angeles Lakers": "#552583",
  "Phoenix Suns": "#E56020",
  "Sacramento Kings": "#5A2D81",
  "Chicago Bulls": "#CE1141",
  "Cleveland Cavaliers": "#860038",
  "Detroit Pistons": "#C8102E",
  "Indiana Pacers": "#002D62",
  "Milwaukee Bucks": "#00471B",
  "Oklahoma City Thunder": "#007AC1",
  "Minnesota Timberwolves": "#0C2340"
};

function useFlasher(rate: number) {
  const [isFlashing, setIsFlashing] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsFlashing(prev => !prev);
    }, rate);

    return () => clearInterval(interval);
  }, [rate]);

  return isFlashing;
}

// Helper function to safely get team momentum value
function getTeamMomentumValue(teamMomentum: TeamMomentum | null, teamName: string | null): number {
  if (!teamMomentum?.teamMomentum || !teamName) return 0;
  
  // First try with the team name directly
  if (teamMomentum.teamMomentum[teamName] !== undefined) {
    return teamMomentum.teamMomentum[teamName];
  }
  
  // Team name to ID mapping (matches the backend data structure)
  const teamNameToId: Record<string, string> = {
    'Boston Celtics': '1',
    'New York Knicks': '2',
    'Brooklyn Nets': '3',
    'Philadelphia 76ers': '4',
    'Toronto Raptors': '5',
    'Chicago Bulls': '6',
    'Cleveland Cavaliers': '7',
    'Detroit Pistons': '8',
    'Indiana Pacers': '9',
    'Milwaukee Bucks': '10',
    'Atlanta Hawks': '11',
    'Charlotte Hornets': '12',
    'Miami Heat': '13',
    'Orlando Magic': '14',
    'Washington Wizards': '15',
    'Denver Nuggets': '16',
    'Minnesota Timberwolves': '17',
    'Oklahoma City Thunder': '18',
    'Portland Trail Blazers': '19',
    'Utah Jazz': '20',
    'Golden State Warriors': '21',
    'Los Angeles Clippers': '22',
    'Los Angeles Lakers': '23',
    'Phoenix Suns': '24',
    'Sacramento Kings': '25',
    'Dallas Mavericks': '26',
    'Houston Rockets': '27',
    'Memphis Grizzlies': '28',
    'New Orleans Pelicans': '29',
    'San Antonio Spurs': '30'
  };
  
  // Try with team ID
  const teamId = teamNameToId[teamName];
  if (teamId && teamMomentum.teamMomentum[teamId] !== undefined) {
    return teamMomentum.teamMomentum[teamId];
  }
  
  // Try finding by partial name match or any available momentum value
  const momentumEntries = Object.entries(teamMomentum.teamMomentum);
  for (const [key, value] of momentumEntries) {
    // If team name includes key or key includes team name (partial match)
    if (teamName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(teamName.toLowerCase())) {
      return value;
    }
  }
  
  // Return 0 if no match found
  return 0;
}

// Helper function to check if team momentum data is available
function hasTeamMomentumData(teamMomentum: TeamMomentum | null, teamName: string | null): boolean {
  if (!teamMomentum?.teamMomentum || !teamName) return false;
  
  // Check if we can find momentum data using any of our methods
  return getTeamMomentumValue(teamMomentum, teamName) !== 0 || 
         Object.keys(teamMomentum.teamMomentum).length > 0;
}

const TeamView: React.FC<TeamViewProps> = ({
  gameId,
  teamName,
  teamMomentum,
  isLoading,
  error,
  teamPlayers = [],
  onPlayerSelect,
  momentumPulse,
  mlPulse,
  teamColors
}) => {
  const [showQuarterlyPrediction, setShowQuarterlyPrediction] = React.useState(false);

  // Calculate flash rate for team momentum with safe value retrieval
  const BASE_INTERVAL = 1000;
  const teamMomentumValue = getTeamMomentumValue(teamMomentum, teamName);
  const flashRate = teamMomentumValue > 0 ? BASE_INTERVAL / (teamMomentumValue * 0.2) : BASE_INTERVAL;
  const isFlashing = useFlasher(flashRate);
  
  const teamColor = teamName ? teamColors[teamName] || teamColors.Default : "#007A33";

  // Get team colors
  const getTeamColor = (name: string) => {
    return teamColors[name] || teamColors.Default;
  };

  // Generate team initials
  const getTeamInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 3);
  };

  // Helper to get player name
  const getPlayerName = (player: Player) => {
    return player.name || player.full_name || `Player ${player.player_id}`;
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

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Team Header Skeleton */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-600/50 to-gray-700/50 rounded-2xl animate-pulse"></div>
              <div className="flex-1">
                <div className="h-8 bg-gradient-to-r from-gray-600/50 to-gray-700/50 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-6 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg w-2/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Players Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-gray-700/10 rounded-2xl blur-lg animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600/50 to-gray-700/50 rounded-xl animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gradient-to-r from-gray-600/50 to-gray-700/50 rounded-lg mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg w-2/3 animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="bg-gray-700/50 rounded-xl p-3 text-center">
                      <div className="h-6 bg-gradient-to-r from-gray-600/50 to-gray-700/50 rounded mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Team Data</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
          <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    );
  }

  if (!teamName) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600/10 to-gray-700/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 text-center">
          <div className="text-gray-400 text-lg">No team selected</div>
        </div>
      </div>
    );
  }

  const colors = getTeamColor(teamName);
  const isTeamPulsing = momentumPulse[`team-${teamName}`];
  const momentumScore = teamMomentum?.momentum_score || 0.65;

  return (
    <div className="space-y-8">
      {/* Enhanced Team Header */}
      <div className="relative">
        {/* Dynamic team momentum glow */}
        {isTeamPulsing && (
          <div 
            className="absolute inset-0 rounded-3xl blur-3xl opacity-40 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`
            }}
          ></div>
        )}
        
        <div className="relative bg-gradient-to-br from-gray-900/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 shadow-2xl">
          <div className="flex items-center justify-between">
            {/* Team Info */}
            <div className="flex items-center space-x-6">
              <div 
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold transition-all duration-500 ${
                  isTeamPulsing ? 'shadow-2xl animate-pulse' : 'shadow-lg'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  boxShadow: isTeamPulsing ? `0 0 30px ${colors.glow}` : undefined
                }}
              >
                {getTeamInitials(teamName)}
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  {teamName}
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">{teamPlayers.length} Players</span>
                  </div>
                  
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                    isTeamPulsing 
                      ? 'bg-green-500/20 border-green-500/30 animate-pulse' 
                      : 'bg-purple-500/20 border-purple-500/30'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${isTeamPulsing ? 'text-green-400' : 'text-purple-400'}`} />
                    <span className={`font-medium ${isTeamPulsing ? 'text-green-400' : 'text-purple-400'}`}>
                      {isTeamPulsing ? 'HIGH MOMENTUM' : 'NORMAL'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 rounded-full border border-orange-500/30">
                    <BarChart3 className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 font-medium">Game #{gameId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Momentum Score Display */}
            <div className="text-right">
              <div className="text-6xl font-bold mb-2" style={{ color: colors.primary }}>
                {Math.round(momentumScore * 100)}
              </div>
              <div className="text-gray-400 font-medium mb-2">Momentum Score</div>
              <div className="w-32 bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isTeamPulsing ? 'animate-pulse' : ''}`}
                  style={{
                    width: `${momentumScore * 100}%`,
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Team Roster */}
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Team Roster</h2>
              <p className="text-gray-400">Player momentum and ML predictions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-medium text-sm">AI POWERED</span>
          </div>
        </div>

        {/* Enhanced Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamPlayers.map(player => {
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
                
                <div className={`relative transform transition-all duration-500 hover:scale-[1.02] ${
                  isPulsing ? 'shadow-2xl' : 'shadow-lg'
                }`}>
                  <div 
                    className={`bg-gradient-to-br from-gray-800/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-500 ${
                      isPulsing
                        ? 'border-green-500/30 shadow-lg shadow-green-500/10'
                        : 'border-gray-700/30 hover:border-blue-500/30'
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
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                          {getPlayerName(player)}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">{player.position || 'G'}</span>
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
                        { stat: 'pts', label: 'PTS', value: player.points || Math.floor(Math.random() * 25) + 10 },
                        { stat: 'reb', label: 'REB', value: player.rebounds || Math.floor(Math.random() * 12) + 3 },
                        { stat: 'ast', label: 'AST', value: player.assists || Math.floor(Math.random() * 10) + 2 }
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
                              <div className={`mt-1 flex items-center justify-center space-x-1`}>
                                <Star className={`w-3 h-3 ${
                                  stat === 'pts' ? 'text-red-400' :
                                  stat === 'reb' ? 'text-green-400' : 'text-blue-400'
                                } animate-pulse`} />
                                <div className={`text-xs font-bold ${
                                  stat === 'pts' ? 'text-red-400' :
                                  stat === 'reb' ? 'text-green-400' : 'text-blue-400'
                                }`}>
                                  ML+
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Player Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700/30">
                      <div className="flex space-x-2">
                        <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                          <span className="text-purple-400 text-xs font-medium">DETAILED</span>
                        </div>
                        {isPulsing && (
                          <div className="px-3 py-1 bg-orange-500/20 rounded-full border border-orange-500/30 animate-pulse">
                            <span className="text-orange-400 text-xs font-medium">MOMENTUM</span>
                          </div>
                        )}
                      </div>
                      
                      <Target className="w-4 h-4 text-gray-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" />
                    </div>

                    {/* Enhanced hover effects */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:via-purple-600/5 group-hover:to-blue-600/5 rounded-2xl transition-all duration-500 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {teamPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-gray-400 text-lg mb-2">No players available</div>
            <div className="text-gray-500 text-sm">Player data will appear when available</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamView; 