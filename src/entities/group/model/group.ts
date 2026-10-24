import { z } from 'zod';

export const GroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
});

export type Group = z.infer<typeof GroupSchema>;

export interface GroupInput {
  name?: string;
  description?: string;
}

export function groupLabel(group: Pick<Group, 'id' | 'name'>) {
  return group.name || `Grupo ${group.id}`;
}
