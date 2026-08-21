import apiClient from './apiClient';
import { normalizeSearchText } from '../utils/search';

export async function search(query) {
  const q = normalizeSearchText(query);
  if (!q) {
    return [];
  }

  const params = new URLSearchParams({
    q,
  });

  const response = await apiClient(`/search?${params}`);

  return response.results;
}
