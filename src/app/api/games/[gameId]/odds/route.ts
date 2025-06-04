import { NextRequest, NextResponse } from 'next/server';

// Mock odds data for different games
const mockOddsData: Record<string, any> = {
  '1': {
    gameId: 1,
    homeTeam: 'Boston Celtics',
    awayTeam: 'New York Knicks',
    markets: {
      moneyline: {
        home: -180,
        away: +165
      },
      spread: {
        points: 5.5,
        home: -110,
        away: -110
      },
      total: {
        points: 212.5,
        over: -110,
        under: -110
      }
    },
    lastUpdate: new Date().toLocaleTimeString()
  },
  '2': {
    gameId: 2,
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    markets: {
      moneyline: {
        home: -125,
        away: +105
      },
      spread: {
        points: 2.5,
        home: -110,
        away: -110
      },
      total: {
        points: 225.5,
        over: -105,
        under: -115
      }
    },
    lastUpdate: new Date().toLocaleTimeString()
  },
  '3': {
    gameId: 3,
    homeTeam: 'Miami Heat',
    awayTeam: 'Chicago Bulls',
    markets: {
      moneyline: {
        home: +140,
        away: -160
      },
      spread: {
        points: 3.5,
        home: +110,
        away: -110
      },
      total: {
        points: 208.5,
        over: -110,
        under: -110
      }
    },
    lastUpdate: new Date().toLocaleTimeString()
  },
  'default': {
    gameId: 0,
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    markets: {
      moneyline: {
        home: -110,
        away: -110
      },
      spread: {
        points: 0,
        home: -110,
        away: -110
      },
      total: {
        points: 200,
        over: -110,
        under: -110
      }
    },
    lastUpdate: new Date().toLocaleTimeString()
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  
  // Get odds for this game
  let baseData = mockOddsData[gameId] || mockOddsData['default'];
  
  // Add some variability to simulate changing odds
  const variation = (Math.random() - 0.5) * 10; // ±5 points
  
  const data = {
    ...baseData,
    markets: {
      moneyline: {
        home: Math.round(baseData.markets.moneyline.home + variation),
        away: Math.round(baseData.markets.moneyline.away - variation)
      },
      spread: {
        points: baseData.markets.spread.points,
        home: Math.round(baseData.markets.spread.home + variation * 0.1),
        away: Math.round(baseData.markets.spread.away - variation * 0.1)
      },
      total: {
        points: baseData.markets.total.points,
        over: Math.round(baseData.markets.total.over + variation * 0.1),
        under: Math.round(baseData.markets.total.under - variation * 0.1)
      }
    },
    lastUpdate: new Date().toLocaleTimeString()
  };
  
  // Simulate occasional API delays
  if (Math.random() < 0.1) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return NextResponse.json(data);
} 