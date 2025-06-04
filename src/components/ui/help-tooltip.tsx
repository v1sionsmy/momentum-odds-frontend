import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string;
  title?: string;
  className?: string;
}

export function HelpTooltip({ content, title, className }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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
      const tooltipHeight = 120; // Approximate tooltip height
      
      if (spaceAbove >= tooltipHeight + 16) {
        setPosition('top');
      } else if (spaceBelow >= tooltipHeight + 16) {
        setPosition('bottom');
      } else {
        // Use whichever has more space
        setPosition(spaceAbove > spaceBelow ? 'top' : 'bottom');
      }

      // Determine horizontal alignment
      const tooltipWidth = 288; // max-w-xs is ~288px
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
    const verticalClasses = position === 'top' ? "bottom-full mb-2" : "top-full mt-2";
    
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
          return "absolute top-full left-2";
        case 'right':
          return "absolute top-full right-2";
        default:
          return "absolute top-full left-1/2 transform -translate-x-1/2";
      }
    } else {
      switch (alignment) {
        case 'left':
          return "absolute bottom-full left-2";
        case 'right':
          return "absolute bottom-full right-2";
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

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        className={cn(
          "inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-600 text-gray-300 text-xs hover:bg-gray-500 hover:text-white transition-colors",
          className
        )}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
      >
        ?
      </button>
      
      {isVisible && (
        <div className={getTooltipClasses()}>
          <div 
            ref={tooltipRef}
            className="bg-[#1A1F26] border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs w-72"
          >
            {title && (
              <div className="font-semibold text-white mb-1 text-sm">{title}</div>
            )}
            <div className="text-gray-300 text-xs leading-relaxed">{content}</div>
            
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