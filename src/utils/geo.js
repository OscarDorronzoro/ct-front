// Geometry helpers over GeoJSON coordinates ([lon, lat])

const EARTH_RADIUS_M = 6371008.8;

const toRad = (deg) => (deg * Math.PI) / 180;

export function distanceMeters([lon1, lat1], [lon2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Area of a ring on the sphere (same method as turf/area)
export function ringAreaM2(ring) {
  const n = ring.length;

  if (n < 3) {
    return 0;
  }

  let total = 0;

  for (let i = 0; i < n; i++) {
    const [lon1] = ring[(i + n - 1) % n];
    const [, lat2] = ring[i];
    const [lon3] = ring[(i + 1) % n];

    total += (toRad(lon3) - toRad(lon1)) * Math.sin(toRad(lat2));
  }

  return Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

export function formatArea(m2) {
  const hectares = m2 / 10000;

  if (hectares >= 10) {
    return `${Math.round(hectares).toLocaleString('es-AR')} ha`;
  }

  if (hectares >= 0.1) {
    return `${hectares.toLocaleString('es-AR', { maximumFractionDigits: 2 })} ha`;
  }

  return `${Math.round(m2).toLocaleString('es-AR')} m²`;
}

// Center of the ring's bounding box: good enough to place a label
export function ringCenter(ring) {
  const lons = ring.map(([lon]) => lon);
  const lats = ring.map(([, lat]) => lat);

  return [
    (Math.min(...lons) + Math.max(...lons)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2,
  ];
}

// [[west, south], [east, north]] of several rings, or null
export function ringsBounds(rings) {
  const coords = rings.flat();

  if (coords.length === 0) {
    return null;
  }

  const lons = coords.map(([lon]) => lon);
  const lats = coords.map(([, lat]) => lat);

  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ];
}

export function closeRing(ring) {
  return [...ring, ring[0]];
}

// Ring of a GeoJSON polygon without the closing vertex
export function openRing(polygonCoordinates) {
  return polygonCoordinates[0].slice(0, -1);
}
