import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import CowList from '../components/cows/CowList';
import Toolbar from '../components/utils/Toolbar';
import SearchBox from '../components/search/SearchBox';
import AddButton from '../components/utils/AddButton';

import useIsMobile from '../hooks/useIsMobile';
import { getAllCows, deleteCow } from '../services/cow';

import { normalizeSearchText } from '../utils/search';
import logger from '../utils/logger';

export default function CowsPage() {
  const [cows, setCows] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const isMobile = useIsMobile();

  // Effects
  useEffect(() => {
    getAllCows()
      .then(setCows);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!cows || !search.trim()) {
      return [];
    }

    const query = search.trim().toLowerCase();

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

  const handleDelete = async (cow) => {
    const confirmed = window.confirm(
      `¿Está seguro de eliminar la vaca "${cow.alias || cow.id}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCow(cow.id);

      setCows(cows =>
        cows.filter(currentCow => currentCow.id !== cow.id)
      );
    } catch (err) {
      logger.error(err);

      // Por ahora
      alert(
        err?.name === 'ApiError'
          ? err.message
          : 'No se pudo eliminar la vaca.'
      );
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
          onDelete={handleDelete}
        />

      </div>

    </div>
  );
}
