import { closeRing } from '@/shared/lib/geo';

// Colors by zone type name (zone_types). Bright enough over satellite imagery.
const TYPE_STYLES = {
  general: { color: '#3b82f6', label: 'General' },
  potrero: { color: '#22c55e', label: 'Potrero' },
  corral: { color: '#d97706', label: 'Corral' },
  tambo: { color: '#a855f7', label: 'Tambo' },
  aguada: { color: '#06b6d4', label: 'Aguada' },
  exclusion: { color: '#ef4444', label: 'Exclusión' },
  manga: { color: '#ec4899', label: 'Manga' },
};

const DEFAULT_STYLE = { color: '#94a3b8', label: 'Zona' };

export function zoneTypeStyle(typeName) {
  return TYPE_STYLES[typeName] ?? { ...DEFAULT_STYLE, label: typeName ?? DEFAULT_STYLE.label };
}

// Limits of a zone loaded into a collar (see backend commandService)
export const COLLAR_ZONE_MAX_VERTICES = 16;
export const COLLAR_ZONE_MAX_RADIUS_M = 36000;

// zones with `ring` -> FeatureCollection for the map layers
export function zonesToGeoJSON(zones, zoneTypes, selectedId = null) {
  const typeNames = new Map(zoneTypes.map((t) => [t.id, t.name]));

  return {
    type: 'FeatureCollection',
    features: zones.map((zone) => ({
      type: 'Feature',
      id: zone.id,
      geometry: {
        type: 'Polygon',
        coordinates: [closeRing(zone.ring)],
      },
      properties: {
        id: zone.id,
        name: zone.name,
        color: zoneTypeStyle(typeNames.get(zone.zoneTypeId)).color,
        exclusion: typeNames.get(zone.zoneTypeId) === 'exclusion',
        selected: zone.id === selectedId,
      },
    })),
  };
}
