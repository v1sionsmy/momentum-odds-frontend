const API_CONFIG = {
  development: 'https://nba-analytics-api.onrender.com', // FORCE PRODUCTION - local DB missing tables
  production: 'https://nba-analytics-api.onrender.com' // HARDCODED FIX - force correct backend
};

// Force deployment update - 2024-12-29 18:05
// Updated .env.local with correct backend URLs - 2024-12-29 18:20
// DEBUG: Environment check for CORS fix - 2024-12-29 18:25
// EMERGENCY HARDCODE FIX - 2024-12-29 18:30
// LOCAL DB FIX - 2024-12-29 19:00 - Force production API since local DB missing game_teams table
console.log('🔍 API_CONFIG check:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  final_config: API_CONFIG,
  hardcoded_production: 'https://nba-analytics-api.onrender.com',
  note: 'FORCED PRODUCTION - local DB missing tables'
});

const API_BASE_URL = API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG] || API_CONFIG.development;

class NBAAnalyticsAPI {
  private baseUrl: string;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    let lastError: Error;

    // Retry mechanism for production reliability
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Network request failed');
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          throw lastError;
        }
        
        // Wait before retry (except on last attempt)
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    throw lastError!;
  }

  // Health Check
  async getHealth() {
    return this.request('/health');
  }

  // Recent Games
  async getRecentGames(limit = 10) {
    return this.request(`/api/v1/games/recent?limit=${limit}`);
  }

  // Featured Game (most recent with complete data)
  async getFeaturedGame() {
    return this.request('/api/v1/games/recent?limit=1');
  }

  // Live Games - GET ACTUAL LIVE GAMES FROM BACKEND
  async getLiveGames() {
    return this.request('/api/v1/games/live');
  }

  // Game Players
  async getGamePlayers(gameId: number, minMinutes = 15) {
    return this.request(`/api/v1/players/game/${gameId}?min_minutes=${minMinutes}`);
  }

  // Quarterly Prediction
  async predictQuarterly(gameId: number, playerId: number, quarter: number) {
    return this.request('/api/v1/predict/quarterly', {
      method: 'POST',
      body: JSON.stringify({
        game_id: gameId,
        player_id: playerId,
        quarter: quarter
      })
    });
  }

  // Momentum Analysis
  async analyzeMomentum(gameId: number) {
    return this.request('/api/v1/analyze/momentum', {
      method: 'POST',
      body: JSON.stringify({
        game_id: gameId
      })
    });
  }

  // Model Statistics
  async getModelStats() {
    return this.request('/api/v1/stats/model');
  }
}

// Create singleton instance
export const api = new NBAAnalyticsAPI();
export default api; 