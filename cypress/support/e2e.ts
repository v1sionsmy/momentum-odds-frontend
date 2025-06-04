/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here
    }
  }
}

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands') 