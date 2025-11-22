// Enregistrement du Service Worker pour la PWA
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker enregistré avec succès:', registration.scope);
          
          // Vérifier les mises à jour toutes les heures
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
          
          // Écouter les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 Nouvelle version du Service Worker détectée');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('✨ Nouvelle version disponible. Rechargez pour mettre à jour.');
                // Optionnel: Afficher une notification à l'utilisateur
              }
            });
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
