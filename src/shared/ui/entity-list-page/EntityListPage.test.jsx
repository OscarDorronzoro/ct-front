// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import EntityListPage from './EntityListPage';

const items = [{ id: 1, name: 'Rodeo 1' }, { id: 2, name: 'Tambo' }];
const fields = (item) => [item.name];
const toResult = (item) => ({ id: item.id, label: item.name, description: null });

// list: what useEntityList returns, already loaded
function setup({ newPath = '/new', deleteDialog, aside, itemToDelete = null } = {}) {
  const list = {
    items,
    loading: false,
    loadError: null,
    reload: vi.fn(),
    actionError: null,
    clearActionError: vi.fn(),
    itemToDelete,
    requestDelete: vi.fn(),
    cancelDelete: vi.fn(),
    confirmDelete: vi.fn(),
  };
  const onSelect = vi.fn();

  render(
    <MemoryRouter>
      <EntityListPage
        title="Grupos"
        addLabel="Agregar grupo"
        newPath={newPath}
        list={list}
        search={{
          placeholder: 'Buscar grupo...', fields, toResult, onSelect,
        }}
        labels={{ error: 'Error', empty: 'Vacío' }}
        renderItem={(item) => (
          <button key={item.id} type="button" onClick={() => list.requestDelete(item)}>{item.name}</button>
        )}
        deleteDialog={deleteDialog}
        aside={aside}
      />
    </MemoryRouter>,
  );

  return { list, onSelect, user: userEvent.setup() };
}

describe('EntityListPage', () => {
  it('lists the items and searches them', async () => {
    const { onSelect, user } = setup();

    expect(screen.getByRole('button', { name: 'Rodeo 1' })).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Buscar grupo...' }), 'tam');
    await user.click(screen.getByRole('option', { name: 'Tambo' }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  it('offers to add only with a new path', () => {
    setup({ newPath: null });

    expect(screen.queryByRole('link', { name: 'Agregar grupo' })).not.toBeInTheDocument();
  });

  it('confirms before deleting', async () => {
    const { list, user } = setup({
      itemToDelete: items[0],
      deleteDialog: { title: 'Eliminar grupo', message: (item) => `¿Eliminar "${item.name}"?` },
    });

    expect(screen.getByText('¿Eliminar "Rodeo 1"?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(list.confirmDelete).toHaveBeenCalled();
  });

  it('shows the aside next to the list', () => {
    setup({ aside: <div>Mapa de zonas</div> });

    expect(screen.getByText('Mapa de zonas')).toBeInTheDocument();
  });
});
