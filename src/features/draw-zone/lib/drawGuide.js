// Guide of the crosshair drawing (touch screens): the sides placed so far, the next side (from
// the last vertex to the crosshair) and the closing one (from the crosshair to the first
// vertex), with a circle on each vertex. On a mouse, terra-draw draws its own guide.

const SOURCE = 'draw-guide';

const EMPTY = { type: 'FeatureCollection', features: [] };

const line = (kind, coordinates) => ({
  type: 'Feature',
  properties: { kind },
  geometry: { type: 'LineString', coordinates },
});

const vertex = (coordinates, first) => ({
  type: 'Feature',
  properties: { kind: 'vertex', first },
  geometry: { type: 'Point', coordinates },
});

// points: [[lon, lat], ...] placed; center: [lon, lat] of the crosshair
export function guideGeoJSON(points, center) {
  if (points.length === 0) {
    return EMPTY;
  }

  const last = points[points.length - 1];
  const features = [
    line('next', [last, center]),
    ...points.map((p, i) => vertex(p, i === 0)),
  ];

  // With two vertices or more: the sides drawn and the closing one (the zone it would make)
  if (points.length > 1) {
    features.unshift(line('closing', [center, points[0]]), line('drawn', points));
  }

  return { type: 'FeatureCollection', features };
}

export function addGuideLayers(map, color) {
  map.addSource(SOURCE, { type: 'geojson', data: EMPTY });

  map.addLayer({
    id: 'draw-guide-closing',
    type: 'line',
    source: SOURCE,
    filter: ['==', ['get', 'kind'], 'closing'],
    paint: { 'line-color': '#ffffff', 'line-width': 2, 'line-opacity': 0.7, 'line-dasharray': [1, 2] },
  });

  map.addLayer({
    id: 'draw-guide-drawn',
    type: 'line',
    source: SOURCE,
    filter: ['==', ['get', 'kind'], 'drawn'],
    paint: { 'line-color': color, 'line-width': 3 },
  });

  map.addLayer({
    id: 'draw-guide-next',
    type: 'line',
    source: SOURCE,
    filter: ['==', ['get', 'kind'], 'next'],
    paint: { 'line-color': color, 'line-width': 3, 'line-dasharray': [2, 1.5] },
  });

  // The first vertex bigger: it's where the zone closes
  map.addLayer({
    id: 'draw-guide-vertices',
    type: 'circle',
    source: SOURCE,
    filter: ['==', ['get', 'kind'], 'vertex'],
    paint: {
      'circle-radius': ['case', ['get', 'first'], 8, 6],
      'circle-color': '#ffffff',
      'circle-stroke-color': color,
      'circle-stroke-width': 3,
    },
  });
}

export function setGuide(map, points, center) {
  map.getSource(SOURCE)?.setData(guideGeoJSON(points, center));
}

export function setGuideColor(map, color) {
  ['draw-guide-drawn', 'draw-guide-next'].forEach((id) => map.setPaintProperty(id, 'line-color', color));
  map.setPaintProperty('draw-guide-vertices', 'circle-stroke-color', color);
}
