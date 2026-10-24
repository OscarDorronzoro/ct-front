import { Plus } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Button, Fab } from '@/shared/ui/button';
import { EntityList } from '@/shared/ui/list';
import { Toolbar } from '@/shared/ui/toolbar';
import { SearchBox } from '@/shared/ui/search-box';
import { ActionError } from '@/shared/ui/alert';
import { ConfirmDialog } from '@/shared/ui/dialog';
import { useListSearch } from '@/shared/lib/list';
import styles from './EntityListPage.module.css';

// Settings section with the list of an entity: add button (and FAB on phones), search, list and
// delete with confirmation.
// - list: the result of useEntityList (the page keeps it: it may use the items, like the zones map)
// - addLabel, newPath: the add buttons, only with a newPath (who can create)
// - search: { placeholder, fields, toResult, onSelect } (see useListSearch; fields and toResult
//   must keep their identity: module functions)
// - labels, emptyIcon, emptyAction, renderItem: of EntityList
// - deleteDialog: { title, message(item) }, for the lists that delete
// - aside: shown beside the list on wide screens and above it on phones (a map)
export default function EntityListPage({
  title,
  addLabel,
  newPath,
  list,
  search,
  labels,
  emptyIcon,
  emptyAction,
  renderItem,
  deleteDialog,
  aside,
}) {
  const { search: query, setSearch, results } = useListSearch(list.items, search);
  const item = list.itemToDelete;

  const content = (
    <>
      <ActionError error={list.actionError} onClose={list.clearActionError} />

      <Toolbar>
        <SearchBox
          value={query}
          onChange={setSearch}
          placeholder={search.placeholder}
          results={results}
          onSelect={search.onSelect}
        />
      </Toolbar>

      <EntityList
        items={list.items}
        loading={list.loading}
        error={list.loadError}
        onRetry={list.reload}
        labels={labels}
        emptyIcon={emptyIcon}
        emptyAction={emptyAction}
        renderItem={renderItem}
      />
    </>
  );

  return (
    <Page
      title={title}
      hideHeaderOnMobile
      width={aside ? 'full' : 'default'}
      actions={newPath && <Button icon={Plus} to={newPath}>{addLabel}</Button>}
    >
      {aside ? (
        <div className={styles.layout}>
          <div className={styles.aside}>{aside}</div>
          <div className={styles.list}>{content}</div>
        </div>
      ) : content}

      {newPath && <Fab icon={Plus} label={addLabel} to={newPath} />}

      {deleteDialog && (
        <ConfirmDialog
          open={Boolean(item)}
          title={deleteDialog.title}
          message={item ? deleteDialog.message(item) : ''}
          confirmLabel="Eliminar"
          danger
          onConfirm={list.confirmDelete}
          onCancel={list.cancelDelete}
        />
      )}
    </Page>
  );
}
