import React from "react";
import PlayerMomentumModule from "@/components/PlayerMomentumModule";
import EnhancedQuarterlyPrediction from "@/components/EnhancedQuarterlyPrediction";

interface PlayerViewProps {
  gameId: number | null;
  playerId: string | null;
  playerName: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playerMomentum: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  correlations: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentStats: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propLines: any;
  isLoading: boolean;
  error: string | null;
  showQuarterlyPrediction: boolean;
}

function PlayerView({
  gameId,
  playerId,
  playerName,
  playerMomentum,
  correlations,
  currentStats,
  propLines,
  isLoading,
  error,
  showQuarterlyPrediction
}: PlayerViewProps) {
  if (isLoading) {
    return <div className="text-gray-400 text-center">Loading player data…</div>;
  }
  
  if (error) {
    return <div className="text-red-400 text-center">Error loading player data: {error}</div>;
  }
  
  if (!playerId || !playerName) {
    return <div className="text-gray-400 text-center">No player selected</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Player Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          {playerName} Analytics
        </h2>
        <div className="text-sm text-gray-400 mb-4">
          Individual player momentum and predictive models
        </div>
        
        {/* Explanation box */}
        <div className="max-w-2xl mx-auto bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="text-sm text-blue-300">
            <strong>How to read this data:</strong> Live stats show real-time performance tracking, 
            while Q4 predictions use AI to forecast final quarter performance based on current momentum and historical patterns.
          </div>
        </div>
      </div>

      {/* Main Content - Toggle between Live Stats and Predictions */}
      {showQuarterlyPrediction ? (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Enhanced Quarterly Predictions</h3>
            <div className="text-sm text-gray-400">AI-powered player performance forecasting</div>
          </div>
          
          <EnhancedQuarterlyPrediction
            gameId={gameId || 0}
            playerId={parseInt(playerId)}
            playerName={playerName}
          />
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Live Player Momentum</h3>
            <div className="text-sm text-gray-400">Real-time performance tracking and statistics</div>
          </div>
          
          <PlayerMomentumModule
            playerMomentum={playerMomentum}
            correlations={correlations}
            currentStats={currentStats}
            propLines={propLines}
            isLoading={isLoading}
            error={error}
          />
        </div>
      )}
    </div>
  );
}

export default PlayerView; 