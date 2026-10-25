import { z } from 'zod';
import { apiClient, jsonBody } from '@/shared/api';

const endpoint = '/notifications/push';

// Key of the server to subscribe the browser; null if the server has no push configured
export async function getPushKey() {
  const { publicKey } = await apiClient(`${endpoint}/key`, {
    schema: z.object({ publicKey: z.string().nullable() }),
  });
  return publicKey;
}

// Whether the server sends to this device in this session
export async function isSubscriptionActive(subscriptionEndpoint: string) {
  const params = new URLSearchParams({ endpoint: subscriptionEndpoint });
  const { active } = await apiClient(`${endpoint}/subscription?${params}`, {
    schema: z.object({ active: z.boolean() }),
  });
  return active;
}

// PushSubscription.toJSON() of the browser
export async function saveSubscription(subscription: PushSubscriptionJSON) {
  await apiClient(`${endpoint}/subscription`, jsonBody('PUT', subscription));
}

export async function deleteSubscription(subscriptionEndpoint: string) {
  await apiClient(`${endpoint}/subscription`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscriptionEndpoint }),
  });
}

// To the devices of the user; how many received it
export async function sendTestNotification() {
  const { sent } = await apiClient(`${endpoint}/test`, {
    method: 'POST',
    schema: z.object({ sent: z.number() }),
  });
  return sent;
}
