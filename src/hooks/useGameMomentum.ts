import { useEffect, useState, useCallback } from "react";
import axios from "axios";

// Environment-based API configuration for legacy momentum endpoints
const LEGACY_API_CONFIG = {
  development: "http://localhost:8001", // Different port for legacy API
  production: "https://momentum-ignition-backend.onrender.com"
};

const LEGACY_BASE_URL = LEGACY_API_CONFIG[process.env.NODE_ENV as keyof typeof LEGACY_API_CONFIG] || LEGACY_API_CONFIG.development;

const api = axios.create({
  baseURL: LEGACY_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export type GameMomentumData = {
  teamMomentum: Record<string, number>;
  playerMomentum: Record<string, number>;
};

export type FlashPattern = {
  teamId: string;
  color: string;
  colorType: 'primary' | 'secondary';
  duration: number; // how long this flash should last in ms
}[];

// Team colors with primary and secondary
type TeamColors = {
  primary: string;
  secondary: string;
};

export const useGameMomentum = (gameId: number | null) => {
  const [momentumData, setMomentumData] = useState<GameMomentumData | null>(null);
  const [flashPattern, setFlashPattern] = useState<FlashPattern>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to calculate flash pattern from momentum data
  const calculateFlashPattern = (teamMomentum: Record<string, number>): FlashPattern => {
    const teams = Object.entries(teamMomentum);
    if (teams.length !== 2) return [];

    const [team1, team2] = teams;
    const [team1Id, team1Value] = team1;
    const [team2Id, team2Value] = team2;

    // Calculate ratio - normalize to get relative weights
    const total = team1Value + team2Value;
    const team1Ratio = team1Value / total;

    // Create pattern based on ratios
    // Base flash duration is 500ms, we'll create a pattern for 10 flashes (5 seconds total)
    const patternLength = 10;
    const team1Flashes = Math.round(team1Ratio * patternLength);
    const team2Flashes = patternLength - team1Flashes;

    // Shuffle to create more natural alternating pattern
    // Alternate between primary and secondary colors for each team
    const shuffledPattern: FlashPattern = [];
    let team1Count = 0;
    let team2Count = 0;
    let team1ColorToggle = true; // true = primary, false = secondary
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
        team1ColorToggle = !team1ColorToggle; // Alternate colors for this team
      } else if (team2Count < team2Flashes) {
        const teamColors = getTeamColors(team2Id);
        shuffledPattern.push({
          teamId: team2Id,
          color: team2ColorToggle ? teamColors.primary : teamColors.secondary,
          colorType: team2ColorToggle ? 'primary' : 'secondary',
          duration: 500
        });
        team2Count++;
        team2ColorToggle = !team2ColorToggle; // Alternate colors for this team
      } else {
        // Fallback to team1 if team2 is exhausted
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

  // Fetch momentum data
  const fetchMomentum = useCallback(async (gameId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data } = await api.get<GameMomentumData>(`/api/games/${gameId}/momentum`);
      setMomentumData(data);
      
      // Calculate new flash pattern
      if (data.teamMomentum) {
        const pattern = calculateFlashPattern(data.teamMomentum);
        setFlashPattern(pattern);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch momentum data"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up polling
  useEffect(() => {
    if (!gameId) {
      setMomentumData(null);
      setFlashPattern([]);
      return;
    }

    // Initial fetch
    fetchMomentum(gameId);

    // Set up polling every 2 seconds
    const interval = setInterval(() => {
      fetchMomentum(gameId);
    }, 2000);

    return () => clearInterval(interval);
  }, [gameId, fetchMomentum]);

  return {
    momentumData,
    flashPattern,
    error,
    isLoading,
  };
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

// Helper function to get team colors by ID
// NBA team colors mapped by team ID with primary and secondary colors
const getTeamColors = (teamId: string): TeamColors => {
  const TEAM_COLORS_BY_ID: Record<string, TeamColors> = {
    // Atlantic Division
    '1': { primary: '#007A33', secondary: '#BA9653' },   // Boston Celtics - Green, Gold
    '2': { primary: '#006BB6', secondary: '#F58426' },   // New York Knicks - Blue, Orange
    '3': { primary: '#000000', secondary: '#FFFFFF' },   // Brooklyn Nets - Black, White
    '4': { primary: '#006BB6', secondary: '#ED174C' },   // Philadelphia 76ers - Blue, Red
    '5': { primary: '#CE1141', secondary: '#000000' },   // Toronto Raptors - Red, Black
    
    // Central Division
    '6': { primary: '#CE1141', secondary: '#000000' },   // Chicago Bulls - Red, Black
    '7': { primary: '#6F263D', secondary: '#FDBB30' },   // Cleveland Cavaliers - Wine, Gold
    '8': { primary: '#C8102E', secondary: '#006BB6' },   // Detroit Pistons - Red, Blue
    '9': { primary: '#FDBB30', secondary: '#002D62' },   // Indiana Pacers - Gold, Navy
    '10': { primary: '#00471B', secondary: '#EEE1C6' },  // Milwaukee Bucks - Green, Cream
    
    // Southeast Division
    '11': { primary: '#E03A3E', secondary: '#C1D32F' },  // Atlanta Hawks - Red, Volt Green
    '12': { primary: '#1D1160', secondary: '#00788C' },  // Charlotte Hornets - Purple, Teal
    '13': { primary: '#98002E', secondary: '#F9A01B' },  // Miami Heat - Red, Orange
    '14': { primary: '#0077C0', secondary: '#C4CED4' },  // Orlando Magic - Blue, Silver
    '15': { primary: '#002B5C', secondary: '#E31837' },  // Washington Wizards - Navy, Red
    
    // Northwest Division
    '16': { primary: '#0E2240', secondary: '#FEC524' },  // Denver Nuggets - Navy, Gold
    '17': { primary: '#0C2340', secondary: '#78BE20' },  // Minnesota Timberwolves - Navy, Green
    '18': { primary: '#007AC1', secondary: '#EF3B24' },  // Oklahoma City Thunder - Blue, Orange
    '19': { primary: '#E03A3E', secondary: '#000000' },  // Portland Trail Blazers - Red, Black
    '20': { primary: '#002B5C', secondary: '#00471B' },  // Utah Jazz - Navy, Green
    
    // Pacific Division
    '21': { primary: '#1D428A', secondary: '#FFC72C' },  // Golden State Warriors - Blue, Gold
    '22': { primary: '#C8102E', secondary: '#1D428A' },  // Los Angeles Clippers - Red, Blue
    '23': { primary: '#552583', secondary: '#FDB927' },  // Los Angeles Lakers - Purple, Gold
    '24': { primary: '#1D1160', secondary: '#E56020' },  // Phoenix Suns - Purple, Orange
    '25': { primary: '#5A2D81', secondary: '#63727A' },  // Sacramento Kings - Purple, Gray
    
    // Southwest Division
    '26': { primary: '#00538C', secondary: '#002F5F' },  // Dallas Mavericks - Blue, Navy
    '27': { primary: '#CE1141', secondary: '#000000' },  // Houston Rockets - Red, Black
    '28': { primary: '#5D76A9', secondary: '#12173F' },  // Memphis Grizzlies - Blue, Navy
    '29': { primary: '#0C2340', secondary: '#C8102E' },  // New Orleans Pelicans - Navy, Red
    '30': { primary: '#C4CED4', secondary: '#000000' },  // San Antonio Spurs - Silver, Black
    
    // Alternative team IDs that might be used
    '38': { primary: '#1D428A', secondary: '#FFC72C' },  // Golden State Warriors (alt ID)
    '40': { primary: '#1D1160', secondary: '#E56020' },  // Phoenix Suns (alt ID)
  };

  return TEAM_COLORS_BY_ID[teamId] || { primary: '#888888', secondary: '#666666' }; // Default gray for unknown teams
}; 