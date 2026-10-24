import { RefreshCw, WifiOff } from 'lucide-react';
import styles from './UpdatingBadge.module.css';

// Over the map while the data on screen is old: refreshing after coming back to the page,
// or the last refresh failed
export default function UpdatingBadge({ stale, error }) {
  if (!stale && !error) {
    return null;
  }

  return (
    <div className={`${styles.badge} ${error ? styles.error : ''}`} role="status">
      {error
        ? <><WifiOff size={14} aria-hidden="true" /> No se pudo actualizar</>
        : <><RefreshCw size={14} className={styles.spin} aria-hidden="true" /> Actualizando…</>}
    </div>
  );
}
