import { useEffect, useState } from 'react';
import {
  BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, Moon, Activity, ExternalLink,
} from 'lucide-react';
import MapSheet from './MapSheet';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { CowIcon } from '@/shared/ui/icons';
import { getPositionDetails, getDistances } from '@/entities/position';
import { formatDistance, compassPoint } from '@/shared/lib/geo';
import { toTimeElapsed, formatTime, formatDateTime } from '@/shared/lib/date';
import { formatNumber } from '@/shared/lib/format';
import { logger } from '@/shared/lib/logger';
import { StatusChip } from '@/shared/ui/status-chip';
import styles from './PositionSheet.module.css';

const BATTERY_ICONS = {
  ok: BatteryFull,
  low: BatteryLow,
  critical: BatteryWarning,
};

const BATTERY_LABELS = {
  ok: 'Batería',
  low: 'Batería baja',
  critical: 'Batería crítica',
};

// Measures with their exact decimals (3,40 V; 12,0 km/h)
const number = (value, digits = 0) => formatNumber(value, { digits, fixed: true });

// Battery level -> tone of the chip
const BATTERY_TONES = {
  ok: 'success',
  low: 'warning',
  critical: 'danger',
};

function BatteryChip({ battery, recordedAt }) {
  if (!battery) {
    return <StatusChip icon={BatteryMedium}>Batería sin datos</StatusChip>;
  }

  // Read from an earlier message (the position's one had no voltage)
  const earlier = new Date(battery.recordedAt) < new Date(recordedAt);

  return (
    <StatusChip
      tone={BATTERY_TONES[battery.level]}
      icon={BATTERY_ICONS[battery.level]}
      title={BATTERY_LABELS[battery.level]}
      note={`${number(battery.voltage, 2)} V${earlier ? ` · ${formatTime(battery.recordedAt)}` : ''}`}
    >
      {battery.percent}%
    </StatusChip>
  );
}

function StateChip({ state }) {
  if (state.status === 'sleeping') {
    return (
      <StatusChip
        tone="info"
        icon={Moon}
        note={state.wakeExpectedAt ? `despierta ~${formatTime(state.wakeExpectedAt)}` : `desde ${formatTime(state.since)}`}
      >
        Durmiendo
      </StatusChip>
    );
  }

  return <StatusChip tone="primary" icon={Activity}>Activo</StatusChip>;
}

// 0 means it barely moved (under 10 m); very low averages come from long intervals
function formatSpeed(kmh) {
  if (kmh === 0) {
    return 'Quieta';
  }

  return kmh < 0.1 ? 'Menos de 0,1 km/h' : `${number(kmh, 1)} km/h`;
}

// Distance traveled by the collar on the position's day (until now, if it's today)
function loadDayDistance(collarId, timestamp) {
  const from = new Date(timestamp);
  from.setHours(0, 0, 0, 0);
  const endOfDay = new Date(from);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const to = new Date(Math.min(endOfDay, Date.now()));

  // One row for the collar; none if it has no positions in the range
  return getDistances({ dateFrom: from.toISOString(), dateTo: to.toISOString(), collarId })
    .then(([row]) => row?.meters ?? 0);
}

// Selected position: cow, collar, battery, sleep state and signal.
// Rendered with key={position id}: a new point starts with a fresh state.
export default function PositionSheet({ point, onClose }) {
  const { id, collarId, cowId, timestamp, signalStrength } = point.properties;
  const [details, setDetails] = useState(null);
  const [failed, setFailed] = useState(false);
  const [dayMeters, setDayMeters] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getPositionDetails(id)
      .then((data) => {
        if (!cancelled) {
          setDetails(data);
        }
      })
      .catch((err) => {
        logger.error('Error loading position details', err);
        if (!cancelled) {
          setFailed(true);
        }
      });

    // Secondary: the sheet works without it
    loadDayDistance(collarId, timestamp)
      .then((meters) => {
        if (!cancelled) {
          setDayMeters(meters);
        }
      })
      .catch((err) => logger.error('Error loading distance', err));

    return () => { cancelled = true; };
  }, [id, collarId, timestamp]);

  const cow = details?.cow;
  const collarCode = details?.collar?.code ?? collarId;
  const { position, signal } = details ?? {};

  return (
    <MapSheet
      avatar={cow?.imageUrl ? { src: cow.imageUrl } : <CowIcon size={26} />}
      title={cow?.alias || (cowId ? `Vaca ${cowId}` : 'Sin vaca asignada')}
      subtitle={`Collar ${collarCode}\u00A0· ${toTimeElapsed(timestamp).text}`}
      onClose={onClose}
      actions={cow && (
        <Button variant="secondary" icon={ExternalLink} to={`/settings/cows/${cow.id}`}>
          Ver vaca
        </Button>
      )}
    >
      {!details && !failed && (
        <div className={styles.loading}><Spinner /></div>
      )}

      {failed && (
        <p className={styles.muted}>No se pudieron cargar los detalles.</p>
      )}

      {details && (
        <>
          <div className={styles.chips}>
            <BatteryChip battery={details.battery} recordedAt={position.recordedAt} />
            <StateChip state={details.state} />
          </div>

          <dl className={styles.details}>
            <dt>Fecha</dt>
            <dd>{formatDateTime(position.recordedAt, { seconds: true })}</dd>

            <dt>Señal</dt>
            <dd>
              {signalStrength ?? '—'}%
              {signal?.rssi !== null && signal?.rssi !== undefined && (
                <span className={styles.muted}>
                  {` · RSSI ${signal.rssi} dBm · SNR ${number(signal.snr, 1)} dB`}
                </span>
              )}
            </dd>

            {position.accuracy !== null && (
              <>
                <dt>Precisión</dt>
                <dd>± {number(position.accuracy)} m</dd>
              </>
            )}

            {position.distanceToPrevious !== null && (
              <>
                <dt>Desplazamiento</dt>
                <dd>{number(position.distanceToPrevious)} m desde la posición anterior</dd>
              </>
            )}

            {position.speed !== null && position.speed !== undefined && (
              <>
                <dt>Velocidad</dt>
                <dd>
                  {formatSpeed(position.speed)}
                  {position.heading !== null && position.heading !== undefined && (
                    <span className={styles.muted}>
                      {` · hacia el ${compassPoint(position.heading)} (${number(position.heading)}°)`}
                    </span>
                  )}
                </dd>
              </>
            )}

            {dayMeters !== null && (
              <>
                <dt>Recorrido del día</dt>
                <dd>{formatDistance(dayMeters)}</dd>
              </>
            )}

            {details.collar?.firmwareVersion && (
              <>
                <dt>Firmware</dt>
                <dd>{details.collar.firmwareVersion}</dd>
              </>
            )}
          </dl>
        </>
      )}
    </MapSheet>
  );
}
