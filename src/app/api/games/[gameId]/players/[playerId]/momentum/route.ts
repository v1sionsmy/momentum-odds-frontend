import { NextRequest, NextResponse } from 'next/server';
import { PlayerMomentumResponse } from '@/types/game';

// Mock player momentum data with prop betting info
const mockPlayerMomentumData: Record<string, PlayerMomentumResponse> = {
  // Mock player IDs and their momentum data
  'player_001': {
    playerMomentum: {
      ptsMom: 4.2,
      rebMom: 3.1,
      astMom: 2.8,
      blkMom: 1.5,
      stlMom: 2.2
    },
    correlations: {
      ptsMom: true,   // High correlation
      rebMom: false,  // Low correlation
      astMom: true,   // High correlation
      blkMom: false,  // Low correlation
      stlMom: true    // High correlation
    },
    currentStats: {
      points: 18.5,
      rebounds: 7.2,
      assists: 4.8,
      blocks: 0.8,
      steals: 1.4
    },
    propLines: {
      points: 21.5,
      rebounds: 8.5,
      assists: 5.5,
      blocks: 1.5,
      steals: 1.5
    }
  },
  'player_002': {
    playerMomentum: {
      ptsMom: 3.8,
      rebMom: 4.5,
      astMom: 1.9,
      blkMom: 3.2,
      stlMom: 1.8
    },
    correlations: {
      ptsMom: false,
      rebMom: true,
      astMom: false,
      blkMom: true,
      stlMom: false
    },
    currentStats: {
      points: 14.2,
      rebounds: 9.8,
      assists: 2.1,
      blocks: 2.3,
      steals: 0.9
    },
    propLines: {
      points: 16.5,
      rebounds: 9.5,
      assists: 3.5,
      blocks: 1.5,
      steals: 1.5
    }
  },
  'player_003': {
    playerMomentum: {
      ptsMom: 5.1,
      rebMom: 2.3,
      astMom: 4.2,
      blkMom: 1.1,
      stlMom: 3.4
    },
    correlations: {
      ptsMom: true,
      rebMom: false,
      astMom: true,
      blkMom: false,
      stlMom: true
    },
    currentStats: {
      points: 22.8,
      rebounds: 4.1,
      assists: 7.3,
      blocks: 0.5,
      steals: 2.2
    },
    propLines: {
      points: 24.5,
      rebounds: 6.5,
      assists: 6.5,
      blocks: 1.5,
      steals: 1.5
    }
  },
  'player_004': {
    playerMomentum: {
      ptsMom: 2.9,
      rebMom: 1.8,
      astMom: 3.7,
      blkMom: 2.1,
      stlMom: 1.2
    },
    correlations: {
      ptsMom: false,
      rebMom: false,
      astMom: true,
      blkMom: true,
      stlMom: false
    },
    currentStats: {
      points: 12.1,
      rebounds: 3.4,
      assists: 8.9,
      blocks: 1.2,
      steals: 0.7
    },
    propLines: {
      points: 15.5,
      rebounds: 5.5,
      assists: 7.5,
      blocks: 1.5,
      steals: 1.5
    }
  },
  'player_005': {
    playerMomentum: {
      ptsMom: 3.6,
      rebMom: 3.9,
      astMom: 2.1,
      blkMom: 1.8,
      stlMom: 2.8
    },
    correlations: {
      ptsMom: true,
      rebMom: true,
      astMom: false,
      blkMom: false,
      stlMom: true
    },
    currentStats: {
      points: 19.7,
      rebounds: 6.8,
      assists: 3.2,
      blocks: 1.1,
      steals: 1.9
    },
    propLines: {
      points: 18.5,
      rebounds: 7.5,
      assists: 4.5,
      blocks: 1.5,
      steals: 1.5
    }
  },
  // Default for unknown players
  'default': {
    playerMomentum: {
      ptsMom: 3.0,
      rebMom: 2.5,
      astMom: 2.0,
      blkMom: 1.0,
      stlMom: 1.5
    },
    correlations: {
      ptsMom: false,
      rebMom: false,
      astMom: true,
      blkMom: false,
      stlMom: false
    },
    currentStats: {
      points: 15.2,
      rebounds: 5.1,
      assists: 3.8,
      blocks: 0.9,
      steals: 1.1
    },
    propLines: {
      points: 17.5,
      rebounds: 6.5,
      assists: 4.5,
      blocks: 1.5,
      steals: 1.5
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string; playerId: string }> }
) {
  const { playerId } = await params;
  
  // Get the base data for this player
  const baseData = mockPlayerMomentumData[playerId] || mockPlayerMomentumData['default'];
  
  // Add some variability based on time to simulate changing momentum and stats
  const variation = (Math.random() - 0.5) * 0.5; // ±0.25
  const statVariation = (Math.random() - 0.5) * 2; // ±1.0 for stats
  
  // Create slightly varied data
  const data = {
    playerMomentum: {
      ptsMom: Math.max(0.1, baseData.playerMomentum.ptsMom + variation),
      rebMom: Math.max(0.1, baseData.playerMomentum.rebMom + variation * 0.8),
      astMom: Math.max(0.1, baseData.playerMomentum.astMom + variation * 0.6),
      blkMom: Math.max(0.1, baseData.playerMomentum.blkMom + variation * 0.4),
      stlMom: Math.max(0.1, baseData.playerMomentum.stlMom + variation * 0.7)
    },
    correlations: baseData.correlations,
    currentStats: {
      points: Math.max(0, baseData.currentStats.points + statVariation),
      rebounds: Math.max(0, baseData.currentStats.rebounds + statVariation * 0.5),
      assists: Math.max(0, baseData.currentStats.assists + statVariation * 0.4),
      blocks: Math.max(0, baseData.currentStats.blocks + statVariation * 0.2),
      steals: Math.max(0, baseData.currentStats.steals + statVariation * 0.3)
    },
    propLines: baseData.propLines
  };
  
  // Simulate occasional API delays
  if (Math.random() < 0.05) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return NextResponse.json(data);
} 