import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { CowIcon } from '@/shared/ui/icons';
import { Page } from '@/shared/ui/page';
import { Button, Fab } from '@/shared/ui/button';
import { EntityList } from '@/shared/ui/list';
import { Toolbar } from '@/shared/ui/toolbar';
import { SearchBox } from '@/shared/ui/search-box';
import { ActionError } from '@/shared/ui/alert';
import { ConfirmDialog } from '@/shared/ui/dialog';
import {
  CowRow, cowLabel, getAllCows, deleteCow,
} from '@/entities/cow';
import { useCan } from '@/entities/viewer';
import { useEntityList, useListSearch } from '@/shared/lib/list';

const NEW_PATH = '/settings/cows/new';

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
  const { search, setSearch, results } = useListSearch(list.items, {
    fields: searchFields,
    toResult: toSearchResult,
  });

  const item = list.itemToDelete;

  return (
    <Page
      title="Vacas"
      hideHeaderOnMobile
      actions={canWrite && (
        <Button icon={Plus} to={NEW_PATH}>
          Agregar vaca
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
          placeholder="Buscar vaca..."
          results={results}
          onSelect={(result) => navigate(`/settings/cows/${result.id}`)}
        />
      </Toolbar>

      <EntityList
        items={list.items}
        loading={list.loading}
        error={list.loadError}
        onRetry={list.reload}
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
      />

      {canWrite && <Fab icon={Plus} label="Agregar vaca" to={NEW_PATH} />}

      <ConfirmDialog
        open={!!item}
        title="Eliminar vaca"
        message={item ? `¿Está seguro de eliminar la vaca "${cowLabel(item)}"?` : ''}
        confirmLabel="Eliminar"
        danger
        onConfirm={list.confirmDelete}
        onCancel={list.cancelDelete}
      />
    </Page>
  );
}
