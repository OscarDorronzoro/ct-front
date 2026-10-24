import { apiClient } from '@/shared/api';
import { normalizeSearchText } from '@/shared/lib/text';

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
