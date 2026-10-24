import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Page } from '@/shared/ui/page';
import { Alert } from '@/shared/ui/alert';
import { Spinner } from '@/shared/ui/spinner';
import {
  FormField, SelectField, FormActions, formStyles,
} from '@/shared/ui/form';
import { ZoneDrawMap } from '@/features/draw-zone';
import {
  getZone, getAllZones, getZoneTypes, createZone, updateZone,
  zoneTypeStyle, zonesToGeoJSON, COLLAR_ZONE_MAX_VERTICES, COLLAR_ZONE_MAX_RADIUS_M,
} from '@/entities/zone';
import { distanceMeters, formatArea, ringAreaM2 } from '@/shared/lib/geo';
import { logger } from '@/shared/lib/logger';
import { useEntityForm } from '@/shared/lib/form';
import styles from './ZoneFormPage.module.css';

// ring: [[lon, lat], ...] drawn on the map (null until it's closed)
const emptyForm = {
  name: '',
  zoneTypeId: null,
  description: '',
  ring: null,
};

const messages = { load: 'No se pudo cargar la zona.', save: 'No se pudo guardar la zona.' };

const toForm = (zone) => ({
  name: zone.name,
  zoneTypeId: zone.zoneTypeId,
  description: zone.description ?? '',
  ring: zone.ring,
});

function validate(form) {
  if (!form.ring) {
    return 'Dibujá la zona en el mapa y cerrala tocando el primer vértice.';
  }
  return form.zoneTypeId ? null : 'Elegí el tipo de zona.';
}

// Reasons why the zone can't be loaded into a collar (still valid as a zone)
function collarLimits(ring) {
  if (!ring) {
    return [];
  }

  const reasons = [];

  if (ring.length > COLLAR_ZONE_MAX_VERTICES) {
    reasons.push(`tiene ${ring.length} vértices (máximo ${COLLAR_ZONE_MAX_VERTICES})`);
  }

  if (ring.some((point) => distanceMeters(ring[0], point) > COLLAR_ZONE_MAX_RADIUS_M)) {
    reasons.push(`se extiende más de ${COLLAR_ZONE_MAX_RADIUS_M / 1000} km desde el primer vértice`);
  }

  return reasons;
}

export default function ZoneFormPage() {
  const { zoneId } = useParams();
  const navigate = useNavigate();

  const [zoneTypes, setZoneTypes] = useState([]);
  const [otherZones, setOtherZones] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const {
    form, setForm, handleChange, handleSubmit, entity, loading: loadingZone, saving, error, clearError,
  } = useEntityForm({
    id: zoneId,
    empty: emptyForm,
    load: getZone,
    toForm,
    validate,
    save: (values) => (zoneId ? updateZone(zoneId, values) : createZone(values)),
    onSaved: () => navigate('/settings/zones'),
    messages,
  });

  // The types, and the other zones to draw next to them
  useEffect(() => {
    let cancelled = false;

    Promise.all([getZoneTypes(), getAllZones()])
      .then(([types, zones]) => {
        if (!cancelled) {
          setZoneTypes(types);
          setOtherZones(zones.filter((z) => String(z.id) !== String(zoneId)));
        }
      })
      .catch((err) => logger.error('Error loading zone types', err))
      .finally(() => {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      });

    return () => { cancelled = true; };
  }, [zoneId]);

  // The map starts with the zone and fits the view to it: it waits for everything
  const loading = loadingZone || loadingOptions;
  const { ring } = form;
  const setRing = (drawn) => setForm((current) => ({ ...current, ring: drawn }));

  const typeName = zoneTypes.find((t) => t.id === form.zoneTypeId)?.name;
  const { color } = zoneTypeStyle(typeName);

  const typeOptions = useMemo(
    () => zoneTypes.map((t) => ({ value: t.id, label: zoneTypeStyle(t.name).label })),
    [zoneTypes],
  );

  const contextZones = useMemo(
    () => zonesToGeoJSON(otherZones, zoneTypes),
    [otherZones, zoneTypes],
  );

  const limits = collarLimits(ring);

  return (
    <Page
      title={zoneId ? 'Editar zona' : 'Nueva zona'}
      backTo="/settings/zones"
      width="full"
      flush
    >
      <div className={styles.layout}>
        <div className={styles.map}>
          {loading ? (
            <div className={styles.loading}><Spinner size={32} /></div>
          ) : (
            <ZoneDrawMap
              initialRing={entity?.ring ?? null}
              color={color}
              contextZones={contextZones}
              onChange={setRing}
            />
          )}
        </div>

        <form className={`${styles.panel} ${formStyles.form}`} onSubmit={handleSubmit}>
          {error && <Alert tone="danger" onClose={clearError}>{error}</Alert>}

          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Superficie</div>
              <div className={styles.statValue}>{ring ? formatArea(ringAreaM2(ring)) : '—'}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Vértices</div>
              <div className={styles.statValue}>{ring ? ring.length : '—'}</div>
            </div>
          </div>

          {limits.length > 0 && (
            <Alert tone="warning">
              Se puede guardar, pero no se podrá cargar en un collar: {limits.join(' y ')}.
            </Alert>
          )}

          <FormField
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej. Potrero norte"
            required
          />

          <SelectField
            label="Tipo"
            name="zoneTypeId"
            value={form.zoneTypeId}
            onChange={handleChange}
            options={typeOptions}
            placeholder="Seleccione un tipo"
            loading={loading}
            required
          />

          <FormField
            label="Descripción"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Opcional"
          />

          <FormActions
            onCancel={() => navigate('/settings/zones')}
            saving={saving}
          />
        </form>
      </div>
    </Page>
  );
}
