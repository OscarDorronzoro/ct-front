import { expect, type Page } from '@playwright/test';
import { PASSWORD } from './database';

// The satellite tiles come from the internet: a blank tile instead (offline and always the same)
const BLANK_TILE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

export async function stubMapTiles(page: Page) {
  await page.route('**/ArcGIS/rest/services/**', (route) => route.fulfill({
    status: 200, contentType: 'image/png', body: BLANK_TILE,
  }));
}

// Logs the page in through the API (the cookies are shared with the browser of the page)
export async function logIn(page: Page, username: string) {
  const res = await page.request.post('/api/auth/login', { data: { username, password: PASSWORD } });
  expect(res.ok()).toBe(true);
}

// SelectField (a combobox named by its label): opens it and chooses an option
export async function choose(page: Page, label: string, option: string | RegExp) {
  await page.getByRole('combobox', { name: label }).click();
  await page.getByRole('option', { name: option }).click();
}
