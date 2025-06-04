export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  gameTime: string;
  status: string;
}

export interface Player {
  player_id: string;
  name: string;
  position: string;
  minutes_played: string;
  team_id: string;
}

export interface OddsMarkets {
  moneyline: {
    home: number;
    away: number;
  };
  spread: {
    points: number;
    home: number;
    away: number;
  };
  total: {
    points: number;
    over: number;
    under: number;
  };
}

export interface GameOdds {
  gameId: number;
  homeTeam: string;
  awayTeam: string;
  markets: OddsMarkets;
  lastUpdate: string;
}

export interface PlayerStats {
  points: number;
  rebounds: number;
  assists: number;
  blocks: number;
  steals: number;
}

export interface PlayerPropLines {
  points: number;
  rebounds: number;
  assists: number;
  blocks: number;
  steals: number;
}

export interface PlayerMomentumData {
  ptsMom: number;
  rebMom: number;
  astMom: number;
  blkMom: number;
  stlMom: number;
}

export interface PlayerCorrelations {
  ptsMom: boolean;
  rebMom: boolean;
  astMom: boolean;
  blkMom: boolean;
  stlMom: boolean;
}

export interface PlayerMomentumResponse {
  playerMomentum: PlayerMomentumData;
  correlations: PlayerCorrelations;
  currentStats: PlayerStats;
  propLines: PlayerPropLines;
}

export type TeamMomentumRecord = Record<string, number>;

export interface GameMomentumData {
  teamMomentum: TeamMomentumRecord;
  playerMomentum: Record<string, number>;
} 