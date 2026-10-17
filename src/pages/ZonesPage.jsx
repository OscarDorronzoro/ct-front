import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LandPlot } from 'lucide-react';

import Page from '../components/ui/Page';
import Button from '../components/ui/Button';
import Fab from '../components/ui/Fab';
import EntityList from '../components/ui/EntityList';
import Toolbar from '../components/utils/Toolbar';
import SearchBox from '../components/search/SearchBox';
import ActionError from '../components/utils/ActionError';
import ConfirmDialog from '../components/utils/ConfirmDialog';
import ZoneRow from '../components/zones/ZoneRow';
import ZonesOverviewMap from '../components/zones/ZonesOverviewMap';

import useEntityList from '../hooks/useEntityList';
import useListSearch from '../hooks/useListSearch';
import { getAllZones, getZoneTypes, deleteZone } from '../services/zone';
import { zonesToGeoJSON } from '../utils/zoneStyles';
import logger from '../utils/logger';
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

  const openZone = (id) => navigate(`/settings/zones/${id}`);
  const item = list.itemToDelete;

  return (
    <Page
      title="Zonas"
      hideHeaderOnMobile
      width="full"
      actions={
        <Button icon={Plus} to={NEW_PATH}>
          Agregar zona
        </Button>
      }
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
              onSelect={(result) => openZone(result.id)}
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
            emptyAction={<Button icon={Plus} size="sm" to={NEW_PATH}>Dibujar zona</Button>}
            renderItem={(zone) => (
              <ZoneRow
                key={zone.id}
                zone={zone}
                typeName={typeNames.get(zone.zoneTypeId)}
                onDelete={list.requestDelete}
              />
            )}
          />
        </div>
      </div>

      <Fab icon={Plus} label="Agregar zona" to={NEW_PATH} />

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
