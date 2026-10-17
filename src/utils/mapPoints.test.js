import { describe, it, expect } from 'vitest';

import {
  groupByCollar, collarColors, tracksGeoJSON, heatWeights, COLLAR_PALETTE,
} from './mapPoints';

const MINUTE = 60 * 1000;
const T0 = Date.parse('2026-10-14T12:00:00Z');

let nextId = 1;
const point = (collarId, minute, lon = -61, lat = -33) => ({
  id: nextId++,
  collarId,
  recordedAt: new Date(T0 + minute * MINUTE).toISOString(),
  location: { longitude: lon, latitude: lat },
});

describe('groupByCollar', () => {
  it('groups by collar, oldest first', () => {
    const groups = groupByCollar([point(2, 10), point(1, 5), point(2, 0)]);

    expect([...groups.keys()]).toEqual([2, 1]);
    expect(groups.get(2).map((p) => p.recordedAt)).toEqual([
      new Date(T0).toISOString(),
      new Date(T0 + 10 * MINUTE).toISOString(),
    ]);
  });
});

describe('collarColors', () => {
  it('assigns colors by collar id order, so they are stable', () => {
    const colors = collarColors([7, 3, 5]);

    expect(colors.get(3)).toBe(COLLAR_PALETTE[0]);
    expect(colors.get(5)).toBe(COLLAR_PALETTE[1]);
    expect(colors.get(7)).toBe(COLLAR_PALETTE[2]);
  });

  it('never repeats a color while there are enough', () => {
    const ids = Array.from({ length: COLLAR_PALETTE.length }, (_, i) => i + 1);

    expect(new Set(collarColors(ids).values()).size).toBe(COLLAR_PALETTE.length);
  });
});

describe('tracksGeoJSON', () => {
  it('joins close positions in one line and dashes long gaps', () => {
    const groups = groupByCollar([
      point(1, 0, -61.0), point(1, 2, -61.1), point(1, 4, -61.2),
      point(1, 60, -61.3), point(1, 62, -61.4),
    ]);
    const { features } = tracksGeoJSON(groups, collarColors(groups.keys()));

    expect(features.map((f) => [f.properties.gap, f.geometry.coordinates.map(([lon]) => lon)])).toEqual([
      [false, [-61.0, -61.1, -61.2]],
      [true, [-61.2, -61.3]],
      [false, [-61.3, -61.4]],
    ]);
  });

  it('draws no line for a single position', () => {
    const groups = groupByCollar([point(1, 0)]);

    expect(tracksGeoJSON(groups, collarColors(groups.keys())).features).toEqual([]);
  });
});

describe('heatWeights', () => {
  it('weighs each position by the time until the next one, capped at 30 min', () => {
    const points = [point(1, 0), point(1, 15), point(1, 90)];
    const weights = heatWeights(groupByCollar(points));

    expect(weights.get(points[0].id)).toBe(0.5); // 15 min
    expect(weights.get(points[1].id)).toBe(1); // 75 min, capped
  });

  it('weighs the last position by the time since the previous one', () => {
    const points = [point(1, 0), point(1, 6)];

    expect(heatWeights(groupByCollar(points)).get(points[1].id)).toBeCloseTo(0.2);
  });

  it('gives a lone position half the weight', () => {
    const lone = point(1, 0);

    expect(heatWeights(groupByCollar([lone])).get(lone.id)).toBe(0.5);
  });
});
