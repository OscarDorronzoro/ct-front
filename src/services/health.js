import { apiClient } from '@/shared/api';

const endpoint = '/health';

const json = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// { summary: { withdrawal, lastWeight, nextDoses }, events: [...] }, most recent first
export function getCowHealth(cowId) {
  return apiClient(`${endpoint}/cows/${cowId}`);
}

export function recordEvent(cowId, event) {
  return apiClient(`${endpoint}/cows/${cowId}/events`, json('POST', event));
}

export function voidEvent(eventId, reason) {
  return apiClient(`${endpoint}/events/${eventId}/void`, json('POST', { reason }));
}

// active: only the ones that can be used in new events
export function getProducts({ active } = {}) {
  return apiClient(`${endpoint}/products${active ? '?active=true' : ''}`);
}

export function getProduct(productId) {
  return apiClient(`${endpoint}/products/${productId}`);
}

export function createProduct(product) {
  return apiClient(`${endpoint}/products`, json('POST', product));
}

export function updateProduct(productId, product) {
  return apiClient(`${endpoint}/products/${productId}`, json('PUT', product));
}
