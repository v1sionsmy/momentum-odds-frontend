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
          <div className="text-2xl font-bold text-gray-800 mb-4">Select a Game to See Live Momentum</div>
          <div className="text-gray-600 text-sm max-w-md mx-auto mb-6">
            Choose a live game from the sidebar to see real-time momentum visualization. 
            The box will flash with team colors - faster flashing indicates higher momentum shifts.
          </div>
          <div className="bg-white/80 rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-700">
              <strong>Color Guide:</strong> Each team has unique colors that flash based on their current momentum strength
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center">
          <div className="text-xl font-bold text-emerald-700 mb-2">Loading Momentum...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center">
          <div className="text-xl font-bold text-red-600 mb-2">Error Loading Momentum</div>
          <div className="text-gray-600 text-sm">{error.message}</div>
        </div>
      );
    }

    if (!momentumData || !momentumData.teamMomentum) {
      return (
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-600 mb-2">No Momentum Data</div>
          <div className="text-gray-600 text-sm">No momentum data available for this game</div>
        </div>
      );
    }

    // If we have momentum data, show the logo with flashing overlay
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <Image
          src="/MomentumoddsLogo.png"
          alt="Momentumodds Logo"
          width={400}
          height={100}
          className="opacity-40 select-none"
          priority
        />
      </div>
    );
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background base */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
      
      {/* Flash overlay */}
      <div 
        className="absolute inset-0 transition-colors duration-500 ease-in-out"
        style={{ 
          backgroundColor: flashColor,
          opacity: flashColor === 'transparent' ? 0 : 0.15,
          boxShadow: flashColor !== 'transparent' ? `inset 0 0 60px ${flashColor}30` : 'none'
        }}
      />
      
      {/* Border that flashes */}
      <div 
        className="absolute inset-4 rounded-lg border-2 transition-colors duration-500 ease-in-out"
        style={{ 
          borderColor: flashColor === 'transparent' ? '#E5E7EB' : flashColor,
          boxShadow: flashColor !== 'transparent' ? `0 0 15px ${flashColor}40` : 'none'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
        {renderContent()}
      </div>
    </div>
  );
}; 