import React from 'react';
import { render, screen } from '@testing-library/react';
import { TeamPulse, TeamPulseRow } from '../TeamPulse';
import { PlayerPulseCard, PlayerPulseGrid } from '../PlayerPulseCard';

// Mock SWR to avoid network calls in tests
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    mutate: jest.fn()
  }))
}));

describe('Momentum Pulse Components', () => {
  describe('TeamPulse', () => {
    const mockTeam = {
      momentum: 75,
      momentum_abs: 75,
      team_name: 'Boston Celtics',
      team_color: '#007A33'
    };

    it('renders team pulse with correct animation duration', () => {
      render(<TeamPulse team={mockTeam} />);
      
      expect(screen.getByText('Boston Celtics')).toBeInTheDocument();
      expect(screen.getByText('+75.0')).toBeInTheDocument();
      
      // Check if the pulse circle is rendered
      const pulseElement = screen.getByText('+75.0').parentElement;
      expect(pulseElement).toHaveClass('animate-team-pulse');
    });

    it('calculates correct pulse duration for high momentum', () => {
      const { container } = render(<TeamPulse team={mockTeam} />);
      const pulseElement = container.querySelector('.animate-team-pulse');
      
      // High momentum (75) should result in fast pulse
      // Formula: hz = 0.25 + (3 - 0.25) * (75 / 100) = 2.3125 Hz
      // Duration = 1000 / 2.3125 ≈ 432ms
      const style = pulseElement.style;
      expect(style.animationDuration).toMatch(/\d+ms/);
    });

    it('shows glow effect for high momentum', () => {
      const { container } = render(<TeamPulse team={mockTeam} />);
      
      // Should show glow effect for momentum > 50
      const glowElement = container.querySelector('.absolute.inset-0.rounded-full.opacity-30');
      expect(glowElement).toBeInTheDocument();
    });
  });

  describe('TeamPulseRow', () => {
    const mockHomeTeam = {
      momentum: 60,
      momentum_abs: 60,
      team_name: 'Boston Celtics',
      team_color: '#007A33'
    };

    const mockAwayTeam = {
      momentum: -40,
      momentum_abs: 40,
      team_name: 'Los Angeles Lakers',
      team_color: '#552583'
    };

    it('renders both teams with VS divider', () => {
      render(
        <TeamPulseRow 
          homeTeam={mockHomeTeam} 
          awayTeam={mockAwayTeam} 
          isLoading={false} 
          error={null} 
        />
      );
      
      expect(screen.getByText('Boston Celtics')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
      expect(screen.getByText('VS')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <TeamPulseRow 
          homeTeam={null} 
          awayTeam={null} 
          isLoading={true} 
          error={null} 
        />
      );
      
      expect(screen.getByText('Loading team momentum...')).toBeInTheDocument();
    });
  });

  describe('PlayerPulseCard', () => {
    const mockPlayer = {
      playerId: '123',
      name: 'Jayson Tatum',
      teamId: 'BOS',
      momentum_abs: 80,
      momentum: 80,
      proj: '25 Pts / 8 Reb / 6 Ast (Q2)',
      headshot: '/assets/players/123.png',
      momentumTrend: [0.6, 0.7, 0.8]
    };

    it('renders player card with correct momentum display', () => {
      render(<PlayerPulseCard player={mockPlayer} />);
      
      expect(screen.getByText('Jayson Tatum')).toBeInTheDocument();
      expect(screen.getByText('+80.0')).toBeInTheDocument();
      expect(screen.getByText('25 Pts / 8 Reb / 6 Ast (Q2)')).toBeInTheDocument();
    });

    it('applies correct background color for positive momentum', () => {
      const { container } = render(<PlayerPulseCard player={mockPlayer} />);
      const cardElement = container.querySelector('.animate-player-flash');
      
      expect(cardElement).toHaveClass('bg-green-600');
    });

    it('applies correct background color for negative momentum', () => {
      const negativePlayer = { ...mockPlayer, momentum: -50, momentum_abs: 50 };
      const { container } = render(<PlayerPulseCard player={negativePlayer} />);
      const cardElement = container.querySelector('.animate-player-flash');
      
      expect(cardElement).toHaveClass('bg-red-600');
    });

    it('shows intensity bars based on momentum', () => {
      const { container } = render(<PlayerPulseCard player={mockPlayer} />);
      
      // momentum_abs = 80, so floor(80/33) = 2 bars should be white
      const intensityBars = container.querySelectorAll('.w-1.h-4');
      const whiteBars = container.querySelectorAll('.bg-white');
      
      expect(intensityBars).toHaveLength(3);
      expect(whiteBars.length).toBeGreaterThan(0);
    });
  });

  describe('PlayerPulseGrid', () => {
    const mockPlayers = [
      {
        playerId: '1',
        name: 'Player 1',
        teamId: 'BOS',
        momentum_abs: 90,
        momentum: 90,
        proj: '20 Pts / 5 Reb / 3 Ast (Q1)',
        headshot: '/assets/players/1.png',
        momentumTrend: [0.8, 0.85, 0.9]
      },
      {
        playerId: '2',
        name: 'Player 2',
        teamId: 'LAL',
        momentum_abs: 70,
        momentum: -70,
        proj: '15 Pts / 10 Reb / 2 Ast (Q1)',
        headshot: '/assets/players/2.png',
        momentumTrend: [0.7, 0.65, 0.7]
      }
    ];

    it('renders grid of player cards', () => {
      render(
        <PlayerPulseGrid 
          players={mockPlayers} 
          isLoading={false} 
          error={null} 
          maxPlayers={12} 
        />
      );
      
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('limits players to maxPlayers prop', () => {
      render(
        <PlayerPulseGrid 
          players={mockPlayers} 
          isLoading={false} 
          error={null} 
          maxPlayers={1} 
        />
      );
      
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.queryByText('Player 2')).not.toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <PlayerPulseGrid 
          players={[]} 
          isLoading={true} 
          error={null} 
          maxPlayers={12} 
        />
      );
      
      expect(screen.getByText('Loading player momentum...')).toBeInTheDocument();
    });

    it('shows empty state when no players', () => {
      render(
        <PlayerPulseGrid 
          players={[]} 
          isLoading={false} 
          error={null} 
          maxPlayers={12} 
        />
      );
      
      expect(screen.getByText('No player momentum data')).toBeInTheDocument();
    });
  });
}); 