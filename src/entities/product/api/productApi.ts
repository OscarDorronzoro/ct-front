import { z } from 'zod';
import { apiClient, jsonBody } from '@/shared/api';
import { ProductSchema, type ProductInput } from '../model/product';

const endpoint = '/health/products';

// active: only the ones that can be used in new events
export function getProducts({ active }: { active?: boolean } = {}) {
  return apiClient(`${endpoint}${active ? '?active=true' : ''}`, { schema: z.array(ProductSchema) });
}

export function getProduct(productId: number | string) {
  return apiClient(`${endpoint}/${productId}`, { schema: ProductSchema });
}

export async function createProduct(product: ProductInput) {
  await apiClient(endpoint, jsonBody('POST', product));
}

export async function updateProduct(productId: number | string, product: ProductInput) {
  await apiClient(`${endpoint}/${productId}`, jsonBody('PUT', product));
}
