import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import GroupList from '../components/groups/GroupList';
import Toolbar from '../components/utils/Toolbar';
import SearchBox from '../components/search/SearchBox';
import AddButton from '../components/utils/AddButton';
import ActionError from '../components/utils/ActionError';
import ConfirmDialog from '../components/utils/ConfirmDialog';

import useIsMobile from '../hooks/useIsMobile';
import { getAllGroups, deleteGroup } from '../services/group';

import { normalizeSearchText } from '../utils/search';
import logger from '../utils/logger';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Load data
  const loadGroups = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await getAllGroups();
      setGroups(data);
    } catch (err) {
      logger.error(err);
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!search.trim()) {
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

  // Delete Group
  const handleDelete = (group) => {
    setGroupToDelete(group);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) {
      return;
    }

    const group = groupToDelete;

    setGroupToDelete(null);
    setActionError(null);

    try {
      await deleteGroup(group.id);

      setGroups(groups =>
        groups.filter(currentGroup => currentGroup.id !== group.id)
      );
    } catch (err) {
      logger.error('Error deleting group', err);
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
        <ActionError
          error={actionError}
          onClose={() => setActionError(null)}
        />

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
            <AddButton
              label="Agregar grupo"
              path="/settings/groups"
            />
          }
        </Toolbar>

        {isMobile &&
          <AddButton path="/settings/groups" />
        }

        <GroupList
          groups={groups}
          loading={loading}
          error={loadError}
          onRetry={loadGroups}
          onDelete={handleDelete}
        />

      </div>

      <ConfirmDialog
        open={!!groupToDelete}
        title="Eliminar grupo"
        message={
          groupToDelete
            ? `¿Está seguro de eliminar el grupo "${groupToDelete.name || groupToDelete.id}"?`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setGroupToDelete(null)}
      />

    </div>
  );
}
