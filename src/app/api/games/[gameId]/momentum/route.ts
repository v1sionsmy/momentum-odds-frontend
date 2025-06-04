import { NextRequest, NextResponse } from 'next/server';
import { GameMomentumData } from '@/types/game';

type TeamMomentum = Record<string, number>;

// Mock data for testing - corresponds to our games
const mockMomentumDataByGame: Record<string, GameMomentumData> = {
  // Game 1: Boston Celtics vs New York Knicks
  '1': {
    teamMomentum: {
      "1": 6.2,   // Celtics - higher momentum
      "2": 2.1    // Knicks - lower momentum  
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
      "21": 4.2   // Warriors
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
      "6": 5.4    // Bulls - higher momentum
    },
    playerMomentum: {
      "3934681": 4.3,
      "3934682": 3.7,
      "3934683": 2.9
    }
  },
  
  // Default for other games
  'default': {
    teamMomentum: {
      "18": 3.9,  // Thunder
      "30": 3.79  // Spurs
    },
    playerMomentum: {
      "3934672": 5.1,
      "3934673": 4.2,
      "3934674": 3.8
    }
  }
};

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
  const teams = Object.keys(baseData.teamMomentum);
  
  let data = { ...baseData };
  
  if (teams.length >= 2) {
    const newTeamMomentum: TeamMomentum = {};
    
    // Apply variation and time-based changes
    teams.forEach((teamId, index) => {
      let momentum = baseData.teamMomentum[teamId];
      
      // Add variation
      if (index === 0) {
        momentum += variation;
      } else {
        momentum -= variation;
      }
      
      // Add time-based oscillation for more dynamic changes
      const timeVariation = Math.sin(now / 15000) * 0.3;
      momentum += index === 0 ? timeVariation : -timeVariation;
      
      newTeamMomentum[teamId] = Math.max(0.1, momentum);
    });
    
    data = {
      ...data,
      teamMomentum: newTeamMomentum
    };
  }
  
  // Simulate occasional API delays
  if (Math.random() < 0.1) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return NextResponse.json(data);
} 