// Push notifications. Imported by the service worker that vite-plugin-pwa generates
// (workbox.importScripts in vite.config.js).

// { title, body, url, tag } from the backend (notifications/push.service)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(self.registration.showNotification(data.title || 'Rastreo de Vacas', {
    body: data.body,
    icon: '/favicon/web-app-manifest-192x192.png',
    // Same tag: replaces the previous notification instead of piling up
    tag: data.tag,
    data: { url: data.url || '/' },
  }));
});

// Tapping it opens the app where the notification points (the map on the cow), reusing an open window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = windows.find((client) => new URL(client.url).origin === self.location.origin);

    if (open) {
      await open.focus();
      return open.navigate(url);
    }

    return self.clients.openWindow(url);
  })());
});
