import { CircleDot, Flame } from 'lucide-react';

import styles from './HistoryLegend.module.css';

const VIEWS = [
  { value: 'points', label: 'Recorridos', icon: CircleDot },
  { value: 'heat', label: 'Calor', icon: Flame },
];

// History map: view switch (tracks / heatmap) and one chip per cow, which shows or hides it.
// items: [{ collarId, label, color }]
export default function HistoryLegend({
  view, onViewChange, items, hidden, onToggle,
}) {
  return (
    <div className={styles.legend}>
      <div className={styles.views} role="radiogroup" aria-label="Vista">
        {VIEWS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={view === value}
            onClick={() => onViewChange(value)}
            className={`${styles.view} ${view === value ? styles.viewActive : ''}`}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {items.map(({ collarId, label, color }) => {
        const off = hidden.has(collarId);

        return (
          <button
            key={collarId}
            type="button"
            aria-pressed={!off}
            title={off ? `Mostrar ${label}` : `Ocultar ${label}`}
            onClick={() => onToggle(collarId)}
            className={`${styles.chip} ${off ? styles.chipOff : ''}`}
          >
            <span className={styles.dot} style={{ background: color }} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
