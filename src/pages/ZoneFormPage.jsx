import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Page } from '@/shared/ui/page';
import { Alert } from '@/shared/ui/alert';
import { Spinner } from '@/shared/ui/spinner';
import {
  FormField, SelectField, FormActions, formStyles,
} from '@/shared/ui/form';
import ZoneDrawMap from '@/components/zones/ZoneDrawMap';

import {
  getZone, getAllZones, getZoneTypes, createZone, updateZone, zoneTypeStyle, zonesToGeoJSON, COLLAR_ZONE_MAX_VERTICES, COLLAR_ZONE_MAX_RADIUS_M,
} from '@/entities/zone';
import { distanceMeters, formatArea, ringAreaM2 } from '@/shared/lib/geo';
import { logger } from '@/shared/lib/logger';
import styles from './ZoneFormPage.module.css';

const emptyForm = {
  name: '',
  zoneTypeId: null,
  description: '',
};

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

  const [form, setForm] = useState(emptyForm);
  const [ring, setRing] = useState(null);
  const [initialRing, setInitialRing] = useState(null);
  const [zoneTypes, setZoneTypes] = useState([]);
  const [otherZones, setOtherZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getZoneTypes(),
      getAllZones(),
      zoneId ? getZone(zoneId) : null,
    ])
      .then(([types, zones, zone]) => {
        if (cancelled) {
          return;
        }

        setZoneTypes(types);
        setOtherZones(zones.filter((z) => String(z.id) !== String(zoneId)));

        if (zone) {
          setForm({
            name: zone.name,
            zoneTypeId: zone.zoneTypeId,
            description: zone.description ?? '',
          });
          setInitialRing(zone.ring);
          setRing(zone.ring);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          logger.error('Error loading zone', err);
          setError('No se pudo cargar la zona.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [zoneId]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    if (!ring) {
      setError('Dibujá la zona en el mapa y cerrala tocando el primer vértice.');
      return;
    }

    if (!form.zoneTypeId) {
      setError('Elegí el tipo de zona.');
      return;
    }

    setError(null);

    try {
      setSaving(true);

      const data = { ...form, ring };

      if (zoneId) {
        await updateZone(zoneId, data);
      } else {
        await createZone(data);
      }

      navigate('/settings/zones');
    } catch (err) {
      logger.error('Error saving zone', err);

      setError(
        err?.name === 'ApiError'
          ? err.data?.message ?? err.message
          : 'No se pudo guardar la zona.'
      );
    } finally {
      setSaving(false);
    }
  };

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
              initialRing={initialRing}
              color={color}
              contextZones={contextZones}
              onChange={setRing}
            />
          )}
        </div>

        <form className={`${styles.panel} ${formStyles.form}`} onSubmit={handleSubmit}>
          {error && <Alert tone="danger" onClose={() => setError(null)}>{error}</Alert>}

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
