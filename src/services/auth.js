import apiClient from './apiClient';

const endpoint = '/auth';

export function login(credentials) {
  return apiClient(`${endpoint}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
}

export function logout() {
  return apiClient(`${endpoint}/logout`, {
    method: 'POST',
  });
}

export async function getCurrentUser() {
  const response = await apiClient(`${endpoint}/me`);
  return response.user;
}
