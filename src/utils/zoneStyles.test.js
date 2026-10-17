import { describe, it, expect } from 'vitest';

import { zoneTypeStyle, zonesToGeoJSON } from './zoneStyles';

describe('zoneTypeStyle', () => {
  it('returns the style of a known type', () => {
    expect(zoneTypeStyle('aguada')).toEqual({ color: '#06b6d4', label: 'Aguada' });
  });

  it('falls back to a neutral color, keeping the type name', () => {
    expect(zoneTypeStyle('manga')).toMatchObject({ label: 'manga' });
    expect(zoneTypeStyle(undefined)).toMatchObject({ label: 'Zona' });
  });
});

describe('zonesToGeoJSON', () => {
  const types = [{ id: 1, name: 'potrero' }, { id: 2, name: 'exclusion' }];
  const ring = [[-61, -33], [-60, -33], [-60, -32]];
  const zones = [
    { id: 10, name: 'Lote 1', zoneTypeId: 1, ring },
    { id: 11, name: 'Laguna', zoneTypeId: 2, ring },
  ];

  it('closes each ring and styles it by type', () => {
    const [lote, laguna] = zonesToGeoJSON(zones, types, 11).features;

    expect(lote.geometry.coordinates).toEqual([[...ring, ring[0]]]);
    expect(lote.properties).toMatchObject({ name: 'Lote 1', color: '#22c55e', exclusion: false, selected: false });
    expect(laguna.properties).toMatchObject({ exclusion: true, selected: true });
  });
});
