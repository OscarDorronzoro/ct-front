import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LandPlot } from 'lucide-react';
import { EntityListPage } from '@/shared/ui/entity-list-page';
import { Button } from '@/shared/ui/button';
import { useEntityList } from '@/shared/lib/list';
import { logger } from '@/shared/lib/logger';
import {
  ZoneRow, getAllZones, getZoneTypes, deleteZone, zonesToGeoJSON,
} from '@/entities/zone';
import { useCan } from '@/entities/viewer';
import { ZonesOverviewMap } from '@/widgets/zones-overview';

const NEW_PATH = '/settings/zones/new';

const removeZone = (zone) => deleteZone(zone.id);
const searchFields = (zone) => [zone.name, zone.description];
const toSearchResult = (zone) => ({
  type: 'zone',
  id: zone.id,
  label: zone.name,
  description: zone.description || null,
});

// The list with a map of all the zones
export default function ZonesPage() {
  const navigate = useNavigate();
  const canWrite = useCan()('zones:write');
  const [zoneTypes, setZoneTypes] = useState([]);

  const list = useEntityList({ load: getAllZones, remove: removeZone });

  useEffect(() => {
    getZoneTypes()
      .then(setZoneTypes)
      .catch((err) => logger.error('Error loading zone types', err));
  }, []);

  const typeNames = useMemo(
    () => new Map(zoneTypes.map((t) => [t.id, t.name])),
    [zoneTypes],
  );

  const zonesGeoJSON = useMemo(
    () => zonesToGeoJSON(list.items, zoneTypes),
    [list.items, zoneTypes],
  );

  const openZone = canWrite ? (id) => navigate(`/settings/zones/${id}`) : undefined;

  return (
    <EntityListPage
      title="Zonas"
      addLabel="Agregar zona"
      newPath={canWrite ? NEW_PATH : null}
      list={list}
      aside={<ZonesOverviewMap zonesGeoJSON={zonesGeoJSON} onZoneClick={openZone} />}
      search={{
        placeholder: 'Buscar zona...',
        fields: searchFields,
        toResult: toSearchResult,
        onSelect: openZone && ((result) => openZone(result.id)),
      }}
      labels={{
        error: 'No se pudieron cargar las zonas.',
        empty: 'Todavía no hay zonas',
        emptyMessage: 'Dibujá los potreros, corrales y aguadas del campo para seguir dónde está cada vaca.',
      }}
      emptyIcon={LandPlot}
      emptyAction={canWrite && <Button icon={Plus} size="sm" to={NEW_PATH}>Dibujar zona</Button>}
      renderItem={(zone) => (
        <ZoneRow
          key={zone.id}
          zone={zone}
          typeName={typeNames.get(zone.zoneTypeId)}
          editable={canWrite}
          onDelete={canWrite ? list.requestDelete : undefined}
        />
      )}
      deleteDialog={{
        title: 'Eliminar zona',
        message: (zone) => `¿Está seguro de eliminar la zona "${zone.name}"?`,
      }}
    />
  );
}
