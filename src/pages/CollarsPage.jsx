import { useNavigate } from 'react-router';
import { Plus, SatelliteDish } from 'lucide-react';

import Page from '../components/ui/Page';
import Button from '../components/ui/Button';
import Fab from '../components/ui/Fab';
import EntityList from '../components/ui/EntityList';
import Toolbar from '../components/utils/Toolbar';
import SearchBox from '../components/search/SearchBox';
import ActionError from '../components/utils/ActionError';
import ConfirmDialog from '../components/utils/ConfirmDialog';
import CollarRow from '../components/collars/CollarRow';

import useEntityList from '../hooks/useEntityList';
import { collarLabel } from '../utils/labels';
import useListSearch from '../hooks/useListSearch';
import { getAllCollars, deleteCollar } from '../services/collar';

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
      actions={
        <Button icon={Plus} to={NEW_PATH}>
          Agregar collar
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
          placeholder="Buscar collar..."
          results={results}
          onSelect={(result) => navigate(`/settings/collars/${result.id}`)}
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
            onDelete={list.requestDelete}
          />
        )}
      />

      <Fab icon={Plus} label="Agregar collar" to={NEW_PATH} />

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
