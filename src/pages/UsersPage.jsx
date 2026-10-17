import { useNavigate } from 'react-router';
import { Plus, UserRound } from 'lucide-react';

import Page from '../components/ui/Page';
import Button from '../components/ui/Button';
import Fab from '../components/ui/Fab';
import EntityList from '../components/ui/EntityList';
import Toolbar from '../components/utils/Toolbar';
import SearchBox from '../components/search/SearchBox';
import ActionError from '../components/utils/ActionError';
import ConfirmDialog from '../components/utils/ConfirmDialog';
import UserRow from '../components/users/UserRow';

import useEntityList from '../hooks/useEntityList';
import { userLabel } from '../utils/labels';
import useListSearch from '../hooks/useListSearch';
import { getAllUsers, deleteUser } from '../services/user';

const NEW_PATH = '/settings/users/new';

const removeUser = (user) => deleteUser(user.id);
const searchFields = (user) => [user.id, user.username];
const toSearchResult = (user) => ({
  type: 'user',
  id: user.id,
  label: userLabel(user),
  description: null,
});

export default function UsersPage() {
  const navigate = useNavigate();

  const list = useEntityList({ load: getAllUsers, remove: removeUser });
  const { search, setSearch, results } = useListSearch(list.items, {
    fields: searchFields,
    toResult: toSearchResult,
  });

  const item = list.itemToDelete;

  return (
    <Page
      title="Usuarios"
      hideHeaderOnMobile
      actions={
        <Button icon={Plus} to={NEW_PATH}>
          Agregar usuario
        </Button>
      }
    >
      <ActionError
        error={list.actionError}
        onClose={list.clearActionError}
      />

      <Toolbar>
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Buscar usuario..."
          results={results}
          onSelect={(result) => navigate(`/settings/users/${result.id}`)}
        />
      </Toolbar>

      <EntityList
        items={list.items}
        loading={list.loading}
        error={list.loadError}
        onRetry={list.reload}
        labels={{
          error: 'No se pudieron cargar los usuarios.',
          empty: 'No hay usuarios registrados',
        }}
        emptyIcon={UserRound}
        renderItem={(user) => (
          <UserRow
            key={user.id}
            user={user}
            onDelete={list.requestDelete}
          />
        )}
      />

      <Fab icon={Plus} label="Agregar usuario" to={NEW_PATH} />

      <ConfirmDialog
        open={!!item}
        title="Eliminar usuario"
        message={item ? `¿Está seguro de eliminar el usuario "${userLabel(item)}"?` : ''}
        confirmLabel="Eliminar"
        danger
        onConfirm={list.confirmDelete}
        onCancel={list.cancelDelete}
      />
    </Page>
  );
}
