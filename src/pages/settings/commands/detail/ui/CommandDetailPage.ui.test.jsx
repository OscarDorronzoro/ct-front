import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import CommandDetailPage from './CommandDetailPage';
import { getCommand, cancelCommand } from '@/entities/command';
import { ApiError } from '@/shared/api';

vi.mock('@/entities/command/api/commandApi');

const target = (values) => ({
  id: 1,
  collarId: 4,
  collarCode: 12,
  status: 'pending',
  result: null,
  deliveries: 0,
  deliveredAt: null,
  completedAt: null,
  ...values,
});

const command = (values) => ({
  id: 31,
  type: 'params',
  payload: { params: { gpsOn: 90 } },
  target: 'collars',
  createdAt: '2026-10-20T12:00:00Z',
  canceledAt: null,
  targets: [
    target({ status: 'done', result: 'ok', deliveredAt: '2026-10-20T12:05:00Z' }),
    target({ id: 2, collarCode: 13 }),
  ],
  ...values,
});

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/settings/commands/31']}>
      <Routes>
        <Route path="/settings/commands/:commandId" element={<CommandDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe('CommandDetailPage', () => {
  beforeEach(() => {
    getCommand.mockResolvedValue(command());
    cancelCommand.mockResolvedValue(null);
  });

  it('shows what it carries and how each collar is doing', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Cambiar parámetros' })).toBeInTheDocument();
    expect(screen.getByText('GPS y envío: GPS encendido')).toBeInTheDocument();
    expect(screen.getByText('90 s')).toBeInTheDocument();
    expect(screen.getByText('Collar 12')).toBeInTheDocument();
    expect(screen.getByText('Ejecutado')).toBeInTheDocument();
    expect(screen.getByText('Esperando al collar')).toBeInTheDocument();
  });

  it('cancels with confirmation and shows the new state', async () => {
    const user = renderPage();

    await user.click(await screen.findByRole('button', { name: 'Cancelar comando' }));

    getCommand.mockResolvedValue(command({
      canceledAt: '2026-10-20T13:00:00Z',
      targets: [target({ status: 'done', result: 'canceled' })],
    }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar comando' }));

    expect(cancelCommand).toHaveBeenCalledWith('31');
    expect(await screen.findByText(/Comando cancelado/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar comando' })).not.toBeInTheDocument();
  });

  it('offers no cancel when every delivery finished', async () => {
    getCommand.mockResolvedValue(command({ targets: [target({ status: 'done', result: 'ok' })] }));
    renderPage();

    await screen.findByText('Ejecutado');
    expect(screen.queryByRole('button', { name: 'Cancelar comando' })).not.toBeInTheDocument();
  });

  it('explains a failed cancel', async () => {
    cancelCommand.mockRejectedValue(new ApiError('El comando ya terminó.', 409, { error: 'COMMAND_FINISHED' }));
    const user = renderPage();

    await user.click(await screen.findByRole('button', { name: 'Cancelar comando' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar comando' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El comando ya terminó.');
  });

  it('says when the command could not be loaded', async () => {
    getCommand.mockRejectedValue(new ApiError('El comando no existe.', 404, { error: 'COMMAND_NOT_FOUND' }));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el comando.');
  });
});
