# API Migration Summary

## Overview
Updated the frontend to align with the documented NBA Analytics API endpoints. The changes ensure consistent API usage and proper environment-based configuration.

## Key Changes Made

### 1. Created Unified API Client (`src/lib/api.ts`)
- **New file**: Centralized API client following the documented endpoints
- **Environment-based URLs**: Automatically switches between development (`http://localhost:8000`) and production
- **Proper error handling**: Consistent error handling across all endpoints
- **All documented endpoints**: Health check, recent games, game players, quarterly predictions, momentum analysis, and model statistics

### 2. Updated Hooks to Use Correct Endpoints

#### `src/hooks/useRecentGames.ts`
- **Before**: Direct fetch to `http://localhost:8000/api/v1/games/recent`
- **After**: Uses unified API client with proper error handling
- **Added**: Support for `limit` parameter and `home_abbr`/`away_abbr` fields

#### `src/hooks/useGamePlayers.ts`
- **Before**: Used legacy endpoint `/games/${gameId}/players` with hardcoded backend URL
- **After**: Uses documented endpoint `/api/v1/players/game/${gameId}` with unified API client
- **Updated**: Player interface to match documented response structure
- **Added**: Support for `min_minutes` parameter

#### `src/hooks/useReplayMomentum.ts`
- **Before**: Direct fetch to `http://localhost:8000/api/v1/games/${gameId}/momentum`
- **After**: Uses unified API client with `/api/v1/analyze/momentum` endpoint
- **Updated**: Converts new API response format to maintain compatibility with existing UI components

#### `src/hooks/useTeamProps.ts`
- **Before**: Hardcoded localhost URL
- **After**: Environment-based URL configuration
- **Note**: This endpoint is not in the documented API - may need backend implementation

### 3. Created New Hooks for Missing Features

#### `src/hooks/useMomentumAnalysis.ts` (NEW)
- Implements the documented `/api/v1/analyze/momentum` endpoint
- Proper TypeScript interfaces matching the API response
- Error handling and loading states

#### `src/hooks/useQuarterlyPrediction.ts` (NEW)
- Implements the documented `/api/v1/predict/quarterly` endpoint
- Validates quarter parameter (only 2, 3, or 4 allowed)
- Returns prediction data with confidence scores

#### `src/hooks/useModelStats.ts` (NEW)
- Implements the documented `/api/v1/stats/model` endpoint
- Fetches ML model statistics and performance metrics

#### `src/hooks/useHealthCheck.ts` (NEW)
- Implements the documented `/health` endpoint
- Periodic health checks (default every 30 seconds)
- Monitors API server status and service availability

### 4. Updated Legacy API Configuration

#### `src/api/momentum.ts`
- **Before**: Hardcoded production URL
- **After**: Environment-based configuration
- **Ports**: Development uses `localhost:8001` for legacy API, production uses existing URL

#### `src/hooks/useGameMomentum.ts`
- **Before**: Hardcoded production URL
- **After**: Environment-based configuration matching legacy API

## Environment Configuration

### Development
- **Main API**: `http://localhost:8000` (documented endpoints)
- **Legacy API**: `http://localhost:8001` (existing momentum features)

### Production
- **Main API**: `https://your-render-app.onrender.com` (update with actual URL)
- **Legacy API**: `https://momentum-ignition-backend.onrender.com`

## Breaking Changes

### Interface Updates
1. **Player interface**: Changed from `player_id: string` to `player_id: number`
2. **Player fields**: Added `full_name`, `points`, `rebounds`, `assists`, `team_name`, `team_abbr`
3. **Recent games**: Added `home_abbr` and `away_abbr` fields

### Function Signatures
1. **useRecentGames**: Now accepts `limit` parameter
2. **useGamePlayers**: Now accepts `minMinutes` parameter
3. **useTeamPlayers**: Now accepts `minMinutes` parameter

## Next Steps

1. **Update Production URL**: Replace `https://your-render-app.onrender.com` with actual production URL in `src/lib/api.ts`
2. **Test All Endpoints**: Verify all documented endpoints work correctly
3. **Implement Missing Endpoints**: Add `/api/v1/games/${gameId}/team-props` if needed
4. **Update Components**: Update any components that use the changed interfaces
5. **Environment Variables**: Consider using environment variables for API URLs

## Files Modified

### New Files
- `src/lib/api.ts`
- `src/hooks/useMomentumAnalysis.ts`
- `src/hooks/useQuarterlyPrediction.ts`
- `src/hooks/useModelStats.ts`
- `src/hooks/useHealthCheck.ts`

### Modified Files
- `src/hooks/useRecentGames.ts`
- `src/hooks/useGamePlayers.ts`
- `src/hooks/useReplayMomentum.ts`
- `src/hooks/useTeamProps.ts`
- `src/api/momentum.ts`
- `src/hooks/useGameMomentum.ts`

## API Endpoint Mapping

| Feature | Old Endpoint | New Endpoint | Status |
|---------|-------------|--------------|--------|
| Recent Games | `GET /api/v1/games/recent` | `GET /api/v1/games/recent` | ✅ Fixed |
| Game Players | `GET /games/${id}/players` | `GET /api/v1/players/game/${id}` | ✅ Fixed |
| Momentum Analysis | `GET /api/games/${id}/momentum` | `POST /api/v1/analyze/momentum` | ✅ Fixed |
| Health Check | Not implemented | `GET /health` | ✅ Added |
| Quarterly Prediction | Not implemented | `POST /api/v1/predict/quarterly` | ✅ Added |
| Model Statistics | Not implemented | `GET /api/v1/stats/model` | ✅ Added |
| Team Props | `GET /api/v1/games/${id}/team-props` | Not documented | ⚠️ Needs backend | 