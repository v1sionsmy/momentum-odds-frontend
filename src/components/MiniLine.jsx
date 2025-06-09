import React from 'react';

/**
 * MiniLine - Lightweight sparkline component for momentum trends
 * @param {Object} props
 * @param {Array<number>} props.data - Array of numeric values to plot
 * @param {number} props.width - Width of the sparkline (default: 60)
 * @param {number} props.height - Height of the sparkline (default: 20)
 * @param {string} props.color - Color of the line (default: '#ffffff')
 * @param {number} props.strokeWidth - Stroke width (default: 2)
 */
export function MiniLine({ 
  data = [], 
  width = 60, 
  height = 20, 
  color = '#ffffff', 
  strokeWidth = 2 
}) {
  if (!data || data.length < 2) {
    // Show flat line for insufficient data
    return (
      <svg width={width} height={height} className="opacity-50">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
      </svg>
    );
  }

  // Calculate min/max values for scaling
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1; // Prevent division by zero
  
  // Generate points for the polyline
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
      
      {/* Add small dots at data points for emphasis */}
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - minValue) / range) * height;
        
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={1}
            fill={color}
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
} 