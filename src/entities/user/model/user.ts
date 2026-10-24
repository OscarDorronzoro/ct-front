import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  // See roles.js
  roles: z.array(z.string()),
});

export type User = z.infer<typeof UserSchema>;

export interface UserInput {
  username?: string;
  password?: string;
  roles?: string[];
}

// A device where the user is logged in
export const UserSessionSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  lastUsedAt: z.string(),
  createdIp: z.string().nullable(),
  lastIp: z.string().nullable(),
  userAgent: z.string().nullable(),
  // The session of the request (the admin's own device)
  current: z.boolean(),
});

export type UserSession = z.infer<typeof UserSessionSchema>;

export function userLabel(user: { id: number; username?: string | null }) {
  return user.username || `Usuario ${user.id}`;
}
