import React, { useState, useEffect } from 'react';

interface GameCountdownProps {
  gameStartTime: string | Date | null;
  className?: string;
}

const GameCountdown: React.FC<GameCountdownProps> = ({ gameStartTime, className = '' }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  useEffect(() => {
    if (!gameStartTime) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const startTime = new Date(gameStartTime).getTime();
      const difference = startTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({
          days,
          hours,
          minutes,
          seconds,
          total: difference
        });
      } else {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        });
      }
    };

    // Update immediately
    updateCountdown();

    // Set up interval to update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [gameStartTime]);

  if (!gameStartTime || timeRemaining.total <= 0) {
    return (
      <div className={`text-center space-y-2 ${className}`}>
        <h3 className="text-lg font-semibold text-white">Game Starting Soon</h3>
        <p className="text-gray-400 text-sm">
          The game should be starting any moment now!
        </p>
      </div>
    );
  }

  const formatTimeUnit = (value: number, label: string) => (
    <div className="flex flex-col items-center">
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 min-w-[60px]">
        <div className="text-2xl font-bold text-white">
          {value.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1 font-medium">
        {label}
      </div>
    </div>
  );

  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className="text-6xl mb-4">⏰</div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Game Starts In</h3>
        
        {/* Countdown Display */}
        <div className="flex justify-center items-center space-x-3">
          {timeRemaining.days > 0 && (
            <>
              {formatTimeUnit(timeRemaining.days, 'DAYS')}
              <div className="text-gray-500 text-xl font-bold">:</div>
            </>
          )}
          
          {(timeRemaining.days > 0 || timeRemaining.hours > 0) && (
            <>
              {formatTimeUnit(timeRemaining.hours, 'HRS')}
              <div className="text-gray-500 text-xl font-bold">:</div>
            </>
          )}
          
          {formatTimeUnit(timeRemaining.minutes, 'MIN')}
          <div className="text-gray-500 text-xl font-bold">:</div>
          {formatTimeUnit(timeRemaining.seconds, 'SEC')}
        </div>
        
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          Live momentum tracking and real-time analysis will be available once the game begins.
        </p>
      </div>
    </div>
  );
};

export default GameCountdown; 