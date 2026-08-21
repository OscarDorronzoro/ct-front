import { useEffect } from 'react';
import { useRouteError } from 'react-router';
import logger from '../utils/logger';

export default function ErrorPage() {
  const error = useRouteError();

  useEffect(() => {
    logger.error('React Router error', {
      error,
      stack: error?.stack,
    });
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#153029'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1>Algo salió mal</h1>

        <p>
          Ocurrió un error inesperado.
          <br />
          Intentá volver al inicio.
        </p>

        <button onClick={() => window.location = '/'}>
          Volver
        </button>
      </div>
    </div>
  );
}
