import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './tooltip';
import { HelpCircle } from 'lucide-react';
import { normalizeMomentum, getMomentumStatus } from '@/hooks/useMomentumHelpers';

interface MomentumBarProps {
  label: string;
  value: number;
  maxValue?: number;
  minValue?: number;
  emoji?: string;
  explanationTitle?: string;
  explanationText?: string;
  recentActivity?: string;
  className?: string;
  style?: React.CSSProperties;
  isFlashing?: boolean;
  flashColor?: string;
}

export function MomentumBar({
  label,
  value,
  maxValue = 10,
  minValue = 0,
  emoji,
  explanationTitle,
  explanationText,
  recentActivity,
  className,
  style,
  isFlashing = false,
  flashColor = "#FFFFFF"
}: MomentumBarProps) {
  const percentage = normalizeMomentum(value, minValue, maxValue);
  const status = getMomentumStatus(percentage);
  
  // Create visual progress bar with segments
  const filledSegments = Math.floor(percentage / 10);
  const partialSegment = (percentage % 10) / 10;

  return (
    <div 
      className={cn("relative p-4 rounded-lg border-2 transition-all duration-200", className)}
      style={style}
    >
      {/* Header with label and help icon */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-400 font-medium">{label}</span>
          {emoji && <span className="text-sm">{emoji}</span>}
        </div>
        
        {(explanationTitle || explanationText) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-gray-400 hover:text-gray-300">
                  <HelpCircle className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  {explanationTitle && (
                    <div className="font-medium text-white">{explanationTitle}</div>
                  )}
                  {explanationText && (
                    <div className="text-gray-300">{explanationText}</div>
                  )}
                  {recentActivity && (
                    <div className="text-xs text-gray-400 border-t border-gray-600 pt-1 mt-1">
                      {recentActivity}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Momentum value and percentage */}
      <div className="flex items-baseline justify-between mb-3">
        <div className={cn(
          "text-2xl font-bold transition-colors",
          isFlashing ? "text-white" : "text-gray-200"
        )}>
          {value.toFixed(2)}
        </div>
        <div className={cn(
          "text-lg font-semibold transition-colors",
          isFlashing ? "text-white" : "text-gray-300"
        )}>
          {Math.round(percentage)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex space-x-0.5 h-3 bg-[#2A2F36] rounded-full p-0.5">
          {Array.from({ length: 10 }, (_, i) => {
            let segmentOpacity = 0.2;
            
            if (i < filledSegments) {
              segmentOpacity = 1;
            } else if (i === filledSegments && partialSegment > 0) {
              segmentOpacity = 0.2 + (partialSegment * 0.8);
            }

            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-300"
                style={{
                  backgroundColor: status.color,
                  opacity: segmentOpacity,
                  boxShadow: isFlashing && i < filledSegments ? `0 0 6px ${status.color}` : 'none'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Status text */}
      <div className={cn(
        "text-xs font-medium transition-colors flex items-center space-x-1",
        isFlashing ? "text-gray-200" : "text-gray-400"
      )} style={{ color: status.color }}>
        <span>{status.emoji}</span>
        <span>{status.text}</span>
      </div>

      {/* Flash overlay */}
      {isFlashing && (
        <div
          className="absolute inset-0 rounded-lg transition-opacity duration-200 pointer-events-none"
          style={{
            backgroundColor: flashColor,
            opacity: 0.1,
            boxShadow: `inset 0 0 20px ${flashColor}40`
          }}
        />
      )}
    </div>
  );
} 