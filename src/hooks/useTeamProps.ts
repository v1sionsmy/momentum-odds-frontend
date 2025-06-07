import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface TeamProp {
  id: string;
  team: string;
  category: string;
  line: number;
  odds: number;
  type: 'over' | 'under';
  confidence: number;
  description: string;
}

// Mock data for team props since the API endpoint doesn't exist yet
const generateMockTeamProps = (gameId: number): TeamProp[] => {
  const teams = ['Lakers', 'Celtics', 'Warriors', 'Heat', 'Nuggets', 'Bucks'];
  const categories = ['Points', 'Rebounds', 'Assists', 'Steals', 'Blocks'];
  const props: TeamProp[] = [];

  for (let i = 0; i < 6; i++) {
    const team = teams[Math.floor(Math.random() * teams.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const line = Math.floor(Math.random() * 50) + 80; // 80-130 range
    const odds = Math.floor(Math.random() * 40) - 120; // -120 to -80 range
    const type = Math.random() < 0.5 ? 'over' : 'under';
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100 range

    props.push({
      id: `${gameId}-${team}-${category}-${i}`,
      team,
      category,
      line,
      odds,
      type,
      confidence,
      description: `${team} ${type} ${line} ${category}`
    });
  }

  return props;
};

export function useTeamProps(gameId: number | null) {
  const [teamProps, setTeamProps] = useState<TeamProp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId) {
      setTeamProps([]);
      return;
    }

    const fetchTeamProps = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('⚠️ Team Props API endpoint not yet implemented. Using mock data for game:', gameId);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate mock data
        const mockProps = generateMockTeamProps(gameId);
        setTeamProps(mockProps);
        
        // Note: Once the backend implements the team props endpoint, replace this with:
        // const data = await api.request(`/api/v1/games/${gameId}/team-props`);
        // if (data.success && Array.isArray(data.team_props)) {
        //   setTeamProps(data.team_props);
        // } else {
        //   setTeamProps([]);
        // }
        
      } catch (err) {
        console.error('Error in team props:', err);
        setError(err instanceof Error ? err : new Error('Failed to load team props'));
        setTeamProps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamProps();
  }, [gameId]);

  return { teamProps, isLoadingTeamProps: isLoading, errorTeamProps: error };
} 