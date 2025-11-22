/**
 * SCRIPT DE TEST IMMEDIAT
 * Copier-coller dans la console du navigateur sur le telephone du vendeur
 */

async function testNotificationsAppFermee() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  TEST NOTIFICATIONS APP FERMEE         ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  // 1. Vérifier Service Worker
  console.log('📋 1. Vérification Service Worker...');
  const regs = await navigator.serviceWorker.getRegistrations();
  if (regs.length === 0) {
    console.error('❌ ERREUR: Aucun Service Worker trouvé');
    console.log('   Solution: Rechargez la page');
    return;
  }
  console.log('✅ Service Worker actif:', regs.length);
  console.log('');

  // 2. Vérifier permission
  console.log('📋 2. Vérification permission notifications...');
  if (Notification.permission !== 'granted') {
    console.error('❌ ERREUR: Permission non accordée');
    console.log('   Permission actuelle:', Notification.permission);
    console.log('   Solution: Activez les notifications');
    
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      console.log('✅ Permission accordée !');
    } else {
      return;
    }
  } else {
    console.log('✅ Permission accordée');
  }
  console.log('');

  // 3. Vérifier User ID
  console.log('📋 3. Vérification User ID...');
  const userId = localStorage.getItem('userId');
  if (!userId) {
    console.error('❌ ERREUR: Pas de User ID');
    console.log('   Solution: Connectez-vous');
    return;
  }
  console.log('✅ User ID:', userId);
  console.log('');

  // 4. Vérifier User Type
  console.log('📋 4. Vérification User Type...');
  const userType = localStorage.getItem('userType');
  console.log('   Type:', userType);
  if (userType !== 'professionnel' && userType !== 'grossiste') {
    console.warn('⚠️  ATTENTION: Vous devez être vendeur pour recevoir les notifications');
  } else {
    console.log('✅ Type vendeur confirmé');
  }
  console.log('');

  // 5. Démarrer la vérification périodique
  console.log('📋 5. Démarrage vérification périodique...');
  if (!navigator.serviceWorker.controller) {
    console.error('❌ ERREUR: Service Worker pas de contrôleur');
    console.log('   Solution: Rechargez la page');
    return;
  }

  // Récupérer l'URL Convex
  const convexUrl = 'https://your-deployment.convex.cloud'; // À REMPLACER
  
  navigator.serviceWorker.controller.postMessage({
    type: 'START_NOTIFICATION_CHECK',
    userId: userId,
    convexUrl: convexUrl
  });
  
  console.log('✅ Vérification périodique démarrée');
  console.log('   Intervalle: 30 secondes');
  console.log('   URL Convex:', convexUrl);
  console.log('');

  // 6. Test notification immédiate
  console.log('📋 6. Test notification immédiate...');
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('🎉 Test Réussi !', {
      body: 'Le système de notifications fonctionne correctement',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: { url: '/dashboard' }
    });
    console.log('✅ Notification de test affichée');
  } catch (error) {
    console.error('❌ Erreur notification test:', error);
  }
  console.log('');

  // 7. Instructions finales
  console.log('╔════════════════════════════════════════╗');
  console.log('║  TOUT EST PRET !                       ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('📱 PROCHAINES ETAPES:');
  console.log('');
  console.log('1. FERMEZ COMPLETEMENT L\'APP');
  console.log('   - Fermez Chrome');
  console.log('   - Verrouillez l\'écran');
  console.log('   - Posez le téléphone');
  console.log('');
  console.log('2. PASSEZ UNE COMMANDE');
  console.log('   - Depuis un autre appareil');
  console.log('   - Commandez un de vos produits');
  console.log('');
  console.log('3. ATTENDEZ MAX 30 SECONDES');
  console.log('   - Le téléphone va vibrer');
  console.log('   - La notification va s\'afficher');
  console.log('   - MEME SI L\'APP EST FERMEE !');
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║  VERIFICATION EN COURS...              ║');
  console.log('║  Toutes les 30 secondes                ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  
  // 8. Monitoring
  console.log('📊 MONITORING:');
  console.log('');
  console.log('Pour voir les vérifications en temps réel:');
  console.log('1. Connectez le téléphone au PC');
  console.log('2. Ouvrez chrome://inspect sur PC');
  console.log('3. Trouvez votre Service Worker');
  console.log('4. Cliquez sur "inspect"');
  console.log('5. Regardez les logs');
  console.log('');
  console.log('Vous verrez toutes les 30 secondes:');
  console.log('  "🔍 Vérification des notifications en attente..."');
  console.log('');
}

// Exécuter le test
testNotificationsAppFermee();
