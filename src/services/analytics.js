import { apiClient } from '@/shared/api';

const endpoint = '/analytics';

// Datasets the user can query, with their measures and dimensions
export function getCatalog() {
  return apiClient(`${endpoint}/catalog`);
}

// { columns, rows, truncated } (see the backend docs)
export function runQuery(query) {
  return apiClient(`${endpoint}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
}

// [{ value, label }] of a dimension in the range, for the filters
export function getDimensionValues({ dataset, dimension, dateFrom, dateTo }) {
  const params = new URLSearchParams({ dataset, dimension, dateFrom, dateTo });
  return apiClient(`${endpoint}/values?${params}`);
}
