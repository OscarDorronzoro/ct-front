import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { choose, logIn } from './helpers/ui';

// The map of the zone form, once its canvas is drawn
async function mapArea(page: Page) {
  const canvas = page.locator('.maplibregl-canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('The map has no size');
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function saveZone(page: Page, name: string) {
  await page.getByLabel('Nombre').fill(name);
  await choose(page, 'Tipo', 'Potrero');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page).toHaveURL(/\/settings\/zones$/);
}

test.beforeEach(async ({ page }) => {
  await logIn(page, 'admin');
});

test('draws a zone with the mouse and saves it', async ({ page }) => {
  await page.goto('/settings/zones/new');
  const center = await mapArea(page);
  const corners = [[-120, -80], [120, -90], [140, 90], [-100, 100]];

  // A click per vertex, and on the first one again to close it
  for (const [dx, dy] of [...corners, corners[0]]) {
    await page.mouse.click(center.x + dx, center.y + dy);
  }

  await expect(page.getByText('Arrastre los vértices para ajustar')).toBeVisible();
  await saveZone(page, 'Potrero norte');

  await expect(page.getByText('Potrero norte')).toBeVisible();
  await expect(page.getByText('4 vértices')).toBeVisible();
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('draws a zone with the crosshair: pan the map, add each point, close it', async ({ page }) => {
    await page.goto('/settings/zones/new');
    const center = await mapArea(page);
    await expect(page.getByText('Mueva el mapa hasta la mira')).toBeVisible();

    // Drags the map: the next point is wherever the crosshair ends up
    const pan = async (dx: number, dy: number) => {
      await page.mouse.move(center.x, center.y);
      await page.mouse.down();
      await page.mouse.move(center.x + dx, center.y + dy, { steps: 8 });
      await page.mouse.up();
    };

    await page.getByRole('button', { name: 'Agregar punto' }).click();
    await pan(-120, 0);
    await page.getByRole('button', { name: 'Agregar punto' }).click();
    await pan(0, -140);
    await page.getByRole('button', { name: 'Agregar punto' }).click();
    await page.getByRole('button', { name: 'Cerrar' }).click();

    await expect(page.getByText('Arrastre los vértices para ajustar')).toBeVisible();
    await saveZone(page, 'Corral');

    await expect(page.getByText('Corral', { exact: true })).toBeVisible();
    await expect(page.getByText('3 vértices')).toBeVisible();
  });
});
