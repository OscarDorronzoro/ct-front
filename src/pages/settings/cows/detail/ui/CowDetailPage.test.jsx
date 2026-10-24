// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import CowDetailPage from './CowDetailPage';
import { AuthContext } from '@/entities/viewer';
import { getCow } from '@/entities/cow';
import { getCowHealth, voidEvent } from '@/entities/health-event';

vi.mock('@/entities/cow/api/cowApi');
vi.mock('@/entities/health-event/api/healthEventApi');
vi.mock('@/entities/product/api/productApi');

const VETERINARIAN = ['cows:read', 'cows:write', 'health:read', 'health:write'];
const TECHNICIAN = ['cows:read', 'cows:assignCollar'];

const weighing = {
  id: 5,
  type: 'weighing',
  occurredAt: '2026-10-20T12:00:00Z',
  notes: null,
  recordedBy: { id: 1, username: 'ana' },
  voided: null,
  details: { weightKg: 412 },
};

const health = {
  summary: {
    withdrawal: { meatUntil: '2026-11-10T12:00:00Z', milkUntil: null },
    lastWeight: { kg: 412, at: '2026-10-20T12:00:00Z' },
    nextDoses: [],
  },
  events: [weighing],
};

function renderCard(permissions) {
  render(
    <AuthContext.Provider value={{ user: { id: 1, permissions } }}>
      <MemoryRouter initialEntries={['/settings/cows/8']}>
        <Routes>
          <Route path="/settings/cows/:cowId" element={<CowDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return userEvent.setup();
}

describe('CowDetailPage', () => {
  beforeEach(() => {
    getCow.mockResolvedValue({
      id: 8,
      alias: 'Ángela',
      earTag: 'A-100',
      sex: 'female',
      category: { name: 'Vaca' },
      categoryHistory: [
        {
          id: 2, category: { name: 'Vaca' }, dateFrom: '2026-05-10T12:00:00Z', dateTo: null, source: 'manual',
        },
        {
          id: 1, category: { name: 'Vaquillona' }, dateFrom: '2025-03-01T12:00:00Z', dateTo: '2026-05-10T12:00:00Z', source: 'automatic',
        },
      ],
      groups: [],
    });
    getCowHealth.mockResolvedValue(health);
    voidEvent.mockResolvedValue({});
  });

  it('shows the cow, what the history means today and its events', async () => {
    renderCard(VETERINARIAN);

    expect(await screen.findByText('A-100')).toBeInTheDocument();
    expect(screen.getByText('Hembra')).toBeInTheDocument();
    expect(await screen.findByText('Carne en retiro hasta el 10/11/2026')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pesaje' })).toBeInTheDocument();
    expect(screen.getByText('Registrado por ana')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Registrar evento/ })).toBeInTheDocument();
  });

  it('shows the current category since when, and its history', async () => {
    renderCard(TECHNICIAN);

    expect(await screen.findByText('Vaca · desde 10/05/2026')).toBeInTheDocument();
    expect(screen.getByText('Historial de categorías')).toBeInTheDocument();
    expect(screen.getByText(/01\/03\/2025 – 10\/05\/2026 · por edad/)).toBeInTheDocument();
  });

  it('hides the clinical history from who cannot read it', async () => {
    renderCard(TECHNICIAN);

    expect(await screen.findByText('A-100')).toBeInTheDocument();
    expect(screen.queryByText('Historia clínica')).not.toBeInTheDocument();
    expect(getCowHealth).not.toHaveBeenCalled();
  });

  it('voids an event with a reason and reloads the history', async () => {
    const user = renderCard(VETERINARIAN);

    await user.click(await screen.findByRole('button', { name: 'Anular evento' }));

    const dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Anular' });
    expect(confirm).toBeDisabled();

    await user.type(within(dialog).getByLabelText('Motivo'), 'Balanza descalibrada');
    await user.click(confirm);

    expect(voidEvent).toHaveBeenCalledWith(5, 'Balanza descalibrada');
    expect(getCowHealth).toHaveBeenCalledTimes(2);
  });
});
