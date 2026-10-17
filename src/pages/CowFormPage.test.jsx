// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';

import CowFormPage from './CowFormPage';
import { getCow, getAllCows, updateCow, createCow } from '../services/cow';
import { getAllCollars } from '../services/collar';
import { getAllBreeds } from '../services/breed';
import { getAllGroups } from '../services/group';

vi.mock('../services/cow');
vi.mock('../services/collar');
vi.mock('../services/breed');
vi.mock('../services/group');

const angela = {
  id: 8,
  alias: 'Ángela',
  earTag: 'A-100',
  currentCollarId: 123,
  imageUrl: '/images/cows/a.webp',
  breedId: null,
  birthDate: null,
  groups: [{ id: 2, name: 'Rodeo 1' }],
};

function renderForm(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/settings/cows/new" element={<CowFormPage />} />
        <Route path="/settings/cows/:cowId" element={<CowFormPage />} />
        <Route path="/settings/cows" element={<div>Lista de vacas</div>} />
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

// What the form sent: [field, value] pairs, the image as its name
async function submitted(saveMock) {
  await screen.findByText('Lista de vacas');
  const formData = saveMock.mock.lastCall.at(-1);
  return [...formData.entries()].map(([key, value]) => [key, value instanceof File ? value.name : value]);
}

describe('CowFormPage', () => {
  beforeEach(() => {
    getCow.mockResolvedValue(angela);
    getAllCows.mockResolvedValue([
      { id: 8, alias: 'Ángela', currentCollarId: 123 },
      { id: 6, alias: '322', currentCollarId: 129 },
    ]);
    getAllCollars.mockResolvedValue([{ id: 123, code: 12 }, { id: 129, code: 29 }, { id: 140, code: 40 }]);
    getAllBreeds.mockResolvedValue([]);
    getAllGroups.mockResolvedValue([{ id: 2, name: 'Rodeo 1' }, { id: 3, name: 'Rodeo 2' }]);
    updateCow.mockResolvedValue({});
    createCow.mockResolvedValue({});
  });

  const loaded = () => screen.findByRole('button', { name: 'Collar 12' });

  it('sends the cow as it is when nothing changes', async () => {
    const user = renderForm('/settings/cows/8');
    await loaded();

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(updateCow).toHaveBeenCalledWith(8, expect.any(FormData));
    expect(await submitted(updateCow)).toEqual([
      ['alias', 'Ángela'],
      ['earTag', 'A-100'],
      ['groupIds[]', '2'],
      ['currentCollarId', '123'],
    ]);
  });

  it('unassigns the collar with an empty currentCollarId', async () => {
    const user = renderForm('/settings/cows/8');
    await user.click(await loaded());
    await user.click(screen.getByRole('option', { name: 'Sin collar' }));

    expect(screen.getByText('El collar actual se desasignará al guardar.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await submitted(updateCow)).toContainEqual(['currentCollarId', '']);
  });

  it('warns when the chosen collar belongs to another cow', async () => {
    const user = renderForm('/settings/cows/8');
    await user.click(await loaded());
    await user.click(screen.getByRole('option', { name: /Collar 29/ }));

    expect(screen.getByText('Está asignado a 322: se le quitará al guardar.')).toBeInTheDocument();
  });

  it('asks to remove the image only when it is removed', async () => {
    const user = renderForm('/settings/cows/8');
    await loaded();

    await user.click(screen.getByRole('button', { name: 'Quitar imagen' }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await submitted(updateCow)).toContainEqual(['removeImage', 'true']);
  });

  it('sends an empty groupIds when every group is removed', async () => {
    const user = renderForm('/settings/cows/8');
    // The group shows once the group options have loaded
    await screen.findByRole('button', { name: 'Rodeo 1' });

    await user.click(screen.getByRole('button', { name: 'Quitar' }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    const fields = await submitted(updateCow);
    expect(fields).toContainEqual(['groupIds', '']);
    expect(fields.some(([key]) => key === 'groupIds[]')).toBe(false);
  });

  it('creates a cow without sending a collar when none is chosen', async () => {
    const user = renderForm('/settings/cows/new');
    await screen.findByRole('button', { name: 'Sin collar' });

    await user.type(screen.getByLabelText(/Alias/), 'Nueva');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(createCow).toHaveBeenCalled());
    const fields = await submitted(createCow);
    expect(fields).toContainEqual(['alias', 'Nueva']);
    expect(fields.some(([key]) => key === 'currentCollarId')).toBe(false);
  });
});
