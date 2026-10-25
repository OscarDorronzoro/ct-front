import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import CowFormPage from './CowFormPage';
import { AuthContext } from '@/entities/viewer';
import {
  getCow, getAllCows, updateCow, createCow,
} from '@/entities/cow';
import { getAllCollars } from '@/entities/collar';
import { getAllBreeds } from '@/entities/breed';
import { getAllGroups } from '@/entities/group';
import { getAllCategories } from '@/entities/category';

vi.mock('@/entities/cow/api/cowApi');
vi.mock('@/entities/collar/api/collarApi');
vi.mock('@/entities/breed/api/breedApi');
vi.mock('@/entities/group/api/groupApi');
vi.mock('@/entities/category/api/categoryApi');

const angela = {
  id: 8,
  alias: 'Ángela',
  earTag: 'A-100',
  currentCollarId: 123,
  imageUrl: '/images/cows/a.webp',
  breedId: null,
  sex: 'female',
  categoryId: 3,
  birthDate: null,
  groups: [{ id: 2, name: 'Rodeo 1' }],
};

// Permissions of the logged user (backend roles): manager by default
const MANAGER = ['cows:read', 'cows:write', 'cows:assignCollar'];
const VETERINARIAN = ['cows:read', 'cows:write'];
const TECHNICIAN = ['cows:read', 'cows:assignCollar'];

function renderForm(path, permissions = MANAGER) {
  render(
    <AuthContext.Provider value={{ user: { id: 1, permissions } }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/settings/cows/new" element={<CowFormPage />} />
          <Route path="/settings/cows/:cowId/edit" element={<CowFormPage />} />
          <Route path="/settings/cows/:cowId" element={<div>Ficha de la vaca</div>} />
          <Route path="/settings/cows" element={<div>Lista de vacas</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return userEvent.setup();
}

// What the form sent: [field, value] pairs, the image as its name. After saving it goes to the
// card of the cow (edit) or to the list (new).
async function submitted(saveMock) {
  await screen.findByText(/Ficha de la vaca|Lista de vacas/);
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
    getAllCategories.mockResolvedValue([
      { id: 2, name: 'Vaquillona', sex: 'female' },
      { id: 3, name: 'Vaca', sex: 'female' },
      { id: 6, name: 'Novillo', sex: 'male' },
    ]);
    updateCow.mockResolvedValue({});
    createCow.mockResolvedValue({});
  });

  const loaded = () => screen.findByRole('button', { name: 'Collar 12' });

  it('sends the cow as it is when nothing changes', async () => {
    const user = renderForm('/settings/cows/8/edit');
    await loaded();

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(updateCow).toHaveBeenCalledWith('8', expect.any(FormData));
    expect(await submitted(updateCow)).toEqual([
      ['alias', 'Ángela'],
      ['earTag', 'A-100'],
      ['sex', 'female'],
      ['groupIds[]', '2'],
      ['categoryId', '3'],
      ['currentCollarId', '123'],
    ]);
  });

  it('lets a veterinarian edit the cow but not its collar', async () => {
    const user = renderForm('/settings/cows/8/edit', VETERINARIAN);
    const collar = await loaded();

    expect(collar).toBeDisabled();
    expect(screen.getByText('Solo un encargado o un técnico pueden cambiar el collar.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    const fields = await submitted(updateCow);
    expect(fields).toContainEqual(['alias', 'Ángela']);
    expect(fields.some(([key]) => key === 'currentCollarId')).toBe(false);
  });

  it('lets a technician change only the collar', async () => {
    const user = renderForm('/settings/cows/8/edit', TECHNICIAN);
    await user.click(await loaded());
    await user.click(screen.getByRole('option', { name: /Collar 40/ }));

    expect(screen.getByLabelText(/Alias/)).toBeDisabled();
    expect(screen.queryByText('Imagen')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await submitted(updateCow)).toEqual([['currentCollarId', '140']]);
  });

  it('offers only the categories of the sex, and drops the category when the sex changes', async () => {
    const user = renderForm('/settings/cows/8/edit');
    await user.click(await screen.findByRole('button', { name: 'Vaca' }));

    expect(screen.getByRole('option', { name: 'Vaquillona' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Novillo' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Vaca' }));
    await user.click(screen.getByRole('button', { name: 'Hembra' }));
    await user.click(screen.getByRole('option', { name: 'Macho' }));

    await user.click(screen.getByRole('button', { name: 'Sin categoría' }));
    expect(screen.getByRole('option', { name: 'Novillo' })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Novillo' }));

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    const fields = await submitted(updateCow);
    expect(fields).toContainEqual(['sex', 'male']);
    expect(fields).toContainEqual(['categoryId', '6']);
  });

  it('asks for the sex before the category on a new cow', async () => {
    renderForm('/settings/cows/new');

    expect(await screen.findByText('Elija primero el sexo.')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Sin categoría' })).toBeDisabled();
  });

  it('unassigns the collar with an empty currentCollarId', async () => {
    const user = renderForm('/settings/cows/8/edit');
    await user.click(await loaded());
    await user.click(screen.getByRole('option', { name: 'Sin collar' }));

    expect(screen.getByText('El collar actual se desasignará al guardar.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await submitted(updateCow)).toContainEqual(['currentCollarId', '']);
  });

  it('warns when the chosen collar belongs to another cow', async () => {
    const user = renderForm('/settings/cows/8/edit');
    await user.click(await loaded());
    await user.click(screen.getByRole('option', { name: /Collar 29/ }));

    expect(screen.getByText('Está asignado a 322: se le quitará al guardar.')).toBeInTheDocument();
  });

  it('asks to remove the image only when it is removed', async () => {
    const user = renderForm('/settings/cows/8/edit');
    await loaded();

    await user.click(screen.getByRole('button', { name: 'Quitar imagen' }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await submitted(updateCow)).toContainEqual(['removeImage', 'true']);
  });

  it('sends an empty groupIds when every group is removed', async () => {
    const user = renderForm('/settings/cows/8/edit');
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
