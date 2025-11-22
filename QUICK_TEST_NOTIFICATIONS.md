# Test Rapide des Notifications Push

## Test Immediat Sans commande

### Etape 1 Activer les notifications
1. Connectez-vous en tant que professionnel ou grossiste
2. Attendez 3 secondes
3. Un popup apparait Activer les notifications
4. Cliquez sur Activer les notifications
5. Autorisez dans le navigateur
6. Une notification de test s affiche automatiquement

### Etape 2 Tester manuellement via la console

Ouvrez la console du navigateur F12 et executez

```javascript
const registration = await navigator.serviceWorker.ready;
await registration.showNotification('Test EntreCoiffeur', {
  body: 'Ceci est une notification de test',
  icon: '/icon-192x192.png',
  badge: '/icon-192x192.png',
  vibrate: [200, 100, 200]
});
```

## Depannage Rapide

### La notification ne s affiche pas

Verifier la permission
```javascript
console.log('Permission:', Notification.permission);
```

Reinitialiser
```javascript
localStorage.removeItem('notificationPromptDismissed');
location.reload();
```

## Test sur Mobile Android

1. Ouvrez Chrome sur Android
2. Allez sur votre site
3. Connectez-vous en tant que vendeur
4. Activez les notifications
5. Verrouillez l ecran
6. Passez une commande depuis un autre appareil
7. Notification recue meme ecran verrouille
