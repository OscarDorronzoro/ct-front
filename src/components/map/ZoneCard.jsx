import { LandPlot, Pencil } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import useCan from '@/hooks/useCan';
import MapSheet from './MapSheet';
import { formatArea, ringAreaM2 } from '@/shared/lib/geo';
import { zoneTypeStyle } from '@/utils/zoneStyles';

export default function ZoneCard({ zone, typeName, onClose }) {
  const { color, label } = zoneTypeStyle(typeName);
  const canEdit = useCan()('zones:write');

  return (
    <MapSheet
      avatar={<LandPlot size={22} color={color} />}
      title={zone.name}
      subtitle={`${label}\u00A0· ${formatArea(ringAreaM2(zone.ring))}`}
      onClose={onClose}
      actions={canEdit && (
        <Button variant="secondary" icon={Pencil} to={`/settings/zones/${zone.id}`}>
          Editar zona
        </Button>
      )}
    />
  );
}
