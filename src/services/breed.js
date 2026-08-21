import apiClient from './apiClient';

const endpoint = '/breeds';

export function getAllBreeds() {
  return apiClient(endpoint);
}

export function getBreed(breedId) {
  return apiClient(`${endpoint}/${breedId}`);
}
