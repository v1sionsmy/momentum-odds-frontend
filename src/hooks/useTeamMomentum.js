import useSWR from 'swr';

// API configuration
const API_CONFIG = {
  development: 'http://localhost:8000',
  production: "https://nba-analytics-api.onrender.com"
};

const BASE_URL = API_CONFIG[process.env.NODE_ENV] || API_CONFIG.development;

// Fetcher function
const fetcher = async (url) => {
  const response = await fetch(`${BASE_URL}${url}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Calculate momentum absolute value for pulse speed
const calculateMomentumAbs = (momentum) => {
  return Math.abs(momentum || 0);
};

// Generate mock team data for testing
const generateMockTeamData = (gameId) => {
  const teamPairs = [
    { 
      home: { name: 'Boston Celtics', color: '#007A33' },
      away: { name: 'Los Angeles Lakers', color: '#552583' }
    },
    { 
      home: { name: 'Golden State Warriors', color: '#006BB6' },
      away: { name: 'Dallas Mavericks', color: '#00538C' }
    },
    { 
      home: { name: 'Miami Heat', color: '#98002E' },
      away: { name: 'Milwaukee Bucks', color: '#00471B' }
    }
  ];

  // Use game ID to select consistent team pairing
  const teamIndex = gameId ? parseInt(gameId) % teamPairs.length : 0;
  const selectedTeams = teamPairs[teamIndex];

  // Generate realistic momentum values
  const homeMomentum = (Math.random() - 0.5) * 120; // -60 to +60
  const awayMomentum = (Math.random() - 0.5) * 120; // -60 to +60

  return {
    teamMomentum: {
      home: homeMomentum,
      away: awayMomentum
    },
    homeTeam: {
      name: selectedTeams.home.name,
      primary_color: selectedTeams.home.color
    },
    awayTeam: {
      name: selectedTeams.away.name,
      primary_color: selectedTeams.away.color
    }
  };
};

/**
 * Hook for fetching team momentum data with SWR caching
 * @param {number|null} gameId - The game ID to fetch momentum for
 * @returns {Object} - { home, away, isLoading, error, mutate }
 */
export function useTeamMomentum(gameId) {
  const { data, error, isLoading, mutate } = useSWR(
    gameId ? `/api/games/${gameId}/momentum` : null,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
      // For demo purposes, provide fallback data
      fallbackData: gameId ? generateMockTeamData(gameId) : null
    }
  );

  // Transform data into the expected format
  let transformedData = null;
  
  if (data?.teamMomentum) {
    // Use real API data if available
    transformedData = {
      home: {
        momentum: data.teamMomentum?.home || 0,
        momentum_abs: calculateMomentumAbs(data.teamMomentum?.home),
        team_name: data.homeTeam?.name || 'Home Team',
        team_color: data.homeTeam?.primary_color || '#007A33'
      },
      away: {
        momentum: data.teamMomentum?.away || 0,
        momentum_abs: calculateMomentumAbs(data.teamMomentum?.away),
        team_name: data.awayTeam?.name || 'Away Team',
        team_color: data.awayTeam?.primary_color || '#006BB6'
      }
    };
  } else if (gameId) {
    // Use mock data for demo/testing
    const mockData = generateMockTeamData(gameId);
    transformedData = {
      home: {
        momentum: mockData.teamMomentum.home,
        momentum_abs: calculateMomentumAbs(mockData.teamMomentum.home),
        team_name: mockData.homeTeam.name,
        team_color: mockData.homeTeam.primary_color
      },
      away: {
        momentum: mockData.teamMomentum.away,
        momentum_abs: calculateMomentumAbs(mockData.teamMomentum.away),
        team_name: mockData.awayTeam.name,
        team_color: mockData.awayTeam.primary_color
      }
    };
  }

  return {
    home: transformedData?.home || null,
    away: transformedData?.away || null,
    isLoading: isLoading && !transformedData,
    error: error && !transformedData ? error : null,
    mutate
  };
} 