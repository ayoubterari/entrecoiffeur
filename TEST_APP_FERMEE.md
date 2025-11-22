# TEST NOTIFICATIONS APP FERMEE

## Test en 5 minutes

### TELEPHONE VENDEUR

#### Etape 1 Ouvrir l app
1. Connectez-vous en tant que vendeur
2. Activez les notifications si demande

#### Etape 2 Verifier que tout est pret
Ouvrez la console F12
```javascript
// Copier-coller ce code
async function verifier() {
  console.log('=== VERIFICATION ===');
  
  // 1. Service Worker
  const regs = await navigator.serviceWorker.getRegistrations();
  console.log('Service Worker:', regs.length > 0 ? 'OK' : 'ERREUR');
  
  // 2. Permission
  console.log('Permission:', Notification.permission);
  
  // 3. User ID
  const userId = localStorage.getItem('userId');
  console.log('User ID:', userId);
  
  // 4. Demarrer verification
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'START_NOTIFICATION_CHECK',
      userId: userId,
      convexUrl: 'https://votre-url.convex.cloud'
    });
    console.log('Verification demarree');
  }
  
  console.log('=== PRET ===');
  console.log('Vous pouvez FERMER l app maintenant');
}
verifier();
```

#### Etape 3 FERMER L APP
- Fermez completement Chrome
- Verrouillez l ecran
- Posez le telephone

### TELEPHONE CLIENT ou PC

#### Etape 4 Passer une commande
1. Connectez-vous en tant que client
2. Trouvez un produit du vendeur
3. Ajoutez au panier
4. Passez la commande
5. Validez le paiement

### RESULTAT ATTENDU

#### Dans les 30 secondes
- Le telephone du vendeur VIBRE
- Une notification s affiche
- MEME SI L APP EST FERMEE
- MEME SI L ECRAN EST VERROUILLE

#### La notification montre
- Nouvelle commande
- Nom du client
- Nom du produit
- Montant

#### Clic sur la notification
- Ouvre l app
- Va au dashboard
- Onglet Commandes

## Si ca ne marche pas

### Verifier les logs du Service Worker

#### Sur Android
1. Connectez le telephone au PC
2. Ouvrez Chrome sur PC
3. Allez sur chrome://inspect
4. Trouvez votre telephone
5. Cliquez sur inspect sous le Service Worker
6. Regardez les logs

Vous devriez voir toutes les 30 secondes
```
Verification des notifications en attente...
0 notification(s) en attente
```

Puis quand une commande arrive
```
Verification des notifications en attente...
1 notification(s) en attente
Notification affichee et marquee
```

### Problemes courants

#### 1. Rien ne se passe
- Verifiez que la verification est demarree
- Regardez les logs du SW
- Reessayez l etape 2

#### 2. Notification uniquement quand j ouvre l app
- Le SW n est pas actif en arriere-plan
- Reinstallez le SW
- Redemarrez le telephone

#### 3. Delai trop long
- Normal jusqu a 30 secondes
- Pour reduire editez NOTIFICATION_CHECK_INTERVAL
- Attention a la batterie

## Test rapide sans commande

### Creer une notification de test

Sur PC dans la console Convex
```javascript
// Creer une notification en attente
await ctx.db.insert("pendingNotifications", {
  userId: "ID_DU_VENDEUR",
  payload: {
    title: "TEST APP FERMEE",
    body: "Si vous voyez ceci ca marche",
    icon: "/icon-192x192.png",
    data: { url: "/dashboard" }
  },
  isDelivered: false,
  createdAt: Date.now()
});
```

Attendez max 30 secondes
La notification doit s afficher sur le telephone

## Optimisation batterie

### Changer l intervalle

Dans sw.js ligne 13
```javascript
// Actuel 30 secondes
const NOTIFICATION_CHECK_INTERVAL = 30000;

// Pour 1 minute plus economique
const NOTIFICATION_CHECK_INTERVAL = 60000;

// Pour 10 secondes plus rapide
const NOTIFICATION_CHECK_INTERVAL = 10000;
```

Puis
```javascript
// Forcer la mise a jour du SW
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  location.reload();
});
```

## Monitoring

### Voir combien de notifications en attente

```javascript
// Dans la console
const userId = localStorage.getItem('userId');
console.log('User ID:', userId);

// Puis dans Convex Dashboard
// Query: pendingNotifications
// Filter: userId = "VOTRE_ID" AND isDelivered = false
```

### Statistiques

```javascript
// Nombre total de notifications
const total = await ctx.db
  .query("pendingNotifications")
  .collect();
console.log('Total:', total.length);

// Non livrees
const pending = await ctx.db
  .query("pendingNotifications")
  .withIndex("by_delivered", q => q.eq("isDelivered", false))
  .collect();
console.log('En attente:', pending.length);
```

## Checklist finale

- [ ] Service Worker enregistre
- [ ] Permission notifications accordee
- [ ] User ID present
- [ ] Verification periodique demarree
- [ ] App fermee
- [ ] Commande passee
- [ ] Notification recue dans les 30s

Si tous les points sont OK
**FELICITATIONS CA MARCHE**
