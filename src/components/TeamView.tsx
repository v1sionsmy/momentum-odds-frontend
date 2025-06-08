import React from "react";
import { PlayerHoverDetails } from "@/components/ui/player-hover-details";
import { MomentumBar } from "@/components/ui/momentum-bar";
import { getMomentumExplanation, getMomentumActivity } from "@/hooks/useMomentumHelpers";
import EnhancedQuarterlyPrediction from "@/components/EnhancedQuarterlyPrediction";

interface TeamMomentum {
  teamMomentum: Record<string, number>;
  playerMomentum?: Record<string, number>;
}

interface Player {
  player_id: number;
  full_name: string;
  position: string;
  points: number;
  rebounds: number;
  assists: number;
  minutes_played: number;
  team_name: string;
  team_abbr: string;
}

interface TeamViewProps {
  gameId: number | null;
  teamId: string | null;
  teamName: string | null;
  teamMomentum: TeamMomentum | null;
  isLoading: boolean;
  error: string | null;
  teamPlayers: Player[];
  onPlayerSelect: (playerId: string, playerName?: string) => void;
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

function TeamView({
  gameId,
  teamName,
  teamMomentum,
  isLoading,
  error,
  teamPlayers,
  onPlayerSelect
}: Omit<TeamViewProps, 'teamId'>) {
  const [showQuarterlyPrediction, setShowQuarterlyPrediction] = React.useState(false);

  // Calculate flash rate for team momentum with safe value retrieval
  const BASE_INTERVAL = 1000;
  const teamMomentumValue = getTeamMomentumValue(teamMomentum, teamName);
  const flashRate = teamMomentumValue > 0 ? BASE_INTERVAL / (teamMomentumValue * 0.2) : BASE_INTERVAL;
  const isFlashing = useFlasher(flashRate);
  
  const teamColor = teamName ? teamColors[teamName] || "#007A33" : "#007A33";

  if (isLoading) {
    return <div className="text-gray-400 text-center">Loading team data…</div>;
  }
  
  if (error) {
    return <div className="text-red-400 text-center">Error loading team data: {error}</div>;
  }
  
  if (!teamName) {
    return <div className="text-gray-400 text-center">No team selected</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Team Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          {teamName} Analytics
        </h2>
        <div className="text-sm text-gray-400">
          Team momentum tracking and predictive analytics
        </div>
      </div>

      {/* Team Momentum Section */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Live Team Momentum</h3>
          <div className="text-sm text-gray-400">Real-time performance tracking</div>
        </div>

        {hasTeamMomentumData(teamMomentum, teamName) ? (
          <div className="w-full max-w-4xl mx-auto">
            <PlayerHoverDetails
              playerName={teamName}
              momentum={teamMomentumValue}
            >
              <MomentumBar
                label={teamName}
                value={teamMomentumValue}
                maxValue={1}
                minValue={0}
                emoji="🏀"
                explanationTitle="Team Momentum"
                explanationText={getMomentumExplanation('team')}
                recentActivity={getMomentumActivity({ type: 'team', category: 'overall', value: teamMomentumValue })}
                isFlashing={isFlashing}
                flashColor={teamColor}
                className="border-2 hover:border-gray-500 transition-colors"
                style={{
                  borderColor: isFlashing ? teamColor : "#4B5563",
                  boxShadow: isFlashing ? `0 0 20px ${teamColor}50` : "none"
                }}
              />
            </PlayerHoverDetails>
          </div>
        ) : (
          <div className="text-gray-400 text-center">
            <div className="text-lg mb-2">⏳ Waiting for Momentum Data</div>
            <div className="text-sm">
              {teamMomentum ? 
                `Team momentum tracking will be available once the game begins or data becomes available.` :
                `No momentum data available for ${teamName} at this time.`
              }
            </div>
            {teamMomentum && Object.keys(teamMomentum.teamMomentum || {}).length > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                Available teams: {Object.keys(teamMomentum.teamMomentum).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Quarterly Predictions */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Enhanced Quarterly Predictions</h3>
            <div className="text-sm text-gray-400">AI-powered team performance forecasting</div>
          </div>
          <button
            onClick={() => setShowQuarterlyPrediction(!showQuarterlyPrediction)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showQuarterlyPrediction
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {showQuarterlyPrediction ? 'Hide Predictions' : 'Show Predictions'}
          </button>
        </div>

        {showQuarterlyPrediction ? (
          <EnhancedQuarterlyPrediction
            gameId={gameId || 0}
            playerId={0}
            playerName={teamName || 'Team'}
          />
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-lg mb-2">🎯 Advanced Team Forecasting</div>
            <div className="text-sm">
              Click &quot;Show Predictions&quot; to access quarterly performance analytics and AI-powered team forecasts
            </div>
          </div>
        )}
      </div>

      {/* Team Players Section */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Team Players</h3>
            <div className="text-sm text-gray-400">
              {teamPlayers.length} players • Click any player for individual analytics
            </div>
          </div>
        </div>

        {teamPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamPlayers.map((player) => (
              <div
                key={player.player_id}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer group"
                onClick={() => onPlayerSelect(player.player_id.toString(), player.full_name)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                      {player.full_name}
                    </div>
                    <div className="text-xs text-gray-400">{player.position}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {player.minutes_played} min
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-white font-semibold">{player.points}</div>
                    <div className="text-gray-500">PTS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{player.rebounds}</div>
                    <div className="text-gray-500">REB</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{player.assists}</div>
                    <div className="text-gray-500">AST</div>
                  </div>
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-600">
                  <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    Click for player momentum & predictions →
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-lg mb-2">👥 No Player Data</div>
            <div className="text-sm">
              Player statistics will appear here once the game begins or data becomes available
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamView; 