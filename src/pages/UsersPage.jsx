import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import UserList from '../components/users/UserList';
import Toolbar from '../components/utils/Toolbar';
import SearchBox from '../components/search/SearchBox';
import AddButton from '../components/utils/AddButton';

import useIsMobile from '../hooks/useIsMobile';
import { getAllUsers, deleteUser } from '../services/user';

import { normalizeSearchText } from '../utils/search';
import logger from '../utils/logger';

export default function UsersPage() {
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Effects
  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => {
        logger.error(err);
        setUsers([]);
      });
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!users || !search.trim()) {
      return [];
    }

    const query = normalizeSearchText(search);

    return users
      .filter(user => {
        return (
          normalizeSearchText(user.id).includes(query) ||
          normalizeSearchText(user.username).includes(query)
        );
      })
      .slice(0, 8)
      .map(user => ({
        type: 'user',
        id: user.id,
        label: user.username || `Usuario #${user.id}`,
        description: null,
      }));
  }, [users, search]);

  const handleSearchSelect = (result) => {
    if (result.type === 'user') {
      navigate(`/settings/users/${result.id}`);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `¿Está seguro de eliminar el usuario "${user.name || user.email || user.id}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteUser(user.id);

      setUsers(users =>
        users.filter(currentUser => currentUser.id !== user.id)
      );
    } catch (err) {
      logger.error(err);

      alert(
        err?.name === 'ApiError'
          ? err.message
          : 'No se pudo eliminar el usuario.'
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
          <h2>Usuarios</h2>
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
              placeholder="Buscar usuario..."
              results={searchResults}
              onSelect={handleSearchSelect}
            />
          </div>

          {!isMobile &&
            <AddButton label="Agregar usuario" path="/settings/users" />
          }
        </Toolbar>

        {isMobile &&
          <AddButton path="/settings/users" />
        }

        <UserList
          users={users}
          onDelete={handleDelete}
        />

      </div>

    </div>
  );
}
