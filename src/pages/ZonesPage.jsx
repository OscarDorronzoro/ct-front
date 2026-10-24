import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LandPlot } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Button, Fab } from '@/shared/ui/button';
import { EntityList } from '@/shared/ui/list';
import { Toolbar } from '@/shared/ui/toolbar';
import { SearchBox } from '@/shared/ui/search-box';
import { ActionError } from '@/shared/ui/alert';
import { ConfirmDialog } from '@/shared/ui/dialog';
import {
  ZoneRow, getAllZones, getZoneTypes, deleteZone, zonesToGeoJSON,
} from '@/entities/zone';
import { useCan } from '@/entities/viewer';
import ZonesOverviewMap from '@/components/zones/ZonesOverviewMap';

import { useEntityList, useListSearch } from '@/shared/lib/list';

import { logger } from '@/shared/lib/logger';
import styles from './ZonesPage.module.css';

const NEW_PATH = '/settings/zones/new';

const removeZone = (zone) => deleteZone(zone.id);
const searchFields = (zone) => [zone.name, zone.description];
const toSearchResult = (zone) => ({
  type: 'zone',
  id: zone.id,
  label: zone.name,
  description: zone.description || null,
});

export default function ZonesPage() {
  const navigate = useNavigate();
  const canWrite = useCan()('zones:write');
  const [zoneTypes, setZoneTypes] = useState([]);

  const list = useEntityList({ load: getAllZones, remove: removeZone });
  const { search, setSearch, results } = useListSearch(list.items, {
    fields: searchFields,
    toResult: toSearchResult,
  });

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
  const item = list.itemToDelete;

  return (
    <Page
      title="Zonas"
      hideHeaderOnMobile
      width="full"
      actions={canWrite && (
        <Button icon={Plus} to={NEW_PATH}>
          Agregar zona
        </Button>
      )}
    >
      <div className={styles.layout}>
        <div className={styles.map}>
          <ZonesOverviewMap zonesGeoJSON={zonesGeoJSON} onZoneClick={openZone} />
        </div>

        <div className={styles.list}>
          <ActionError
            error={list.actionError}
            onClose={list.clearActionError}
          />

          <Toolbar>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Buscar zona..."
              results={results}
              onSelect={openZone && ((result) => openZone(result.id))}
            />
          </Toolbar>

          <EntityList
            items={list.items}
            loading={list.loading}
            error={list.loadError}
            onRetry={list.reload}
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
          />
        </div>
      </div>

      {canWrite && <Fab icon={Plus} label="Agregar zona" to={NEW_PATH} />}

      <ConfirmDialog
        open={!!item}
        title="Eliminar zona"
        message={item ? `¿Está seguro de eliminar la zona "${item.name}"?` : ''}
        confirmLabel="Eliminar"
        danger
        onConfirm={list.confirmDelete}
        onCancel={list.cancelDelete}
      />
    </Page>
  );
}
