import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Pencil, Plus, ClipboardList } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { EntityList, ErrorState } from '@/shared/ui/list';
import { ActionError } from '@/shared/ui/alert';
import { CowIcon } from '@/shared/ui/icons';
import HealthSummary from '@/components/health/HealthSummary';
import HealthEventItem from '@/components/health/HealthEventItem';
import VoidEventDialog from '@/components/health/VoidEventDialog';

import useCan from '@/hooks/useCan';
import useCowHealth from '@/hooks/useCowHealth';
import { getCow } from '@/services/cow';
import { voidEvent } from '@/services/health';
import { cowLabel, collarLabel, SEX_LABELS } from '@/utils/labels';
import {
  EVENT_TYPES, CATEGORY_SOURCES, formatDay, formatAge,
} from '@/utils/health';
import { logger } from '@/shared/lib/logger';
import styles from './CowDetailPage.module.css';

// Card of a cow: its data and, for who can read it, its clinical history
export default function CowDetailPage() {
  const { cowId } = useParams();
  const can = useCan();
  const canReadHealth = can('health:read');
  const canWriteHealth = can('health:write');

  const [cow, setCow] = useState(null);
  const [cowError, setCowError] = useState(null);
  const {
    health, error: healthError, reload: loadHealth,
  } = useCowHealth(cowId, canReadHealth);
  const [typeFilter, setTypeFilter] = useState(null);
  const [eventToVoid, setEventToVoid] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getCow(cowId)
      .then((data) => {
        if (!cancelled) {
          setCow(data);
        }
      })
      .catch((err) => {
        logger.error('Error loading cow', err);
        if (!cancelled) {
          setCowError(err);
        }
      });

    return () => { cancelled = true; };
  }, [cowId]);

  const confirmVoid = async (event, reason) => {
    setEventToVoid(null);

    try {
      await voidEvent(event.id, reason);
      loadHealth();
    } catch (err) {
      logger.error('Error voiding event', err);
      setActionError(err);
    }
  };

  if (cowError) {
    return (
      <Page title="Vaca" backTo="/settings/cows">
        <ErrorState title="No se pudo cargar la vaca." error={cowError} />
      </Page>
    );
  }

  if (!cow) {
    return (
      <Page title="Vaca" backTo="/settings/cows">
        <div className={styles.loading}><Spinner /></div>
      </Page>
    );
  }

  const history = cow.categoryHistory ?? [];
  const currentCategory = history.find((h) => !h.dateTo);

  const facts = [
    ['Caravana', cow.earTag || 'S/N'],
    ['Categoría', cow.category && [
      cow.category.name,
      currentCategory && `desde ${formatDay(currentCategory.dateFrom)}`,
    ].filter(Boolean).join(' · ')],
    ['Sexo', SEX_LABELS[cow.sex]],
    ['Raza', cow.breed?.name],
    ['Nacimiento', cow.birthDate && `${formatDay(cow.birthDate)} · ${formatAge(cow.birthDate)}`],
    ['Collar', cow.collar ? collarLabel(cow.collar) : 'Sin collar'],
  ].filter(([, value]) => value);

  const events = health?.events.filter((e) => !typeFilter || e.type === typeFilter) ?? [];

  return (
    <Page
      title={cowLabel(cow)}
      backTo="/settings/cows"
      actions={can('cows:write', 'cows:assignCollar') && (
        <Button variant="secondary" icon={Pencil} to={`/settings/cows/${cow.id}/edit`}>
          Editar
        </Button>
      )}
    >
      <ActionError error={actionError} onClose={() => setActionError(null)} />

      <Card padded className={styles.profile}>
        <div className={styles.avatar}>
          {cow.imageUrl ? <img src={cow.imageUrl} alt="" /> : <CowIcon size={40} />}
        </div>

        <dl className={styles.facts}>
          {facts.map(([label, value]) => (
            <div key={label} className={styles.fact}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {history.length > 1 && (
          <details className={styles.categoryHistory}>
            <summary>Historial de categorías</summary>
            <ul>
              {history.map((h) => (
                <li key={h.id}>
                  <strong>{h.category.name}</strong>
                  {' '}
                  {formatDay(h.dateFrom)}
                  {h.dateTo ? ` – ${formatDay(h.dateTo)}` : ' – hoy'}
                  {' · '}
                  {CATEGORY_SOURCES[h.source] ?? h.source}
                </li>
              ))}
            </ul>
          </details>
        )}

        {cow.groups?.length > 0 && (
          <div className={styles.groups}>
            {cow.groups.map((group) => <Badge key={group.id} tone="accent">{group.name}</Badge>)}
          </div>
        )}
      </Card>

      {canReadHealth && (
        <section className={styles.history} aria-labelledby="history-title">
          <div className={styles.historyHeader}>
            <h2 id="history-title" className={styles.sectionTitle}>Historia clínica</h2>
            {canWriteHealth && (
              <Button size="sm" icon={Plus} to={`/settings/cows/${cow.id}/events/new`}>
                Registrar evento
              </Button>
            )}
          </div>

          {health && <HealthSummary summary={health.summary} />}

          <div className={styles.filters} role="group" aria-label="Filtrar por tipo">
            {[{ value: null, label: 'Todos' }, ...EVENT_TYPES].map(({ value, label }) => (
              <button
                key={label}
                type="button"
                className={styles.filter}
                aria-pressed={typeFilter === value}
                onClick={() => setTypeFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <EntityList
            items={events}
            loading={!health && !healthError}
            error={healthError}
            onRetry={loadHealth}
            labels={{
              error: 'No se pudo cargar la historia clínica.',
              empty: typeFilter ? 'No hay eventos de este tipo' : 'Sin eventos registrados',
              emptyMessage: !typeFilter && 'Las vacunaciones, tratamientos, revisaciones y pesajes aparecen acá.',
            }}
            emptyIcon={ClipboardList}
            renderItem={(event) => (
              <HealthEventItem
                key={event.id}
                event={event}
                onVoid={canWriteHealth ? setEventToVoid : undefined}
              />
            )}
          />
        </section>
      )}

      <VoidEventDialog
        key={eventToVoid?.id ?? 'none'}
        event={eventToVoid}
        onConfirm={confirmVoid}
        onCancel={() => setEventToVoid(null)}
      />
    </Page>
  );
}
