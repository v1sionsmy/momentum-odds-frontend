import { NextRequest, NextResponse } from 'next/server';
import { GameMomentumData } from '@/types/game';

type TeamMomentum = Record<string, number>;

// Team ID to name mapping for better frontend compatibility
const teamIdToName: Record<string, string> = {
  '1': 'Boston Celtics',
  '2': 'New York Knicks',
  '6': 'Chicago Bulls',
  '9': 'Indiana Pacers',
  '13': 'Miami Heat',
  '18': 'Oklahoma City Thunder',
  '21': 'Golden State Warriors',
  '23': 'Los Angeles Lakers',
  '25': 'Sacramento Kings',
  '30': 'San Antonio Spurs'
};

// Mock data for testing - corresponds to our games
const mockMomentumDataByGame: Record<string, GameMomentumData> = {
  // Game 1: Boston Celtics vs New York Knicks
  '1': {
    teamMomentum: {
      "1": 6.2,   // Celtics - higher momentum
      "2": 2.1,   // Knicks - lower momentum
      "Boston Celtics": 6.2,
      "New York Knicks": 2.1
    },
    playerMomentum: {
      "3934675": 4.5,
      "3934676": 3.9,
      "3934677": 2.8
    }
  },
  
  // Game 2: Lakers vs Warriors  
  '2': {
    teamMomentum: {
      "23": 4.8,  // Lakers - slight edge
      "21": 4.2,  // Warriors
      "Los Angeles Lakers": 4.8,
      "Golden State Warriors": 4.2
    },
    playerMomentum: {
      "3934678": 5.1,
      "3934679": 4.2,
      "3934680": 3.8
    }
  },
  
  // Game 3: Heat vs Bulls
  '3': {
    teamMomentum: {
      "13": 3.9,  // Heat
      "6": 5.4,   // Bulls - higher momentum
      "Miami Heat": 3.9,
      "Chicago Bulls": 5.4
    },
    playerMomentum: {
      "3934681": 4.3,
      "3934682": 3.7,
      "3934683": 2.9
    }
  },
  
  // Game 6: Thunder vs Pacers (upcoming)
  '6': {
    teamMomentum: {
      "18": 4.2,  // Thunder - slight edge
      "9": 3.8,   // Pacers
      "Oklahoma City Thunder": 4.2,
      "Indiana Pacers": 3.8
    },
    playerMomentum: {
      "3934690": 4.8,
      "3934691": 4.1,
      "3934692": 3.9,
      "3934693": 4.3,
      "3934694": 3.7
    }
  },
  
  // Default for other games - Thunder vs Pacers
  'default': {
    teamMomentum: {
      "18": 3.9,  // Thunder
      "9": 3.4,   // Pacers
      "Oklahoma City Thunder": 3.9,
      "Indiana Pacers": 3.4
    },
    playerMomentum: {
      "3934672": 5.1,
      "3934673": 4.2,
      "3934674": 3.8
    }
  }
};

// Helper function to create momentum data with both ID and name keys
function createTeamMomentumData(baseTeamMomentum: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = { ...baseTeamMomentum };
  
  // Add team name keys for any team ID keys that exist
  Object.entries(baseTeamMomentum).forEach(([key, value]) => {
    if (teamIdToName[key] && !result[teamIdToName[key]]) {
      result[teamIdToName[key]] = value;
    }
  });
  
  return result;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  
  // Get the base data for this game
  const baseData = mockMomentumDataByGame[gameId] || mockMomentumDataByGame['default'];
  
  // Add some variability based on time to simulate changing momentum
  const now = Date.now();
  
  // Add some random variation
  const variation = (Math.random() - 0.5) * 0.5; // ±0.25
  const baseTeamMomentum = baseData.teamMomentum;
  
  // Get unique teams (filter out duplicate entries)
  const teamIds = Object.keys(baseTeamMomentum).filter(key => !isNaN(Number(key)));
  
  let newTeamMomentum: TeamMomentum = {};
  
  if (teamIds.length >= 1) {
    // Apply variation and time-based changes to team IDs only, then propagate to names
    teamIds.forEach((teamId, index) => {
      let momentum = baseTeamMomentum[teamId];
      
      // Add variation
      if (index === 0) {
        momentum += variation;
      } else {
        momentum -= variation;
      }
      
      // Add time-based oscillation for more dynamic changes
      const timeVariation = Math.sin(now / 15000) * 0.3;
      momentum += index === 0 ? timeVariation : -timeVariation;
      
      const finalMomentum = Math.max(0.1, Math.min(10.0, momentum));
      
      // Set both team ID and team name
      newTeamMomentum[teamId] = finalMomentum;
      if (teamIdToName[teamId]) {
        newTeamMomentum[teamIdToName[teamId]] = finalMomentum;
      }
    });
  } else {
    // Fallback: use original data with both keys
    newTeamMomentum = createTeamMomentumData(baseTeamMomentum);
  }

  const data = {
    ...baseData,
    teamMomentum: newTeamMomentum
  };
  
  // Simulate occasional API delays
  if (Math.random() < 0.1) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return NextResponse.json(data);
} 