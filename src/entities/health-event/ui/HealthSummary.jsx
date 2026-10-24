import {
  ShieldAlert, ShieldCheck, Scale, CalendarClock,
} from 'lucide-react';
import { formatDay } from '@/shared/lib/date';
import { formatNumber } from '@/shared/lib/format';
import { StatusChip } from '@/shared/ui/status-chip';
import styles from './Health.module.css';

// What the history means today (computed by the backend): withdrawal, last weight, boosters
export default function HealthSummary({ summary }) {
  const { withdrawal, lastWeight, nextDoses } = summary;
  const inWithdrawal = withdrawal.meatUntil || withdrawal.milkUntil;

  return (
    <div className={styles.chips}>
      {withdrawal.meatUntil && (
        <StatusChip tone="danger" icon={ShieldAlert}>
          Carne en retiro hasta el {formatDay(withdrawal.meatUntil)}
        </StatusChip>
      )}
      {withdrawal.milkUntil && (
        <StatusChip tone="danger" icon={ShieldAlert}>
          Leche en retiro hasta el {formatDay(withdrawal.milkUntil)}
        </StatusChip>
      )}
      {!inWithdrawal && (
        <StatusChip tone="success" icon={ShieldCheck}>Sin retiro vigente</StatusChip>
      )}

      {lastWeight && (
        <StatusChip tone="neutral" icon={Scale} note={`· ${formatDay(lastWeight.at)}`}>
          {formatNumber(lastWeight.kg)} kg
        </StatusChip>
      )}

      {nextDoses.map((dose) => (
        <StatusChip
          key={dose.product.id}
          tone={dose.overdue ? 'warning' : 'neutral'}
          icon={CalendarClock}
          note={`· ${formatDay(dose.dueOn)}`}
        >
          {dose.overdue ? 'Refuerzo vencido' : 'Refuerzo'} {dose.product.name}
        </StatusChip>
      ))}
    </div>
  );
}
