import { NextResponse } from 'next/server';

// Mock games data
const mockGames = [
  {
    id: 1,
    api_game_id: 1,
    home_team: "Boston Celtics",
    away_team: "New York Knicks", 
    home_score: 98,
    away_score: 92,
    status: "LIVE",
    date: "2024-01-15T19:30:00Z"
  },
  {
    id: 2,
    api_game_id: 2,
    home_team: "Los Angeles Lakers",
    away_team: "Golden State Warriors",
    home_score: 105,
    away_score: 110,
    status: "LIVE", 
    date: "2024-01-15T22:00:00Z"
  },
  {
    id: 3,
    api_game_id: 3,
    home_team: "Miami Heat",
    away_team: "Chicago Bulls",
    home_score: 87,
    away_score: 89,
    status: "LIVE",
    date: "2024-01-15T20:00:00Z"
  },
  {
    id: 4,
    api_game_id: 4,
    home_team: "Denver Nuggets",
    away_team: "Phoenix Suns",
    home_score: 0,
    away_score: 0,
    status: "Not Started",
    date: "2024-01-16T21:00:00Z"
  },
  {
    id: 5,
    api_game_id: 5,
    home_team: "Dallas Mavericks",
    away_team: "San Antonio Spurs",
    home_score: 112,
    away_score: 108,
    status: "Game Finished",
    date: "2024-01-14T20:30:00Z"
  }
];

export async function GET() {
  // Add some random score changes for live games to simulate real-time updates
  const dynamicGames = mockGames.map(game => {
    if (game.status !== "Not Started" && game.status !== "Game Finished") {
      // Add random points occasionally
      const homeChange = Math.random() < 0.1 ? Math.floor(Math.random() * 3) : 0;
      const awayChange = Math.random() < 0.1 ? Math.floor(Math.random() * 3) : 0;
      
      return {
        ...game,
        home_score: game.home_score + homeChange,
        away_score: game.away_score + awayChange
      };
    }
    return game;
  });

  return NextResponse.json(dynamicGames);
} 