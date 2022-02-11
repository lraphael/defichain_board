/* eslint-disable @typescript-eslint/no-namespace */
// in cypress/support/index.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />

// ***********************************************************
// This example support/index.ts is processed and
// loaded automatically before your e2e test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands'

// declare global {
//   namespace Cypress {
//     interface Chainable {
//       /**
//        * Custom command to select DOM element byvue attribute.
//        * @example cy.vue()
//        */
//       vue(): Chainable<typeof Cypress.vueWrapper>
//     }
//   }
// }
