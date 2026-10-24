import { useNavigate } from 'react-router';
import { Plus, UserRound } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Button, Fab } from '@/shared/ui/button';
import { EntityList } from '@/shared/ui/list';
import { Toolbar } from '@/shared/ui/toolbar';
import SearchBox from '@/components/search/SearchBox';
import { ActionError } from '@/shared/ui/alert';
import { ConfirmDialog } from '@/shared/ui/dialog';
import UserRow from '@/components/users/UserRow';

import { useEntityList, useListSearch } from '@/shared/lib/list';
import useCan from '@/hooks/useCan';
import { userLabel } from '@/utils/labels';

import { getAllUsers, deleteUser } from '@/services/user';

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
  const can = useCan();
  const canWrite = can('users:manage');
  const canEdit = canWrite;

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
      actions={canWrite && (
        <Button icon={Plus} to={NEW_PATH}>
          Agregar usuario
        </Button>
      )}
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
          onSelect={canEdit ? (result) => navigate(`/settings/users/${result.id}`) : undefined}
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
            editable={canEdit}
            onDelete={canWrite ? list.requestDelete : undefined}
          />
        )}
      />

      {canWrite && <Fab icon={Plus} label="Agregar usuario" to={NEW_PATH} />}

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
