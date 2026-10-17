import { SatelliteDish } from 'lucide-react';

import EntityRow from '../ui/EntityRow';
import Badge from '../ui/Badge';
import { collarLabel } from '../../utils/labels';

export default function CollarRow({ collar, onDelete }) {
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
      to={`/settings/collars/${collar.id}`}
      entityLabel="collar"
      onDelete={() => onDelete(collar)}
    />
  );
}
