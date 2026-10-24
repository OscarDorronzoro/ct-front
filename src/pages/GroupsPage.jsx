import { useNavigate } from 'react-router';
import { Plus, Users } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Button, Fab } from '@/shared/ui/button';
import { EntityList } from '@/shared/ui/list';
import { Toolbar } from '@/shared/ui/toolbar';
import SearchBox from '@/components/search/SearchBox';
import { ActionError } from '@/shared/ui/alert';
import { ConfirmDialog } from '@/shared/ui/dialog';
import GroupRow from '@/components/groups/GroupRow';

import { useEntityList, useListSearch } from '@/shared/lib/list';
import useCan from '@/hooks/useCan';
import { groupLabel } from '@/utils/labels';

import { getAllGroups, deleteGroup } from '@/services/group';

const NEW_PATH = '/settings/groups/new';

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
  const can = useCan();
  const canWrite = can('cows:write');
  const canEdit = canWrite;

  const list = useEntityList({ load: getAllGroups, remove: removeGroup });
  const { search, setSearch, results } = useListSearch(list.items, {
    fields: searchFields,
    toResult: toSearchResult,
  });

  const item = list.itemToDelete;

  return (
    <Page
      title="Grupos"
      hideHeaderOnMobile
      actions={canWrite && (
        <Button icon={Plus} to={NEW_PATH}>
          Agregar grupo
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
          placeholder="Buscar grupo..."
          results={results}
          onSelect={canEdit ? (result) => navigate(`/settings/groups/${result.id}`) : undefined}
        />
      </Toolbar>

      <EntityList
        items={list.items}
        loading={list.loading}
        error={list.loadError}
        onRetry={list.reload}
        labels={{
          error: 'No se pudieron cargar los grupos.',
          empty: 'No hay grupos registrados',
        }}
        emptyIcon={Users}
        renderItem={(group) => (
          <GroupRow
            key={group.id}
            group={group}
            editable={canEdit}
            onDelete={canWrite ? list.requestDelete : undefined}
          />
        )}
      />

      {canWrite && <Fab icon={Plus} label="Agregar grupo" to={NEW_PATH} />}

      <ConfirmDialog
        open={!!item}
        title="Eliminar grupo"
        message={item ? `¿Está seguro de eliminar el grupo "${groupLabel(item)}"?` : ''}
        confirmLabel="Eliminar"
        danger
        onConfirm={list.confirmDelete}
        onCancel={list.cancelDelete}
      />
    </Page>
  );
}
