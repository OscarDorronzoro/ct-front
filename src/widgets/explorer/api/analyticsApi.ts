import { z } from 'zod';
import { apiClient, jsonBody } from '@/shared/api';
import {
  DatasetSchema, DimensionValueSchema, QueryResultSchema, type Query,
} from '../model/analytics';

const endpoint = '/analytics';

// Datasets the user can query, with their measures and dimensions
export function getCatalog() {
  return apiClient(`${endpoint}/catalog`, { schema: z.array(DatasetSchema) });
}

export function runQuery(query: Query) {
  return apiClient(`${endpoint}/query`, { ...jsonBody('POST', query), schema: QueryResultSchema });
}

// Values of a dimension in the range, for the filters
export function getDimensionValues({
  dataset, dimension, dateFrom, dateTo,
}: { dataset: string; dimension: string; dateFrom: string; dateTo: string }) {
  const params = new URLSearchParams({
    dataset, dimension, dateFrom, dateTo,
  });
  return apiClient(`${endpoint}/values?${params}`, { schema: z.array(DimensionValueSchema) });
}
