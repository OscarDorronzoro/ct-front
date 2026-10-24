import { z } from 'zod';
import { apiClient } from '@/shared/api';
import { CategorySchema } from '../model/category';

const endpoint = '/categories';

// In order of the life of the animal for each sex
export function getAllCategories() {
  return apiClient(endpoint, { schema: z.array(CategorySchema) });
}
