import apiClient from './apiClient';

const endpoint = '/categories';

// [{ id, name, sex }], in order of the life of the animal for each sex
export function getAllCategories() {
  return apiClient(endpoint);
}
