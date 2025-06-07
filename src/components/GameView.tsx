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

interface GameViewProps {
  gameId: number;
  liveTeams: Team[];
  upcomingTeams: Team[];
  onTeamSelect: (teamId: string, teamName: string) => void;
}

function GameView({ gameId, liveTeams, upcomingTeams, onTeamSelect }: GameViewProps) {
  const allTeams = [...liveTeams, ...upcomingTeams];
  const gameTeams = allTeams.filter(team => team.gameId === gameId);
  
  if (gameTeams.length < 2) {
    return (
      <div className="text-gray-400 text-center flex-1 flex items-center justify-center">
        <div>
          <div className="text-xl mb-2">Game data incomplete</div>
          <div className="text-sm">Unable to load both teams for game {gameId}</div>
        </div>
      </div>
    );
  }

  const [team1, team2] = gameTeams;
  const isLive = liveTeams.some(t => t.gameId === gameId);
  const isUpcoming = !isLive;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Game Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          {team1.name} vs {team2.name}
        </h2>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isLive ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
          }`}>
            {isLive ? 'LIVE' : 'UPCOMING'}
          </div>
          <div className="text-gray-400">Game {gameId}</div>
        </div>
        
        {/* Score Display for Live Games */}
        {isLive && (
          <div className="mt-4 text-4xl font-bold text-white">
            <span className={team1.score > team2.score ? 'text-green-400' : ''}>{team1.score}</span>
            <span className="text-gray-500 mx-4">-</span>
            <span className={team2.score > team1.score ? 'text-green-400' : ''}>{team2.score}</span>
          </div>
        )}
      </div>

      {/* Teams Head-to-Head */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 */}
        <div
          className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer group"
          onClick={() => onTeamSelect(team1.id, team1.name)}
        >
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {team1.name}
            </div>
            <div className="text-sm text-gray-400 mb-4">
              {team1.isHome ? 'Home Team' : 'Away Team'}
            </div>
            
            {isLive ? (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">
                  {team1.score}
                </div>
                <div className="text-sm text-gray-400">
                  Current Score
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-400">
                  Game Preview
                </div>
                <div className="text-xs text-yellow-400">
                  Waiting for game start
                </div>
              </div>
            )}
            
            {/* Team Analytics Preview */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500 mb-2">Available Analytics:</div>
              <div className="flex flex-wrap gap-1 justify-center">
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">
                  Team Momentum
                </span>
                <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded">
                  Player Models
                </span>
                <span className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded">
                  Quarterly Forecast
                </span>
              </div>
            </div>
            
            {/* Click to View */}
            <div className="mt-4 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
              Click to view team analytics →
            </div>
          </div>
        </div>

        {/* Team 2 */}
        <div
          className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer group"
          onClick={() => onTeamSelect(team2.id, team2.name)}
        >
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {team2.name}
            </div>
            <div className="text-sm text-gray-400 mb-4">
              {team2.isHome ? 'Home Team' : 'Away Team'}
            </div>
            
            {isLive ? (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">
                  {team2.score}
                </div>
                <div className="text-sm text-gray-400">
                  Current Score
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-400">
                  Game Preview
                </div>
                <div className="text-xs text-yellow-400">
                  Waiting for game start
                </div>
              </div>
            )}
            
            {/* Team Analytics Preview */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500 mb-2">Available Analytics:</div>
              <div className="flex flex-wrap gap-1 justify-center">
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">
                  Team Momentum
                </span>
                <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded">
                  Player Models
                </span>
                <span className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded">
                  Quarterly Forecast
                </span>
              </div>
            </div>
            
            {/* Click to View */}
            <div className="mt-4 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
              Click to view team analytics →
            </div>
          </div>
        </div>
      </div>

      {/* Game Info Panel */}
      <div className="mt-8 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">Game Analytics</div>
          <div className="text-xs text-gray-500">
            Select a team above to access momentum tracking, player prediction models, and enhanced quarterly analytics
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameView; 