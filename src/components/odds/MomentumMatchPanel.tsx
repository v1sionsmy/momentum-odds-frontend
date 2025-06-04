import React from 'react';
import { Card } from '../ui/card';
import { LoadingOverlay } from '../ui/loading';
import { useGameMomentum } from '@/hooks/useGameMomentum';
import { ArrowUp, ArrowDown, Minus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MomentumMatchPanelProps {
  gameId: number;
  className?: string;
}

export function MomentumMatchPanel({ gameId, className }: MomentumMatchPanelProps) {
  const { momentumData, error, isLoading } = useGameMomentum(gameId);

  if (error) {
    return (
      <Card className={cn("bg-[#0F1318] border-[#1A1F26] shadow-lg", className)}>
        <div className="p-4">
          <div className="flex items-center text-[#FF3355] mb-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Error Loading Momentum Data</span>
          </div>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-[#0F1318] border-[#1A1F26] shadow-lg", className)}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium text-gray-400">MOMENTUM MATCH</div>
          {momentumData && (
            <div className="text-xs text-gray-500">
              Updated {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>

        <LoadingOverlay isLoading={isLoading} text="Loading momentum data...">
          {momentumData && (
            <div className="space-y-6">
              {/* Overall Momentum Comparison */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-400">OVERALL MOMENTUM</div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(momentumData.teamMomentum).map(([teamId, momentum]) => (
                    <div
                      key={teamId}
                      className="bg-[#1A1F26] rounded-lg p-3"
                    >
                      <div className="text-sm font-medium mb-1">Team {teamId}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {Math.round(momentum * 10)}
                        </div>
                        <div className={cn(
                          "flex items-center text-sm",
                          momentum > 5 && "text-[#00FF8B]",
                          momentum < 5 && "text-[#FF3355]",
                          momentum === 5 && "text-gray-400"
                        )}>
                          {momentum > 5 && <ArrowUp className="w-4 h-4" />}
                          {momentum < 5 && <ArrowDown className="w-4 h-4" />}
                          {momentum === 5 && <Minus className="w-4 h-4" />}
                          <span className="ml-1">
                            {momentum > 5 ? '+' : ''}{Math.round((momentum - 5) * 10)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Win Probability */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-400">WIN PROBABILITY</div>
                <div className="bg-[#1A1F26] rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm">Team 1</div>
                    <div className="text-sm">Team 2</div>
                  </div>
                  <div className="relative h-2 bg-[#2A2F36] rounded-full overflow-hidden">
                    {(() => {
                      const momentumValues = Object.values(momentumData.teamMomentum);
                      const total = momentumValues.reduce((a, b) => a + b, 0);
                      const team1Pct = total > 0 ? (momentumValues[0] / total) * 100 : 50;
                      const team2Pct = total > 0 ? (momentumValues[1] / total) * 100 : 50;
                      
                      return (
                        <>
                          <div
                            className="absolute h-full bg-[#00FF8B]"
                            style={{
                              width: `${team1Pct}%`,
                              left: 0
                            }}
                          />
                          <div
                            className="absolute h-full bg-[#FF3355]"
                            style={{
                              width: `${team2Pct}%`,
                              right: 0
                            }}
                          />
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    {(() => {
                      const momentumValues = Object.values(momentumData.teamMomentum);
                      const total = momentumValues.reduce((a, b) => a + b, 0);
                      const team1Pct = total > 0 ? Math.round((momentumValues[0] / total) * 100) : 50;
                      const team2Pct = total > 0 ? Math.round((momentumValues[1] / total) * 100) : 50;
                      
                      return (
                        <>
                          <div className="text-sm font-medium">{team1Pct}%</div>
                          <div className="text-sm font-medium">{team2Pct}%</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </LoadingOverlay>
      </div>
    </Card>
  );
} 