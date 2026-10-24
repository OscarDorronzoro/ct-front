import { describe, it, expect } from 'vitest';
import { cowLabel, formatAge } from './cow';

describe('cowLabel', () => {
  it('names a cow by its alias, or its id', () => {
    expect(cowLabel({ id: 8, alias: 'Ángela' })).toBe('Ángela');
    expect(cowLabel({ id: 8, alias: '' })).toBe('Vaca 8');
  });
});

describe('formatAge', () => {
  const now = new Date('2026-10-22T12:00:00');

  it.each([
    ['2026-10-12', '10 días'],
    ['2026-02-22', '8 meses'],
    ['2025-10-22', '1 año'],
    ['2023-08-01', '3 años y 2 meses'],
    ['2023-08-25', '3 años y 1 mes'],
  ])('born %s -> %s', (birth, text) => {
    expect(formatAge(`${birth}T12:00:00`, now)).toBe(text);
  });
});
