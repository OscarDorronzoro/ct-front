import { test, expect } from './fixtures';
import { choose, logIn } from './helpers/ui';

test.beforeEach(async ({ page }) => {
  await logIn(page, 'admin');
});

test('records a vaccination, with its withdrawal, and voids it with a reason', async ({ page, api }) => {
  const cow = await api.createCow({ alias: 'Aurora', sex: 'female' });

  await page.goto(`/settings/cows/${cow.id}`);
  await expect(page.getByText('Sin retiro vigente')).toBeVisible();

  await page.getByRole('link', { name: 'Registrar evento' }).click();
  // Vacunación is the default type; the antiaftosa has 21 days of meat withdrawal (deploy.sql)
  await choose(page, 'Producto', 'Vacuna antiaftosa');
  await page.getByLabel('Dosis').fill('2 ml');
  await page.getByRole('button', { name: 'Guardar' }).click();

  await expect(page).toHaveURL(new RegExp(`/settings/cows/${cow.id}$`));
  await expect(page.getByText('Vacunación · Vacuna antiaftosa')).toBeVisible();
  await expect(page.getByText(/Carne en retiro hasta el \d{2}\/\d{2}\/\d{4}/)).toBeVisible();

  await page.getByRole('button', { name: 'Anular evento' }).click();
  await page.getByLabel('Motivo').fill('Cargado en la vaca equivocada');
  await page.getByRole('button', { name: 'Anular', exact: true }).click();

  // It stays in the history, voided; its withdrawal no longer counts
  await expect(page.getByText(/Anulado el .*: Cargado en la vaca equivocada/)).toBeVisible();
  await expect(page.getByText('Sin retiro vigente')).toBeVisible();
});

test('offers the castration only for males', async ({ page, api }) => {
  const female = await api.createCow({ alias: 'Aurora', sex: 'female' });
  const male = await api.createCow({ alias: 'Toro', sex: 'male' });

  await page.goto(`/settings/cows/${female.id}/events/new`);
  await expect(page.getByRole('button', { name: 'Vacunación' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Castración' })).toHaveCount(0);

  await page.goto(`/settings/cows/${male.id}/events/new`);
  await expect(page.getByRole('button', { name: 'Castración' })).toBeVisible();
});
