import React from "react";
import { PlayerHoverDetails } from "@/components/ui/player-hover-details";
import { MomentumBar } from "@/components/ui/momentum-bar";
import { getMomentumExplanation, getMomentumActivity } from "@/hooks/useMomentumHelpers";
import { MomentumTimeline } from "@/components/MomentumTimeline";

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

function useMultipleFlasher(rates: number[]) {
  const [flashStates, setFlashStates] = React.useState<boolean[]>(rates.map(() => false));

  React.useEffect(() => {
    const intervals = rates.map((rate, index) => {
      return setInterval(() => {
        setFlashStates(prev => {
          const newStates = [...prev];
          newStates[index] = !newStates[index];
          return newStates;
        });
      }, rate);
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [rates]);

  return flashStates;
}

interface TeamMomentum {
  teamMomentum: Record<string, number>;
  playerMomentum?: Record<string, number>;
}

interface MainMomentumBoxProps {
  teamMomentum: TeamMomentum | null;
  isLoading: boolean;
  error: string | null;
  selectedTeamName?: string | null;
  selectedGameId?: number | null;
  isReplayMode?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshots?: any[];
  currentSnapshotId?: number;
}

function MainMomentumBox({
  teamMomentum,
  isLoading,
  error,
  selectedTeamName,
  selectedGameId,
  isReplayMode = false,
  snapshots = [],
  currentSnapshotId
}: MainMomentumBoxProps) {
  // Calculate flash rates - always calculate consistently
  const BASE_INTERVAL = 1000;
  
  const flashRates = React.useMemo(() => {
    if (!teamMomentum) {
      return [BASE_INTERVAL, BASE_INTERVAL];
    }
    
    const teams = Object.entries(teamMomentum.teamMomentum);
    const team1Momentum = teams[0]?.[1] || 0;
    const team2Momentum = teams[1]?.[1] || 0;
    
    const team1FlashRate = team1Momentum > 0 ? BASE_INTERVAL / (team1Momentum * 0.2) : BASE_INTERVAL;
    const team2FlashRate = team2Momentum > 0 ? BASE_INTERVAL / (team2Momentum * 0.2) : BASE_INTERVAL;
    
    return [team1FlashRate, team2FlashRate];
  }, [teamMomentum]);
  
  // Always call the same hook consistently
  const flashStates = useMultipleFlasher(flashRates);
  const [team1Flashing] = flashStates;
  
  if (isLoading) {
    return <div className="text-gray-400 text-center">Loading team momentum…</div>;
  }
  
  if (error) {
    return <div className="text-red-400 text-center">Error loading team momentum.</div>;
  }
  
  if (!teamMomentum) {
    return <div className="text-gray-400 text-center">Select a team to see momentum.</div>;
  }

  const teams = Object.entries(teamMomentum.teamMomentum);
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 lg:p-8 space-y-6 lg:space-y-8">
      {/* Enhanced Team Momentum Header */}
      <div className="text-center">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">
          {isReplayMode ? 'Game Momentum Replay' : `${selectedTeamName || 'Team'} Live Momentum`}
        </h2>
        <div className="text-sm text-gray-400">
          {isReplayMode ? 'Historical momentum data replay' : 'Real-time performance tracking'}
        </div>
      </div>
      
      {/* Team Momentum Bars */}
      <div className="w-full max-w-4xl space-y-4">
        {teams.length > 0 && teams.map(([teamName, momentum], index) => {
          const isFlashing = index === 0 ? team1Flashing : flashStates[1] || false;
          const teamColor = teamColors[teamName] || (index === 0 ? "#007A33" : "#006BB6");
          
          return (
            <PlayerHoverDetails
              key={teamName}
              playerName={teamName}
              momentum={momentum}
            >
              <MomentumBar
                label={teamName}
                value={momentum}
                maxValue={1}
                minValue={0}
                emoji="🏀"
                explanationTitle="Team Momentum"
                explanationText={getMomentumExplanation('team')}
                recentActivity={getMomentumActivity({ type: 'team', category: 'overall', value: momentum })}
                isFlashing={isFlashing}
                flashColor={teamColor}
                className="border-2 hover:border-gray-500 transition-colors"
                style={{
                  borderColor: isFlashing ? teamColor : "#4B5563",
                  boxShadow: isFlashing ? `0 0 20px ${teamColor}50` : "none"
                }}
              />
            </PlayerHoverDetails>
          );
        })}
      </div>

      {/* Momentum Timeline - Only show in replay mode */}
      {isReplayMode && snapshots.length > 0 && (
        <MomentumTimeline 
          snapshots={snapshots}
          currentSnapshotId={currentSnapshotId}
          className="w-full max-w-5xl"
        />
      )}

      {/* Enhanced Analytics Section */}
      {!isReplayMode && selectedGameId && (
        <div className="w-full max-w-5xl">
          <div className="border-t border-gray-700 pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-medium text-white">
                🧠 PREDICTIVE ANALYTICS
              </div>
              
              {/* Analytics Status */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-400">Live Analysis</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-400">Player Models Active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Analytics Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Team Performance</span>
                <span className="text-xs text-green-400">Active</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {(teams[0]?.[1] * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Current momentum score</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Player Models</span>
                <span className="text-xs text-blue-400">Ready</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">15</div>
              <div className="text-xs text-gray-500">Players with prediction data</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Quarterly Forecast</span>
                <span className="text-xs text-purple-400">Available</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">Q2-Q4</div>
              <div className="text-xs text-gray-500">Prediction quarters</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
            <div className="text-sm text-blue-300 mb-1">💡 Enhanced Analytics Available</div>
            <div className="text-xs text-blue-200">
              Select a player from the sidebar to access quarterly performance predictions and enhanced statistical models.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainMomentumBox; 