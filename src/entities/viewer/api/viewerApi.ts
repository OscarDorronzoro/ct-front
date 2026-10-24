import { z } from 'zod';
import { apiClient, jsonBody } from '@/shared/api';
import { ViewerSchema, type Credentials } from '../model/viewer';

const endpoint = '/auth';

// Sets the session cookies
export async function login(credentials: Credentials) {
  await apiClient(`${endpoint}/login`, jsonBody('POST', credentials));
}

export async function logout() {
  await apiClient(`${endpoint}/logout`, { method: 'POST' });
}

export async function getCurrentUser() {
  const { user } = await apiClient(`${endpoint}/me`, { schema: z.object({ user: ViewerSchema }) });
  return user;
}
