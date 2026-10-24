import { describe, it, expect } from 'vitest';
import { formatNumber } from './formatNumber';

describe('formatNumber', () => {
  it('uses the Argentine separators and at most 2 decimals', () => {
    expect(formatNumber(1234.567)).toBe('1.234,57');
    expect(formatNumber(39.5)).toBe('39,5');
  });

  it('keeps the exact decimals with fixed', () => {
    expect(formatNumber(3.4, { digits: 2, fixed: true })).toBe('3,40');
    expect(formatNumber(12.6, { digits: 0 })).toBe('13');
  });

  it('shortens large numbers with compact, and shows a dash for no value', () => {
    // The abbreviation depends on the engine's locale data: 1,2 mil (Chrome) or 1,2 K (Node)
    expect(formatNumber(1200, { compact: true })).toMatch(/^1,2\s?(mil|K)$/);
    expect(formatNumber(null)).toBe('—');
  });
});
