import { z } from 'zod';

export const CollarSchema = z.object({
  id: z.number(),
  // Number the collar transmits (1-255)
  code: z.number(),
  mac: z.string().nullable(),
  firmwareVersion: z.string().nullable(),
  // Configuration of the collar (thresholds, intervals...): see the backend collarParams
  params: z.record(z.string(), z.unknown()).nullable(),
  description: z.string().nullable(),
});

export type Collar = z.infer<typeof CollarSchema>;

export interface CollarInput {
  code?: number | string;
  mac?: string;
  firmwareVersion?: string;
  description?: string;
}

export function collarLabel(collar: { id: number; code?: number | null }) {
  return `Collar ${collar.code ?? collar.id}`;
}
