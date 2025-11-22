# Fixer la Redirection des Notifications

## Probleme
La notification s affiche bien mais le clic sur Voir la commande ne redirige pas vers le dashboard

## Solution Rapide

### Sur votre telephone

1. Ouvrez Chrome et allez sur votre site
2. Ouvrez la console F12
3. Copiez et collez ce code

```javascript
// Forcer la mise a jour du Service Worker
async function updateSW() {
  const regs = await navigator.serviceWorker.getRegistrations();
  for (let reg of regs) {
    await reg.unregister();
  }
  console.log('Service Worker mis a jour');
  setTimeout(() => location.reload(), 1000);
}
updateSW();
```

4. La page va se recharger
5. Reconnectez-vous en tant que vendeur
6. Reactivez les notifications si demande
7. Testez une nouvelle commande

## Verification

Apres la mise a jour testez avec ce code

```javascript
// Test de redirection
async function testRedirect() {
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification('Test Redirection', {
    body: 'Cliquez pour tester',
    icon: '/icon-192x192.png',
    data: {
      url: '/dashboard?tab=orders'
    },
    actions: [{
      action: 'view',
      title: 'Voir'
    }]
  });
}
testRedirect();
```

Cliquez sur la notification
- Si ca redirige vers le dashboard SUCCES
- Sinon continuez ci-dessous

## Solution Alternative

Si ca ne marche toujours pas ajoutez ce code dans votre console

```javascript
// Ecouter les clics sur notifications
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
    window.location.href = event.data.url;
  }
});
```

## Pour les developpeurs

Le Service Worker a ete mis a jour avec
- Meilleure gestion des clics
- Navigation avec client.navigate
- Logs detailles pour debug
- Gestion des erreurs

Le nouveau SW utilise
```javascript
client.navigate(fullUrl)
```
au lieu de juste
```javascript
client.focus()
```
