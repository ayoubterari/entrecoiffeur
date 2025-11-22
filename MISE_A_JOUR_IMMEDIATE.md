# Mise a Jour Immediate - Redirection Notifications

## Sur votre telephone MAINTENANT

### Etape 1 Ouvrir la console
1. Ouvrez Chrome sur votre telephone
2. Allez sur votre site
3. Menu 3 points Plus d outils Console JavaScript

### Etape 2 Copier ce code

```javascript
async function maj() {
  console.log('Mise a jour...');
  const regs = await navigator.serviceWorker.getRegistrations();
  for (let reg of regs) {
    await reg.unregister();
  }
  console.log('OK - Rechargement...');
  location.reload();
}
maj();
```

### Etape 3 Coller et Entree

La page va se recharger automatiquement

### Etape 4 Reconnecter

1. Reconnectez-vous en tant que vendeur
2. Si demande reactivez les notifications

### Etape 5 Tester

Passez une nouvelle commande depuis un autre appareil

Maintenant quand vous cliquez sur Voir la commande
- Le navigateur s ouvre
- Vous etes redirige vers le dashboard
- Onglet Commandes ouvert

## Verification rapide

Apres la mise a jour testez

```javascript
async function test() {
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification('Test', {
    body: 'Cliquez pour tester la redirection',
    data: { url: '/dashboard?tab=orders' },
    actions: [{ action: 'view', title: 'Tester' }]
  });
}
test();
```

Cliquez sur Tester
- Si ca redirige SUCCES
- Sinon recommencez l etape 2

## Ce qui a change

Version 2.0.0 du Service Worker
- Utilise client.navigate au lieu de client.focus
- Meilleure gestion des URLs
- Logs detailles pour debug
- Gestion automatique des erreurs
- Mise a jour automatique toutes les 5 minutes

## Si probleme persiste

Desinstallez completement la PWA
1. Parametres Applications
2. Trouvez EntreCoiffeur
3. Desinstaller
4. Retournez sur le site
5. Reinstallez la PWA
6. Reconnectez-vous
