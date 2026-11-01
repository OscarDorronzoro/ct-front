import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import CommandFormPage from './CommandFormPage';
import { AuthContext } from '@/entities/viewer';
import { getAllCollars } from '@/entities/collar';
import { getAllZones } from '@/entities/zone';
import { getAllFirmwares } from '@/entities/firmware-version';
import { createCommand } from '@/entities/command';

vi.mock('@/entities/collar/api/collarApi');
vi.mock('@/entities/zone/api/zoneApi');
vi.mock('@/entities/firmware-version/api/firmwareApi');
vi.mock('@/entities/command/api/commandApi');

const TECHNICIAN = ['collars:read', 'collars:write', 'commands:send', 'firmware:manage'];
const MANAGER = ['collars:read', 'commands:send'];

function renderForm(permissions = TECHNICIAN) {
  render(
    <AuthContext.Provider value={{ user: { id: 1, permissions } }}>
      <MemoryRouter initialEntries={['/settings/commands/new']}>
        <Routes>
          <Route path="/settings/commands/new" element={<CommandFormPage />} />
          <Route path="/settings/commands/:commandId" element={<p>Detalle del comando</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return userEvent.setup();
}

async function chooseType(user, name) {
  await user.click(screen.getByRole('combobox', { name: 'Comando' }));
  await user.click(screen.getByRole('option', { name }));
}

const ring = (vertices) => Array.from({ length: vertices }, (_, i) => [i, i]);

describe('CommandFormPage', () => {
  beforeEach(() => {
    getAllCollars.mockResolvedValue([
      {
        id: 4, code: 12, description: 'Rodeo', firmwareVersion: '1.0.0', mac: null, params: { gpsOn: 90 },
      },
      {
        id: 5, code: 13, description: null, firmwareVersion: null, mac: null, params: null,
      },
    ]);
    getAllZones.mockResolvedValue([
      { id: 7, name: 'Potrero', ring: ring(4) },
      { id: 8, name: 'Enorme', ring: ring(17) },
    ]);
    getAllFirmwares.mockResolvedValue([
      {
        id: 2, code: 3, version: '1.2.0', size: 1, notes: null, createdAt: '2026-10-20T12:00:00Z',
      },
    ]);
    createCommand.mockResolvedValue({ id: 31 });
  });

  it('offers only the commands the user can send', async () => {
    const user = renderForm(MANAGER);

    await user.click(screen.getByRole('combobox', { name: 'Comando' }));

    expect(screen.getAllByRole('option').map((option) => option.textContent))
      .toEqual(['Cargar zona', 'Borrar zona']);
  });

  it('sends the params that were filled in and opens the command', async () => {
    const user = renderForm();

    await chooseType(user, 'Cambiar parámetros');
    await user.click(await screen.findByRole('checkbox', { name: /Collar 12/ }));

    // A single collar: its current value
    expect(screen.getByText(/Ahora: 90 s/)).toBeInTheDocument();

    await user.type(screen.getByLabelText('GPS encendido'), '120');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(createCommand).toHaveBeenCalledWith({
      type: 'params', target: { collarIds: [4] }, params: { gpsOn: 120 },
    });
    expect(await screen.findByText('Detalle del comando')).toBeInTheDocument();
  });

  it('leaves out the zones that do not fit in the collar', async () => {
    const user = renderForm();
    await screen.findByRole('checkbox', { name: /Collar 12/ });

    await chooseType(user, 'Cargar zona');
    await user.click(screen.getByRole('combobox', { name: 'Zona' }));

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Potrero']);
  });

  it('confirms before sending to every collar, and does not send when canceled', async () => {
    const user = renderForm();
    await screen.findByRole('checkbox', { name: /Collar 12/ });

    await chooseType(user, 'Pedir diagnóstico');
    await user.click(screen.getByRole('button', { name: 'Todos los collares' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('¿Enviar "Pedir diagnóstico" a 2 collares?');

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(createCommand).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Enviar' }));

    expect(createCommand).toHaveBeenCalledWith({ type: 'diag', target: 'all' });
  });

  it('updates to the latest firmware unless a version is chosen', async () => {
    const user = renderForm();

    await chooseType(user, 'Actualizar firmware');
    await user.click(await screen.findByRole('checkbox', { name: /Collar 12/ }));
    await user.click(screen.getByRole('combobox', { name: 'Firmware' }));
    await user.click(screen.getByRole('option', { name: '1.2.0' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Enviar' }));

    expect(createCommand).toHaveBeenCalledWith({
      type: 'ota', target: { collarIds: [4] }, version: '1.2.0',
    });
  });

  it('says what is missing without sending', async () => {
    const user = renderForm();

    await chooseType(user, 'Reiniciar');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Elija al menos un collar.');
    expect(createCommand).not.toHaveBeenCalled();
  });
});
