// Service Worker pour EntreCoiffeur PWA
const CACHE_VERSION = '2.0.0'; // Version avec redirection notifications
const CACHE_NAME = `entrecoiffeur-v${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

console.log(`🚀 Service Worker version ${CACHE_VERSION} chargé`);

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erreur lors du cache:', error);
      })
  );
  // Forcer l'activation immédiate
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation en cours...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prendre le contrôle immédiatement
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner le cache si disponible, sinon fetch
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Ne pas cacher les requêtes non-GET ou non-200
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Cloner la réponse pour la mettre en cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erreur fetch:', error);
      })
  );
});

// Écouter les messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('📬 Service Worker: Notification push reçue');
  
  let notificationData = {
    title: 'EntreCoiffeur',
    body: 'Vous avez une nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'entrecoiffeur-notification',
    requireInteraction: true,
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (e) {
      console.error('❌ Erreur parsing notification:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      actions: notificationData.actions || []
    })
  );
});

// Gestion du clic sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Clic sur notification', event);
  
  // Fermer la notification
  event.notification.close();

  // Récupérer l'URL de destination
  const urlToOpen = event.notification.data?.url || '/dashboard?tab=orders';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;
  
  console.log('🔗 URL à ouvrir:', fullUrl);

  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      console.log('📱 Clients trouvés:', clientList.length);
      
      // Chercher si une fenêtre de l'app est déjà ouverte
      for (let client of clientList) {
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(fullUrl);
        
        // Si c'est le même domaine, naviguer vers la page
        if (clientUrl.origin === targetUrl.origin) {
          console.log('✅ Client trouvé, navigation vers:', fullUrl);
          if ('focus' in client) {
            client.focus();
          }
          // Naviguer vers l'URL cible
          return client.navigate(fullUrl);
        }
      }
      
      // Sinon, ouvrir une nouvelle fenêtre
      console.log('🆕 Ouverture nouvelle fenêtre:', fullUrl);
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    }).catch((error) => {
      console.error('❌ Erreur lors de l\'ouverture:', error);
    })
  );
});
