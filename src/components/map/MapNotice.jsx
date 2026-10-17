import { useEffect } from 'react';

import styles from './MapNotice.module.css';

const DURATION_MS = 4000;

// Short message over the map (snackbar). Rendered with a key per message: each one restarts the timer.
export default function MapNotice({ children, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, DURATION_MS);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <div className={styles.notice} role="status">
      {children}
    </div>
  );
}
