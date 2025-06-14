import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerPropsDisplay from './PlayerPropsDisplay';

interface PlayerStats {
  playerId: string;
  name: string;
  points: number;
  pointsETA: number;
  rebounds: number;
  reboundsETA: number;
  assists: number;
  assistsETA: number;
  color?: string;
}

interface TeamInfo {
  nextPlayLikely: string;
  confidence: number;
  keyLineup: string[];
  gameFlow: string;
}

interface LowerPanelProps {
  mode: 'team' | 'player';
  selectedPlayer?: PlayerStats;
  teamInfo?: TeamInfo;
  gameId?: number;
  className?: string;
}

export default function LowerPanel({ mode, selectedPlayer, teamInfo, gameId, className = "" }: LowerPanelProps) {
  return (
    <div className={`grid grid-cols-3 gap-4 p-4 bg-gray-900 border-t border-gray-700 ${className}`}>
      <AnimatePresence mode="wait">
        {mode === 'team' && teamInfo && (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="col-span-3 grid grid-cols-3 gap-4"
          >
            {/* Predicted Momentum Swing */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Predicted Momentum Swing</h3>
              <div className="text-lg font-bold text-white mb-1">{teamInfo.nextPlayLikely}</div>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${teamInfo.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{teamInfo.confidence}% confidence</span>
              </div>
            </div>

            {/* Key Lineup */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Key Lineup</h3>
              <div className="space-y-1">
                {teamInfo.keyLineup.map((player, index) => (
                  <div key={index} className="text-sm text-white flex items-center">
                    <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                    {player}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Flow */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Game Flow</h3>
              <div className="text-lg font-bold text-white mb-1">{teamInfo.gameFlow}</div>
              <div className="text-xs text-gray-400">
                Current game momentum and pace analysis
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'player' && selectedPlayer && (
          <motion.div
            key="player"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="col-span-3 grid grid-cols-4 gap-4"
          >
            {/* Player Header */}
            <div className="col-span-4 text-center mb-2">
              <h3 className="text-lg font-semibold text-white">{selectedPlayer.name}</h3>
              <div className="text-sm text-gray-400">Performance vs. Projection</div>
            </div>

            {/* Points ETA */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-center">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Points</h4>
                <div className="text-2xl font-bold text-white mb-1">
                  {selectedPlayer.points}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  ETA: {selectedPlayer.pointsETA}
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((selectedPlayer.points / selectedPlayer.pointsETA) * 100, 100)}%`,
                      backgroundColor: selectedPlayer.points >= selectedPlayer.pointsETA ? '#10B981' : 
                                     selectedPlayer.points >= selectedPlayer.pointsETA * 0.8 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((selectedPlayer.points / selectedPlayer.pointsETA) * 100).toFixed(0)}% of projection
                </div>
              </div>
            </div>

            {/* Rebounds ETA */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-center">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Rebounds</h4>
                <div className="text-2xl font-bold text-white mb-1">
                  {selectedPlayer.rebounds}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  ETA: {selectedPlayer.reboundsETA}
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((selectedPlayer.rebounds / selectedPlayer.reboundsETA) * 100, 100)}%`,
                      backgroundColor: selectedPlayer.rebounds >= selectedPlayer.reboundsETA ? '#10B981' : 
                                     selectedPlayer.rebounds >= selectedPlayer.reboundsETA * 0.8 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((selectedPlayer.rebounds / selectedPlayer.reboundsETA) * 100).toFixed(0)}% of projection
                </div>
              </div>
            </div>

            {/* Assists ETA */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-center">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Assists</h4>
                <div className="text-2xl font-bold text-white mb-1">
                  {selectedPlayer.assists}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  ETA: {selectedPlayer.assistsETA}
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((selectedPlayer.assists / selectedPlayer.assistsETA) * 100, 100)}%`,
                      backgroundColor: selectedPlayer.assists >= selectedPlayer.assistsETA ? '#10B981' : 
                                     selectedPlayer.assists >= selectedPlayer.assistsETA * 0.8 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((selectedPlayer.assists / selectedPlayer.assistsETA) * 100).toFixed(0)}% of projection
                </div>
              </div>
            </div>

            {/* Player Props Odds */}
            {gameId && (
              <PlayerPropsDisplay
                gameId={gameId}
                playerId={selectedPlayer.playerId}
                playerName={selectedPlayer.name}
                currentStats={{
                  points: selectedPlayer.points,
                  rebounds: selectedPlayer.rebounds,
                  assists: selectedPlayer.assists
                }}
              />
            )}
          </motion.div>
        )}

        {/* Default state */}
        {((mode === 'team' && !teamInfo) || (mode === 'player' && !selectedPlayer)) && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="col-span-3 flex items-center justify-center py-8"
          >
            <div className="text-center text-gray-400">
              {mode === 'team' ? (
                <>
                  <div className="text-4xl mb-2">📊</div>
                  <div>Select a game to view team insights</div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">👤</div>
                  <div>Click a player to view detailed stats</div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 