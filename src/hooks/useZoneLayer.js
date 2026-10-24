import { useEffect, useMemo, useState } from 'react';
import { getAllZones, getZoneTypes } from '@/services/zone';
import { zonesToGeoJSON } from '@/utils/zoneStyles';
import { logger } from '@/shared/lib/logger';

const VISIBLE_KEY = 'mapZonesVisible';

// Hidden by default; the user's choice is remembered
function readVisible() {
  try {
    return localStorage.getItem(VISIBLE_KEY) === 'true';
  } catch {
    return false;
  }
}

// Zones for the live/history map: data, GeoJSON and a persisted visibility toggle
export default function useZoneLayer() {
  const [zones, setZones] = useState([]);
  const [zoneTypes, setZoneTypes] = useState([]);
  const [visible, setVisible] = useState(readVisible);

  useEffect(() => {
    Promise.all([getAllZones(), getZoneTypes()])
      .then(([zoneList, types]) => {
        setZones(zoneList);
        setZoneTypes(types);
      })
      .catch((err) => logger.error('Error loading zones', err));
  }, []);

  const toggleVisible = () => {
    setVisible((current) => {
      try {
        localStorage.setItem(VISIBLE_KEY, String(!current));
      } catch {
        // Private mode: keep it in memory only
      }
      return !current;
    });
  };

  const geojson = useMemo(() => zonesToGeoJSON(zones, zoneTypes), [zones, zoneTypes]);
  const zonesById = useMemo(() => new Map(zones.map((z) => [z.id, z])), [zones]);
  const typeNames = useMemo(() => new Map(zoneTypes.map((t) => [t.id, t.name])), [zoneTypes]);

  return {
    geojson, zonesById, typeNames, visible, toggleVisible,
  };
}
