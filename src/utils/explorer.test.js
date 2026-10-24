import { describe, it, expect } from 'vitest';
import {
  presetDates, chartsOf, niceScale, formatX, toCsv, SERIES_COLORS,
} from './explorer';

const dims = [
  { id: 'month', kind: 'date' },
  { id: 'cow', kind: 'category' },
  { id: 'category', kind: 'category' },
];

const cell = (value, label = value) => ({ value, label });

describe('presetDates', () => {
  const now = new Date(2026, 9, 22, 15, 0);

  it('ends today, both days included', () => {
    expect(presetDates('7d', now)).toEqual({ dateFrom: '2026-10-16', dateTo: '2026-10-22' });
    expect(presetDates('year', now)).toEqual({ dateFrom: '2026-01-01', dateTo: '2026-10-22' });
  });
});

describe('chartsOf', () => {
  const measure = { id: 'distance', label: 'Distancia', kind: 'measure', unit: 'km' };

  it('makes a number per measure without dimensions', () => {
    const shaped = chartsOf({ columns: [measure], rows: [[2.5]] }, dims);

    expect(shaped).toEqual({ kind: 'stat', measures: [{ ...measure, value: 2.5 }] });
  });

  it('puts the date on the x axis and the other dimension as series, sorted by name', () => {
    const shaped = chartsOf({
      columns: [{ id: 'cow', kind: 'dimension' }, { id: 'month', kind: 'dimension' }, measure],
      rows: [
        [cell(7, 'Rosa'), cell('2026-09'), 3],
        [cell(6, 'Ana'), cell('2026-09'), 2],
        [cell(6, 'Ana'), cell('2026-10'), 4],
      ],
    }, dims);

    expect(shaped.kind).toBe('line');
    expect(shaped.x.keys).toEqual(['2026-09', '2026-10']);
    expect(shaped.charts[0].series.map((s) => [s.label, s.values, s.color])).toEqual([
      ['Ana', [2, 4], SERIES_COLORS[0]],
      ['Rosa', [3, null], SERIES_COLORS[1]],
    ]);
  });

  it('uses bars for categories, and says when there are too many series to draw', () => {
    const rows = Array.from({ length: 9 }, (_, i) => [cell('Vaca'), cell(i, `Rodeo ${i}`), i]);
    const shaped = chartsOf({
      columns: [{ id: 'category', kind: 'dimension' }, { id: 'cow', kind: 'dimension' }, measure],
      rows,
    }, dims);

    expect(shaped.kind).toBe('bar');
    expect(shaped.tooMany).toBe(true);
  });
});

describe('niceScale', () => {
  it('starts at zero for magnitudes and rounds the ticks', () => {
    expect(niceScale([1.2, 3.7, 2])).toEqual({ min: 0, max: 4, ticks: [0, 1, 2, 3, 4] });
  });

  it('zooms in on values far from zero (voltages)', () => {
    const { min, max } = niceScale([3.56, 3.92]);

    expect(min).toBeGreaterThan(3);
    expect(max).toBeLessThanOrEqual(4);
  });

  it('keeps zero between negative and positive values', () => {
    const { ticks } = niceScale([-0.05, 0.07]);

    expect(ticks).toContain(0);
  });
});

describe('formatX', () => {
  it('shortens dates', () => {
    expect(formatX('2026-10-05', 'day')).toBe('05/10');
    expect(formatX('2026-10-05', 'week')).toBe('sem. 05/10');
    expect(formatX('Vaca', 'category')).toBe('Vaca');
  });
});

describe('toCsv', () => {
  it('writes labels and numbers, with units in the header', () => {
    const csv = toCsv({
      columns: [{ label: 'Vaca' }, { label: 'Distancia', unit: 'km' }],
      rows: [[cell(6, 'Ana "la mansa"'), 2.5], [cell(7, 'Rosa'), null]],
    });

    expect(csv).toBe('"Vaca","Distancia (km)"\n"Ana ""la mansa""",2.5\n"Rosa",');
  });
});
