import { z } from 'zod';
import { apiClient, jsonBody } from '@/shared/api';
import { GroupSchema, type GroupInput } from '../model/group';

const endpoint = '/groups';

export function getAllGroups() {
  return apiClient(endpoint, { schema: z.array(GroupSchema) });
}

export function getGroup(groupId: number | string) {
  return apiClient(`${endpoint}/${groupId}`, { schema: GroupSchema });
}

export async function createGroup(group: GroupInput) {
  await apiClient(endpoint, jsonBody('POST', group));
}

export async function updateGroup(groupId: number | string, group: GroupInput) {
  await apiClient(`${endpoint}/${groupId}`, jsonBody('PUT', group));
}

export async function deleteGroup(groupId: number) {
  await apiClient(`${endpoint}/${groupId}`, { method: 'DELETE' });
}
