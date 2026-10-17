import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Dates are formatted in local time: fix the zone so results don't depend on the machine
process.env.TZ = 'America/Argentina/Buenos_Aires';

// Separate from vite.config.js: tests don't need the dev server (https certificates) or the PWA
export default defineConfig({
  // JSX with the automatic runtime, as in the app
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{js,jsx}'],
    // Components need a DOM: their tests start with `// @vitest-environment jsdom`
    environment: 'node',
    setupFiles: ['src/test/setup.js'],
    restoreMocks: true,
    unstubGlobals: true,
  },
});
