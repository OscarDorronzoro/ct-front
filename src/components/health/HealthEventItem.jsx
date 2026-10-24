import { Ban } from 'lucide-react';
import { IconButton } from '@/shared/ui/button';
import {
  eventTypeInfo, eventTitle, eventDetails, formatDay,
} from '@/utils/health';
import styles from './Health.module.css';

// An event of the clinical history. Voided ones stay, crossed out, with the reason.
export default function HealthEventItem({ event, onVoid }) {
  const { icon: Icon } = eventTypeInfo(event.type);
  const { voided } = event;

  return (
    <article className={`${styles.event} ${voided ? styles.voided : ''}`}>
      <div className={styles.eventIcon}>
        <Icon size={20} aria-hidden="true" />
      </div>

      <div className={styles.eventBody}>
        <div className={styles.eventHeader}>
          <h3 className={styles.eventTitle}>{eventTitle(event)}</h3>
          <time className={styles.eventDate} dateTime={event.occurredAt}>
            {formatDay(event.occurredAt)}
          </time>
        </div>

        {eventDetails(event).map((line) => (
          <p key={line} className={styles.eventLine}>{line}</p>
        ))}

        {event.notes && <p className={styles.eventNotes}>{event.notes}</p>}

        <p className={styles.eventMeta}>
          {event.recordedBy ? `Registrado por ${event.recordedBy.username}` : 'Registrado'}
        </p>

        {voided && (
          <p className={styles.voidNote}>
            Anulado el {formatDay(voided.at)}
            {voided.by && ` por ${voided.by.username}`}: {voided.reason}
          </p>
        )}
      </div>

      {onVoid && !voided && (
        <IconButton icon={Ban} label="Anular evento" variant="danger" onClick={() => onVoid(event)} />
      )}
    </article>
  );
}
