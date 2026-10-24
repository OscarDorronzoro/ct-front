import { describe, it, expect } from 'vitest';
import {
  presetRange, defaultRange, resolveRange, shiftRange, rangeLabel, rangeSummary,
  customRange, fromInputs, toDateValue, toTimeValue,
} from './dateRange';

// Local time (America/Argentina/Buenos_Aires, see vitest.config.js)
const at = (day, hour, minute = 0) => new Date(2026, 9, day, hour, minute);
const HOUR = 60 * 60 * 1000;

describe('presetRange', () => {
  it('"today" starts at midnight', () => {
    const now = at(14, 14);

    expect(presetRange('today', now)).toEqual({
      preset: 'today', from: at(14, 0), to: now, live: true,
    });
  });

  it('"today" covers at least 6 hours right after midnight', () => {
    expect(presetRange('today', at(14, 0, 30)).from).toEqual(at(13, 18, 30));
    expect(presetRange('today', at(14, 5, 59)).from).toEqual(at(13, 23, 59));
    expect(presetRange('today', at(14, 6)).from).toEqual(at(14, 0));
  });

  it('"yesterday" is the whole previous day, fixed', () => {
    const range = presetRange('yesterday', at(14, 10));

    expect(range.from).toEqual(at(13, 0));
    expect(range.to).toEqual(new Date(at(14, 0) - 1));
    expect(range.live).toBe(false);
  });

  it('rolling presets follow the current time', () => {
    const range = presetRange('last6h', at(14, 10));

    expect(range).toMatchObject({ from: at(14, 4), to: at(14, 10), live: true, rollingMs: 6 * HOUR });
  });

  it('defaultRange is "today"', () => {
    expect(defaultRange(at(14, 10)).preset).toBe('today');
  });
});

describe('resolveRange', () => {
  it('moves a rolling range with the current time', () => {
    const range = presetRange('last6h', at(14, 10));

    expect(resolveRange(range, at(14, 12))).toEqual({ from: at(14, 6), to: at(14, 12) });
  });

  it('keeps the start of "today" and moves only the end', () => {
    const range = presetRange('today', at(14, 10));

    expect(resolveRange(range, at(14, 12))).toEqual({ from: at(14, 0), to: at(14, 12) });
  });

  it('leaves a fixed range as it is', () => {
    const range = presetRange('yesterday', at(14, 10));

    expect(resolveRange(range, at(15, 10))).toEqual({ from: range.from, to: range.to });
  });
});

describe('shiftRange', () => {
  const now = at(14, 10);

  it('moves a fixed range back by its own length', () => {
    const range = shiftRange(presetRange('yesterday', now), -1, now);

    expect(range.live).toBe(false);
    expect(rangeSummary(range, now)).toBe('12/10 · 00:00 → 23:59');
  });

  it('does not drift after several shifts', () => {
    let range = presetRange('yesterday', now);
    for (let i = 0; i < 5; i++) {
      range = shiftRange(range, -1, now);
    }

    expect(range.from).toEqual(at(8, 0));
    expect(rangeSummary(range, now)).toBe('08/10 · 00:00 → 23:59');
  });

  it('turns live when the next period reaches now', () => {
    const range = shiftRange(presetRange('yesterday', now), 1, now);

    expect(range).toMatchObject({ to: now, live: true, rollingMs: 24 * HOUR });
  });

  it('turns live when the next period ends less than a minute before now', () => {
    const range = { preset: 'custom', from: new Date(now - 2 * HOUR - 30000), to: new Date(now - HOUR - 30000), live: false };

    expect(shiftRange(range, 1, now).live).toBe(true);
  });

  it('stays fixed when the next period ends earlier', () => {
    const range = { preset: 'custom', from: new Date(now - 3 * HOUR), to: new Date(now - 2 * HOUR), live: false };

    expect(shiftRange(range, 1, now)).toMatchObject({ from: new Date(now - 2 * HOUR), to: new Date(now - HOUR), live: false });
  });
});

describe('rangeSummary', () => {
  it('"today" shows only times', () => {
    expect(rangeSummary(presetRange('today', at(14, 14)), at(14, 14))).toBe('00:00 → ahora');
  });

  it('shows the day when the start was yesterday', () => {
    expect(rangeSummary(presetRange('today', at(14, 0, 30)), at(14, 0, 30))).toBe('13/10 18:30 → ahora');
  });

  it('shows a past day once', () => {
    expect(rangeSummary(presetRange('yesterday', at(14, 10)), at(14, 10))).toBe('13/10 · 00:00 → 23:59');
  });

  it('shows both days for a range across days', () => {
    const range = { preset: 'custom', from: at(9, 6), to: at(11, 18), live: false };

    expect(rangeSummary(range, at(14, 10))).toBe('09/10 06:00 → 11/10 18:00');
  });
});

describe('rangeLabel', () => {
  it('names presets and custom ranges', () => {
    expect(rangeLabel({ preset: 'yesterday' })).toBe('Ayer');
    expect(rangeLabel({ preset: 'custom' })).toBe('Personalizado');
  });
});

describe('customRange', () => {
  const now = at(14, 10);

  it('needs both ends unless it runs until now', () => {
    expect(customRange(at(14, 8), null, false, now)).toEqual({ error: 'Complete fecha y hora.' });
    expect(customRange(null, at(14, 9), false, now).error).toBeDefined();
  });

  it('rejects a start after the end', () => {
    expect(customRange(at(14, 9), at(14, 8), false, now)).toEqual({ error: '"Desde" tiene que ser anterior a "Hasta".' });
  });

  it('builds a fixed range', () => {
    expect(customRange(at(13, 8), at(13, 9), false, now)).toEqual({
      range: { preset: 'custom', from: at(13, 8), to: at(13, 9), live: false },
    });
  });

  it('runs until now when asked, or when the end is now or later', () => {
    expect(customRange(at(14, 8), null, true, now).range).toMatchObject({ to: now, live: true });
    expect(customRange(at(14, 8), at(14, 11), false, now).range).toMatchObject({ to: now, live: true });
  });
});

describe('form inputs', () => {
  it('round-trips date and time values', () => {
    const date = at(4, 8, 5);

    expect(toDateValue(date)).toBe('2026-10-04');
    expect(toTimeValue(date)).toBe('08:05');
    expect(fromInputs('2026-10-04', '08:05')).toEqual(date);
  });

  it('returns null for incomplete inputs', () => {
    expect(fromInputs('2026-10-04', '')).toBeNull();
    expect(fromInputs('', '08:05')).toBeNull();
  });
});
