// Script pour forcer la mise à jour du Service Worker
// À exécuter dans la console pour mettre à jour le SW immédiatement

async function updateServiceWorker() {
  console.log('🔄 Mise à jour du Service Worker...');
  
  try {
    // Récupérer toutes les registrations
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    console.log(`📋 ${registrations.length} Service Worker(s) trouvé(s)`);
    
    // Désinscrire tous les SW
    for (let registration of registrations) {
      console.log('🗑️ Désinscription du SW:', registration.scope);
      await registration.unregister();
    }
    
    console.log('✅ Tous les Service Workers ont été désinscrits');
    console.log('🔄 Rechargement de la page pour réenregistrer...');
    
    // Attendre un peu avant de recharger
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  }
}

// Exécuter automatiquement
updateServiceWorker();
