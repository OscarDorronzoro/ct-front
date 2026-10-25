// The server key (VAPID, base64url) as the bytes pushManager.subscribe expects
export function serverKeyBytes(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    + '='.repeat((4 - (base64url.length % 4)) % 4);
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}
