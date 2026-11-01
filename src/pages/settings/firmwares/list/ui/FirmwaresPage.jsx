import { Cpu } from 'lucide-react';
import { EntityListPage } from '@/shared/ui/entity-list-page';
import { useEntityList } from '@/shared/lib/list';
import {
  FirmwareRow, firmwareLabel, getAllFirmwares, deleteFirmware,
} from '@/entities/firmware-version';

const removeFirmware = (firmware) => deleteFirmware(firmware.id);
const searchFields = (firmware) => [firmware.version, firmware.code, firmware.notes];
const toSearchResult = (firmware) => ({
  type: 'firmware',
  id: firmware.id,
  label: firmwareLabel(firmware),
  description: firmware.notes,
});

export default function FirmwaresPage() {
  const list = useEntityList({ load: getAllFirmwares, remove: removeFirmware });

  return (
    <EntityListPage
      title="Firmware"
      addLabel="Subir firmware"
      newPath="/settings/firmwares/new"
      list={list}
      search={{
        placeholder: 'Buscar firmware...',
        fields: searchFields,
        toResult: toSearchResult,
      }}
      labels={{
        error: 'No se pudieron cargar los firmwares.',
        empty: 'No hay firmwares',
        emptyMessage: 'Suba un firmware para poder actualizar los collares.',
      }}
      emptyIcon={Cpu}
      // From the newest to the oldest: the first one is the latest
      renderItem={(firmware, index) => (
        <FirmwareRow
          key={firmware.id}
          firmware={firmware}
          latest={index === 0}
          onDelete={list.requestDelete}
        />
      )}
      deleteDialog={{
        title: 'Eliminar firmware',
        message: (firmware) => `¿Está seguro de eliminar el ${firmwareLabel(firmware).toLowerCase()}? `
          + 'Su código y su versión no podrán volver a usarse.',
      }}
    />
  );
}
