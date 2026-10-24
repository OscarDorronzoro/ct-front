import { SatelliteDish } from 'lucide-react';
import { EntityRow } from '@/shared/ui/list';
import { Badge } from '@/shared/ui/badge';
import { collarLabel } from '@/utils/labels';

// editable: opens the form; onDelete: only when the user can delete
export default function CollarRow({ collar, editable = true, onDelete }) {
  return (
    <EntityRow
      avatar={<SatelliteDish size={22} />}
      title={collarLabel(collar)}
      meta={[collar.description]}
      tags={
        <Badge tone={collar.firmwareVersion ? 'primary' : 'neutral'}>
          {collar.firmwareVersion ? `Firmware ${collar.firmwareVersion}` : 'Firmware desconocido'}
        </Badge>
      }
      to={editable ? `/settings/collars/${collar.id}` : undefined}
      entityLabel="collar"
      onDelete={onDelete && (() => onDelete(collar))}
    />
  );
}
