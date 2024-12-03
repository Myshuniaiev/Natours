import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // Allows using testing globals like `describe`, `it`, `expect` without importing them.
    environment: "node", // Sets the testing environment.
    coverage: {
      provider: "v8", // Changed from 'c8' to 'v8'
      reporter: ["text", "json", "html"], // Coverage report formats.
    },
  },
});
