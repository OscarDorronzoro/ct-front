import { Users } from 'lucide-react';
import { EntityRow } from '@/shared/ui/list';
import { groupLabel } from '../model/group';

// editable: opens the form; onDelete: only when the user can delete
export default function GroupRow({ group, editable = true, onDelete }) {
  return (
    <EntityRow
      avatar={<Users size={22} />}
      title={groupLabel(group)}
      meta={[group.description]}
      to={editable ? `/settings/groups/${group.id}` : undefined}
      entityLabel="grupo"
      onDelete={onDelete && (() => onDelete(group))}
    />
  );
}
