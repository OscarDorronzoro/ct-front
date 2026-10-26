import { test, expect } from './fixtures';
import { PASSWORD } from './helpers/database';
import { logIn } from './helpers/ui';

test.describe('session', () => {
  test('asks to log in and then goes back to the page requested', async ({ page }) => {
    await page.goto('/settings/cows');
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel('Usuario').fill('admin');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page).toHaveURL(/\/settings\/cows$/);
    await expect(page.getByRole('heading', { name: 'Vacas' })).toBeVisible();
  });

  test('says when the password is wrong', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Usuario').fill('admin');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('not-the-password');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.getByText('Usuario o contraseña incorrectos.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logs out from the user menu', async ({ page }) => {
    await logIn(page, 'admin');
    await page.goto('/settings/cows');

    await page.getByRole('button', { name: 'Menú de usuario' }).click();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/settings/cows');
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('permissions', () => {
  test('a viewer sees the data but no way to change it', async ({ page, api }) => {
    await api.createUser('consulta', ['viewer']);
    await logIn(page, 'consulta');
    await page.goto('/settings/cows');

    const nav = page.getByRole('navigation').first();
    await expect(nav.getByRole('link', { name: 'Vacas' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Productos' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Usuarios' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Agregar vaca' })).toHaveCount(0);
  });

  test('a page the role cannot use sends it back to the map', async ({ page, api }) => {
    await api.createUser('vet', ['veterinarian']);
    await logIn(page, 'vet');

    await page.goto('/settings/users');
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/settings/collars/new');
    await expect(page).toHaveURL(/\/$/);
  });

  test('the admin manages the users', async ({ page }) => {
    await logIn(page, 'admin');
    await page.goto('/settings/users');

    await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible();
    await expect(page.getByText('admin', { exact: true }).first()).toBeVisible();
  });
});
