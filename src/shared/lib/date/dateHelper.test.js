import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  toTimeElapsed, formatDay, formatTime, formatDateTime,
} from './dateHelper';

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
    [60 * MINUTE, 'Hace 1,0 h'],
    [72 * MINUTE, 'Hace 1,2 h'],
    // 1 h 59 min: rounded down, never more than what passed
    [119 * MINUTE, 'Hace 1,9 h'],
    [156 * MINUTE, 'Hace 2,6 h'],
    [3 * 60 * MINUTE, 'Hace 3,0 h'],
    [(24 * 60 - 1) * MINUTE, 'Hace 23,9 h'],
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

// In the time of the farm (vitest.config.js fixes the zone): 14:05 UTC is 11:05
describe('formats', () => {
  const at = '2026-10-24T14:05:09Z';

  it('formats the day, also of a date without time', () => {
    expect(formatDay(at)).toBe('24/10/2026');
    // A day of the calendar (YYYY-MM-DD) is that day, not the one before at midnight UTC
    expect(formatDay('2026-04-20')).toBe('20/04/2026');
  });

  it('formats the time in 24 hours', () => {
    expect(formatTime(at)).toBe('11:05');
  });

  it('formats date and time, with the seconds when asked', () => {
    expect(formatDateTime(at)).toBe('24/10/2026, 11:05');
    expect(formatDateTime(at, { seconds: true })).toBe('24/10/2026, 11:05:09');
  });
});

