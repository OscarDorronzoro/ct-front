import { useCallback, useEffect, useState } from 'react';

import { getCowHealth } from '../services/health';
import logger from '../utils/logger';

// Clinical history of a cow ({ summary, events }), with reload (e.g. after voiding an event).
// enabled: false for users who can't read it (nothing is requested).
export default function useCowHealth(cowId, enabled) {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    if (!enabled) {
      return Promise.resolve();
    }

    return getCowHealth(cowId)
      .then((data) => {
        setHealth(data);
        setError(null);
      })
      .catch((err) => {
        logger.error('Error loading clinical history', err);
        setError(err);
      });
  }, [cowId, enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { health, error, reload };
}
