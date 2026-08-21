import apiClient from './apiClient';

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
