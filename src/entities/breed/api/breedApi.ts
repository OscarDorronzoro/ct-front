import { z } from 'zod';
import { apiClient } from '@/shared/api';
import { BreedSchema } from '../model/breed';

const endpoint = '/breeds';

export function getAllBreeds() {
  return apiClient(endpoint, { schema: z.array(BreedSchema) });
}
