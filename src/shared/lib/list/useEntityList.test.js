// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useEntityList from './useEntityList';

const cows = [{ id: 1, alias: 'A' }, { id: 2, alias: 'B' }];

// Same functions on every render, as the pages do (see the hook's note on `load`)
function setup({ load = async () => cows, remove = vi.fn() } = {}) {
  return renderHook(() => useEntityList({ load, remove })).result;
}

describe('useEntityList', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('loads the items', async () => {
    const result = setup();

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual(cows);
  });

  it('keeps the load error', async () => {
    const error = new Error('offline');
    const result = setup({ load: () => Promise.reject(error) });

    await waitFor(() => expect(result.current.loadError).toBe(error));
    expect(result.current.items).toEqual([]);
  });

  it('deletes an item only after confirming', async () => {
    const remove = vi.fn().mockResolvedValue();
    const result = setup({ remove });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.requestDelete(cows[0]));
    expect(remove).not.toHaveBeenCalled();
    expect(result.current.itemToDelete).toBe(cows[0]);

    await act(() => result.current.confirmDelete());

    expect(remove).toHaveBeenCalledWith(cows[0]);
    expect(result.current.items).toEqual([cows[1]]);
    expect(result.current.itemToDelete).toBeNull();
  });

  it('keeps the item and the error when deleting fails', async () => {
    const error = new Error('COW_NOT_FOUND');
    const result = setup({ remove: () => Promise.reject(error) });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.requestDelete(cows[0]));
    await act(() => result.current.confirmDelete());

    expect(result.current.items).toEqual(cows);
    expect(result.current.actionError).toBe(error);
  });
});
