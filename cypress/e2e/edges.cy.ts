/// <reference types="cypress" />

describe('Edges Panel', () => {
  beforeEach(() => {
    // Mock WebSocket connection
    cy.window().then((win) => {
      // @ts-ignore - Mock WebSocket
      win.WebSocket = class MockWebSocket {
        onopen: (() => void) | null = null;
        onclose: (() => void) | null = null;
        onmessage: ((e: { data: string }) => void) | null = null;
        onerror: ((e: Error) => void) | null = null;

        constructor(url: string) {
          // Simulate connection
          setTimeout(() => this.onopen?.(), 100);

          // Start sending mock data
          let i = 0;
          const mockData = [
            '{"edgeId":"edge1","gameId":123,"playerId":"player1","playerName":"Jayson Tatum","market":"PTS","edgePct":0.35,"timestamp":"2024-03-20T12:00:00Z","odds":[{"bookmaker":"DraftKings","line":28.5,"over":-110,"under":-110}],"modelProjection":{"mean":32.1,"stdDev":4.2,"confidence":0.85}}',
            '{"edgeId":"edge2","gameId":123,"playerId":"player2","playerName":"Jaylen Brown","market":"AST","edgePct":0.15,"timestamp":"2024-03-20T12:00:00Z","odds":[{"bookmaker":"FanDuel","line":4.5,"over":-115,"under":-105}],"modelProjection":{"mean":5.2,"stdDev":2.1,"confidence":0.75}}',
            '{"edgeId":"edge1","gameId":123,"playerId":"player1","playerName":"Jayson Tatum","market":"PTS","edgePct":0.42,"timestamp":"2024-03-20T12:01:00Z","odds":[{"bookmaker":"DraftKings","line":28.5,"over":-120,"under":-100}],"modelProjection":{"mean":32.8,"stdDev":4.0,"confidence":0.88}}',
          ];

          const interval = setInterval(() => {
            if (i >= mockData.length) {
              clearInterval(interval);
              return;
            }
            this.onmessage?.({ data: mockData[i++] });
          }, 1000);
        }

        close() {
          this.onclose?.();
        }
      };
    });

    // Mock auth state
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: {
          type: 'pro',
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      }));
    });

    cy.visit('/dashboard');
  });

  it('displays edges with live updates', () => {
    // Check initial state
    cy.get('[data-testid="edges-panel"]').should('exist');
    cy.get('[data-testid="edge-card"]').should('have.length.at.least', 1);

    // Verify edge card content
    cy.get('[data-testid="edge-card"]').first().within(() => {
      cy.get('[data-testid="player-name"]').should('contain', 'Jayson Tatum');
      cy.get('[data-testid="edge-percentage"]').should('contain', '35');
      cy.get('[data-testid="market-type"]').should('contain', 'PTS');
    });

    // Check for high edge indicator
    cy.get('[data-testid="edge-card"]')
      .filter('[data-edge-high="true"]')
      .should('have.class', 'animate-pulse')
      .should('have.class', 'border-accent');

    // Verify connection status
    cy.get('[data-testid="connection-status"]')
      .should('have.class', 'bg-green-500');
  });

  it('supports sorting edges', () => {
    // Wait for edges to load
    cy.get('[data-testid="edge-card"]').should('have.length.at.least', 2);

    // Sort by player name
    cy.contains('button', 'Sort by edgePct').click();
    cy.contains('Player').click();

    // Verify sorting
    cy.get('[data-testid="player-name"]').then(($names) => {
      const names = Array.from($names).map(el => el.textContent);
      const sorted = [...names].sort();
      expect(names).to.deep.equal(sorted);
    });

    // Toggle sort order
    cy.contains('button', '↓').click();
    cy.get('[data-testid="player-name"]').then(($names) => {
      const names = Array.from($names).map(el => el.textContent);
      const sorted = [...names].sort().reverse();
      expect(names).to.deep.equal(sorted);
    });
  });

  it('shows paywall for free users', () => {
    // Update auth state to free user
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        subscription: {
          type: 'free',
          status: 'active',
        },
      }));
    });

    cy.reload();

    // Verify paywall is shown
    cy.get('[data-testid="paywall"]').should('exist');
    cy.get('[data-testid="upgrade-button"]').should('exist');
    cy.get('[data-testid="edges-panel"]').should('not.exist');
  });

  it('handles WebSocket disconnection', () => {
    // Wait for connection
    cy.get('[data-testid="connection-status"]')
      .should('have.class', 'bg-green-500');

    // Simulate disconnection
    cy.window().then((win) => {
      // @ts-ignore - Access mock WebSocket
      const ws = win.WebSocket.prototype;
      ws.onclose?.();
    });

    // Check for disconnection state
    cy.get('[data-testid="connection-status"]')
      .should('have.class', 'bg-red-500');
  });
}); 