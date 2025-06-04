import React, { useEffect, useState, useMemo } from "react";
import { MomentumBar } from "./ui/momentum-bar";
import { PropProgressTile } from "./ui/prop-progress-tile";
import { getMomentumActivity, getMomentumExplanation } from "@/hooks/useMomentumHelpers";

// A helper to manage multiple flashing states consistently
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

interface PlayerMomentum {
  ptsMom: number;
  rebMom: number;
  astMom: number;
  blkMom: number;
  stlMom: number;
}

interface Correlations {
  ptsMom: boolean;
  rebMom: boolean;
  astMom: boolean;
  blkMom: boolean;
  stlMom: boolean;
}

interface CurrentStats {
  points: number;
  rebounds: number;
  assists: number;
  blocks: number;
  steals: number;
}

interface PropLines {
  points: number;
  rebounds: number;
  assists: number;
  blocks: number;
  steals: number;
}

interface PlayerMomentumModuleProps {
  playerMomentum: PlayerMomentum | null;
  correlations: Correlations | null;
  currentStats: CurrentStats | null;
  propLines: PropLines | null;
  isLoading: boolean;
  error: any;
}

function PlayerMomentumModule({
  playerMomentum,
  correlations,
  currentStats,
  propLines,
  isLoading,
  error,
}: PlayerMomentumModuleProps) {
  // Base interval to compute flashing speed
  const BASE_INTERVAL = 1000; // ms

  // Calculate all flash rates consistently
  const flashRates = useMemo(() => {
    if (!playerMomentum) {
      return [BASE_INTERVAL, BASE_INTERVAL, BASE_INTERVAL, BASE_INTERVAL, BASE_INTERVAL];
    }

    return [
      playerMomentum.ptsMom > 0 ? BASE_INTERVAL / playerMomentum.ptsMom : BASE_INTERVAL,
      playerMomentum.rebMom > 0 ? BASE_INTERVAL / playerMomentum.rebMom : BASE_INTERVAL,
      playerMomentum.astMom > 0 ? BASE_INTERVAL / playerMomentum.astMom : BASE_INTERVAL,
      playerMomentum.blkMom > 0 ? BASE_INTERVAL / playerMomentum.blkMom : BASE_INTERVAL,
      playerMomentum.stlMom > 0 ? BASE_INTERVAL / playerMomentum.stlMom : BASE_INTERVAL,
    ];
  }, [playerMomentum]);

  // Use single hook for all flash states
  const flashStates = useMultipleFlasher(flashRates);
  const [ptsOn, rebOn, astOn, blkOn, stlOn] = flashStates;

  if (isLoading) {
    return <div className="text-gray-400">Loading player momentum…</div>;
  }
  if (error) {
    return <div className="text-red-400">Error loading player momentum.</div>;
  }
  if (!playerMomentum) {
    return <div className="text-gray-400">Select a player to see momentum.</div>;
  }

  // Helper to decide border color
  const borderClass = (catKey: keyof Correlations) =>
    correlations?.[catKey] ? "border-green-400 shadow-lg" : "border-gray-700";

  return (
    <div className="w-full h-full p-4 space-y-6">
      {/* Momentum Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Points Momentum Bar */}
        <MomentumBar
          label="Points"
          value={playerMomentum.ptsMom}
          emoji="🔥"
          explanationTitle="Points Momentum"
          explanationText={getMomentumExplanation('points')}
          recentActivity={getMomentumActivity({ type: 'player', category: 'points', value: playerMomentum.ptsMom })}
          isFlashing={ptsOn}
          flashColor="#ffffff"
          className={borderClass("ptsMom")}
        />

        {/* Rebounds Momentum Bar */}
        <MomentumBar
          label="Rebounds"
          value={playerMomentum.rebMom}
          emoji="💪"
          explanationTitle="Rebounds Momentum"
          explanationText={getMomentumExplanation('rebounds')}
          recentActivity={getMomentumActivity({ type: 'player', category: 'rebounds', value: playerMomentum.rebMom })}
          isFlashing={rebOn}
          flashColor="#ffffff"
          className={borderClass("rebMom")}
        />

        {/* Assists Momentum Bar */}
        <MomentumBar
          label="Assists"
          value={playerMomentum.astMom}
          emoji="🎯"
          explanationTitle="Assists Momentum"
          explanationText={getMomentumExplanation('assists')}
          recentActivity={getMomentumActivity({ type: 'player', category: 'assists', value: playerMomentum.astMom })}
          isFlashing={astOn}
          flashColor="#ffffff"
          className={borderClass("astMom")}
        />

        {/* Blocks Momentum Bar */}
        <MomentumBar
          label="Blocks"
          value={playerMomentum.blkMom}
          emoji="🛡️"
          explanationTitle="Blocks Momentum"
          explanationText={getMomentumExplanation('blocks')}
          recentActivity={getMomentumActivity({ type: 'player', category: 'blocks', value: playerMomentum.blkMom })}
          isFlashing={blkOn}
          flashColor="#ffffff"
          className={borderClass("blkMom")}
        />

        {/* Steals Momentum Bar */}
        <MomentumBar
          label="Steals"
          value={playerMomentum.stlMom}
          emoji="⚡"
          explanationTitle="Steals Momentum"
          explanationText={getMomentumExplanation('steals')}
          recentActivity={getMomentumActivity({ type: 'player', category: 'steals', value: playerMomentum.stlMom })}
          isFlashing={stlOn}
          flashColor="#ffffff"
          className={borderClass("stlMom")}
        />
      </div>

      {/* Prop Progress Tiles */}
      {currentStats && propLines && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-400 border-t border-gray-700 pt-4">
            PROP BET PROGRESS
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PropProgressTile
              label="Points"
              emoji="🔥"
              currentValue={currentStats.points}
              propLine={propLines.points}
              momentum={playerMomentum.ptsMom}
              unit="pts"
            />
            <PropProgressTile
              label="Rebounds"
              emoji="💪"
              currentValue={currentStats.rebounds}
              propLine={propLines.rebounds}
              momentum={playerMomentum.rebMom}
              unit="reb"
            />
            <PropProgressTile
              label="Assists"
              emoji="🎯"
              currentValue={currentStats.assists}
              propLine={propLines.assists}
              momentum={playerMomentum.astMom}
              unit="ast"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerMomentumModule; 