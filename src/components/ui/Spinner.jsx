import styles from './Spinner.module.css';

export default function Spinner({ size = 24, label = 'Cargando' }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={styles.spinner}
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(2, Math.round(size / 10)),
      }}
    />
  );
}
