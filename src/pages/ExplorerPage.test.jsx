// @vitest-environment jsdom
import {
  describe, it, expect, beforeAll, beforeEach, vi,
} from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import ExplorerPage from './ExplorerPage';
import { getCatalog, runQuery } from '@/services/analytics';

vi.mock('@/services/analytics');

const CATALOG = [
  {
    id: 'activity',
    label: 'Actividad diaria',
    description: 'Distancia y descanso.',
    measures: [
      { id: 'distancePerCowKm', label: 'Distancia por vaca y día', unit: 'km' },
      { id: 'restingHours', label: 'Descanso por vaca y día', unit: 'h' },
    ],
    dimensions: [
      { id: 'week', label: 'Semana', kind: 'date' },
      { id: 'cow', label: 'Vaca', kind: 'category' },
    ],
  },
  {
    id: 'weather',
    label: 'Clima',
    description: 'Temperatura y lluvia.',
    measures: [{ id: 'precipitationMm', label: 'Lluvia', unit: 'mm' }],
    dimensions: [{ id: 'month', label: 'Mes', kind: 'date' }],
  },
];

const weekly = {
  columns: [
    { id: 'week', label: 'Semana', kind: 'dimension' },
    { id: 'distancePerCowKm', label: 'Distancia por vaca y día', kind: 'measure', unit: 'km' },
  ],
  rows: [
    [{ value: '2026-10-05', label: '2026-10-05' }, 2.5],
    [{ value: '2026-10-12', label: '2026-10-12' }, 3.1],
  ],
  truncated: false,
};

function renderPage() {
  render(<MemoryRouter><ExplorerPage /></MemoryRouter>);
  return userEvent.setup();
}

describe('ExplorerPage', () => {
  beforeAll(() => {
    // jsdom doesn't lay out: the charts get a fixed width
    globalThis.ResizeObserver = class {
      constructor(callback) { this.callback = callback; }

      observe() { this.callback([{ contentRect: { width: 600 } }]); }

      disconnect() {}
    };
  });

  beforeEach(() => {
    getCatalog.mockResolvedValue(CATALOG);
    runQuery.mockResolvedValue(weekly);
  });

  it('asks for the first dataset by week by default, and shows a chart and the table', async () => {
    renderPage();

    expect(await screen.findByRole('img', { name: /Distancia por vaca y día: gráfico de líneas/ })).toBeInTheDocument();
    expect(runQuery).toHaveBeenCalledWith(expect.objectContaining({
      dataset: 'activity', measures: ['distancePerCowKm'], dimensions: ['week'], filters: [],
    }));
    expect(screen.getByText('2 filas')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '3,1' })).toBeInTheDocument();
  });

  it('starts over with the defaults of another dataset', async () => {
    const user = renderPage();
    await screen.findByText('2 filas');

    await user.click(screen.getByRole('button', { name: 'Actividad diaria' }));
    await user.click(screen.getByRole('option', { name: 'Clima' }));

    await waitFor(() => expect(runQuery).toHaveBeenLastCalledWith(expect.objectContaining({
      dataset: 'weather', measures: ['precipitationMm'], dimensions: ['month'],
    })));
  });

  it('shows a number per measure without groups', async () => {
    runQuery.mockResolvedValueOnce(weekly).mockResolvedValue({
      columns: [{ id: 'distancePerCowKm', label: 'Distancia por vaca y día', kind: 'measure', unit: 'km' }],
      rows: [[2.84]],
      truncated: false,
    });
    const user = renderPage();
    await screen.findByText('2 filas');

    await user.click(screen.getByRole('button', { name: 'Semana' }));
    await user.click(screen.getByRole('option', { name: 'Sin agrupar' }));

    expect(await screen.findByText('1 fila')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // The big number and its cell in the table
    expect(screen.getAllByText('2,84')).toHaveLength(2);
  });

  it('says when the role has nothing to query', async () => {
    getCatalog.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText('No hay datos disponibles para su rol')).toBeInTheDocument();
  });
});
