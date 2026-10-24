import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { toTimeElapsed } from './dateHelper';

const NOW = new Date('2026-10-14T12:00:00Z');
const MINUTE = 60 * 1000;
const ago = (ms) => new Date(NOW.getTime() - ms);

describe('toTimeElapsed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [30 * 1000, 'Ahora'],
    [5 * MINUTE, 'Hace 5 min'],
    [59 * MINUTE, 'Hace 59 min'],
    [3 * 60 * MINUTE, 'Hace 3 h'],
    [24 * 60 * MINUTE, 'Hace 1 día'],
    [9.71 * 24 * 60 * MINUTE, 'Hace 9 días'],
    [45 * 24 * 60 * MINUTE, 'Hace 1 mes'],
    [100 * 24 * 60 * MINUTE, 'Hace 3 meses'],
    [400 * 24 * 60 * MINUTE, 'Hace 1 año'],
  ])('%i ms ago -> %s', (ms, text) => {
    expect(toTimeElapsed(ago(ms)).text).toBe(text);
  });

  it('accepts timestamps and ISO strings', () => {
    expect(toTimeElapsed(ago(5 * MINUTE).getTime()).text).toBe('Hace 5 min');
    expect(toTimeElapsed(ago(5 * MINUTE).toISOString()).text).toBe('Hace 5 min');
  });
});
