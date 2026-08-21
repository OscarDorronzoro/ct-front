import apiClient from './apiClient';

const endpoint = '/groups';

export function getAllGroups() {
  return apiClient(endpoint);
}

export function getGroup(groupId) {
  return apiClient(`${endpoint}/${groupId}`);
}

export function createGroup(group) {
   return apiClient(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(group),
    });
}

export function updateGroup(id, group) {
  return apiClient(`${endpoint}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(group),
  });
}

export function deleteGroup(groupId) {
  return apiClient(`${endpoint}/${groupId}`, {
    method: 'DELETE',
  })
}
