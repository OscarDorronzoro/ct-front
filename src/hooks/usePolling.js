import { useEffect, useState } from 'react';

import logger from '../utils/logger';

// Loads data now and, with intervalMs, again every intervalMs while the page is visible.
// - Hidden page (tab in background, phone locked): polling pauses.
// - Visible again or back online: loads at once. If it was away longer than one interval,
//   `stale` is true until that load arrives, so the page can show the data is old.
// load(): Promise<data>. It must keep its identity between renders (a module function, or
// useCallback with what it depends on): a new load starts over and drops the results of the
// previous one. The last data stays while a new load runs.
export default function usePolling(load, { intervalMs = null } = {}) {
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let current = true;
    let timer = null;
    let hiddenAt = null;

    const run = () => load()
      .then((result) => {
        if (current) {
          setData(result);
          setError(null);
          setStale(false);
        }
      })
      .catch((err) => {
        logger.error('Polling load failed', err);
        if (current) {
          setError(err);
        }
      });

    const start = () => {
      if (intervalMs && !timer) {
        timer = setInterval(run, intervalMs);
      }
    };

    const stop = () => {
      clearInterval(timer);
      timer = null;
    };

    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        stop();
        return;
      }

      if (!intervalMs) {
        return;
      }

      if (hiddenAt && Date.now() - hiddenAt > intervalMs) {
        setStale(true);
      }
      run();
      start();
    };

    const onOnline = () => {
      if (!document.hidden) {
        run();
      }
    };

    run();
    if (!document.hidden) {
      start();
    }

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);

    return () => {
      current = false;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    };
  }, [load, intervalMs]);

  return { data, error, stale };
}
