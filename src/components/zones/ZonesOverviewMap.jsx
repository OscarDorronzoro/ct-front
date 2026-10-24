import { useEffect, useRef, useState } from 'react';
import { BaseMap } from '@/shared/ui/map';
import {
  addZoneLayers, setZoneData, createZoneLabels, ZONE_FILL_LAYER,
} from '@/entities/zone';
import { openRing, ringsBounds } from '@/shared/lib/geo';
import { getSavedMapConfig } from '@/shared/lib/map-config';

// All zones, read only. onZoneClick(id) when a zone is tapped.
export default function ZonesOverviewMap({ zonesGeoJSON, onZoneClick }) {
  const mapRef = useRef(null);
  const labelsRef = useRef(null);
  const fittedRef = useRef(false);
  const onZoneClickRef = useRef(onZoneClick);
  const [mapReady, setMapReady] = useState(false);
  const [mapConfig] = useState(getSavedMapConfig);

  useEffect(() => {
    onZoneClickRef.current = onZoneClick;
  });

  const handleLoad = (map) => {
    mapRef.current = map;
    addZoneLayers(map);
    labelsRef.current = createZoneLabels(map);

    map.on('click', ZONE_FILL_LAYER, (e) => {
      onZoneClickRef.current?.(e.features[0].properties.id);
    });
    map.on('mouseenter', ZONE_FILL_LAYER, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', ZONE_FILL_LAYER, () => {
      map.getCanvas().style.cursor = '';
    });

    setMapReady(true);
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !zonesGeoJSON) {
      return;
    }

    setZoneData(map, zonesGeoJSON);
    labelsRef.current.update(zonesGeoJSON);

    // Fit once, when the zones arrive
    if (!fittedRef.current && zonesGeoJSON.features.length > 0) {
      fittedRef.current = true;
      const bounds = ringsBounds(zonesGeoJSON.features.map((f) => openRing(f.geometry.coordinates)));
      map.fitBounds(bounds, { padding: 40, duration: 0, maxZoom: 16 });
    }
  }, [mapReady, zonesGeoJSON]);

  useEffect(() => () => labelsRef.current?.remove(), []);

  return <BaseMap configs={mapConfig} onLoad={handleLoad} />;
}
