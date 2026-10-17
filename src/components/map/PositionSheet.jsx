import { useEffect, useState } from 'react';
import {
  BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, Moon, Activity, ExternalLink,
} from 'lucide-react';

import MapSheet from './MapSheet';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import CowIcon from '../icons/CowIcon';
import { getPositionDetails } from '../../services/position';
import { toTimeElapsed } from '../../utils/dateHelper';
import logger from '../../utils/logger';
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

const number = (value, digits = 0) => value.toLocaleString('es-AR', {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
});

const time = (date) => new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

const dateTime = (date) => new Date(date).toLocaleString('es-AR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

function BatteryChip({ battery, recordedAt }) {
  if (!battery) {
    return (
      <span className={`${styles.chip} ${styles.neutral}`}>
        <BatteryMedium size={16} aria-hidden="true" />
        Batería sin datos
      </span>
    );
  }

  const Icon = BATTERY_ICONS[battery.level];
  // Read from an earlier message (the position's one had no voltage)
  const earlier = new Date(battery.recordedAt) < new Date(recordedAt);

  return (
    <span className={`${styles.chip} ${styles[battery.level]}`} title={BATTERY_LABELS[battery.level]}>
      <Icon size={16} aria-hidden="true" />
      {battery.percent}%
      <span className={styles.chipNote}>
        {number(battery.voltage, 2)} V{earlier && ` · ${time(battery.recordedAt)}`}
      </span>
    </span>
  );
}

function StateChip({ state }) {
  if (state.status === 'sleeping') {
    return (
      <span className={`${styles.chip} ${styles.sleeping}`}>
        <Moon size={16} aria-hidden="true" />
        Durmiendo
        <span className={styles.chipNote}>
          {state.wakeExpectedAt ? `despierta ~${time(state.wakeExpectedAt)}` : `desde ${time(state.since)}`}
        </span>
      </span>
    );
  }

  return (
    <span className={`${styles.chip} ${styles.awake}`}>
      <Activity size={16} aria-hidden="true" />
      Activo
    </span>
  );
}

// Selected position: cow, collar, battery, sleep state and signal.
// Rendered with key={position id}: a new point starts with a fresh state.
export default function PositionSheet({ point, onClose }) {
  const { id, collarId, cowId, timestamp, signalStrength } = point.properties;
  const [details, setDetails] = useState(null);
  const [failed, setFailed] = useState(false);

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

    return () => { cancelled = true; };
  }, [id]);

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
            <dd>{dateTime(position.recordedAt)}</dd>

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
