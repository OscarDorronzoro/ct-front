import { LandPlot } from 'lucide-react';
import { EntityRow } from '@/shared/ui/list';
import { Badge } from '@/shared/ui/badge';
import { formatArea, ringAreaM2 } from '@/shared/lib/geo';
import { zoneTypeStyle, COLLAR_ZONE_MAX_VERTICES } from '@/utils/zoneStyles';

// editable: opens the form; onDelete: only when the user can delete
export default function ZoneRow({ zone, typeName, editable = true, onDelete }) {
  const { color, label } = zoneTypeStyle(typeName);

  return (
    <EntityRow
      avatar={<LandPlot size={22} color={color} />}
      title={zone.name}
      meta={[
        label,
        formatArea(ringAreaM2(zone.ring)),
        `${zone.ring.length} vértices`,
      ]}
      tags={zone.ring.length > COLLAR_ZONE_MAX_VERTICES && (
        <Badge tone="warning">No se puede cargar en un collar</Badge>
      )}
      to={editable ? `/settings/zones/${zone.id}` : undefined}
      entityLabel="zona"
      onDelete={onDelete && (() => onDelete(zone))}
    />
  );
}
