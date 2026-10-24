import { apiClient } from '@/shared/api';

const endpoint = '/users';

export function getAllUsers() {
  return apiClient(endpoint);
}

export function getUser(userId) {
  return apiClient(`${endpoint}/${userId}`);
}

export function createUser(user) {
   return apiClient(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
}

export function updateUser(id, user) {
  return apiClient(`${endpoint}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
}

export function deleteUser(userId) {
  return apiClient(`${endpoint}/${userId}`, {
    method: 'DELETE',
  })
}

// Active sessions (devices) of a user, and revoking them (admin)
export function getUserSessions(userId) {
  return apiClient(`${endpoint}/${userId}/sessions`);
}

export function revokeUserSession(userId, sessionId) {
  return apiClient(`${endpoint}/${userId}/sessions/${sessionId}`, {
    method: 'DELETE',
  });
}

// All but the caller's own session
export function revokeAllUserSessions(userId) {
  return apiClient(`${endpoint}/${userId}/sessions`, {
    method: 'DELETE',
  });
}
