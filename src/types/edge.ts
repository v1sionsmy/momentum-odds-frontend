export interface Edge {
  edgeId: string;
  gameId: number;
  playerId: string;
  playerName: string;
  market: string;
  edgePct: number;
  timestamp: string;
  odds: {
    bookmaker: string;
    line: number;
    over: number;
    under: number;
  }[];
  modelProjection: {
    mean: number;
    stdDev: number;
    confidence: number;
  };
}

export type EdgeUpdate = Edge;

export interface EdgeError {
  code: 'EDGE_NOT_FOUND' | 'INVALID_GAME' | 'RATE_LIMITED';
  message: string;
} 