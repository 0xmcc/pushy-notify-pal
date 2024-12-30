self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'New Move', body: 'A move has been played!' };
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.gameData,
    vibrate: [200, 100, 200],
    tag: 'game-move',
    actions: [
      {
        action: 'view',
        title: 'View Game'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' && event.notification.data?.gameId) {
    const gameUrl = `/multiplayer?game=${event.notification.data.gameId}`;
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/multiplayer') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(gameUrl);
        }
      })
    );
  }
});