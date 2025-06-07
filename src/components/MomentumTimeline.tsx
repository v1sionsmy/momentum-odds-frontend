import React from 'react';

interface MomentumSnapshot {
  id: number;
  timestamp: string;
  momentum_data: {
    team_momentum: {
      home_team: {
        name: string;
        momentum_score: number;
      };
      away_team: {
        name: string;
        momentum_score: number;
      };
    };
  };
}

interface MomentumTimelineProps {
  snapshots: MomentumSnapshot[];
  currentSnapshotId?: number;
  className?: string;
}

export function MomentumTimeline({ snapshots, currentSnapshotId, className = "" }: MomentumTimelineProps) {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="text-gray-400 text-center">No momentum timeline data available</div>
      </div>
    );
  }

  const width = 800;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Get team names
  const homeTeam = snapshots[0]?.momentum_data?.team_momentum?.home_team?.name || "Home";
  const awayTeam = snapshots[0]?.momentum_data?.team_momentum?.away_team?.name || "Away";

  // Prepare data points
  const dataPoints = snapshots.map((snapshot, index) => ({
    index,
    id: snapshot.id,
    homeScore: snapshot.momentum_data?.team_momentum?.home_team?.momentum_score || 0,
    awayScore: snapshot.momentum_data?.team_momentum?.away_team?.momentum_score || 0,
    timestamp: snapshot.timestamp
  }));

  // Scale functions
  const xScale = (index: number) => (index / (snapshots.length - 1)) * chartWidth;
  const yScale = (value: number) => chartHeight - (value * chartHeight);

  // Create path strings for the lines
  const createPath = (values: number[]) => {
    return values
      .map((value, index) => {
        const x = xScale(index);
        const y = yScale(value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const homeTeamPath = createPath(dataPoints.map(d => d.homeScore));
  const awayTeamPath = createPath(dataPoints.map(d => d.awayScore));

  // Find current point index
  const currentIndex = dataPoints.findIndex(d => d.id === currentSnapshotId);

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Momentum Timeline</h3>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-300">{homeTeam}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-300">{awayTeam}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <svg width={width} height={height} className="bg-gray-900 rounded">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart area */}
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map(value => (
              <g key={value}>
                <line
                  x1={-5}
                  y1={yScale(value)}
                  x2={chartWidth}
                  y2={yScale(value)}
                  stroke="#4B5563"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <text
                  x={-10}
                  y={yScale(value) + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-400"
                >
                  {value.toFixed(2)}
                </text>
              </g>
            ))}
            
            {/* Home team line */}
            <path
              d={homeTeamPath}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Away team line */}
            <path
              d={awayTeamPath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Data points */}
            {dataPoints.map((point, index) => (
              <g key={point.id}>
                {/* Home team point */}
                <circle
                  cx={xScale(index)}
                  cy={yScale(point.homeScore)}
                  r={index === currentIndex ? "6" : "3"}
                  fill="#3B82F6"
                  stroke={index === currentIndex ? "#FFF" : "none"}
                  strokeWidth="2"
                  className={index === currentIndex ? "animate-pulse" : ""}
                />
                
                {/* Away team point */}
                <circle
                  cx={xScale(index)}
                  cy={yScale(point.awayScore)}
                  r={index === currentIndex ? "6" : "3"}
                  fill="#EF4444"
                  stroke={index === currentIndex ? "#FFF" : "none"}
                  strokeWidth="2"
                  className={index === currentIndex ? "animate-pulse" : ""}
                />
              </g>
            ))}
            
            {/* Current time indicator line */}
            {currentIndex >= 0 && (
              <line
                x1={xScale(currentIndex)}
                y1={0}
                x2={xScale(currentIndex)}
                y2={chartHeight}
                stroke="#FFF"
                strokeWidth="2"
                opacity="0.7"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            )}
            
            {/* X-axis */}
            <line
              x1={0}
              y1={chartHeight}
              x2={chartWidth}
              y2={chartHeight}
              stroke="#4B5563"
              strokeWidth="1"
            />
            
            {/* Y-axis */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={chartHeight}
              stroke="#4B5563"
              strokeWidth="1"
            />
          </g>
          
          {/* Labels */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-gray-400"
          >
            Game Timeline →
          </text>
          
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${height / 2})`}
            className="text-xs fill-gray-400"
          >
            Momentum Score
          </text>
        </svg>
      </div>
      
      {/* Current values */}
      {currentIndex >= 0 && (
        <div className="mt-4 flex justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">
              {homeTeam}: {dataPoints[currentIndex]?.homeScore.toFixed(3)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">
              {awayTeam}: {dataPoints[currentIndex]?.awayScore.toFixed(3)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 