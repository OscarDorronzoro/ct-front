import { apiClient } from '@/shared/api';

const endpoint = '/zones';

// The API uses [lat, lon] (like the gateway); the frontend works with GeoJSON [lon, lat]
const toRing = (points) => points.map(([lat, lon]) => [lon, lat]);
const toPoints = (ring) => ring.map(([lon, lat]) => [lat, lon]);

// Zone with `ring`: [[lon, lat], ...] without repeating the first vertex
function fromApi(zone) {
  const { points, ...rest } = zone;
  return { ...rest, ring: toRing(points) };
}

function toApi(zone) {
  const { ring, ...rest } = zone;
  return ring ? { ...rest, points: toPoints(ring) } : rest;
}

export async function getAllZones() {
  const zones = await apiClient(endpoint);
  return zones.map(fromApi);
}

export async function getZone(zoneId) {
  return fromApi(await apiClient(`${endpoint}/${zoneId}`));
}

export function getZoneTypes() {
  return apiClient(`${endpoint}/types`);
}

export async function createZone(zone) {
  const { zone: created } = await apiClient(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toApi(zone)),
  });

  return fromApi(created);
}

export async function updateZone(id, zone) {
  const { zone: updated } = await apiClient(`${endpoint}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toApi(zone)),
  });

  return fromApi(updated);
}

export function deleteZone(zoneId) {
  return apiClient(`${endpoint}/${zoneId}`, {
    method: 'DELETE',
  });
}
