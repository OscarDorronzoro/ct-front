import apiClient from './apiClient';

const endpoint = '/collars';

export function getAllCollars() {
  return apiClient(endpoint);
}

export function getCollar(collarId) {
  return apiClient(`${endpoint}/${collarId}`);
}

export function createCollar(collar) {
   return apiClient(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collar),
    });
}

export function updateCollar(id, collar) {
  return apiClient(`${endpoint}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(collar),
  });
}

export function deleteCollar(collarId) {
  return apiClient(`${endpoint}/${collarId}`, {
    method: 'DELETE',
  })
}
