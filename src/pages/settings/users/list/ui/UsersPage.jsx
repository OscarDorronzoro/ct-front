import { useNavigate } from 'react-router';
import { UserRound } from 'lucide-react';
import { EntityListPage } from '@/shared/ui/entity-list-page';
import { useEntityList } from '@/shared/lib/list';
import {
  UserRow, userLabel, getAllUsers, deleteUser,
} from '@/entities/user';
import { useCan } from '@/entities/viewer';

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
  const canWrite = useCan()('users:manage');

  const list = useEntityList({ load: getAllUsers, remove: removeUser });

  return (
    <EntityListPage
      title="Usuarios"
      addLabel="Agregar usuario"
      newPath={canWrite ? '/settings/users/new' : null}
      list={list}
      search={{
        placeholder: 'Buscar usuario...',
        fields: searchFields,
        toResult: toSearchResult,
        onSelect: canWrite ? (result) => navigate(`/settings/users/${result.id}`) : undefined,
      }}
      labels={{
        error: 'No se pudieron cargar los usuarios.',
        empty: 'No hay usuarios registrados',
      }}
      emptyIcon={UserRound}
      renderItem={(user) => (
        <UserRow
          key={user.id}
          user={user}
          editable={canWrite}
          onDelete={canWrite ? list.requestDelete : undefined}
        />
      )}
      deleteDialog={{
        title: 'Eliminar usuario',
        message: (user) => `¿Está seguro de eliminar el usuario "${userLabel(user)}"?`,
      }}
    />
  );
}
