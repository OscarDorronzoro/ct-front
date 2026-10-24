import { z } from 'zod';

export const BreedSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type Breed = z.infer<typeof BreedSchema>;
