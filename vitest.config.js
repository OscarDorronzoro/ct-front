import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// Dates are formatted in local time: fix the zone so results don't depend on the machine
process.env.TZ = 'America/Argentina/Buenos_Aires';

const UI_TESTS = 'src/**/*.ui.test.{js,jsx,ts,tsx}';

// Separate from vite.config.js: tests don't need the dev server (https certificates) or the PWA.
// Two kinds of tests:
// - unit (npm test): pure logic in Node, fast. src/**/*.test.*
// - ui (npm run test:ui): components and hooks, on a simulated DOM. src/**/*.ui.test.*
export default defineConfig({
  // JSX with the automatic runtime, as in the app
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    restoreMocks: true,
    unstubGlobals: true,
    // Threads start faster than processes; each file is still isolated (shared state between files
    // broke the module mocks)
    pool: 'threads',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{js,jsx,ts,tsx}'],
          exclude: [UI_TESTS],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'ui',
          include: [UI_TESTS],
          // Lighter than jsdom (the environment was ~40% of the run)
          environment: 'happy-dom',
          setupFiles: ['src/test/setup.js'],
        },
      },
    ],
  },
});
