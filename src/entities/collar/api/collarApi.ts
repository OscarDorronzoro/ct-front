import { z } from 'zod';
import { apiClient, jsonBody } from '@/shared/api';
import { CollarSchema, type CollarInput } from '../model/collar';

const endpoint = '/collars';

export function getAllCollars() {
  return apiClient(endpoint, { schema: z.array(CollarSchema) });
}

export function getCollar(collarId: number | string) {
  return apiClient(`${endpoint}/${collarId}`, { schema: CollarSchema });
}

export async function createCollar(collar: CollarInput) {
  await apiClient(endpoint, jsonBody('POST', collar));
}

export async function updateCollar(collarId: number | string, collar: CollarInput) {
  await apiClient(`${endpoint}/${collarId}`, jsonBody('PUT', collar));
}

export async function deleteCollar(collarId: number) {
  await apiClient(`${endpoint}/${collarId}`, { method: 'DELETE' });
}
