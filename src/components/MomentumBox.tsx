import React, { useEffect, useState } from 'react';
import { useGameMomentum } from '@/hooks/useGameMomentum';
import Image from 'next/image';

interface MomentumBoxProps {
  selectedGameId: number | null;
}

export const MomentumBox: React.FC<MomentumBoxProps> = ({ selectedGameId }) => {
  const { momentumData, flashPattern, error, isLoading } = useGameMomentum(selectedGameId);
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [flashColor, setFlashColor] = useState('transparent');

  // Handle the flashing animation
  useEffect(() => {
    if (!flashPattern || flashPattern.length === 0) {
      setFlashColor('transparent');
      return;
    }

    const flash = flashPattern[currentFlashIndex];
    if (!flash) return;

    setFlashColor(flash.color);

    const timer = setTimeout(() => {
      setCurrentFlashIndex((prev) => (prev + 1) % flashPattern.length);
    }, flash.duration);

    return () => clearTimeout(timer);
  }, [currentFlashIndex, flashPattern]);

  // Reset flash index when pattern changes
  useEffect(() => {
    setCurrentFlashIndex(0);
  }, [flashPattern]);

  const renderContent = () => {
    if (!selectedGameId) {
      return (
        <div className="text-center">
          <div className="text-xl font-bold text-red-500 mb-4">Select a Game to See Live Momentum</div>
          <div className="text-gray-400 text-sm max-w-md mx-auto">
            Choose a live game from the sidebar to see real-time momentum visualization. 
            The box will flash with team colors - faster flashing indicates higher momentum shifts.
          </div>
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="text-xs text-gray-500">
              <strong>Color Guide:</strong> Each team has unique colors that flash based on their current momentum strength
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center">
          <div className="text-lg font-bold text-[#00FF8B] mb-2">Loading Momentum...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center">
          <div className="text-lg font-bold text-red-500 mb-2">Error Loading Momentum</div>
          <div className="text-gray-400 text-sm">{error.message}</div>
        </div>
      );
    }

    if (!momentumData || !momentumData.teamMomentum) {
      return (
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-500 mb-2">No Momentum Data</div>
          <div className="text-gray-400 text-sm">No momentum data available for this game</div>
        </div>
      );
    }

    // If we have momentum data, show the logo with flashing overlay
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <Image
          src="/momentum-odds-logo.png"
          alt="Momentum Odds Logo"
          width={400}
          height={400}
          className="opacity-90"
          priority
        />
      </div>
    );
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0E11] via-[#0F1318] to-[#0B0E11]" />
      
      {/* Flash overlay */}
      <div 
        className="absolute inset-0 transition-colors duration-500 ease-in-out"
        style={{ 
          backgroundColor: flashColor,
          opacity: flashColor === 'transparent' ? 0 : 0.35,
          boxShadow: flashColor !== 'transparent' ? `inset 0 0 100px ${flashColor}80` : 'none'
        }}
      />
      
      {/* Border that flashes */}
      <div 
        className="absolute inset-4 rounded-lg border-4 transition-colors duration-500 ease-in-out"
        style={{ 
          borderColor: flashColor === 'transparent' ? '#1A1F26' : flashColor,
          boxShadow: flashColor !== 'transparent' ? `0 0 20px ${flashColor}60` : 'none'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
        {renderContent()}
      </div>
    </div>
  );
}; 