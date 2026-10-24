import { useNavigate } from 'react-router';
import { SatelliteDish } from 'lucide-react';
import { EntityListPage } from '@/shared/ui/entity-list-page';
import { useEntityList } from '@/shared/lib/list';
import {
  CollarRow, collarLabel, getAllCollars, deleteCollar,
} from '@/entities/collar';
import { useCan } from '@/entities/viewer';

const removeCollar = (collar) => deleteCollar(collar.id);
const searchFields = (collar) => [collar.id, collar.code, collar.description];
const toSearchResult = (collar) => ({
  type: 'collar',
  id: collar.id,
  label: collarLabel(collar),
  description: collar.description || null,
});

export default function CollarsPage() {
  const navigate = useNavigate();
  const canWrite = useCan()('collars:write');

  const list = useEntityList({ load: getAllCollars, remove: removeCollar });

  return (
    <EntityListPage
      title="Collares"
      addLabel="Agregar collar"
      newPath={canWrite ? '/settings/collars/new' : null}
      list={list}
      search={{
        placeholder: 'Buscar collar...',
        fields: searchFields,
        toResult: toSearchResult,
        onSelect: canWrite ? (result) => navigate(`/settings/collars/${result.id}`) : undefined,
      }}
      labels={{
        error: 'No se pudieron cargar los collares.',
        empty: 'No hay collares registrados',
        emptyMessage: 'Los collares nuevos también se registran solos cuando transmiten por primera vez.',
      }}
      emptyIcon={SatelliteDish}
      renderItem={(collar) => (
        <CollarRow
          key={collar.id}
          collar={collar}
          editable={canWrite}
          onDelete={canWrite ? list.requestDelete : undefined}
        />
      )}
      deleteDialog={{
        title: 'Eliminar collar',
        message: (collar) => `¿Está seguro de eliminar el ${collarLabel(collar).toLowerCase()}?`,
      }}
    />
  );
}
