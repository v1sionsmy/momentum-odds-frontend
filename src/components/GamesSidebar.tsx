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

type ViewLevel = 'game' | 'team' | 'player';

interface GamesSidebarProps {
  viewLevel: ViewLevel;
  liveTeams: Team[];
  upcomingTeams: Team[];
  teamPlayers: Player[];
  isLoading: boolean;
  selectedGameId: number | null;
  selectedTeamId: string | null;
  selectedPlayerId: string | null;
  onGameSelect: (gameId: number) => void;
  onTeamSelect: (teamId: string, teamName: string) => void;
  onPlayerSelect: (playerId: string, playerName?: string) => void;
}

function GamesSidebar({
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
  onPlayerSelect
}: GamesSidebarProps) {
  if (isLoading) return <div className="text-gray-400">Loading…</div>;
  
  const hasLiveTeams = liveTeams.length > 0;
  const hasUpcomingTeams = upcomingTeams.length > 0;
  
  if (!hasLiveTeams && !hasUpcomingTeams) {
    return <div className="text-gray-400">No games available</div>;
  }

  // Group teams by game
  const getGamesList = () => {
    const allTeams = [...liveTeams, ...upcomingTeams];
    const gameMap = new Map<number, { teams: Team[]; isLive: boolean }>();
    
    allTeams.forEach(team => {
      if (!gameMap.has(team.gameId)) {
        gameMap.set(team.gameId, { 
          teams: [], 
          isLive: liveTeams.some(t => t.gameId === team.gameId) 
        });
      }
      gameMap.get(team.gameId)!.teams.push(team);
    });
    
    return Array.from(gameMap.entries()).map(([gameId, { teams, isLive }]) => ({
      gameId,
      teams,
      isLive,
      isUpcoming: !isLive
    }));
  };

  const getTeamsForGame = (gameId: number) => {
    const allTeams = [...liveTeams, ...upcomingTeams];
    return allTeams.filter(team => team.gameId === gameId);
  };

  // GAME LEVEL VIEW
  if (viewLevel === 'game') {
    const games = getGamesList();
    
    return (
      <div className="space-y-4">
        {/* Live Games */}
        {games.filter(game => game.isLive).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Live Games
            </h3>
            <div className="space-y-2">
              {games.filter(game => game.isLive).map(({ gameId, teams }) => (
                <div
                  key={gameId}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedGameId === gameId
                      ? "border-green-400 bg-gray-700"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                  onClick={() => onGameSelect(gameId)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-white">
                      {teams.length >= 2 ? `${teams[0].name} vs ${teams[1].name}` : `Game ${gameId}`}
                    </div>
                    <div className="text-xs text-green-400">LIVE</div>
                  </div>
                  
                  {teams.length >= 2 && (
                    <div className="text-xs text-gray-400">
                      {teams[0].score} - {teams[1].score}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-1">
                    Game ID: {gameId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Games */}
        {games.filter(game => game.isUpcoming).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Upcoming Games
            </h3>
            <div className="space-y-2">
              {games.filter(game => game.isUpcoming).map(({ gameId, teams }) => (
                <div
                  key={gameId}
                  className={`p-3 border rounded-lg cursor-pointer opacity-80 transition-colors ${
                    selectedGameId === gameId
                      ? "border-yellow-400 bg-gray-700"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                  onClick={() => onGameSelect(gameId)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-white">
                      {teams.length >= 2 ? `${teams[0].name} vs ${teams[1].name}` : `Game ${gameId}`}
                    </div>
                    <div className="text-xs text-yellow-400">UPCOMING</div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    Game ID: {gameId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // TEAM LEVEL VIEW
  if (viewLevel === 'team' && selectedGameId) {
    const teams = getTeamsForGame(selectedGameId);
    const isUpcoming = teams.length > 0 && teams[0].status === 'Scheduled';
    
    return (
      <div className="space-y-2">
        {teams.map((team) => (
          <div
            key={team.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedTeamId === team.id
                ? "border-blue-400 bg-gray-700"
                : "border-gray-700 hover:border-gray-500"
            } ${isUpcoming ? 'opacity-80' : ''}`}
            onClick={() => onTeamSelect(team.id, team.name)}
          >
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-200">
                <span className={`font-bold ${!isUpcoming && team.score > team.opponentScore ? 'text-green-400' : 'text-white'}`}>
                  {team.name}
                </span>
              </div>
              <div className={`text-xs ${isUpcoming ? 'text-yellow-400' : 'text-green-400'}`}>
                {team.isHome ? 'HOME' : 'AWAY'}
              </div>
            </div>
            
            {!isUpcoming ? (
              <div className="text-xs text-gray-400 mt-1">
                <span className={team.score > team.opponentScore ? 'text-green-400 font-semibold' : ''}>{team.score}</span>
                {' - '}
                <span className={team.score <= team.opponentScore ? 'text-red-400 font-semibold' : ''}>{team.opponentScore}</span>
                {' vs '}{team.opponent}
              </div>
            ) : (
              <div className="text-xs text-gray-400 mt-1">
                vs {team.opponent}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // PLAYER LEVEL VIEW
  if (viewLevel === 'player' && selectedTeamId) {
    if (teamPlayers.length === 0) {
      return (
        <div className="text-gray-400 text-center p-4">
          <div className="text-sm">No players found</div>
          <div className="text-xs mt-1">Player data may not be available yet</div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {teamPlayers.map((player) => (
          <div
            key={player.player_id}
            className={`p-2 border rounded cursor-pointer transition-colors ${
              selectedPlayerId === player.player_id.toString()
                ? "border-purple-400 bg-gray-700"
                : "border-gray-700 hover:border-gray-500"
            }`}
            onClick={() => onPlayerSelect(player.player_id.toString(), player.full_name)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-white">{player.full_name}</span>
              <span className="text-xs text-gray-400">{player.position}</span>
            </div>
            
            <div className="text-xs text-gray-500 flex justify-between">
              <span>{player.minutes_played} min</span>
              <span>{player.points}pts • {player.rebounds}reb • {player.assists}ast</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="text-gray-400">Invalid view level</div>;
}

export default GamesSidebar; 