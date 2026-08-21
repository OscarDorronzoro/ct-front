import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import CollarList from '../components/collars/CollarList';
import Toolbar from '../components/utils/Toolbar';
import SearchBox from '../components/search/SearchBox';
import AddButton from '../components/utils/AddButton';

import useIsMobile from '../hooks/useIsMobile';
import { getAllCollars, deleteCollar } from '../services/collar';

import { normalizeSearchText } from '../utils/search';
import logger from '../utils/logger';

export default function CollarsPage() {
  const [collars, setCollars] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const isMobile = useIsMobile();

  // Effects
  useEffect(() => {
    getAllCollars()
      .then(setCollars);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!collars || !search.trim()) {
      return [];
    }

    const query = normalizeSearchText(search);

    return collars
      .filter(collar => {
        return (
          normalizeSearchText(collar.id).includes(query) ||
          normalizeSearchText(collar.description).includes(query)
        );
      })
      .slice(0, 8)
      .map(collar => ({
        type: 'collar',
        id: collar.id,
        label: `Collar #${collar.id}`,
        description: collar.description || null,
      }));
  }, [collars, search]);

  const handleSearchSelect = (result) => {
    if (result.type === 'collar') {
      navigate(`/settings/collars/${result.id}`);
    }
  };

  const handleDelete = async (collar) => {
    const confirmed = window.confirm(
      `¿Está seguro de eliminar el collar "${collar.id}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCollar(collar.id);

      setCollars(collars =>
        collars.filter(currentCollar => currentCollar.id !== collar.id)
      );
    } catch (err) {
      logger.error(err);

      alert(
        err?.name === 'ApiError'
          ? err.message
          : 'No se pudo eliminar el collar.'
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
          <h2>Collares</h2>
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
              placeholder="Buscar collar..."
              results={searchResults}
              onSelect={handleSearchSelect}
            />
          </div>

          {!isMobile &&
            <AddButton label="Agregar collar" path="/settings/collars" />
          }
        </Toolbar>

        {isMobile &&
          <AddButton path="/settings/collars" />
        }

        <CollarList
          collars={collars}
          onDelete={handleDelete}
        />

      </div>

    </div>
  );
}
