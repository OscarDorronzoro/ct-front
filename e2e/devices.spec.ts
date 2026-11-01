import { test, expect } from './fixtures';
import { FIRMWARE_IMAGE } from './helpers/api';
import { createGateway } from './helpers/database';
import { choose, logIn } from './helpers/ui';

// Each test uses its own firmwares: the database starts empty, but the binaries stay in the folder

test.beforeEach(async ({ page, api }) => {
  await api.createCollar(12);
  await logIn(page, 'admin');
});

test('uploads a firmware, and rejects a repeated code in Spanish', async ({ page, api }) => {
  await api.uploadFirmware(1, '1.0.0');

  const upload = async (code: string, version: string) => {
    await page.goto('/settings/firmwares/new');
    await page.getByLabel(/Archivo/).setInputFiles({
      name: 'collar.bin', mimeType: 'application/octet-stream', buffer: FIRMWARE_IMAGE,
    });
    await page.getByLabel(/Código/).fill(code);
    await page.getByLabel(/Versión/).fill(version);
    await page.getByRole('button', { name: 'Subir' }).click();
  };

  await upload('2', '1.1.0');
  await expect(page).toHaveURL(/\/settings\/firmwares$/);
  await expect(page.getByText('Firmware 1.1.0')).toBeVisible();
  await expect(page.getByText('Firmware 1.0.0')).toBeVisible();

  await upload('2', '1.2.0');
  await expect(page.getByRole('alert')).toHaveText('Ya existe un firmware con ese código.');
});

test('rejects a file that is not a firmware', async ({ page }) => {
  await page.goto('/settings/firmwares/new');
  await page.getByLabel(/Archivo/).setInputFiles({
    name: 'notas.bin', mimeType: 'application/octet-stream', buffer: Buffer.from('hola'),
  });
  await page.getByLabel(/Código/).fill('2');
  await page.getByLabel(/Versión/).fill('1.1.0');
  await page.getByRole('button', { name: 'Subir' }).click();

  await expect(page.getByRole('alert')).toHaveText('El archivo de firmware no es válido.');
});

test('sends a firmware update and follows it until the collar confirms', async ({ page, api }) => {
  await api.uploadFirmware(5, '1.5.0');
  const gateway = await createGateway();

  await page.goto('/settings/commands/new');
  await choose(page, 'Comando', 'Actualizar firmware');
  await page.getByRole('checkbox', { name: /Collar 12/ }).check();
  await page.getByRole('button', { name: 'Enviar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Enviar' }).click();

  await expect(page.getByRole('heading', { name: 'Actualizar firmware' })).toBeVisible();
  await expect(page.getByText('Versión 1.5.0')).toBeVisible();
  await expect(page.getByText('Esperando al collar')).toBeVisible();

  // The collar transmits: the backend hands the command to the gateway in its response
  const { commands } = await api.sendMessage(gateway, {
    collarId: 12,
    type: 'pos',
    integrity: 'ok',
    latitude: -32.968,
    longitude: -61.209,
    hdop: 1.1,
    rssi: -80,
    snr: 8,
  });
  expect(commands).toHaveLength(1);

  await page.reload();
  await expect(page.getByText('En el gateway')).toBeVisible();

  await api.reportResults(gateway, [{ id: commands[0].id, result: 'ok' }]);

  await page.reload();
  await expect(page.getByText('Ejecutado')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancelar comando' })).toBeHidden();

  await page.goto('/settings/commands');
  await expect(page.getByText('1 ejecutado')).toBeVisible();
});

test('changes params and cancels the command before it reaches the collar', async ({ page }) => {
  await page.goto('/settings/commands/new');
  await choose(page, 'Comando', 'Cambiar parámetros');
  await page.getByRole('checkbox', { name: /Collar 12/ }).check();
  await page.getByLabel('GPS encendido').fill('90');
  await page.getByLabel('Inicio del día').first().fill('07:30');
  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(page.getByText('GPS y envío: GPS encendido')).toBeVisible();
  await expect(page.getByText('90 s')).toBeVisible();
  await expect(page.getByText('07:30')).toBeVisible();

  await page.getByRole('button', { name: 'Cancelar comando' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar comando' }).click();

  await expect(page.getByText('Cancelado', { exact: true })).toBeVisible();
  await expect(page.getByText(/Comando cancelado/)).toBeVisible();
});

test('loads a zone in the collar of the manager, who has no other commands', async ({ page, api }) => {
  await api.createZone('Potrero', 1, [[-32.97, -61.22], [-32.97, -61.2], [-32.95, -61.2]]);
  await api.createUser('encargado', ['manager']);
  await page.context().clearCookies();
  await logIn(page, 'encargado');

  await page.goto('/settings/commands/new');
  await page.getByRole('combobox', { name: 'Comando' }).click();
  await expect(page.getByRole('option')).toHaveCount(2);
  await page.getByRole('option', { name: 'Cargar zona' }).click();

  await page.getByRole('checkbox', { name: /Collar 12/ }).check();
  await choose(page, 'Zona', 'Potrero');
  await choose(page, 'Lugar en el collar', 'Lugar 2');
  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(page.getByText('Lugar 2')).toBeVisible();

  await page.goto('/settings/firmwares');
  await expect(page).toHaveURL(/\/$/);
});
