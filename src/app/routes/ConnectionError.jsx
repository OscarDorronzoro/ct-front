import { ErrorState } from '@/shared/ui/list';
import styles from './ConnectionError.module.css';

// Full screen: the server couldn't be reached while checking the session.
// No error detail: it's generic, or the HTML error page of the proxy (502 while the backend restarts).
export default function ConnectionError({ onRetry }) {
  return (
    <div className={styles.screen}>
      <ErrorState
        title="No se pudo conectar con el servidor"
        onRetry={onRetry}
      />
      <p className={styles.hint}>Revise su conexión. Se vuelve a intentar al recuperarla.</p>
    </div>
  );
}
