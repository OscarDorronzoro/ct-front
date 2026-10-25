import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import HealthEventFormPage from './HealthEventFormPage';
import { getCow } from '@/entities/cow';
import { getProducts } from '@/entities/product';
import { recordEvent } from '@/entities/health-event';

vi.mock('@/entities/cow/api/cowApi');
vi.mock('@/entities/health-event/api/healthEventApi');
vi.mock('@/entities/product/api/productApi');

function renderForm() {
  render(
    <MemoryRouter initialEntries={['/settings/cows/8/events/new']}>
      <Routes>
        <Route path="/settings/cows/:cowId/events/new" element={<HealthEventFormPage />} />
        <Route path="/settings/cows/:cowId" element={<div>Ficha de la vaca</div>} />
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe('HealthEventFormPage', () => {
  beforeEach(() => {
    getCow.mockResolvedValue({ id: 8, alias: 'Ángela' });
    getProducts.mockResolvedValue([
      { id: 1, name: 'Aftosa', type: 'vaccine' },
      { id: 2, name: 'Ivermectina 1%', type: 'antiparasitic' },
    ]);
    recordEvent.mockResolvedValue({});
  });

  it('offers only the products of the type of event', async () => {
    const user = renderForm();

    await user.click(await screen.findByRole('button', { name: 'Seleccione un producto' }));
    expect(screen.getByRole('option', { name: 'Aftosa' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Ivermectina 1%' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Aftosa' }));
    await user.click(screen.getByRole('button', { name: 'Tratamiento' }));

    // The product of the vaccination doesn't apply to the treatment
    await user.click(screen.getByRole('button', { name: 'Seleccione un producto' }));
    expect(screen.getByRole('option', { name: 'Ivermectina 1%' })).toBeInTheDocument();
  });

  it('sends only the fields of the type, with numbers', async () => {
    const user = renderForm();

    await user.click(await screen.findByRole('button', { name: 'Pesaje' }));
    await user.type(screen.getByLabelText(/Peso/), '412,5');
    await user.type(screen.getByLabelText('Notas'), 'Balanza de la manga');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await screen.findByText('Ficha de la vaca');
    expect(recordEvent).toHaveBeenCalledWith('8', {
      type: 'weighing',
      occurredAt: expect.any(String),
      weightKg: 412.5,
      notes: 'Balanza de la manga',
    });
  });

  it('offers castration only for males, and sends its method', async () => {
    getCow.mockResolvedValue({ id: 8, alias: 'Pampa', sex: 'male' });
    const user = renderForm();

    await user.click(await screen.findByRole('button', { name: 'Castración' }));
    await user.click(screen.getByRole('button', { name: 'Sin indicar' }));
    await user.click(screen.getByRole('option', { name: 'Quirúrgica' }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await screen.findByText('Ficha de la vaca');
    expect(recordEvent).toHaveBeenCalledWith('8', expect.objectContaining({ type: 'castration', method: 'surgical' }));
  });

  it('does not offer castration for a female', async () => {
    getCow.mockResolvedValue({ id: 8, alias: 'Ángela', sex: 'female' });
    renderForm();

    await screen.findByRole('button', { name: 'Seleccione un producto' });
    expect(screen.queryByRole('button', { name: 'Castración' })).not.toBeInTheDocument();
  });

  it('asks for the product before sending a vaccination', async () => {
    const user = renderForm();
    await screen.findByRole('button', { name: 'Seleccione un producto' });

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByText('Elija el producto.')).toBeInTheDocument();
    expect(recordEvent).not.toHaveBeenCalled();
  });
});
