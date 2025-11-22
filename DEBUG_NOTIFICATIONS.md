# 🔍 Debug des Notifications - Checklist Complete

## Etape 1 Verifier que vous etes connecte en tant que vendeur

Ouvrez la console F12 et executez
```javascript
console.log('User Type:', localStorage.getItem('userType'));
console.log('User ID:', localStorage.getItem('userId'));
```

✅ Doit afficher `professionnel` ou `grossiste`

## Etape 2 Verifier la permission des notifications

```javascript
console.log('Permission:', Notification.permission);
```

✅ Doit afficher `granted`

Si ce n est pas le cas
1. Cliquez sur l icone de cadenas dans la barre d adresse
2. Notifications Autoriser
3. Rechargez la page

## Etape 3 Verifier le Service Worker

```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
  regs.forEach(reg => console.log('SW:', reg));
});
```

✅ Doit afficher au moins 1 service worker

## Etape 4 Tester une notification manuelle

```javascript
const registration = await navigator.serviceWorker.ready;
await registration.showNotification('Test Immediat', {
  body: 'Si vous voyez ceci les notifications fonctionnent',
  icon: '/icon-192x192.png',
  vibrate: [200, 100, 200]
});
```

✅ Une notification doit apparaitre immediatement

## Etape 5 Verifier le hook de surveillance

```javascript
// Verifier le compteur de commandes
const userId = localStorage.getItem('userId');
console.log('Compteur commandes:', localStorage.getItem(`lastOrderCount_${userId}`));
```

## Etape 6 Reinitialiser le systeme

Si rien ne fonctionne executez
```javascript
// Reinitialiser tout
const userId = localStorage.getItem('userId');
localStorage.removeItem(`lastOrderCount_${userId}`);
localStorage.removeItem('notificationPromptDismissed');
console.log('Systeme reinitialise - Rechargez la page');
location.reload();
```

## Etape 7 Test complet avec une vraie commande

### Sur le telephone du vendeur
1. Connectez-vous en tant que vendeur
2. Executez dans la console
```javascript
console.log('Permission:', Notification.permission);
console.log('User Type:', localStorage.getItem('userType'));
```
3. Laissez la page ouverte

### Sur un autre appareil
1. Connectez-vous en tant que client
2. Passez une commande chez ce vendeur
3. Validez le paiement

### Resultat attendu
- Le telephone du vendeur vibre
- Une notification apparait
- Titre Nouvelle commande
- Corps Nom du client produit montant

## Etape 8 Verifier les logs Convex

Dans la console vous devriez voir
```
[CONVEX M(orders:createOrder)] [LOG] Nouvelle commande pour le vendeur: [ID]
```

## Solutions aux problemes courants

### Probleme Le popup ne s affiche pas
```javascript
localStorage.removeItem('notificationPromptDismissed');
location.reload();
```

### Probleme Permission refusee
1. Chrome Parametres Site Settings Notifications
2. Trouvez votre site
3. Autorisez les notifications
4. Rechargez

### Probleme Pas de notification sur mobile
1. Verifiez que vous etes sur HTTPS ou localhost
2. Sur iOS installez la PWA sur l ecran d accueil
3. Sur Android autorisez les notifications dans les parametres du navigateur

### Probleme Notification s affiche mais pas de son
1. Android Parametres Applications Chrome Notifications
2. Activez le son pour les notifications
3. Verifiez que le telephone n est pas en mode silencieux

## Test final rapide

Executez ce script complet
```javascript
async function testNotifications() {
  console.log('=== TEST NOTIFICATIONS ===');
  
  // 1. Verifier l utilisateur
  const userType = localStorage.getItem('userType');
  const userId = localStorage.getItem('userId');
  console.log('1. User Type:', userType);
  console.log('   User ID:', userId);
  
  if (userType !== 'professionnel' && userType !== 'grossiste') {
    console.error('ERREUR Vous devez etre connecte en tant que vendeur');
    return;
  }
  
  // 2. Verifier la permission
  console.log('2. Permission:', Notification.permission);
  if (Notification.permission !== 'granted') {
    console.error('ERREUR Permission non accordee');
    const result = await Notification.requestPermission();
    console.log('   Nouvelle permission:', result);
  }
  
  // 3. Verifier le Service Worker
  const regs = await navigator.serviceWorker.getRegistrations();
  console.log('3. Service Workers:', regs.length);
  
  if (regs.length === 0) {
    console.error('ERREUR Aucun Service Worker');
    return;
  }
  
  // 4. Tester une notification
  console.log('4. Envoi notification de test...');
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification('Test Reussi', {
    body: 'Les notifications fonctionnent correctement',
    icon: '/icon-192x192.png',
    vibrate: [200, 100, 200]
  });
  
  console.log('=== TEST TERMINE ===');
  console.log('Si vous avez vu la notification tout fonctionne');
}

testNotifications();
```
