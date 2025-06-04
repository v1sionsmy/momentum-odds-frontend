import { NextRequest, NextResponse } from 'next/server';
import { Player } from '@/types/game';

// Mock players data for different games
const mockPlayersData: Record<string, Player[]> = {
  '1': [
    { player_id: 'player_001', name: 'Jayson Tatum', position: 'SF', minutes_played: '32:45', team_id: '1' },
    { player_id: 'player_002', name: 'Jaylen Brown', position: 'SG', minutes_played: '28:12', team_id: '1' },
    { player_id: 'player_003', name: 'Marcus Smart', position: 'PG', minutes_played: '25:33', team_id: '1' },
    { player_id: 'player_004', name: 'Julius Randle', position: 'PF', minutes_played: '30:22', team_id: '2' },
    { player_id: 'player_005', name: 'RJ Barrett', position: 'SF', minutes_played: '26:18', team_id: '2' },
    { player_id: 'player_006', name: 'Jalen Brunson', position: 'PG', minutes_played: '29:45', team_id: '2' }
  ],
  '2': [
    { player_id: 'player_007', name: 'LeBron James', position: 'SF', minutes_played: '35:12', team_id: '23' },
    { player_id: 'player_008', name: 'Anthony Davis', position: 'PF', minutes_played: '33:45', team_id: '23' },
    { player_id: 'player_009', name: 'Russell Westbrook', position: 'PG', minutes_played: '28:30', team_id: '23' },
    { player_id: 'player_010', name: 'Stephen Curry', position: 'PG', minutes_played: '34:22', team_id: '21' },
    { player_id: 'player_011', name: 'Klay Thompson', position: 'SG', minutes_played: '31:15', team_id: '21' },
    { player_id: 'player_012', name: 'Draymond Green', position: 'PF', minutes_played: '29:33', team_id: '21' }
  ],
  '3': [
    { player_id: 'player_013', name: 'Jimmy Butler', position: 'SF', minutes_played: '32:18', team_id: '13' },
    { player_id: 'player_014', name: 'Bam Adebayo', position: 'C', minutes_played: '30:45', team_id: '13' },
    { player_id: 'player_015', name: 'Tyler Herro', position: 'SG', minutes_played: '27:12', team_id: '13' },
    { player_id: 'player_016', name: 'DeMar DeRozan', position: 'SF', minutes_played: '33:22', team_id: '6' },
    { player_id: 'player_017', name: 'Zach LaVine', position: 'SG', minutes_played: '31:45', team_id: '6' },
    { player_id: 'player_018', name: 'Nikola Vucevic', position: 'C', minutes_played: '28:30', team_id: '6' }
  ],
  'default': [
    { player_id: 'player_019', name: 'Player A', position: 'PG', minutes_played: '25:00', team_id: '1' },
    { player_id: 'player_020', name: 'Player B', position: 'SG', minutes_played: '22:30', team_id: '1' },
    { player_id: 'player_021', name: 'Player C', position: 'SF', minutes_played: '28:15', team_id: '2' },
    { player_id: 'player_022', name: 'Player D', position: 'PF', minutes_played: '26:45', team_id: '2' }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  
  // Get players for this game
  const players = mockPlayersData[gameId] || mockPlayersData['default'];
  
  // Simulate occasional API delays
  if (Math.random() < 0.1) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return NextResponse.json(players);
} 