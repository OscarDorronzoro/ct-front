import { z } from 'zod';
import { apiClient } from '@/shared/api';
import { FirmwareSchema, type FirmwareInput } from '../model/firmware';

const endpoint = '/firmwares';

export function getAllFirmwares() {
  return apiClient(endpoint, { schema: z.array(FirmwareSchema) });
}

export async function createFirmware({
  file, code, version, notes,
}: FirmwareInput) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('code', String(code));
  formData.append('version', version);

  if (notes) {
    formData.append('notes', notes);
  }

  await apiClient(endpoint, { method: 'POST', body: formData });
}

export async function deleteFirmware(firmwareId: number) {
  await apiClient(`${endpoint}/${firmwareId}`, { method: 'DELETE' });
}
