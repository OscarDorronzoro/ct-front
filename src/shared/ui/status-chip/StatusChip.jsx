import styles from './StatusChip.module.css';

// tone: neutral | primary | info | success | warning | danger. note: secondary text after the
// main one (a date, the voltage...). title: tooltip with the meaning of the state.
export default function StatusChip({
  tone = 'neutral', icon: Icon, note, title, children,
}) {
  return (
    <span className={`${styles.chip} ${styles[tone]}`} title={title}>
      {Icon && <Icon size={16} aria-hidden="true" />}
      {children}
      {note && <span className={styles.note}>{note}</span>}
    </span>
  );
}
