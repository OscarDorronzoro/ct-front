import { defineConfig, devices } from '@playwright/test';

// End-to-end tests (npm run test:e2e): the built app in Chromium against the real backend
// (../backend) and a PostgreSQL + PostGIS in Docker. See e2e/global-setup.ts.
export default defineConfig({
  testDir: 'e2e',
  globalSetup: './e2e/global-setup.ts',
  // One database: one test at a time
  workers: 1,
  fullyParallel: false,
  forbidOnly: true,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],
  outputDir: 'e2e-results',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'https://localhost:5174',
    // The certificate of the dev server is self-signed
    ignoreHTTPSErrors: true,
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    // The PWA service worker would cache the app between tests
    serviceWorkers: 'block',
    // What happened, step by step, when a test fails (npx playwright show-trace)
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
