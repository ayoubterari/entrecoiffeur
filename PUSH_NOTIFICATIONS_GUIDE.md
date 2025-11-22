# 📬 Guide des Notifications Push PWA - EntreCoiffeur

## Vue d'ensemble

Système complet de notifications push PWA pour alerter les vendeurs (professionnels et grossistes) lorsqu'ils reçoivent une nouvelle commande sur leur téléphone mobile.

## ✨ Fonctionnalités

### Pour les Vendeurs
- 🔔 **Notifications instantanées** lors de nouvelles commandes
- 📱 **Notifications natives** sur téléphone (iOS, Android)
- ⚡ **Temps réel** - Alertes immédiates
- 🎯 **Ciblées** - Uniquement pour les professionnels et grossistes
- 🔕 **Contrôle total** - Activation/désactivation à tout moment

### Caractéristiques Techniques
- ✅ PWA (Progressive Web App)
- ✅ Service Worker intégré
- ✅ Stockage des abonnements dans Convex
- ✅ Design non-intrusif
- ✅ Compatible iOS et Android

## 📋 Architecture

### Backend (Convex)

#### 1. Schéma de données
```typescript
// Table: pushSubscriptions
{
  userId: Id<"users">,
  endpoint: string,
  keys: {
    p256dh: string,
    auth: string
  },
  userAgent: string,
  isActive: boolean,
  createdAt: number,
  updatedAt: number
}
```

#### 2. Mutations
- **`savePushSubscription`** : Enregistrer un abonnement push
- **`unsubscribePush`** : Désactiver un abonnement
- **`cleanupInactiveSubscriptions`** : Nettoyer les abonnements inactifs

#### 3. Queries
- **`getUserPushSubscriptions`** : Récupérer les abonnements d'un utilisateur
- **`getSellerPushSubscriptions`** : Récupérer les abonnements d'un vendeur
- **`hasActivePushSubscription`** : Vérifier si un utilisateur a des abonnements actifs

#### 4. Actions
- **`notifySellerNewOrder`** : Envoyer une notification pour une nouvelle commande
- **`notifyOrderStatusChange`** : Envoyer une notification de changement de statut

### Frontend (React)

#### 1. Hook personnalisé
**`usePushNotifications.js`**
- Gestion de la permission
- Souscription aux notifications
- Enregistrement dans Convex
- Envoi de notifications de test

#### 2. Composant UI
**`NotificationPrompt.jsx`**
- Modal élégant pour demander la permission
- Affichage des bénéfices
- Options : Activer / Plus tard / Ne plus demander
- Apparaît 3 secondes après la connexion

#### 3. Service Worker
**`sw.js`**
- Gestion des événements push
- Affichage des notifications
- Gestion des clics sur notifications
- Redirection vers le dashboard

## 🚀 Utilisation

### Pour les Vendeurs

#### 1. Première connexion
1. Connectez-vous en tant que professionnel ou grossiste
2. Après 3 secondes, un popup apparaît
3. Cliquez sur **"Activer les notifications"**
4. Autorisez les notifications dans votre navigateur
5. Une notification de test s'affiche

#### 2. Réception de commandes
- Lorsqu'un client passe commande, vous recevez instantanément :
  - 🛍️ Titre : "Nouvelle commande !"
  - 📝 Détails : Nom du client, produit, montant
  - 🔔 Vibration du téléphone
  - 🎯 Clic sur la notification → Redirection vers le dashboard

#### 3. Gestion des notifications
- **Activer** : Via le popup initial ou les paramètres du navigateur
- **Désactiver** : Paramètres du navigateur > Notifications > EntreCoiffeur
- **Ne plus demander** : Option dans le popup (stocké 7 jours)

### Pour les Développeurs

#### Installation
```bash
# Aucune installation supplémentaire requise
# Le système utilise les APIs natives du navigateur
```

#### Configuration
1. **Service Worker** : Déjà configuré dans `/public/sw.js`
2. **Manifest** : Déjà configuré dans `/public/manifest.json`
3. **Hook** : Déjà intégré dans `App.jsx`

#### Tester les notifications

##### Test manuel
```javascript
// Dans la console du navigateur (après avoir activé les notifications)
const registration = await navigator.serviceWorker.ready;
registration.showNotification('Test', {
  body: 'Notification de test',
  icon: '/icon-192x192.png'
});
```

##### Test avec le hook
```javascript
// Le composant NotificationPrompt inclut un bouton de test
// qui envoie automatiquement une notification de bienvenue
```

## 📱 Compatibilité

### Navigateurs supportés
- ✅ Chrome (Android) - Support complet
- ✅ Edge (Android) - Support complet
- ✅ Firefox (Android) - Support complet
- ✅ Safari (iOS 16.4+) - Support complet
- ⚠️ Safari (iOS < 16.4) - Support limité

