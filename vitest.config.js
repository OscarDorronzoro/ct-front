import { defineConfig } from 'vitest/config';

// Dates are formatted in local time: fix the zone so results don't depend on the machine
process.env.TZ = 'America/Argentina/Buenos_Aires';

// Separate from vite.config.js: tests don't need the dev server (https certificates) or the PWA
export default defineConfig({
  test: {
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'node',
    restoreMocks: true,
    unstubGlobals: true,
  },
});
