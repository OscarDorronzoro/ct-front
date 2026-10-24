import { z } from 'zod';
import { apiClient } from '@/shared/api';
import { normalizeSearchText } from '@/shared/lib/text';
import { SearchResultSchema } from '../model/searchResult';

export async function searchEntities(query: string) {
  const q = normalizeSearchText(query);
  if (!q) {
    return [];
  }

  const { results } = await apiClient(`/search?${new URLSearchParams({ q })}`, {
    schema: z.object({ results: z.array(SearchResultSchema) }),
  });

  return results;
}
