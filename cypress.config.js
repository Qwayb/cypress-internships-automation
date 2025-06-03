const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://dev.profteam.su',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
