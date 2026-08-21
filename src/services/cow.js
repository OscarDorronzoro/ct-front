import apiClient from './apiClient';

const endpoint = '/cows';

export function getCow(cowId) {
  return apiClient(`${endpoint}/${cowId}`);
}

export function getAllCows() {
  return apiClient(endpoint);
}

export function createCow(formData) {
   return apiClient(endpoint, {
      method: 'POST',
      body: formData,
    });
}

export function updateCow(id, formData) {
   return apiClient(`${endpoint}/${id}`, {
      method: 'PUT',
      body: formData,
    });
}

export function deleteCow(id) {
  return apiClient(`${endpoint}/${id}`, {
    method: 'DELETE',
  });
}
