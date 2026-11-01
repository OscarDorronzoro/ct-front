import { z } from 'zod';
import { formatNumber } from '@/shared/lib/format';

export const FirmwareSchema = z.object({
  id: z.number(),
  // Number compiled in the firmware (1-255): the collar reports it, and the highest is the newest
  code: z.number(),
  version: z.string(),
  size: z.number(),
  notes: z.string().nullable(),
  createdAt: z.string(),
});

export type Firmware = z.infer<typeof FirmwareSchema>;

export interface FirmwareInput {
  file: File;
  code: number | string;
  version: string;
  notes?: string;
}

// Limit of the backend (firmwareUpload.middleware)
export const FIRMWARE_MAX_SIZE = 4 * 1024 * 1024;

export function firmwareLabel(firmware: { version: string }) {
  return `Firmware ${firmware.version}`;
}

// 1,25 MB
export function firmwareSizeLabel(firmware: { size: number }) {
  return `${formatNumber(firmware.size / (1024 * 1024))} MB`;
}
