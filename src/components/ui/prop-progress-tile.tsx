import React from 'react';
import { cn } from '@/lib/utils';

interface PropProgressTileProps {
  label: string;
  emoji: string;
  currentValue: number;
  propLine: number;
  unit?: string;
  momentum?: number;
  className?: string;
}

// Calculate prop status based on progress
const getPropStatus = (current: number, line: number, momentum: number = 0): { 
  text: string; 
  color: string; 
  icon: string;
  confidence: 'high' | 'medium' | 'low';
} => {
  const progress = (current / line) * 100;
  
  // Factor in momentum for prediction
  const momentumBoost = momentum > 3 ? 15 : momentum > 2 ? 10 : momentum > 1 ? 5 : 0;
  const adjustedProgress = progress + momentumBoost;
  
  if (current >= line) {
    return { text: "Hit!", color: "#00FF8B", icon: "✅", confidence: 'high' };
  }
  
  if (adjustedProgress >= 95) {
    return { text: "Surging: Likely to hit", color: "#00FF8B", icon: "✅", confidence: 'high' };
  }
  
  if (adjustedProgress >= 85) {
    return { text: "Strong pace: Very likely", color: "#00FF8B", icon: "📈", confidence: 'high' };
  }
  
  if (adjustedProgress >= 70) {
    return { text: "On track: Good chance", color: "#FFD700", icon: "🎯", confidence: 'medium' };
  }
  
  if (adjustedProgress >= 50) {
    return { text: "Behind pace: Possible", color: "#FF9500", icon: "⏱️", confidence: 'medium' };
  }
  
  if (adjustedProgress >= 30) {
    return { text: "Struggling: Long shot", color: "#FF6B35", icon: "📉", confidence: 'low' };
  }
  
  return { text: "Unlikely to hit", color: "#FF3355", icon: "❌", confidence: 'low' };
};

export function PropProgressTile({
  label,
  emoji,
  currentValue,
  propLine,
  unit = '',
  momentum = 0,
  className
}: PropProgressTileProps) {
  const progress = Math.min((currentValue / propLine) * 100, 100);
  const status = getPropStatus(currentValue, propLine, momentum);
  
  return (
    <div className={cn(
      "bg-[#1A1F26] rounded-lg p-4 border-2 border-gray-700 transition-all duration-200",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{emoji}</span>
          <span className="text-sm font-medium text-gray-300">{label} Prop Progress</span>
        </div>
        <div className="text-xs text-gray-500">
          {currentValue >= propLine * 0.8 ? 'Complete!' : `${(propLine - currentValue).toFixed(1)} ${unit} needed`}
        </div>
      </div>

      {/* Current vs Line */}
      <div className="mb-3">
        <div className="text-xl font-bold text-white text-center">
          <span className="text-[#00FF8B]">{currentValue.toFixed(1)}</span>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-gray-300">{propLine}</span>
          <span className="text-sm text-gray-500 ml-1">{unit} line</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="relative h-3 bg-[#2A2F36] rounded-full overflow-hidden">
          <div
            className="absolute h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: status.color,
              boxShadow: progress > 80 ? `0 0 8px ${status.color}50` : 'none'
            }}
          />
          
          {/* Progress text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-md">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{status.icon}</span>
          <span 
            className="text-sm font-medium"
            style={{ color: status.color }}
          >
            {status.text}
          </span>
        </div>
        
        {/* Confidence indicator */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-200",
                i < (status.confidence === 'high' ? 3 : status.confidence === 'medium' ? 2 : 1)
                  ? "bg-current opacity-100"
                  : "bg-gray-600 opacity-40"
              )}
              style={{ 
                color: status.confidence === 'high' ? '#00FF8B' : 
                       status.confidence === 'medium' ? '#FFD700' : '#FF6B35'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 