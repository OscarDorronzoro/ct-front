import { apiClient, jsonBody } from '@/shared/api';
import { CowHealthSchema, type HealthEventInput } from '../model/healthEvent';

const endpoint = '/health';

export function getCowHealth(cowId: number | string) {
  return apiClient(`${endpoint}/cows/${cowId}`, { schema: CowHealthSchema });
}

export async function recordEvent(cowId: number | string, event: HealthEventInput) {
  await apiClient(`${endpoint}/cows/${cowId}/events`, jsonBody('POST', event));
}

export async function voidEvent(eventId: number, reason: string) {
  await apiClient(`${endpoint}/events/${eventId}/void`, jsonBody('POST', { reason }));
}
