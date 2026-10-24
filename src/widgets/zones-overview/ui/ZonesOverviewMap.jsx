import { useEffect, useRef } from 'react';
import { BaseMap, useBaseMap } from '@/shared/ui/map';
import {
  addZoneLayers, setZoneData, createZoneLabels, fitToZones, onZoneClick,
} from '@/entities/zone';

// All zones, read only. onZoneClick(id) when a zone is tapped.
export default function ZonesOverviewMap({ zonesGeoJSON, onZoneClick: handleZoneClick }) {
  const labelsRef = useRef(null);
  const fittedRef = useRef(false);
  const onZoneClickRef = useRef(handleZoneClick);

  useEffect(() => {
    onZoneClickRef.current = handleZoneClick;
  });

  const { mapRef, ready, handleLoad } = useBaseMap((map) => {
    addZoneLayers(map);
    labelsRef.current = createZoneLabels(map);
    onZoneClick(map, (id) => onZoneClickRef.current?.(id));
  });

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !zonesGeoJSON) {
      return;
    }

    setZoneData(map, zonesGeoJSON);
    labelsRef.current.update(zonesGeoJSON);

    // Fit once, when the zones arrive
    if (!fittedRef.current && zonesGeoJSON.features.length > 0) {
      fittedRef.current = true;
      fitToZones(map, zonesGeoJSON);
    }
  }, [ready, zonesGeoJSON, mapRef]);

  useEffect(() => () => labelsRef.current?.remove(), []);

  return <BaseMap onLoad={handleLoad} />;
}
