import styles from './Explorer.module.css';
import { formatNumber } from '@/utils/explorer';

// Legend for 2 or more series: the key mirrors the mark (a line or a bar), the text keeps the
// text color (identity comes from the key, never from colored text)
export function Legend({ series, mark }) {
  if (series.length < 2) {
    return null;
  }

  return (
    <ul className={styles.legend}>
      {series.map((s) => (
        <li key={s.key}>
          <span
            className={mark === 'line' ? styles.keyLine : styles.keyBar}
            style={{ background: s.color }}
            aria-hidden="true"
          />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

// Readout of a point: values lead (strong), series names follow; a short line keys each series
export function Tooltip({ title, rows, unit, left, top, alignRight }) {
  return (
    <div
      className={styles.tooltip}
      style={{ left, top, transform: alignRight ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)' }}
      role="status"
    >
      <div className={styles.tooltipTitle}>{title}</div>
      {rows.length === 0 && <div className={styles.tooltipLabel}>Sin datos</div>}
      {rows.map((row) => (
        <div key={row.key} className={styles.tooltipRow}>
          <span className={styles.keyLine} style={{ background: row.color }} aria-hidden="true" />
          <strong>{row.value === null ? '—' : `${formatNumber(row.value)}${unit ? ` ${unit}` : ''}`}</strong>
          {rows.length > 1 && <span className={styles.tooltipLabel}>{row.label}</span>}
        </div>
      ))}
    </div>
  );
}
