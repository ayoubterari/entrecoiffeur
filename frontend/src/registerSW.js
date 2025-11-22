// Enregistrement du Service Worker pour la PWA
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          console.log('✅ Service Worker enregistré avec succès:', registration.scope);
          
          // Forcer la vérification des mises à jour immédiatement
          registration.update();
          
          // Vérifier les mises à jour toutes les 5 minutes
          setInterval(() => {
            registration.update();
          }, 5 * 60 * 1000);
          
          // Écouter les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 Nouvelle version du Service Worker détectée');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('✨ Nouvelle version disponible. Activation automatique...');
                // Activer immédiatement le nouveau service worker
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                // Recharger la page pour utiliser le nouveau SW
                window.location.reload();
              }
            });
          });
          
          // Écouter les messages du Service Worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SW_UPDATED') {
              console.log('🔄 Service Worker mis à jour, rechargement...');
              window.location.reload();
            }
          });
        })
        .catch((error) => {
          console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
        });
    });
  } else {
    console.warn('⚠️ Service Worker non supporté par ce navigateur');
  }
}

// Fonction pour désinstaller le service worker (utile pour le debug)
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('🗑️ Service Worker désinstallé');
      })
      .catch((error) => {
        console.error('❌ Erreur lors de la désinstallation:', error);
      });
  }
}
