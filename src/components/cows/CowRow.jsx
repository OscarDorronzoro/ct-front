import EntityRow from '../ui/EntityRow';
import Badge from '../ui/Badge';
import CowIcon from '../icons/CowIcon';
import { cowLabel } from '../../utils/labels';

export default function CowRow({ cow, onDelete }) {
  return (
    <EntityRow
      avatar={cow.imageUrl
        ? { src: cow.imageUrl, fallback: <CowIcon size={26} /> }
        : <CowIcon size={26} />}
      title={cowLabel(cow)}
      meta={[
        `Caravana ${cow.earTag || 'S/N'}`,
        cow.currentCollarId ? `Collar ${cow.currentCollarId}` : 'Sin collar',
        cow.category?.name,
        cow.breed?.name,
      ]}
      tags={cow.groups?.length > 0 && cow.groups.map(group => (
        <Badge key={group.id} tone="accent">{group.name}</Badge>
      ))}
      to={`/settings/cows/${cow.id}`}
      entityLabel="vaca"
      onDelete={() => onDelete(cow)}
    />
  );
}
