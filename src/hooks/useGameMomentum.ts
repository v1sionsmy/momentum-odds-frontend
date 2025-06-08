import { useEffect, useState, useCallback } from "react";
import { useGameMomentumWebSocket, GameMomentumData, FlashPattern } from "./useGameMomentumWebSocket";

// Fallback API configuration
const API_CONFIG = {
  development: 'http://localhost:8000',
  production: "https://nba-analytics-api.onrender.com"
};

const LEGACY_BASE_URL = API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG] || API_CONFIG.development;

// Export types from WebSocket hook
export type { GameMomentumData, FlashPattern } from "./useGameMomentumWebSocket";

export const useGameMomentum = (gameId: number | null) => {
  // Primary WebSocket connection
  const {
    momentumData: wsMomentumData,
    flashPattern: wsFlashPattern,
    connectionStatus,
    error: wsError,
    isLoading: wsLoading,
    reconnect: wsReconnect,
    isConnected: wsConnected
  } = useGameMomentumWebSocket(gameId);

  // Fallback polling states - properly typed
  const [fallbackData, setFallbackData] = useState<GameMomentumData | null>(null);
  const [fallbackPattern, setFallbackPattern] = useState<FlashPattern>([]);
  const [fallbackError, setFallbackError] = useState<Error | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Determine which data source to use
  const shouldUseFallback = !wsConnected && connectionStatus !== 'connecting';
  const momentumData = shouldUseFallback ? fallbackData : wsMomentumData;
  const flashPattern = shouldUseFallback ? fallbackPattern : wsFlashPattern;
  const error = shouldUseFallback ? fallbackError : wsError;
  const isLoading = wsLoading && !momentumData;

  // Fallback API call
  const fetchFallbackData = useCallback(async (gameId: number) => {
    try {
      setFallbackError(null);
      const response = await fetch(`${LEGACY_BASE_URL}/api/games/${gameId}/momentum`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFallbackData(data);
      
      // Calculate flash pattern for fallback data
      if (data.teamMomentum) {
        const pattern = calculateFlashPattern(data.teamMomentum);
        setFallbackPattern(pattern);
      }
    } catch (err) {
      setFallbackError(err instanceof Error ? err : new Error("Failed to fetch momentum data"));
    }
  }, []);

  // Fallback polling effect
  useEffect(() => {
    if (!gameId || !shouldUseFallback) {
      setUsingFallback(false);
      return;
    }

    console.log('🔄 Using fallback polling for game momentum');
    setUsingFallback(true);

    // Initial fetch
    fetchFallbackData(gameId);

    // Poll every 30 seconds as fallback (much more conservative than before)
    const interval = setInterval(() => {
      fetchFallbackData(gameId);
    }, 30000);

    return () => clearInterval(interval);
  }, [gameId, shouldUseFallback, fetchFallbackData]);

  return {
    momentumData,
    flashPattern,
    error,
    isLoading,
    connectionStatus,
    isConnected: wsConnected,
    usingFallback,
    reconnect: wsReconnect
  };
};

// Team colors helper - moved up and properly typed
type TeamColors = {
  primary: string;
  secondary: string;
};

const getTeamColors = (teamId: string): TeamColors => {
  const TEAM_COLORS_BY_ID: Record<string, TeamColors> = {
    '1': { primary: '#007A33', secondary: '#BA9653' },   // Boston Celtics
    '2': { primary: '#006BB6', secondary: '#F58426' },   // New York Knicks
    '9': { primary: '#FDBB30', secondary: '#002D62' },   // Indiana Pacers
    '18': { primary: '#007AC1', secondary: '#EF3B24' },  // Oklahoma City Thunder
    '21': { primary: '#1D428A', secondary: '#FFC72C' },  // Golden State Warriors
    '23': { primary: '#552583', secondary: '#FDB927' },  // Los Angeles Lakers
  };

  return TEAM_COLORS_BY_ID[teamId] || { primary: '#888888', secondary: '#666666' };
};

// Flash pattern calculation for fallback
const calculateFlashPattern = (teamMomentum: Record<string, number>): FlashPattern => {
  const teams = Object.entries(teamMomentum);
  if (teams.length !== 2) return [];

  const [team1, team2] = teams;
  const [team1Id, team1Value] = team1;
  const [team2Id, team2Value] = team2;

  const total = team1Value + team2Value;
  const team1Ratio = team1Value / total;

  const patternLength = 10;
  const team1Flashes = Math.round(team1Ratio * patternLength);
  const team2Flashes = patternLength - team1Flashes;

  const shuffledPattern: FlashPattern = [];
  let team1Count = 0;
  let team2Count = 0;
  let team1ColorToggle = true;
  let team2ColorToggle = true;
  
  for (let i = 0; i < patternLength; i++) {
    const shouldUseTeam1 = (team1Count / team1Flashes) <= (team2Count / team2Flashes) && team1Count < team1Flashes;
    
    if (shouldUseTeam1) {
      const teamColors = getTeamColors(team1Id);
      shuffledPattern.push({
        teamId: team1Id,
        color: team1ColorToggle ? teamColors.primary : teamColors.secondary,
        colorType: team1ColorToggle ? 'primary' : 'secondary',
        duration: 500
      });
      team1Count++;
      team1ColorToggle = !team1ColorToggle;
    } else if (team2Count < team2Flashes) {
      const teamColors = getTeamColors(team2Id);
      shuffledPattern.push({
        teamId: team2Id,
        color: team2ColorToggle ? teamColors.primary : teamColors.secondary,
        colorType: team2ColorToggle ? 'primary' : 'secondary',
        duration: 500
      });
      team2Count++;
      team2ColorToggle = !team2ColorToggle;
    } else {
      const teamColors = getTeamColors(team1Id);
      shuffledPattern.push({
        teamId: team1Id,
        color: team1ColorToggle ? teamColors.primary : teamColors.secondary,
        colorType: team1ColorToggle ? 'primary' : 'secondary',
        duration: 500
      });
      team1Count++;
      team1ColorToggle = !team1ColorToggle;
    }
  }

  return shuffledPattern;
};

// Helper function to get team ID by team name
const getTeamIdByName = (teamName: string): string => {
  const TEAM_NAME_TO_ID: Record<string, string> = {
    'Boston Celtics': '1',
    'New York Knicks': '2',
    'Brooklyn Nets': '3',
    'Philadelphia 76ers': '4',
    'Toronto Raptors': '5',
    'Chicago Bulls': '6',
    'Cleveland Cavaliers': '7',
    'Detroit Pistons': '8',
    'Indiana Pacers': '9',
    'Milwaukee Bucks': '10',
    'Atlanta Hawks': '11',
    'Charlotte Hornets': '12',
    'Miami Heat': '13',
    'Orlando Magic': '14',
    'Washington Wizards': '15',
    'Denver Nuggets': '16',
    'Minnesota Timberwolves': '17',
    'Oklahoma City Thunder': '18',
    'Portland Trail Blazers': '19',
    'Utah Jazz': '20',
    'Golden State Warriors': '21',
    'Los Angeles Clippers': '22',
    'Los Angeles Lakers': '23',
    'Phoenix Suns': '24',
    'Sacramento Kings': '25',
    'Dallas Mavericks': '26',
    'Houston Rockets': '27',
    'Memphis Grizzlies': '28',
    'New Orleans Pelicans': '29',
    'San Antonio Spurs': '30',
  };
  
  return TEAM_NAME_TO_ID[teamName] || '0';
};

// Helper function to get team colors by team name (for easier access)
export const getTeamColorsByName = (teamName: string): TeamColors => {
  const teamId = getTeamIdByName(teamName);
  return getTeamColors(teamId);
};

// Helper function to get team color by team name (backward compatibility)
export const getTeamColorByName = (teamName: string): string => {
  const teamId = getTeamIdByName(teamName);
  return getTeamColors(teamId).primary;
}; 