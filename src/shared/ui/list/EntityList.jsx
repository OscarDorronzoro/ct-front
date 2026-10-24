import { Card } from '@/shared/ui/card';
import { SkeletonRows, EmptyState, ErrorState } from './ListState';

// List of rows with its loading, error and empty states.
// labels: { error, empty, emptyMessage }. emptyIcon / emptyAction: optional.
export default function EntityList({
  items,
  loading,
  error,
  onRetry,
  labels,
  emptyIcon,
  emptyAction,
  renderItem,
}) {
  let content;

  if (loading) {
    content = <SkeletonRows />;
  } else if (error) {
    content = <ErrorState title={labels.error} error={error} onRetry={onRetry} />;
  } else if (!items?.length) {
    content = (
      <EmptyState
        icon={emptyIcon}
        title={labels.empty}
        message={labels.emptyMessage}
        action={emptyAction}
      />
    );
  } else {
    content = items.map(renderItem);
  }

  return <Card>{content}</Card>;
}
