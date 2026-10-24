import { z } from 'zod';
import { apiClient, jsonBody } from '@/shared/api';
import { UserSchema, UserSessionSchema, type UserInput } from '../model/user';

const endpoint = '/users';

export function getAllUsers() {
  return apiClient(endpoint, { schema: z.array(UserSchema) });
}

export function getUser(userId: number | string) {
  return apiClient(`${endpoint}/${userId}`, { schema: UserSchema });
}

export async function createUser(user: UserInput) {
  await apiClient(endpoint, jsonBody('POST', user));
}

export async function updateUser(userId: number | string, user: UserInput) {
  await apiClient(`${endpoint}/${userId}`, jsonBody('PUT', user));
}

export async function deleteUser(userId: number) {
  await apiClient(`${endpoint}/${userId}`, { method: 'DELETE' });
}

// Active sessions (devices) of a user, and revoking them (admin)
export function getUserSessions(userId: number | string) {
  return apiClient(`${endpoint}/${userId}/sessions`, { schema: z.array(UserSessionSchema) });
}

export async function revokeUserSession(userId: number | string, sessionId: string) {
  await apiClient(`${endpoint}/${userId}/sessions/${sessionId}`, { method: 'DELETE' });
}

// All but the caller's own session
export async function revokeAllUserSessions(userId: number | string) {
  await apiClient(`${endpoint}/${userId}/sessions`, { method: 'DELETE' });
}
