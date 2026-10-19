import { describe, it, expect } from 'vitest';

import {
  distanceMeters, ringAreaM2, formatArea, ringCenter, ringsBounds, closeRing, openRing,
  formatDistance, compassPoint,
} from './geo';

describe('distanceMeters', () => {
  it('measures one degree of latitude as ~111.2 km', () => {
    expect(distanceMeters([-61, -33], [-61, -34])).toBeCloseTo(111195, 0);
  });

  it('is zero for the same point', () => {
    expect(distanceMeters([-61, -33], [-61, -33])).toBe(0);
  });
});

describe('ringAreaM2', () => {
  it('matches width x height for a small square', () => {
    const ring = [[-61, -33], [-60.99, -33], [-60.99, -32.99], [-61, -32.99]];
    const width = distanceMeters(ring[0], ring[1]);
    const height = distanceMeters(ring[0], ring[3]);

    expect(ringAreaM2(ring) / (width * height)).toBeCloseTo(1, 2);
  });

  it('does not depend on the vertex order', () => {
    const ring = [[-61, -33], [-60.99, -33], [-60.99, -32.99]];

    expect(ringAreaM2([...ring].reverse())).toBeCloseTo(ringAreaM2(ring));
  });

  it('is zero with less than 3 vertices', () => {
    expect(ringAreaM2([[-61, -33], [-60, -33]])).toBe(0);
  });
});

describe('formatArea', () => {
  it.each([
    [500, '500 m²'],
    [5000, '0,5 ha'],
    [12345, '1,23 ha'],
    [150000, '15 ha'],
    [12345000, '1.235 ha'],
  ])('%i m² -> %s', (m2, text) => {
    expect(formatArea(m2)).toBe(text);
  });
});

describe('ring helpers', () => {
  const ring = [[-61, -33], [-60, -33], [-60, -32]];

  it('closes and opens rings', () => {
    expect(closeRing(ring)).toEqual([...ring, ring[0]]);
    expect(openRing([closeRing(ring)])).toEqual(ring);
  });

  it('computes the center of the bounding box', () => {
    expect(ringCenter(ring)).toEqual([-60.5, -32.5]);
  });

  it('computes the bounds of several rings, or null', () => {
    expect(ringsBounds([ring, [[-62, -34]]])).toEqual([[-62, -34], [-60, -32]]);
    expect(ringsBounds([])).toBeNull();
  });
});

describe('formatDistance', () => {
  it.each([
    [0, '0 m'],
    [850.4, '850 m'],
    [1000, '1 km'],
    [3240, '3,2 km'],
    [12345, '12,3 km'],
  ])('%f m -> %s', (meters, text) => {
    expect(formatDistance(meters)).toBe(text);
  });
});

describe('compassPoint', () => {
  it.each([
    [0, 'N'], [44, 'NE'], [90, 'E'], [200, 'S'], [270, 'O'], [338, 'N'], [359.9, 'N'],
  ])('%f° -> %s', (degrees, point) => {
    expect(compassPoint(degrees)).toBe(point);
  });
});
