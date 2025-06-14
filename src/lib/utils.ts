import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Odds formatting utilities
/**
 * Format American odds with proper +/- signs
 * @param odds - The odds number (e.g., -110, +150)
 * @returns Formatted string (e.g., "-110", "+150")
 */
export function formatAmericanOdds(odds: number): string {
  if (odds > 0) {
    return `+${odds}`;
  }
  return odds.toString();
}

/**
 * Format spread with proper +/- signs and context
 * @param points - The spread points (e.g., -4.5, +3.5)
 * @returns Formatted string (e.g., "-4.5", "+3.5")
 */
export function formatSpread(points: number): string {
  if (points > 0) {
    return `+${points}`;
  }
  return points.toString();
}

/**
 * Format total points for Over/Under display
 * @param points - The total points (e.g., 218.5)
 * @returns Formatted string (e.g., "O/U 218.5")
 */
export function formatTotal(points: number): string {
  return `O/U ${points}`;
}

/**
 * Format moneyline odds for both teams
 * @param homeOdds - Home team odds
 * @param awayOdds - Away team odds
 * @returns Formatted string (e.g., "+155 / -180")
 */
export function formatMoneyline(homeOdds: number, awayOdds: number): string {
  const formattedHome = formatAmericanOdds(homeOdds);
  const formattedAway = formatAmericanOdds(awayOdds);
  return `${formattedAway} / ${formattedHome}`;
}

// Odds data interfaces
interface OddsMarkets {
  moneyline?: {
    home: number;
    away: number;
  };
  spread?: {
    points: number;
    home: number;
    away: number;
  };
  total?: {
    points: number;
    over: number;
    under: number;
  };
}

interface OddsData {
  markets?: OddsMarkets;
}

/**
 * Detect if odds data appears to be mock/fallback data
 * @param odds - The odds object to check
 * @returns true if the odds appear to be mock data
 */
export function isMockOddsData(odds: OddsData): boolean {
  if (!odds || !odds.markets) return false;
  
  const { moneyline, spread, total } = odds.markets;
  
  // Check for generic -110/-110 patterns (classic mock data)
  if (moneyline && moneyline.home === -110 && moneyline.away === -110) {
    return true;
  }
  
  // Check for all -110 odds (definitely mock data)
  if (spread && total && 
      spread.home === -110 && spread.away === -110 &&
      total.over === -110 && total.under === -110 &&
      moneyline && moneyline.home === -110 && moneyline.away === -110) {
    return true;
  }
  
  // Check for specific Finals fallback patterns from backend
  // Backend generates these specific values for IND vs OKC Finals games
  if (moneyline && spread && total) {
    // Indiana home Finals pattern: -125/+105, -2.5, 218.5
    if (moneyline.home === -125 && moneyline.away === 105 && 
        spread.points === -2.5 && total.points === 218.5) {
      return true;
    }
    
    // OKC home Finals pattern: -140/+120, -3.5, 216.5  
    if (moneyline.home === -140 && moneyline.away === 120 && 
        spread.points === -3.5 && total.points === 216.5) {
      return true;
    }
    
    // Neutral Finals pattern: -110/-110, -1.5, 217.5
    if (moneyline.home === -110 && moneyline.away === -110 && 
        spread.points === -1.5 && total.points === 217.5) {
      return true;
    }
  }
  
  // Check for random seed-based patterns (backend uses random.seed(game_id))
  // These would have very specific decimal patterns that are unlikely in real odds
  if (spread && total && spread.points % 0.5 === 0 && total.points % 0.5 === 0) {
    // If spread and total are both exact half-point values AND moneyline has specific patterns
    if (moneyline && 
        ((moneyline.home % 5 === 0 && moneyline.away % 5 === 0) || // Round numbers
         (Math.abs(moneyline.home) < 150 && Math.abs(moneyline.away) < 150))) { // Conservative range
      // This could be generated odds, but we need more evidence
      // Check if the values are "too perfect" - real odds are usually messier
      const spreadIsRound = Math.abs(spread.points) % 1 === 0 || Math.abs(spread.points) % 0.5 === 0;
      const totalIsRound = total.points % 0.5 === 0;
      const moneylineIsRound = moneyline.home % 5 === 0 && moneyline.away % 5 === 0;
      
      if (spreadIsRound && totalIsRound && moneylineIsRound) {
        return true; // Too perfect to be real
      }
    }
  }
  
  return false;
}

/**
 * Get a user-friendly message about odds data quality
 * @param odds - The odds object to check
 * @param isUpcoming - Whether this is an upcoming game
 * @returns A message about the odds data
 */
export function getOddsDataMessage(odds: OddsData, isUpcoming: boolean = false): string {
  if (!odds) return "No odds available";
  
  if (isMockOddsData(odds)) {
    if (isUpcoming) {
      return "⚠️ Live odds not yet available - showing estimated lines";
    } else {
      return "⚠️ Using fallback odds data";
    }
  }
  
  return "✅ Live betting odds";
} 