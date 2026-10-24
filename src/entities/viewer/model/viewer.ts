import { z } from 'zod';

// The logged user, with the permissions of their roles
export const ViewerSchema = z.object({
  id: z.number(),
  username: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});

export type Viewer = z.infer<typeof ViewerSchema>;

export interface Credentials {
  username: string;
  password: string;
}
