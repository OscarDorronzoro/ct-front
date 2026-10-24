import { useNavigate } from 'react-router';
import { Plus, SatelliteDish } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Button, Fab } from '@/shared/ui/button';
import { EntityList } from '@/shared/ui/list';
import { Toolbar } from '@/shared/ui/toolbar';
import { SearchBox } from '@/shared/ui/search-box';
import { ActionError } from '@/shared/ui/alert';
import { ConfirmDialog } from '@/shared/ui/dialog';
import {
  CollarRow, collarLabel, getAllCollars, deleteCollar,
} from '@/entities/collar';
import { useCan } from '@/entities/viewer';

import { useEntityList, useListSearch } from '@/shared/lib/list';


const NEW_PATH = '/settings/collars/new';

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
  const can = useCan();
  const canWrite = can('collars:write');
  const canEdit = canWrite;

  const list = useEntityList({ load: getAllCollars, remove: removeCollar });
  const { search, setSearch, results } = useListSearch(list.items, {
    fields: searchFields,
    toResult: toSearchResult,
  });

  const item = list.itemToDelete;

  return (
    <Page
      title="Collares"
      hideHeaderOnMobile
      actions={canWrite && (
        <Button icon={Plus} to={NEW_PATH}>
          Agregar collar
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
          placeholder="Buscar collar..."
          results={results}
          onSelect={canEdit ? (result) => navigate(`/settings/collars/${result.id}`) : undefined}
        />
      </Toolbar>

      <EntityList
        items={list.items}
        loading={list.loading}
        error={list.loadError}
        onRetry={list.reload}
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
            editable={canEdit}
            onDelete={canWrite ? list.requestDelete : undefined}
          />
        )}
      />

      {canWrite && <Fab icon={Plus} label="Agregar collar" to={NEW_PATH} />}

      <ConfirmDialog
        open={!!item}
        title="Eliminar collar"
        message={item ? `¿Está seguro de eliminar el ${collarLabel(item).toLowerCase()}?` : ''}
        confirmLabel="Eliminar"
        danger
        onConfirm={list.confirmDelete}
        onCancel={list.cancelDelete}
      />
    </Page>
  );
}
