import { test as base } from '@playwright/test';
import { Api } from './helpers/api';
import { resetDatabase } from './helpers/database';
import { stubMapTiles } from './helpers/ui';

// Each test: an empty database with an admin, the map without the internet, and `api`, logged in as
// that admin, to prepare its data
export const test = base.extend<{ api: Api; freshDatabase: void }>({
  freshDatabase: [async ({}, use) => {
    await resetDatabase();
    await use();
  }, { auto: true }],

  page: async ({ page }, use) => {
    await stubMapTiles(page);
    await use(page);
  },

  api: async ({ playwright, baseURL, freshDatabase: _ }, use) => {
    const request = await playwright.request.newContext({ baseURL, ignoreHTTPSErrors: true });
    const api = new Api(request);
    await api.login();
    await use(api);
    await request.dispose();
  },
});

export { expect } from '@playwright/test';
