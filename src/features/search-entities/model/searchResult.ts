import { z } from 'zod';

// A cow or collar that matches the search (only the kinds the user can read)
export const SearchResultSchema = z.object({
  type: z.string(),
  id: z.number(),
  label: z.string(),
  description: z.string().nullable(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;
