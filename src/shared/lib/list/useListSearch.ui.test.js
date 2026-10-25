import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useListSearch from './useListSearch';

const cows = [
  { id: 1, alias: 'Ángela', earTag: 'A-100' },
  { id: 2, alias: 'Martina', earTag: 'B-200' },
];
const options = {
  fields: (cow) => [cow.alias, cow.earTag],
  toResult: (cow) => ({ type: 'cow', id: cow.id, label: cow.alias }),
};

function search(items, text) {
  const { result } = renderHook(() => useListSearch(items, options));
  act(() => result.current.setSearch(text));
  return result.current.results;
}

describe('useListSearch', () => {
  it('ignores accents and case', () => {
    expect(search(cows, 'ANGELA')).toEqual([{ type: 'cow', id: 1, label: 'Ángela' }]);
  });

  it('matches any of the fields', () => {
    expect(search(cows, 'b-2').map((r) => r.id)).toEqual([2]);
  });

  it('returns nothing for an empty search', () => {
    expect(search(cows, '   ')).toEqual([]);
  });

  it('limits the results to 8', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ id: i, alias: `Vaca ${i}`, earTag: '' }));

    expect(search(many, 'vaca')).toHaveLength(8);
  });
});
