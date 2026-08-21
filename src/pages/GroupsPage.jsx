import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import GroupList from '../components/groups/GroupList';
import Toolbar from '../components/utils/Toolbar';
import SearchBox from '../components/search/SearchBox';
import AddButton from '../components/utils/AddButton';

import useIsMobile from '../hooks/useIsMobile';
import { getAllGroups, deleteGroup } from '../services/group';

import { normalizeSearchText } from '../utils/search';
import logger from '../utils/logger';

export default function GroupsPage() {
  const [groups, setGroups] = useState(null);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Effects
  useEffect(() => {
    getAllGroups()
      .then(setGroups);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!groups || !search.trim()) {
      return [];
    }

    const query = normalizeSearchText(search);

    return groups
      .filter(group => {
        return (
          normalizeSearchText(group.id).includes(query) ||
          normalizeSearchText(group.name).includes(query)
        );
      })
      .slice(0, 8)
      .map(group => ({
        type: 'group',
        id: group.id,
        label: group.name || `Grupo #${group.id}`,
        description: group.description,
      }));
  }, [groups, search]);

  const handleSearchSelect = (result) => {
    if (result.type === 'group') {
      navigate(`/settings/groups/${result.id}`);
    }
  };

  const handleDelete = async (group) => {
    const confirmed = window.confirm(
      `¿Está seguro de eliminar el grupo "${group.name || group.id}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteGroup(group.id);

      setGroups(groups =>
        groups.filter(currentGroup => currentGroup.id !== group.id)
      );
    } catch (err) {
      logger.error(err);

      alert(
        err?.name === 'ApiError'
          ? err.message
          : 'No se pudo eliminar el grupo.'
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
          <h2>Grupos</h2>
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
              placeholder="Buscar grupo..."
              results={searchResults}
              onSelect={handleSearchSelect}
            />
          </div>

          {!isMobile &&
            <AddButton label="Agregar grupo" path="/settings/groups" />
          }
        </Toolbar>

        {isMobile &&
          <AddButton path="/settings/groups" />
        }

        <GroupList
          groups={groups}
          onDelete={handleDelete}
        />

      </div>

    </div>
  );
}
