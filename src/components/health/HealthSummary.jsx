import {
  ShieldAlert, ShieldCheck, Scale, CalendarClock,
} from 'lucide-react';
import { formatDay } from '@/utils/health';
import styles from './Health.module.css';

const Chip = ({ tone, icon: Icon, children }) => (
  <span className={`${styles.chip} ${styles[tone]}`}>
    <Icon size={15} aria-hidden="true" />
    {children}
  </span>
);

// What the history means today (computed by the backend): withdrawal, last weight, boosters
export default function HealthSummary({ summary }) {
  const { withdrawal, lastWeight, nextDoses } = summary;
  const inWithdrawal = withdrawal.meatUntil || withdrawal.milkUntil;

  return (
    <div className={styles.chips}>
      {withdrawal.meatUntil && (
        <Chip tone="danger" icon={ShieldAlert}>
          Carne en retiro hasta el {formatDay(withdrawal.meatUntil)}
        </Chip>
      )}
      {withdrawal.milkUntil && (
        <Chip tone="danger" icon={ShieldAlert}>
          Leche en retiro hasta el {formatDay(withdrawal.milkUntil)}
        </Chip>
      )}
      {!inWithdrawal && (
        <Chip tone="ok" icon={ShieldCheck}>Sin retiro vigente</Chip>
      )}

      {lastWeight && (
        <Chip tone="neutral" icon={Scale}>
          {lastWeight.kg.toLocaleString('es-AR')} kg
          <span className={styles.chipNote}>· {formatDay(lastWeight.at)}</span>
        </Chip>
      )}

      {nextDoses.map((dose) => (
        <Chip key={dose.product.id} tone={dose.overdue ? 'warning' : 'neutral'} icon={CalendarClock}>
          {dose.overdue ? 'Refuerzo vencido' : 'Refuerzo'} {dose.product.name}
          <span className={styles.chipNote}>· {formatDay(dose.dueOn)}</span>
        </Chip>
      ))}
    </div>
  );
}
