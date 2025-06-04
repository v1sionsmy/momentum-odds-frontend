import React, { useState } from 'react';
import { MomentumBar } from '../ui/momentum-bar';
import { PropProgressTile } from '../ui/prop-progress-tile';
import { getMomentumExplanation, getMomentumActivity } from '@/hooks/useMomentumHelpers';

export function MomentumBarDemo() {
  const [flashingIndex, setFlashingIndex] = useState(-1);

  const demoData = [
    { label: "Points", value: 4.2, category: "points", emoji: "🔥" },
    { label: "Rebounds", value: 3.1, category: "rebounds", emoji: "💪" },
    { label: "Assists", value: 2.8, category: "assists", emoji: "🎯" },
    { label: "Blocks", value: 1.5, category: "blocks", emoji: "🛡️" },
    { label: "Steals", value: 2.2, category: "steals", emoji: "⚡" },
  ];

  const propDemoData = [
    { label: "Points", currentValue: 18.5, propLine: 21.5, momentum: 4.2, emoji: "🔥", unit: "pts" },
    { label: "Rebounds", currentValue: 7.2, propLine: 8.5, momentum: 3.1, emoji: "💪", unit: "reb" },
    { label: "Assists", currentValue: 4.8, propLine: 5.5, momentum: 2.8, emoji: "🎯", unit: "ast" },
  ];

  return (
    <div className="p-8 bg-[#0B0E11] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Enhanced Momentum Display Demo
        </h1>
        
        <div className="mb-6 flex justify-center space-x-2">
          <button
            onClick={() => setFlashingIndex(-1)}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            No Flash
          </button>
          {demoData.map((_, index) => (
            <button
              key={index}
              onClick={() => setFlashingIndex(index)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Flash {index + 1}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {demoData.map((item, index) => (
            <MomentumBar
              key={item.label}
              label={item.label}
              value={item.value}
              emoji={item.emoji}
              explanationTitle={`${item.label} Momentum`}
              explanationText={getMomentumExplanation(item.category)}
              recentActivity={getMomentumActivity({ 
                type: 'player', 
                category: item.category as any, 
                value: item.value 
              })}
              isFlashing={flashingIndex === index}
              flashColor="#ffffff"
              className="border-green-400"
            />
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Prop Betting Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {propDemoData.map((item, index) => (
              <PropProgressTile
                key={item.label}
                label={item.label}
                emoji={item.emoji}
                currentValue={item.currentValue}
                propLine={item.propLine}
                momentum={item.momentum}
                unit={item.unit}
              />
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Team Momentum Example</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MomentumBar
              label="Boston Celtics"
              value={7.2}
              emoji="🏀"
              explanationTitle="Team Momentum"
              explanationText={getMomentumExplanation('team')}
              recentActivity={getMomentumActivity({ 
                type: 'team', 
                category: 'overall', 
                value: 7.2 
              })}
              isFlashing={false}
              flashColor="#007A33"
              className="border-2"
              style={{ borderColor: "#007A33" }}
            />
            <MomentumBar
              label="Miami Heat"
              value={2.8}
              emoji="⚡"
              explanationTitle="Team Momentum"
              explanationText={getMomentumExplanation('team')}
              recentActivity={getMomentumActivity({ 
                type: 'team', 
                category: 'overall', 
                value: 2.8 
              })}
              isFlashing={false}
              flashColor="#98002E"
              className="border-2"
              style={{ borderColor: "#98002E" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 