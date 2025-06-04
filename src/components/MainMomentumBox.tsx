import React, { useEffect, useState, useMemo } from "react";
import { MomentumBar } from "./ui/momentum-bar";
import { TeamPropProgressCard } from "./ui/team-prop-progress-card";
import { HelpTooltip } from "./ui/help-tooltip";
import { PlayerHoverDetails } from "./ui/player-hover-details";
import { getMomentumActivity, getMomentumExplanation } from "@/hooks/useMomentumHelpers";
import { useTeamProps } from "@/hooks/useTeamProps";

// Team color mapping
const teamColors: Record<string, string> = {
  "Boston Celtics": "#007A33",
  "New York Knicks": "#006BB6", 
  "Los Angeles Lakers": "#552583",
  "Golden State Warriors": "#1D428A",
  "Miami Heat": "#98002E",
  "Chicago Bulls": "#CE1141",
  "Denver Nuggets": "#0E2240",
  "Phoenix Suns": "#1D1160",
  "Dallas Mavericks": "#00538C",
  "San Antonio Spurs": "#C4CED4"
};

// Consistent flashing hook that matches PlayerMomentumModule
function useMultipleFlasher(rates: number[]) {
  const [flashStates, setFlashStates] = useState<boolean[]>(() => 
    rates.map(() => false)
  );

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    
    rates.forEach((rate, index) => {
      if (rate > 0) {
        const interval = setInterval(() => {
          setFlashStates(prev => {
            const newStates = [...prev];
            newStates[index] = !newStates[index];
            return newStates;
          });
        }, rate);
        intervals.push(interval);
      }
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
  error: any;
  selectedTeamName?: string | null;
  selectedGameId?: number | null;
}

function MainMomentumBox({
  teamMomentum,
  isLoading,
  error,
  selectedTeamName,
  selectedGameId
}: MainMomentumBoxProps) {
  // Calculate flash rates - always calculate consistently
  const BASE_INTERVAL = 1000;
  
  // Add team props data
  const { teamProps, isLoading: isLoadingProps } = useTeamProps(selectedGameId || null);
  
  const flashRates = useMemo(() => {
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
  const [team1Flashing, team2Flashing] = flashStates;
  
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
  
  // Get team colors (fallback to default colors if not found)
  const team1Color = selectedTeamName ? teamColors[selectedTeamName] || "#007A33" : "#007A33";
  const team2Color = "#CE1141"; // Default to a contrasting color for opponent
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 lg:p-8 space-y-6 lg:space-y-8">
      {/* Simplified Team Momentum Header */}
      <div className="text-center">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">
          {selectedTeamName || 'Team'} Live Momentum
        </h2>
        <div className="text-sm text-gray-400">Real-time performance tracking</div>
      </div>
      
      {/* Single Team Momentum Bar */}
      <div className="w-full max-w-2xl">
        {teams.length > 0 && (() => {
          // Find the selected team's data or use the first team
          const selectedTeamData = teams.find(([teamId]) => {
            // If we have a selected team name, try to match it
            if (selectedTeamName) {
              return teamId === selectedTeamName || teamId === "18"; // Assuming selected team has ID 18
            }
            return true; // Default to first team
          }) || teams[0];
          
          const [teamId, momentum] = selectedTeamData;
          const isFlashing = team1Flashing; // Use the flashing state
          const teamColor = team1Color;
          const teamName = selectedTeamName || `Team ${teamId}`;
          
          return (
            <PlayerHoverDetails
              key={teamId}
              playerName={teamName}
              momentum={momentum}
            >
              <MomentumBar
                label={teamName}
                value={momentum}
                maxValue={10}
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
        })()}
      </div>

      {/* Enhanced Team Betting Markets Section - Only for selected team */}
      {!isLoadingProps && Object.keys(teamProps).length > 0 && (
        <div className="w-full max-w-5xl">
          {/* Simplified Section Header */}
          <div className="border-t border-gray-700 pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-medium text-white">
                💰 LIVE BETTING
              </div>
              
              {/* Simplified Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400">Surging</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-400">High Confidence</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Show only the selected team's markets */}
          {Object.entries(teamProps).map(([teamId, markets]) => {
            const teamName = markets[0]?.team_name || `Team ${teamId}`;
            
            // Only show if this is the selected team or if no specific team is selected, show the first one
            const isSelectedTeam = selectedTeamName ? teamName === selectedTeamName : teamId === Object.keys(teamProps)[0];
            
            if (!isSelectedTeam) return null;
            
            // Filter to core markets and prioritize by importance
            const coreMarkets = markets.filter(market => 
              ['moneyline', 'spread', 'team_total'].includes(market.market_type)
            );
            
            // Sort by momentum (surging first, then high confidence)
            const sortedMarkets = coreMarkets.sort((a, b) => {
              if (a.surging && !b.surging) return -1;
              if (!a.surging && b.surging) return 1;
              if (a.market_confidence === 'high' && b.market_confidence !== 'high') return -1;
              if (a.market_confidence !== 'high' && b.market_confidence === 'high') return 1;
              return 0;
            });
            
            const surgingCount = sortedMarkets.filter(market => market.surging).length;
            
            return (
              <div key={teamId}>
                {/* Simplified Team Header */}
                <div className="flex items-center justify-between mb-4 p-3 bg-[#1A1F26] rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">{teamName}</span>
                    {surgingCount > 0 && (
                      <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded-full">
                        🔥 {surgingCount} surging
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {sortedMarkets.length} markets
                  </div>
                </div>
                
                {/* Market Cards Grid - Show all core markets for the selected team */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedMarkets.map((market) => (
                    <TeamPropProgressCard
                      key={`${market.team_id}-${market.market_type}`}
                      teamName={market.team_name}
                      marketType={market.market_type}
                      currentOdds={market.current_odds}
                      openingOdds={market.opening_odds}
                      line={market.line}
                      surging={market.surging}
                      movementDirection={market.movement_direction}
                      movementMagnitude={market.movement_magnitude}
                      impliedProbability={market.implied_probability}
                      marketConfidence={market.market_confidence}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MainMomentumBox; 