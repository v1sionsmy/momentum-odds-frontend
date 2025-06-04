"use client";

import React from 'react';
import { useLiveGames, Game } from '@/hooks/useLiveGames';
import { useGameMomentum } from '@/hooks/useGameMomentum';

export default function LiveGames() {
  const { data: games, isLoading, error } = useLiveGames();

  if (isLoading) return <div>Loading games...</div>;
  if (error) return <div>Error loading games</div>;
  if (!games || (games as Game[]).length === 0) return <div>No live games</div>;

  return (
    <div>
      <h2>Live Games</h2>
      {(games as Game[]).map((game: Game) => (
        <div key={game.id} style={{ marginBottom: 24 }}>
          <strong>{game.home_team} vs {game.away_team}</strong>
          <div>Score: {game.home_score} - {game.away_score}</div>
          <GameMomentum gameId={game.api_game_id} />
        </div>
      ))}
    </div>
  );
}

function GameMomentum({ gameId }: { gameId: number }) {
  const { momentumData, isLoading, error } = useGameMomentum(gameId);

  if (isLoading) return <div>Loading momentum...</div>;
  if (error) return <div>Error loading momentum</div>;
  if (!momentumData) return null;

  return (
    <div>
      {Object.entries(momentumData.teamMomentum).map(([teamId, momentum]) => (
        <div key={teamId}>
          Team {teamId} Momentum: {Math.round(momentum * 100)}%
        </div>
      ))}
      <div>Last Update: {new Date().toLocaleTimeString()}</div>
    </div>
  );
} 