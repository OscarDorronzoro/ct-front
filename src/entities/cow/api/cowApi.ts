import { z } from 'zod';
import { apiClient } from '@/shared/api';
import { CowSchema, CowDetailSchema } from '../model/cow';

const endpoint = '/cows';

export function getAllCows() {
  return apiClient(endpoint, { schema: z.array(CowSchema) });
}

export function getCow(cowId: number | string) {
  return apiClient(`${endpoint}/${cowId}`, { schema: CowDetailSchema });
}

// FormData: the image goes with the data (see the backend cowBody)
export async function createCow(formData: FormData) {
  await apiClient(endpoint, { method: 'POST', body: formData });
}

export async function updateCow(cowId: number | string, formData: FormData) {
  await apiClient(`${endpoint}/${cowId}`, { method: 'PUT', body: formData });
}

export async function deleteCow(cowId: number) {
  await apiClient(`${endpoint}/${cowId}`, { method: 'DELETE' });
}
