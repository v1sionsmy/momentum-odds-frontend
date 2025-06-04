import React from "react";

interface Team {
  id: string;
  name: string;
  gameId: number;
  isHome: boolean;
  score: number;
  opponentScore: number;
  opponent: string;
  status?: string;
}

interface Player {
  player_id: string;
  name: string;
  position: string;
  minutes_played: string;
  team_id: string;
}

interface LiveTeamsSidebarProps {
  liveTeams: Team[];
  upcomingTeams?: Team[];
  isLoading: boolean;
  error: any;
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string, gameId: number, teamName: string) => void;
  onSelectPlayer: (playerId: string) => void;
  teamPlayers: Player[];
}

function LiveTeamsSidebar({
  liveTeams,
  upcomingTeams = [],
  isLoading,
  error,
  selectedTeamId,
  onSelectTeam,
  onSelectPlayer,
  teamPlayers
}: LiveTeamsSidebarProps) {
  if (isLoading) return <div className="text-gray-400">Loading…</div>;
  if (error) return <div className="text-red-400">Error loading teams</div>;
  
  const hasLiveTeams = liveTeams.length > 0;
  const hasUpcomingTeams = upcomingTeams.length > 0;
  
  if (!hasLiveTeams && !hasUpcomingTeams) {
    return <div className="text-gray-400">No live or upcoming teams</div>;
  }

  const renderTeam = (team: Team, isUpcoming: boolean = false) => {
    const isSelected = team.id === selectedTeamId;
    const isWinning = team.score > team.opponentScore;
    
    return (
      <div
        key={team.id}
        className={`p-3 border rounded-lg cursor-pointer ${
          isSelected
            ? "border-green-400 bg-gray-700"
            : "border-gray-700 hover:border-gray-500"
        } ${isUpcoming ? 'opacity-80' : ''}`}
        onClick={() => onSelectTeam(team.id, team.gameId, team.name)}
      >
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-200">
            <span className={`font-bold ${!isUpcoming && isWinning ? 'text-green-400' : 'text-white'}`}>
              {team.name}
            </span>
          </div>
          <div className={`text-xs ${isUpcoming ? 'text-yellow-400' : 'text-green-400'}`}>
            {isUpcoming ? 'UPCOMING' : 'LIVE'}
          </div>
        </div>
        
        {!isUpcoming ? (
          <div className="text-xs text-gray-400 mt-1">
            <span className={isWinning ? 'text-green-400 font-semibold' : ''}>{team.score}</span>
            {' - '}
            <span className={!isWinning ? 'text-red-400 font-semibold' : ''}>{team.opponentScore}</span>
            {' vs '}{team.opponent}
          </div>
        ) : (
          <div className="text-xs text-gray-400 mt-1">
            vs {team.opponent}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-1">
          {team.isHome ? 'Home' : 'Away'}
        </div>

        {/* If this team is selected, show its players */}
        {isSelected && !isUpcoming && (
          <ul className="mt-3 space-y-1 pl-2 border-l-2 border-green-400">
            <li className="text-xs text-gray-400 font-medium mb-1">Players:</li>
            {teamPlayers.map((player) => (
              <li
                key={player.player_id}
                className="text-xs text-gray-300 cursor-pointer hover:text-white hover:bg-gray-600 p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPlayer(player.player_id);
                }}
              >
                <span className="font-medium">{player.name}</span> 
                <span className="text-gray-500"> ({player.position})</span>
                <span className="text-gray-500"> • {player.minutes_played}</span>
              </li>
            ))}
          </ul>
        )}
        
        {/* For upcoming games, show a note that players aren't available */}
        {isSelected && isUpcoming && (
          <div className="mt-3 p-2 bg-gray-700 rounded text-xs text-gray-400">
            Player data available when game starts
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Live Teams Section */}
      {hasLiveTeams && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Live Games
          </h3>
          <div className="space-y-2">
            {liveTeams.map((team) => renderTeam(team, false))}
          </div>
        </div>
      )}
      
      {/* Upcoming Teams Section */}
      {hasUpcomingTeams && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
            Upcoming Games
          </h3>
          <div className="space-y-2">
            {upcomingTeams.map((team) => renderTeam(team, true))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveTeamsSidebar; 