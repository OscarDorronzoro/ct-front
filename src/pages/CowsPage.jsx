import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import CowList from '../components/cows/CowList';
import Toolbar from '../components/utils/Toolbar';
import SearchBox from '../components/search/SearchBox';
import AddButton from '../components/utils/AddButton';
import ActionError from '../components/utils/ActionError';
import ConfirmDialog from '../components/utils/ConfirmDialog';

import useIsMobile from '../hooks/useIsMobile';
import { getAllCows, deleteCow } from '../services/cow';

import { normalizeSearchText } from '../utils/search';
import logger from '../utils/logger';

export default function CowsPage() {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [cowToDelete, setCowToDelete] = useState(null);

  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const isMobile = useIsMobile();

  // Load data
  const loadCows = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await getAllCows();
      setCows(data);
    } catch (err) {
      logger.error(err);
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCows();
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!search.trim()) {
      return [];
    }

    const query = normalizeSearchText(search);

    return cows
      .filter(cow => {
        return (
          normalizeSearchText(cow.id).includes(query) ||
          normalizeSearchText(cow.earTag).includes(query) ||
          normalizeSearchText(cow.alias).includes(query)
        );
      })
      .slice(0, 8)
      .map(cow => ({
        type: 'cow',
        id: cow.id,
        label: cow.alias || `Vaca #${cow.id}`,
        description: cow.earTag
          ? `Caravana: ${cow.earTag}`
          : null,
      }));
  }, [cows, search]);

  const handleSearchSelect = (result) => {
    if (result.type === 'cow') {
      navigate(`/settings/cows/${result.id}`);
    }
  };

  // Delete Cow
  const handleDelete = (cow) => {
    setCowToDelete(cow);
  };

  const confirmDelete = async () => {
    if (!cowToDelete) {
      return;
    }

    const cow = cowToDelete;

    setCowToDelete(null);
    setActionError(null);

    try {
      await deleteCow(cow.id);

      setCows(cows =>
        cows.filter(currentCow => currentCow.id !== cow.id)
      );
    } catch (err) {
      logger.error('Error deleting cow', err);
      setActionError(err);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}
    >

      {/* Header */}
      <div
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          background: '#ffffff',
          borderBottom: '1px solid #ddd',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            color: '#5e3b2c',
            margin: '0 auto',
            fontSize: 18,
          }}
        >
          <h2>Vacas</h2>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          marginTop: '10px',
          background: '#fff',
          height: '100%',
          flex: 1,
          padding: 16,
          overflow: 'auto',
        }}
      >

        <ActionError
          error={actionError}
          onClose={() => setActionError(null)}
        />

        <Toolbar>
          <div style={{ flex: 1 }}>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Buscar vaca..."
              results={searchResults}
              onSelect={handleSearchSelect}
            />
          </div>

          {!isMobile &&
            <AddButton label="Agregar vaca" path="/settings/cows" />
          }
        </Toolbar>

        {isMobile &&
          <AddButton path="/settings/cows" />
        }

        <CowList
          cows={cows}
          loading={loading}
          error={loadError}
          onRetry={loadCows}
          onDelete={handleDelete}
        />

      </div>

      <ConfirmDialog
        open={!!cowToDelete}
        title="Eliminar vaca"
        message={
          cowToDelete
            ? `¿Está seguro de eliminar la vaca "${cowToDelete.alias || cowToDelete.id}"?`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setCowToDelete(null)}
      />

    </div>
  );
}
