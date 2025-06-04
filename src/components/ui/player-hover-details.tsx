import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PlayLog {
  timestamp: string;
  play: string;
  impact: 'positive' | 'negative' | 'neutral';
  points: number;
}

interface PlayerHoverDetailsProps {
  playerName: string;
  momentum: number;
  className?: string;
  children: React.ReactNode;
}

// Mock play data - in real app this would come from API
const getMockPlayLogs = (playerName: string, momentum: number): PlayLog[] => {
  const plays: PlayLog[] = [];
  const now = new Date();
  
  if (momentum > 6) {
    plays.push(
      {
        timestamp: new Date(now.getTime() - 2 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        play: "3-pointer made",
        impact: 'positive',
        points: 3
      },
      {
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        play: "Steal + assist",
        impact: 'positive',
        points: 2
      },
      {
        timestamp: new Date(now.getTime() - 7 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        play: "Defensive rebound",
        impact: 'positive',
        points: 1
      }
    );
  } else if (momentum > 3) {
    plays.push(
      {
        timestamp: new Date(now.getTime() - 3 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        play: "Free throw made",
        impact: 'positive',
        points: 1
      },
      {
        timestamp: new Date(now.getTime() - 8 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        play: "Missed 3-pointer",
        impact: 'negative',
        points: -1
      }
    );
  } else {
    plays.push(
      {
        timestamp: new Date(now.getTime() - 1 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        play: "Turnover",
        impact: 'negative',
        points: -2
      },
      {
        timestamp: new Date(now.getTime() - 4 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        play: "Missed shot",
        impact: 'negative',
        points: -1
      }
    );
  }
  
  return plays.slice(0, 3); // Show last 3 plays
};

export function PlayerHoverDetails({ playerName, momentum, className, children }: PlayerHoverDetailsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const playLogs = getMockPlayLogs(playerName, momentum);

  // Calculate optimal positioning when tooltip becomes visible
  useEffect(() => {
    if (isVisible && containerRef.current && tooltipRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Determine vertical position (top or bottom)
      const spaceAbove = container.top;
      const spaceBelow = viewport.height - container.bottom;
      const tooltipHeight = 200; // Approximate tooltip height
      
      if (spaceAbove >= tooltipHeight + 16) {
        setPosition('top');
      } else if (spaceBelow >= tooltipHeight + 16) {
        setPosition('bottom');
      } else {
        // Use whichever has more space
        setPosition(spaceAbove > spaceBelow ? 'top' : 'bottom');
      }

      // Determine horizontal alignment
      const tooltipWidth = 320; // Fixed tooltip width
      const containerCenter = container.left + container.width / 2;
      
      if (containerCenter - tooltipWidth / 2 < 16) {
        setAlignment('left');
      } else if (containerCenter + tooltipWidth / 2 > viewport.width - 16) {
        setAlignment('right');
      } else {
        setAlignment('center');
      }
    }
  }, [isVisible]);

  const getTooltipClasses = () => {
    const baseClasses = "absolute z-[100]";
    const verticalClasses = position === 'top' ? "bottom-full mb-3" : "top-full mt-3";
    
    let horizontalClasses;
    switch (alignment) {
      case 'left':
        horizontalClasses = "left-0";
        break;
      case 'right':
        horizontalClasses = "right-0";
        break;
      default:
        horizontalClasses = "left-1/2 transform -translate-x-1/2";
    }
    
    return cn(baseClasses, verticalClasses, horizontalClasses);
  };

  const getArrowClasses = () => {
    if (position === 'top') {
      switch (alignment) {
        case 'left':
          return "absolute top-full left-4";
        case 'right':
          return "absolute top-full right-4";
        default:
          return "absolute top-full left-1/2 transform -translate-x-1/2";
      }
    } else {
      switch (alignment) {
        case 'left':
          return "absolute bottom-full left-4";
        case 'right':
          return "absolute bottom-full right-4";
        default:
          return "absolute bottom-full left-1/2 transform -translate-x-1/2";
      }
    }
  };

  const getArrowDirection = () => {
    return position === 'top' 
      ? "border-4 border-transparent border-t-gray-600"
      : "border-4 border-transparent border-b-gray-600";
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      <div
        className={cn("cursor-pointer w-full", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={getTooltipClasses()}>
          <div 
            ref={tooltipRef}
            className="bg-[#1A1F26] border border-gray-600 rounded-lg p-4 shadow-xl w-80 max-w-[90vw]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-white text-sm truncate pr-2">{playerName}</div>
              <div className="text-xs text-gray-400 flex-shrink-0">Recent plays</div>
            </div>
            
            <div className="space-y-2">
              {playLogs.map((play, index) => (
                <div key={index} className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="text-gray-400 flex-shrink-0">{play.timestamp}</span>
                    <span className="text-gray-300 truncate">{play.play}</span>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-xs font-medium flex-shrink-0",
                    play.impact === 'positive' ? "bg-green-600/20 text-green-400" :
                    play.impact === 'negative' ? "bg-red-600/20 text-red-400" :
                    "bg-gray-600/20 text-gray-400"
                  )}>
                    {play.points > 0 ? '+' : ''}{play.points}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-700 mt-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Current momentum</span>
                <span className="text-white font-semibold">{momentum.toFixed(1)}</span>
              </div>
            </div>
            
            {/* Dynamic Arrow */}
            <div className={getArrowClasses()}>
              <div className={getArrowDirection()}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 