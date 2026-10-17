import { FRESHNESS } from '../../utils/mapPoints';

// Map layers for positions. Sources: 'points' (both modes) and 'tracks' (history).
// Point features carry: id, collarId, cowId, color, opacity, ageMinutes, isLast, selected, weight.

export const POINTS_SOURCE = 'points';
export const TRACKS_SOURCE = 'tracks';
export const POINTS_LAYER = 'points-layer';
export const HITBOX_LAYER = 'points-hitbox-layer';
export const HALO_LAYER = 'points-halo-layer';
const HEAT_LAYER = 'points-heat-layer';
const TRACK_LAYERS = ['tracks-casing', 'tracks-line', 'tracks-gap'];

// Heatmap view: points appear (fading in) from this zoom, when there is room to tell them apart
const HEAT_POINTS_ZOOM = 16;

const SELECTED = ['get', 'selected'];
const LAST = ['get', 'isLast'];

// History: the last position of each cow and the selected one are opaque, the rest fade with age
const HISTORY_OPACITY = ['case', ['any', SELECTED, LAST], 1, ['get', 'opacity']];

const LIVE_PAINT = {
  'circle-radius': [
    'interpolate', ['linear'], ['zoom'],
    12, ['case', SELECTED, 9, 6],
    18, ['case', SELECTED, 12, 9],
  ],
  'circle-color': [
    'step', ['get', 'ageMinutes'],
    FRESHNESS.colors.recent,
    FRESHNESS.recentMinutes, FRESHNESS.colors.late,
    FRESHNESS.staleMinutes, FRESHNESS.colors.stale,
  ],
  'circle-stroke-width': ['case', SELECTED, 3, 2.5],
  'circle-stroke-color': ['case', SELECTED, '#0f172a', '#ffffff'],
};

const HISTORY_PAINT = {
  'circle-radius': [
    'interpolate', ['linear'], ['zoom'],
    12, ['case', SELECTED, 7, LAST, 5, 2],
    16, ['case', SELECTED, 9, LAST, 7, 3.5],
    19, ['case', SELECTED, 11, LAST, 9, 6],
  ],
  'circle-color': ['get', 'color'],
  'circle-opacity': HISTORY_OPACITY,
  'circle-stroke-color': ['case', SELECTED, '#0f172a', '#ffffff'],
  'circle-stroke-width': ['case', SELECTED, 3, LAST, 2.5, 1],
  'circle-stroke-opacity': HISTORY_OPACITY,
};

// Heatmap view: points hidden when zoomed out (the selected one stays)
const HEAT_POINTS_OPACITY = [
  'interpolate', ['linear'], ['zoom'],
  HEAT_POINTS_ZOOM, ['case', SELECTED, 1, 0],
  HEAT_POINTS_ZOOM + 2, HISTORY_OPACITY,
];

const EMPTY = { type: 'FeatureCollection', features: [] };

export function addPositionLayers(map, { mode, isMobile }) {
  const history = mode === 'history';

  map.addSource(POINTS_SOURCE, { type: 'geojson', data: EMPTY });

  if (history) {
    map.addSource(TRACKS_SOURCE, { type: 'geojson', data: EMPTY });

    // Time spent at each place: weight = minutes until the next position (see heatWeights)
    map.addLayer({
      id: HEAT_LAYER,
      type: 'heatmap',
      source: POINTS_SOURCE,
      layout: { visibility: 'none' },
      paint: {
        'heatmap-weight': ['get', 'weight'],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 0.6, 18, 2],
        // Roughly 50 m on the ground at field zooms; larger when zoomed out so it stays visible
        'heatmap-radius': [
          'interpolate', ['exponential', 2], ['zoom'],
          10, 2, 14, 10, 16, 28, 18, 90, 20, 300,
        ],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0, 0, 0, 0)',
          0.15, 'rgba(59, 130, 246, 0.55)',
          0.35, '#22d3ee',
          0.55, '#facc15',
          0.75, '#f97316',
          1, '#dc2626',
        ],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 16, 0.85, 19, 0.4],
      },
    });

    const lineLayout = { 'line-join': 'round', 'line-cap': 'round' };

    // Dark casing so tracks read on any background
    map.addLayer({
      id: 'tracks-casing',
      type: 'line',
      source: TRACKS_SOURCE,
      filter: ['!', ['get', 'gap']],
      layout: lineLayout,
      paint: {
        'line-color': 'rgba(15, 23, 42, 0.45)',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2.5, 18, 6],
      },
    });

    map.addLayer({
      id: 'tracks-line',
      type: 'line',
      source: TRACKS_SOURCE,
      filter: ['!', ['get', 'gap']],
      layout: lineLayout,
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1.2, 18, 3.5],
        'line-opacity': 0.9,
      },
    });

    // Long gap between positions: the path in between is unknown
    map.addLayer({
      id: 'tracks-gap',
      type: 'line',
      source: TRACKS_SOURCE,
      filter: ['get', 'gap'],
      layout: lineLayout,
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1.5,
        'line-opacity': 0.7,
        'line-dasharray': [2, 2],
      },
    });
  }

  // Invisible, larger target for touch screens
  map.addLayer({
    id: HITBOX_LAYER,
    type: 'circle',
    source: POINTS_SOURCE,
    paint: {
      'circle-radius': isMobile ? 20 : 10,
      'circle-opacity': 0,
    },
  });

  if (!history) {
    // Pulse on collars that transmitted recently (animated from MapView)
    map.addLayer({
      id: HALO_LAYER,
      type: 'circle',
      source: POINTS_SOURCE,
      filter: ['<', ['get', 'ageMinutes'], FRESHNESS.recentMinutes],
      paint: {
        'circle-color': FRESHNESS.colors.recent,
        'circle-radius': 10,
        'circle-opacity': 0,
      },
    });
  }

  map.addLayer({
    id: POINTS_LAYER,
    type: 'circle',
    source: POINTS_SOURCE,
    // On top: selected, then the last position of each cow, then by time (feature order)
    layout: { 'circle-sort-key': ['case', SELECTED, 2, LAST, 1, 0] },
    paint: history ? HISTORY_PAINT : LIVE_PAINT,
  });
}

// History: tracks or heatmap
export function setHeatView(map, heat) {
  map.setLayoutProperty(HEAT_LAYER, 'visibility', heat ? 'visible' : 'none');
  TRACK_LAYERS.forEach((id) => map.setLayoutProperty(id, 'visibility', heat ? 'none' : 'visible'));

  const opacity = heat ? HEAT_POINTS_OPACITY : HISTORY_OPACITY;
  map.setPaintProperty(POINTS_LAYER, 'circle-opacity', opacity);
  map.setPaintProperty(POINTS_LAYER, 'circle-stroke-opacity', opacity);

  // Hidden points shouldn't be clickable
  map.setLayerZoomRange(HITBOX_LAYER, heat ? HEAT_POINTS_ZOOM : 0, 24);
}
