import { useNavigate } from 'react-router';
import { Users } from 'lucide-react';
import { EntityListPage } from '@/shared/ui/entity-list-page';
import { useEntityList } from '@/shared/lib/list';
import {
  GroupRow, groupLabel, getAllGroups, deleteGroup,
} from '@/entities/group';
import { useCan } from '@/entities/viewer';

const removeGroup = (group) => deleteGroup(group.id);
const searchFields = (group) => [group.id, group.name];
const toSearchResult = (group) => ({
  type: 'group',
  id: group.id,
  label: groupLabel(group),
  description: group.description || null,
});

export default function GroupsPage() {
  const navigate = useNavigate();
  const canWrite = useCan()('cows:write');

  const list = useEntityList({ load: getAllGroups, remove: removeGroup });

  return (
    <EntityListPage
      title="Grupos"
      addLabel="Agregar grupo"
      newPath={canWrite ? '/settings/groups/new' : null}
      list={list}
      search={{
        placeholder: 'Buscar grupo...',
        fields: searchFields,
        toResult: toSearchResult,
        onSelect: canWrite ? (result) => navigate(`/settings/groups/${result.id}`) : undefined,
      }}
      labels={{
        error: 'No se pudieron cargar los grupos.',
        empty: 'No hay grupos registrados',
      }}
      emptyIcon={Users}
      renderItem={(group) => (
        <GroupRow
          key={group.id}
          group={group}
          editable={canWrite}
          onDelete={canWrite ? list.requestDelete : undefined}
        />
      )}
      deleteDialog={{
        title: 'Eliminar grupo',
        message: (group) => `¿Está seguro de eliminar el grupo "${groupLabel(group)}"?`,
      }}
    />
  );
}
