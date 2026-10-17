import { Users } from 'lucide-react';

import EntityRow from '../ui/EntityRow';
import { groupLabel } from '../../utils/labels';

export default function GroupRow({ group, onDelete }) {
  return (
    <EntityRow
      avatar={<Users size={22} />}
      title={groupLabel(group)}
      meta={[group.description]}
      to={`/settings/groups/${group.id}`}
      entityLabel="grupo"
      onDelete={() => onDelete(group)}
    />
  );
}
