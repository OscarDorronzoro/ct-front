import { test, expect } from './fixtures';
import { square } from './helpers/api';
import { createGateway, query } from './helpers/database';
import { logIn } from './helpers/ui';

// A cow with a collar in the field, and two positions the gateway sent a minute ago and now
test.beforeEach(async ({ page, api }) => {
  await api.createZone('Campo', 1, square(-32.967, -61.21, 0.01));
  const collar = await api.createCollar(12);
  await api.createCow({ alias: 'Aurora', currentCollarId: collar.id });

  const gateway = await createGateway();
  const now = Date.now();
  for (const [secondsAgo, latitude] of [[60, -32.968], [0, -32.9685]]) {
    await api.sendMessage(gateway, {
      collarId: 12,
      type: 'pos',
      integrity: 'ok',
      latitude,
      longitude: -61.209,
      recordedAt: new Date(now - secondsAgo * 1000 + 2000).toISOString(),
      hdop: 1.1,
      rssi: -80,
      snr: 8,
    });
  }

  // The backend processes the messages every 5 seconds
  await expect.poll(async () => (await query('SELECT id FROM positions')).length, { timeout: 20_000 })
    .toBe(2);

  await logIn(page, 'admin');
});

test('finds the cow on the live map and opens its position', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar vaca o collar...' }).fill('Aur');
  await page.getByRole('option', { name: /Aurora/ }).click();

  // The sheet of the position: a region named after the cow
  const sheet = page.getByRole('region', { name: 'Aurora' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText(/Collar 12/)).toBeVisible();
});

test('opens the map on the cow of a notification', async ({ page }) => {
  const [cow] = await query<{ id: number }>("SELECT id FROM cows WHERE alias = 'Aurora'");

  await page.goto(`/?cow=${cow.id}`);

  await expect(page.getByRole('region', { name: 'Aurora' })).toBeVisible();
});
