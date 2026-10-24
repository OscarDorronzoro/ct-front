import { describe, it, expect } from 'vitest';
import { guideGeoJSON } from './drawGuide';

const kinds = (geojson) => geojson.features.map((f) => f.properties.kind);

describe('guideGeoJSON', () => {
  const center = [5, 5];

  it('shows nothing before the first vertex', () => {
    expect(guideGeoJSON([], center).features).toEqual([]);
  });

  it('shows the next side from the only vertex to the crosshair', () => {
    const geojson = guideGeoJSON([[0, 0]], center);

    expect(kinds(geojson)).toEqual(['next', 'vertex']);
    expect(geojson.features[0].geometry.coordinates).toEqual([[0, 0], center]);
  });

  it('shows the sides drawn, the next one and the closing one, with every vertex', () => {
    const geojson = guideGeoJSON([[0, 0], [0, 10], [10, 10]], center);

    expect(kinds(geojson)).toEqual(['closing', 'drawn', 'next', 'vertex', 'vertex', 'vertex']);
    expect(geojson.features[0].geometry.coordinates).toEqual([center, [0, 0]]);
    expect(geojson.features.filter((f) => f.properties.first)).toHaveLength(1);
  });
});
