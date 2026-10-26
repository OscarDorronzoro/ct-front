import { test, expect } from './fixtures';
import { choose, logIn } from './helpers/ui';

test.beforeEach(async ({ page }) => {
  await logIn(page, 'admin');
});

test('creates a cow with collar, category and group, and shows its card', async ({ page, api }) => {
  await api.createCollar(7);
  await api.createGroup('Rodeo 1');

  await page.goto('/settings/cows');
  await page.getByRole('link', { name: 'Agregar vaca' }).first().click();

  await page.getByLabel('Alias').fill('Aurora');
  await page.getByLabel('Caravana').fill('AR-001');
  await choose(page, 'Collar asignado', /Collar 7/);
  await choose(page, 'Sexo', 'Hembra');
  await choose(page, 'Categoría', 'Vaquillona');
  await choose(page, 'Grupos', 'Rodeo 1');
  await page.getByRole('button', { name: 'Guardar' }).click();

  await expect(page).toHaveURL(/\/settings\/cows$/);
  const row = page.getByText('Aurora');
  await expect(row).toBeVisible();
  await expect(page.getByText('Caravana AR-001')).toBeVisible();

  await row.click();
  await expect(page.getByRole('heading', { name: 'Aurora' })).toBeVisible();
  await expect(page.getByText('Vaquillona').first()).toBeVisible();
  await expect(page.getByText('Hembra')).toBeVisible();
  await expect(page.getByText('Collar 7')).toBeVisible();
  await expect(page.getByText('Rodeo 1')).toBeVisible();
});

test('edits the cow from its card', async ({ page, api }) => {
  const cow = await api.createCow({ alias: 'Aurora', sex: 'female' });

  await page.goto(`/settings/cows/${cow.id}`);
  await page.getByRole('link', { name: 'Editar' }).click();
  await page.getByLabel('Alias').fill('Aurora II');
  await page.getByRole('button', { name: 'Guardar' }).click();

  await expect(page).toHaveURL(new RegExp(`/settings/cows/${cow.id}$`));
  await expect(page.getByRole('heading', { name: 'Aurora II' })).toBeVisible();
});

test('deletes a cow after confirming', async ({ page, api }) => {
  await api.createCow({ alias: 'Aurora' });

  await page.goto('/settings/cows');
  await page.getByRole('button', { name: 'Eliminar vaca' }).click();
  await expect(page.getByText('¿Está seguro de eliminar la vaca "Aurora"?')).toBeVisible();
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();

  await expect(page.getByText('Aurora')).toHaveCount(0);
  await expect(page.getByText('No hay vacas registradas')).toBeVisible();
});

test('shows the error of the backend in Spanish', async ({ page, api }) => {
  await api.createCollar(7);

  await page.goto('/settings/collars/new');
  await page.getByLabel('Código LoRa').fill('7');
  await page.getByRole('button', { name: 'Guardar' }).click();

  await expect(page.getByText('Ya existe un collar con ese código.')).toBeVisible();
  await expect(page).toHaveURL(/\/settings\/collars\/new$/);
});
