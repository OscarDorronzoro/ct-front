import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  sex: z.enum(['female', 'male']),
});

export type Category = z.infer<typeof CategorySchema>;
