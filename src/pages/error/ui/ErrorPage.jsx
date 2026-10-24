import { useEffect } from 'react';
import { useRouteError } from 'react-router';
import { TriangleAlert, House } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { logger } from '@/shared/lib/logger';
import styles from './ErrorPage.module.css';

// A page crashed or the route doesn't exist. Back to the start with a full reload: a clean state.
export default function ErrorPage() {
  const error = useRouteError();

  useEffect(() => {
    logger.error('React Router error', {
      error,
      stack: error?.stack,
    });
  }, [error]);

  return (
    <div className={styles.screen}>
      <div className={styles.card} role="alert">
        <div className={styles.icon}>
          <TriangleAlert size={28} aria-hidden="true" />
        </div>

        <h1 className={styles.title}>Algo salió mal</h1>

        <p className={styles.text}>
          Ocurrió un error inesperado o la página no existe. Vuelva al inicio para seguir.
        </p>

        <Button icon={House} onClick={() => window.location.assign('/')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
