import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
const BASE_ESRI_URL = import.meta.env.VITE_MAP_TILES_URL || 'https://services.arcgisonline.com';

// Satellite base map. `configs` (center, zoom) is only read on creation.
// onLoad(map) runs once the style is loaded; the map is removed on unmount.
export default function BaseMap({ configs, onLoad }) {
  const mapContainer = useRef(null);
  const onLoadRef = useRef(onLoad);

  useEffect(() => {
    onLoadRef.current = onLoad;
  });

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          esri: {
            type: 'raster',
            tiles: [
              `${BASE_ESRI_URL}/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
            ],
            tileSize: 256,
            maxzoom: 18,
          },
        },
        layers: [
          {
            id: 'esri-layer',
            type: 'raster',
            source: 'esri',
            paint: {
              'raster-resampling': 'linear'
            }
          },
        ],
      },
      center: configs.center,
      zoom: configs.zoom,
      maxZoom: 23, // Zoom mapa
      attributionControl: false,
    });

    map.on('load', () => {
      onLoadRef.current?.(map);
    });

    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
