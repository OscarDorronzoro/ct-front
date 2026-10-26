import { describe, it, expect } from 'vitest';
import { ZoneSchema, zoneToApi } from './zone';

// The API works in [lat, lon] (like the gateway); the map, in GeoJSON [lon, lat]
const apiZone = {
  id: 2,
  zoneTypeId: 1,
  name: 'Campo',
  description: null,
  points: [[-32.97, -61.21], [-32.97, -61.2], [-32.96, -61.2]] as [number, number][],
};

describe('ZoneSchema', () => {
  it('turns the points of the API into a ring for the map', () => {
    const zone = ZoneSchema.parse(apiZone);

    expect(zone.ring).toEqual([[-61.21, -32.97], [-61.2, -32.97], [-61.2, -32.96]]);
    expect(zone).not.toHaveProperty('points');
  });
});

describe('zoneToApi', () => {
  it('sends the ring of the map back as points of the API', () => {
    const { ring, ...zone } = ZoneSchema.parse(apiZone);

    expect(zoneToApi({ ...zone, ring })).toEqual({ ...zone, points: apiZone.points });
  });

  it('sends no points when the ring did not change', () => {
    expect(zoneToApi({ name: 'Campo norte' })).toEqual({ name: 'Campo norte' });
  });
});
