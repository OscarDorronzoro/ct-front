import { describe, it, expect, vi } from 'vitest';
import { getSavedMapConfig, saveMapConfig } from './mapConfig';

// localStorage of a browser, in Node
function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  const local = {
    getItem: (key) => data.get(key) ?? null,
    setItem: vi.fn((key, value) => data.set(key, value)),
  };
  vi.stubGlobal('localStorage', local);
  return local;
}

const FARM = { center: [-61.209824, -32.967354], zoom: 14 };

describe('map config', () => {
  it('starts on the farm when nothing was saved', () => {
    storage();
    expect(getSavedMapConfig()).toEqual(FARM);
  });

  it('starts where the live map was last', () => {
    storage();
    saveMapConfig({ center: [-61.3, -32.9], zoom: 16 });

    expect(getSavedMapConfig()).toEqual({ center: [-61.3, -32.9], zoom: 16 });
  });

  it('falls back to the farm when what was saved is broken', () => {
    storage({ mapConfig: '{not json' });
    expect(getSavedMapConfig()).toEqual(FARM);
  });

  it('keeps working without storage (private mode)', () => {
    const local = storage();
    local.setItem.mockImplementation(() => { throw new Error('QuotaExceededError'); });
    vi.spyOn(local, 'getItem').mockImplementation(() => { throw new Error('SecurityError'); });

    expect(() => saveMapConfig({ center: [0, 0], zoom: 1 })).not.toThrow();
    expect(getSavedMapConfig()).toEqual(FARM);
  });
});
