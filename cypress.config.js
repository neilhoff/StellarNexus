const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "ot9dic",
  e2e: {
    setupNodeEvents (on, config) {
      // implement node event listeners here
    },
    experimentalRunAllSpecs: true
  },
});
