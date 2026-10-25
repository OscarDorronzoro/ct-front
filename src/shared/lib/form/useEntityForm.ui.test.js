import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ApiError } from '@/shared/api';
import useEntityForm from './useEntityForm';

const empty = { name: '' };
const messages = { load: 'No se pudo cargar el grupo.', save: 'No se pudo guardar el grupo.' };
const toForm = (group) => ({ name: group.name });
const submitEvent = { preventDefault: () => {} };

function setup(options = {}) {
  const props = {
    empty, toForm, messages, save: vi.fn(async () => {}), onSaved: vi.fn(), ...options,
  };
  const { result } = renderHook(() => useEntityForm(props));
  return { result, ...props };
}

describe('useEntityForm', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('starts empty for a new entity', () => {
    const { result } = setup();

    expect(result.current.form).toEqual(empty);
    expect(result.current.loading).toBe(false);
  });

  it('loads the entity to edit into the form', async () => {
    const load = vi.fn(async () => ({ id: 2, name: 'Tambo' }));
    const { result } = setup({ id: '2', load });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(load).toHaveBeenCalledWith('2');
    expect(result.current.form).toEqual({ name: 'Tambo' });
    expect(result.current.entity).toEqual({ id: 2, name: 'Tambo' });
  });

  it('shows the load message when the entity cannot be loaded', async () => {
    const { result } = setup({ id: '2', load: () => Promise.reject(new TypeError('offline')) });

    await waitFor(() => expect(result.current.error).toBe('No se pudo cargar el grupo.'));
  });

  it('saves the changed values and then calls onSaved', async () => {
    const { result, save, onSaved } = setup();

    act(() => result.current.handleChange({ target: { name: 'name', value: 'Rodeo 1' } }));
    await act(() => result.current.handleSubmit(submitEvent));

    expect(save).toHaveBeenCalledWith({ name: 'Rodeo 1' });
    expect(onSaved).toHaveBeenCalled();
  });

  it('does not save an invalid form', async () => {
    const { result, save } = setup({ validate: (form) => (form.name ? null : 'Poné un nombre.') });

    await act(() => result.current.handleSubmit(submitEvent));

    expect(result.current.error).toBe('Poné un nombre.');
    expect(save).not.toHaveBeenCalled();
  });

  it('shows the message of a known API error, or the save message', async () => {
    const known = new ApiError('Ya existe un grupo con ese nombre.', 409, { error: 'LAST_ADMIN' });
    const { result, onSaved } = setup({ save: () => Promise.reject(known) });

    await act(() => result.current.handleSubmit(submitEvent));
    expect(result.current.error).toBe('Ya existe un grupo con ese nombre.');
    expect(onSaved).not.toHaveBeenCalled();

    const other = setup({ save: () => Promise.reject(new TypeError('x is undefined')) });
    await act(() => other.result.current.handleSubmit(submitEvent));
    expect(other.result.current.error).toBe('No se pudo guardar el grupo.');
  });
});
