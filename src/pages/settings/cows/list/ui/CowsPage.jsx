import { useNavigate } from 'react-router';
import { EntityListPage } from '@/shared/ui/entity-list-page';
import { CowIcon } from '@/shared/ui/icons';
import { useEntityList } from '@/shared/lib/list';
import {
  CowRow, cowLabel, getAllCows, deleteCow,
} from '@/entities/cow';
import { useCan } from '@/entities/viewer';

const removeCow = (cow) => deleteCow(cow.id);
const searchFields = (cow) => [cow.id, cow.earTag, cow.alias];
const toSearchResult = (cow) => ({
  type: 'cow',
  id: cow.id,
  label: cowLabel(cow),
  description: cow.earTag ? `Caravana: ${cow.earTag}` : null,
});

export default function CowsPage() {
  const navigate = useNavigate();
  const can = useCan();
  const canWrite = can('cows:write');
  // Everyone opens the card of a cow; the pencil (edit form) is for who can change something
  const canEdit = can('cows:write', 'cows:assignCollar');

  const list = useEntityList({ load: getAllCows, remove: removeCow });

  return (
    <EntityListPage
      title="Vacas"
      addLabel="Agregar vaca"
      newPath={canWrite ? '/settings/cows/new' : null}
      list={list}
      search={{
        placeholder: 'Buscar vaca...',
        fields: searchFields,
        toResult: toSearchResult,
        onSelect: (result) => navigate(`/settings/cows/${result.id}`),
      }}
      labels={{
        error: 'No se pudieron cargar las vacas.',
        empty: 'No hay vacas registradas',
      }}
      emptyIcon={CowIcon}
      renderItem={(cow) => (
        <CowRow
          key={cow.id}
          cow={cow}
          editable={canEdit}
          onDelete={canWrite ? list.requestDelete : undefined}
        />
      )}
      deleteDialog={{
        title: 'Eliminar vaca',
        message: (cow) => `¿Está seguro de eliminar la vaca "${cowLabel(cow)}"?`,
      }}
    />
  );
}