### Plateformes
- ✅ Android (tous navigateurs)
- ✅ iOS (Safari 16.4+, via PWA installée)
- ✅ Desktop (Chrome, Edge, Firefox)

## 🔧 Configuration Avancée

### Clés VAPID (Production)

Pour la production, vous devez générer vos propres clés VAPID :

```bash
# Installer web-push
npm install web-push -g

# Générer les clés
web-push generate-vapid-keys

# Résultat :
# Public Key: BEl62iUYgUivxIkv...
# Private Key: 9GEes3H2...
```

Ensuite, mettez à jour :

1. **Frontend** (`usePushNotifications.js`) :
```javascript
const vapidPublicKey = 'VOTRE_CLE_PUBLIQUE';
```

2. **Backend** (créer un fichier de configuration) :
```javascript
// convex/pushConfig.ts
export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
```

### Envoi réel de notifications (Production)

Actuellement, le système est configuré pour la démonstration. Pour envoyer de vraies notifications :

1. **Installer web-push côté serveur** :
```bash
npm install web-push
```

2. **Mettre à jour l'action** (`sendOrderNotification.ts`) :
```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:votre-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

for (const sub of subscriptions) {
  await webpush.sendNotification(
    {
      endpoint: sub.endpoint,
      keys: sub.keys
    },
    JSON.stringify(notificationPayload)
  );
}
```

## 🎨 Personnalisation

### Modifier le design du popup
Éditez `NotificationPrompt.css` :
```css
.notification-prompt-card {
  background: white;
  border-radius: 20px;
  /* Vos styles personnalisés */
}
```

### Modifier le contenu des notifications
Éditez `sendOrderNotification.ts` :
```typescript
const notificationPayload = {
  title: 'Votre titre personnalisé',
  body: 'Votre message personnalisé',
  // ...
};
```

### Changer le délai d'affichage du popup
Éditez `NotificationPrompt.jsx` :
```javascript
setTimeout(() => {
  setShowPrompt(true);
}, 3000); // Changer 3000 (3 secondes)
```

## 🐛 Dépannage

### Les notifications ne s'affichent pas

1. **Vérifier la permission** :
```javascript
console.log('Permission:', Notification.permission);
// Doit être "granted"
```

2. **Vérifier le service worker** :
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

3. **Vérifier l'abonnement** :
```javascript
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.getSubscription().then(sub => {
    console.log('Subscription:', sub);
  });
});
```

### Le popup ne s'affiche pas

1. Vérifier que l'utilisateur est un vendeur :
```javascript
console.log('User Type:', localStorage.getItem('userType'));
// Doit être "professionnel" ou "grossiste"
```

2. Vérifier que le popup n'a pas été refusé :
```javascript
console.log('Dismissed:', localStorage.getItem('notificationPromptDismissed'));
// Doit être null ou une date ancienne
```

3. Effacer le localStorage pour réinitialiser :
```javascript
localStorage.removeItem('notificationPromptDismissed');
```

### Sur iOS

1. **Installer la PWA** : Sur iOS, les notifications ne fonctionnent que si l'app est installée sur l'écran d'accueil
2. **Safari 16.4+** : Vérifier la version d'iOS (Réglages > Général > Informations)
3. **Autoriser les notifications** : Réglages > Notifications > Safari > EntreCoiffeur

## 📊 Statistiques

Pour suivre l'utilisation des notifications :

```typescript
// Query pour obtenir les stats
const stats = await ctx.db
  .query("pushSubscriptions")
  .withIndex("by_active", (q) => q.eq("isActive", true))
  .collect();

console.log('Abonnements actifs:', stats.length);
```

## 🔒 Sécurité

- ✅ Les clés d'abonnement sont stockées de manière sécurisée dans Convex
- ✅ Seuls les vendeurs peuvent recevoir des notifications de commandes
- ✅ Les abonnements sont liés à un userId spécifique
- ✅ Les notifications ne contiennent pas d'informations sensibles

## 📝 Notes Importantes

1. **PWA requise** : L'application doit être installée comme PWA sur iOS
2. **HTTPS requis** : Les notifications push nécessitent HTTPS (ou localhost)
3. **Service Worker** : Doit être enregistré et actif
4. **Permission utilisateur** : L'utilisateur doit accepter les notifications

## 🎯 Prochaines Améliorations

- [ ] Notifications groupées (plusieurs commandes)
- [ ] Personnalisation des sons de notification
- [ ] Statistiques d'engagement
- [ ] Notifications programmées
- [ ] Support des images dans les notifications
- [ ] Notifications pour d'autres événements (messages, avis, etc.)

## 📞 Support

Pour toute question ou problème :
1. Vérifier cette documentation
2. Consulter les logs de la console
3. Tester avec une notification de test
4. Vérifier la compatibilité du navigateur

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2024  
**Auteur** : EntreCoiffeur Team
