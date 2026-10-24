import maplibregl from 'maplibre-gl';
import { ringCenter, openRing } from '@/shared/lib/geo';
import styles from './ZoneLabel.module.css';

const SOURCE = 'zones';
export const ZONE_FILL_LAYER = 'zones-fill';
const LINE_LAYER = 'zones-line';
const EXCLUSION_LINE_LAYER = 'zones-line-exclusion';
const LAYERS = [ZONE_FILL_LAYER, LINE_LAYER, EXCLUSION_LINE_LAYER];

const EMPTY = { type: 'FeatureCollection', features: [] };

// Zones as fill + outline (dashed for exclusion), below `beforeId`.
// options.muted: as context while editing another zone.
export function addZoneLayers(map, { beforeId, muted = false } = {}) {
  map.addSource(SOURCE, { type: 'geojson', data: EMPTY });

  map.addLayer({
    id: ZONE_FILL_LAYER,
    type: 'fill',
    source: SOURCE,
    paint: {
      'fill-color': ['get', 'color'],
      'fill-opacity': muted ? 0.08 : ['case', ['get', 'selected'], 0.35, 0.18],
    },
  }, beforeId);

  map.addLayer({
    id: LINE_LAYER,
    type: 'line',
    source: SOURCE,
    filter: ['!', ['get', 'exclusion']],
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['case', ['get', 'selected'], 3.5, 2],
      'line-opacity': muted ? 0.5 : 0.95,
    },
  }, beforeId);

  map.addLayer({
    id: EXCLUSION_LINE_LAYER,
    type: 'line',
    source: SOURCE,
    filter: ['get', 'exclusion'],
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['case', ['get', 'selected'], 3.5, 2],
      'line-opacity': muted ? 0.5 : 0.95,
      'line-dasharray': [2, 1.5],
    },
  }, beforeId);
}

export function setZoneData(map, geojson) {
  map.getSource(SOURCE)?.setData(geojson);
}

export function setZonesVisible(map, visible) {
  LAYERS.forEach((id) => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
    }
  });
}

// Zone names as HTML markers (the map style has no glyphs for symbol layers)
export function createZoneLabels(map) {
  let markers = [];

  return {
    update(geojson, visible = true) {
      markers.forEach((marker) => marker.remove());

      markers = visible
        ? geojson.features.map((feature) => {
          const element = document.createElement('div');
          element.className = styles.label;
          element.textContent = feature.properties.name;
          element.style.setProperty('--zone-color', feature.properties.color);

          return new maplibregl.Marker({ element })
            .setLngLat(ringCenter(openRing(feature.geometry.coordinates)))
            .addTo(map);
        })
        : [];
    },

    remove() {
      markers.forEach((marker) => marker.remove());
      markers = [];
    },
  };
}
