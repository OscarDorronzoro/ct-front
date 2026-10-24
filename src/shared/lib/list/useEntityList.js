import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/shared/lib/logger';

// Load a list and delete items with confirmation.
// load: () => Promise<items>. remove: (item) => Promise.
// load must keep its identity between renders (a module function or useCallback): the list
// reloads whenever it changes, so an inline arrow function would reload forever.
export default function useEntityList({ load, remove }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      setItems(await load());
    } catch (err) {
      logger.error(err);
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    reload();
  }, [reload]);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) {
      return;
    }

    const item = itemToDelete;

    setItemToDelete(null);
    setActionError(null);

    try {
      await remove(item);
      setItems(current => current.filter(i => i.id !== item.id));
    } catch (err) {
      logger.error('Error deleting item', err);
      setActionError(err);
    }
  }, [itemToDelete, remove]);

  return {
    items,
    loading,
    loadError,
    reload,

    actionError,
    clearActionError: () => setActionError(null),

    itemToDelete,
    requestDelete: setItemToDelete,
    cancelDelete: () => setItemToDelete(null),
    confirmDelete,
  };
}
