"use client";
import React, { useState } from 'react';
import { useRecentGames, RecentGame } from '@/hooks/useRecentGames';
import { useReplayMomentum } from '@/hooks/useReplayMomentum';
import MainMomentumBox from '@/components/MainMomentumBox';
import { Button } from '@/components/ui/button';

export default function RecentGamesPage() {
  const { games, isLoading } = useRecentGames();
  const [selectedGame, setSelectedGame] = useState<number | null>(null);

  const { teamMomentum, isLoading: loadingMom, error: momentumError, snapshots, snapshot } = useReplayMomentum(selectedGame);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Games Replay</h1>
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-6 border-b border-gray-700">
        {isLoading && <div className="text-gray-400">Loading games...</div>}
        {games.map((g: RecentGame) => (
          <Button
            key={g.id}
            variant={selectedGame === g.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGame(g.id)}
          >
            {g.home_team} {g.home_score} - {g.away_score} {g.away_team}
          </Button>
        ))}
      </div>
      {selectedGame ? (
        <MainMomentumBox
          teamMomentum={teamMomentum}
          isLoading={loadingMom}
          error={momentumError?.message || null}
          selectedGameId={selectedGame}
          isReplayMode={true}
          snapshots={snapshots}
          currentSnapshotId={snapshot?.id}
        />
      ) : (
        <div className="text-gray-400">Select a game to start the replay.</div>
      )}
    </div>
  );
} 