self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() ?? 'No payload',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
  };

  event.waitUntil(
    self.registration.showNotification('Push Notification', options)
  );
});