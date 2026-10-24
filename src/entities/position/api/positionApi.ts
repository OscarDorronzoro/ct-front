import { z } from 'zod';
import { apiClient } from '@/shared/api';
import { PositionSchema, DistanceSchema, PositionDetailsSchema } from '../model/position';

const endpoint = '/positions';

interface Range {
  // ISO dates
  dateFrom: string;
  dateTo: string;
}

export function getPositions({ dateFrom, dateTo }: Range) {
  const params = new URLSearchParams({ dateFrom, dateTo });
  return apiClient(`${endpoint}?${params}`, { schema: z.array(PositionSchema) });
}

// Latest position of each active collar (backend default: last 72 h)
export function getLatestPositions({ maxAgeHours }: { maxAgeHours?: number } = {}) {
  const query = maxAgeHours ? `?${new URLSearchParams({ maxAgeHours: String(maxAgeHours) })}` : '';
  return apiClient(`${endpoint}/latest${query}`, { schema: z.array(PositionSchema) });
}

// Distance traveled per collar in a range
export function getDistances({ dateFrom, dateTo, collarId }: Range & { collarId?: number }) {
  const params = new URLSearchParams({ dateFrom, dateTo });
  if (collarId) {
    params.append('collarId', String(collarId));
  }

  return apiClient(`${endpoint}/distance?${params}`, { schema: z.array(DistanceSchema) });
}

export function getPositionDetails(positionId: number) {
  return apiClient(`${endpoint}/${positionId}`, { schema: PositionDetailsSchema });
}
