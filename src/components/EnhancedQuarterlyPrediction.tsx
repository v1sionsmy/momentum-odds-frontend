import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Clock, Zap, Brain, BarChart3 } from 'lucide-react';
import { useQuarterlyPrediction, QuarterlyPredictionData } from '@/hooks/useQuarterlyPrediction';

interface EnhancedQuarterlyPredictionProps {
  gameId: number | null;
  playerId: number;
  playerName: string;
  quarterlyPrediction: ReturnType<typeof useQuarterlyPrediction>;
}

interface StatPrediction {
  label: string;
  icon: React.ReactNode;
  value: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  unit: string;
}

export default function EnhancedQuarterlyPrediction({
  gameId,
  playerId,
  playerName,
  quarterlyPrediction
}: EnhancedQuarterlyPredictionProps) {
  const [selectedQuarter, setSelectedQuarter] = useState<number>(2);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  
  const { predictQuarterly, predictionData, isLoading, error } = useQuarterlyPrediction();

  const handleQuarterSelect = (quarter: number) => {
    setSelectedQuarter(quarter);
    if (gameId) {
      predictQuarterly(gameId, playerId, quarter);
    }
  };

  const getStatPredictions = (data: QuarterlyPredictionData): StatPrediction[] => {
    return [
      {
        label: 'Points',
        icon: <Zap className="w-4 h-4" />,
        value: data.predicted_points,
        confidence: data.confidence_score,
        trend: data.predicted_points > 8 ? 'up' : data.predicted_points < 4 ? 'down' : 'stable',
        color: 'text-orange-400',
        unit: 'pts'
      },
      {
        label: 'Rebounds',
        icon: <Target className="w-4 h-4" />,
        value: data.predicted_rebounds,
        confidence: data.confidence_score,
        trend: data.predicted_rebounds > 3 ? 'up' : data.predicted_rebounds < 1.5 ? 'down' : 'stable',
        color: 'text-blue-400',
        unit: 'reb'
      },
      {
        label: 'Assists',
        icon: <BarChart3 className="w-4 h-4" />,
        value: data.predicted_assists,
        confidence: data.confidence_score,
        trend: data.predicted_assists > 2.5 ? 'up' : data.predicted_assists < 1 ? 'down' : 'stable',
        color: 'text-green-400',
        unit: 'ast'
      }
    ];
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400 bg-green-400/10';
    if (confidence >= 0.6) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Enhanced Quarterly Prediction</h2>
            <p className="text-sm text-gray-400">AI-powered performance forecasting for {playerName}</p>
          </div>
        </div>
        
        {/* Quarter Selection */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Predict:</span>
          {[2, 3, 4].map((quarter) => (
            <Button
              key={quarter}
              variant={selectedQuarter === quarter ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuarterSelect(quarter)}
              disabled={isLoading}
              className="w-12"
            >
              Q{quarter}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full" />
                <span className="text-gray-400">Analyzing performance patterns...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-900/20 border-red-400/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-red-400/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="font-medium text-red-400">Prediction Error</h3>
                <p className="text-sm text-red-300">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      {predictionData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Prediction Card */}
          <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span>Q{predictionData.quarter} Performance Forecast</span>
                </CardTitle>
                <Badge className={getConfidenceColor(predictionData.confidence_score)}>
                  {getConfidenceLabel(predictionData.confidence_score)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stat Predictions */}
              <div className="grid grid-cols-3 gap-4">
                {getStatPredictions(predictionData).map((stat, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={stat.color}>{stat.icon}</div>
                        <span className="text-sm font-medium text-gray-300">{stat.label}</span>
                      </div>
                      {getTrendIcon(stat.trend)}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {stat.value.toFixed(1)}
                      <span className="text-sm text-gray-400 ml-1">{stat.unit}</span>
                    </div>
                    <Progress 
                      value={stat.confidence * 100} 
                      className="h-1 bg-gray-700"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(stat.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                ))}
              </div>

              {/* Model Information */}
              <div className="bg-gray-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-gray-400">Model Type:</span>
                      <span className={`ml-2 ${
                        predictionData.model_type.includes('fallback') 
                          ? 'text-yellow-400' 
                          : 'text-white'
                      }`}>
                        {predictionData.model_type}
                      </span>
                      {predictionData.model_type.includes('fallback') && (
                        <Badge variant="outline" className="ml-2 text-xs text-yellow-400 border-yellow-400/30">
                          Statistical
                        </Badge>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-400">Training Data:</span>
                      <span className="text-white ml-2">Q{predictionData.using_quarters.join(', Q')}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(predictionData.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {predictionData.model_type.includes('fallback') && (
                  <div className="mt-2 text-xs text-yellow-300/80 bg-yellow-500/10 px-2 py-1 rounded">
                    ⚠️ Using statistical analysis - ML model temporarily unavailable
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Confidence & Analytics */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Model Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Confidence */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Overall Confidence</span>
                  <span className="text-sm font-medium text-white">
                    {(predictionData.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={predictionData.confidence_score * 100} 
                  className="h-2 bg-gray-700"
                />
              </div>

              {/* Performance Indicators */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 border-t border-gray-700 pt-3">
                  Performance Indicators
                </h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Scoring Potential</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(predictionData.predicted_points > 8 ? 'up' : 'down')}
                    <span className="text-xs text-white">
                      {predictionData.predicted_points > 8 ? 'High' : 'Moderate'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Playmaking</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(predictionData.predicted_assists > 2.5 ? 'up' : 'stable')}
                    <span className="text-xs text-white">
                      {predictionData.predicted_assists > 2.5 ? 'Active' : 'Steady'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Rebounding</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(predictionData.predicted_rebounds > 3 ? 'up' : 'stable')}
                    <span className="text-xs text-white">
                      {predictionData.predicted_rebounds > 3 ? 'Strong' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => handleQuarterSelect(selectedQuarter)}
                disabled={isLoading}
                className="w-full mt-4"
                variant="outline"
              >
                <Brain className="w-4 h-4 mr-2" />
                Refresh Prediction
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Data State */}
      {!predictionData && !isLoading && !error && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            <div className="text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Ready to Predict</h3>
              <p className="text-gray-400 mb-4">
                Select a quarter above to generate AI-powered performance predictions for {playerName}
              </p>
              <Button 
                onClick={() => gameId && predictQuarterly(gameId, playerId, selectedQuarter)}
                disabled={!gameId}
              >
                Generate Q{selectedQuarter} Prediction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 