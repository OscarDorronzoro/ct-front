import { Cpu } from 'lucide-react';
import { EntityRow } from '@/shared/ui/list';
import { Badge } from '@/shared/ui/badge';
import { formatDay } from '@/shared/lib/date';
import { firmwareLabel, firmwareSizeLabel } from '../model/firmware';

// latest: the one sent when an update doesn't name a version
export default function FirmwareRow({ firmware, latest = false, onDelete }) {
  return (
    <EntityRow
      avatar={<Cpu size={22} />}
      title={firmwareLabel(firmware)}
      meta={[
        `Código ${firmware.code}`,
        firmwareSizeLabel(firmware),
        formatDay(firmware.createdAt),
        firmware.notes,
      ]}
      tags={latest && <Badge tone="primary">Último</Badge>}
      entityLabel="firmware"
      onDelete={onDelete && (() => onDelete(firmware))}
    />
  );
}
