# Documentation Technique PWA - EntreCoiffeur

## 📋 Vue d'ensemble

Cette documentation décrit l'implémentation complète de la Progressive Web App (PWA) pour EntreCoiffeur.

## 🏗️ Architecture

### Fichiers créés

```
frontend/
├── public/
│   ├── manifest.json              # Manifest PWA
│   ├── service-worker.js          # Service Worker
│   └── icons/                     # Icônes PWA (à générer)
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
├── src/
│   └── components/
│       ├── InstallPWA.jsx         # Composant d'installation
│       └── InstallPWA.css         # Styles du composant
└── index.html                     # Meta tags PWA
```

## 📄 Manifest.json

### Configuration

```json
{
  "name": "EntreCoiffeur - Marketplace Professionnelle",
  "short_name": "EntreCoiffeur",
  "description": "Marketplace professionnelle pour coiffeurs, salons de coiffure et grossistes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#C0B4A5",
  "orientation": "portrait-primary"
}
```

### Propriétés clés

- **name** : Nom complet de l'application
- **short_name** : Nom court pour l'écran d'accueil
- **start_url** : URL de démarrage (page d'accueil)
- **display** : Mode d'affichage (standalone = plein écran)
- **theme_color** : Couleur de la barre de statut (#C0B4A5 = beige EntreCoiffeur)
- **icons** : Tableau d'icônes aux différentes tailles

## 🔧 Service Worker

### Stratégie de cache : Network First

```javascript
// 1. Essayer de récupérer depuis le réseau
fetch(event.request)
  .then((response) => {
    // 2. Mettre en cache la réponse
    cache.put(event.request, response.clone());
    return response;
  })
  .catch(() => {
    // 3. Si échec, utiliser le cache
    return caches.match(event.request);
  });
```

### Avantages de cette stratégie

- ✅ Contenu toujours à jour quand en ligne
- ✅ Fallback sur le cache si hors ligne
- ✅ Cache automatiquement les nouvelles pages visitées
- ✅ Idéal pour une marketplace avec contenu dynamique

### Événements du Service Worker

1. **install** : Mise en cache initiale des ressources essentielles
2. **activate** : Nettoyage des anciens caches
3. **fetch** : Interception des requêtes réseau

## 🎨 Composant InstallPWA

### Fonctionnalités

#### 1. Détection automatique

```javascript
// Détection de l'installation
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

// Détection iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// Écoute de l'événement beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  setDeferredPrompt(e);
  setShowInstallButton(true);
});
```

#### 2. Gestion de l'installation

```javascript
const handleInstallClick = async () => {
  if (!deferredPrompt) return;
  
  // Afficher la popup native
  deferredPrompt.prompt();
  
  // Attendre la réponse
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('Installation acceptée');
  }
};
```

#### 3. Persistance du choix utilisateur

```javascript
// Sauvegarder la fermeture de la bannière
localStorage.setItem('pwa-banner-dismissed', new Date().toISOString());

// Réafficher après 7 jours
const daysSinceDismissed = (new Date() - dismissedDate) / (1000 * 60 * 60 * 24);
if (daysSinceDismissed > 7) {
  setShowBanner(true);
}
```

### Modes d'affichage

#### 1. Bannière complète (Android/Chrome)

- Affichée en bas de l'écran
- Icône smartphone + texte + bouton "Installer"
- Bouton de fermeture (X)
- Animation slide-up

#### 2. Bannière iOS

- Instructions pour ajouter à l'écran d'accueil
- Icône de partage Safari (⎙)
- Texte explicatif
- Bouton de fermeture

#### 3. Bouton flottant

- Affiché si la bannière a été fermée
- Position : bottom-right
- Animation pulse
- Icône de téléchargement

## 🎯 Intégration

### Dans main.jsx

```javascript
// Enregistrement du service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker enregistré');
      });
  });
}
```

### Dans App.jsx

```javascript
import InstallPWA from './components/InstallPWA';

function AppContent() {
  return (
    <div className="App">
      {/* ... autres composants ... */}
      <InstallPWA />
    </div>
  );
}
```

### Dans index.html

```html
<!-- PWA Meta Tags -->
<meta name="theme-color" content="#C0B4A5" />
<link rel="manifest" href="/manifest.json" />

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

## 🧪 Tests

### Test d'installation

1. **Chrome DevTools**
   - F12 > Application > Manifest
   - Vérifier les erreurs
   - Tester "Add to home screen"

2. **Lighthouse**
   - F12 > Lighthouse
   - Cocher "Progressive Web App"
   - Générer le rapport
   - Score cible : > 90

3. **Test mobile réel**
   - Déployer sur HTTPS
   - Ouvrir sur mobile
   - Vérifier la bannière d'installation
   - Installer et tester

### Checklist PWA

- [ ] Manifest.json valide
- [ ] Service worker enregistré
- [ ] HTTPS activé
- [ ] Icônes aux bonnes dimensions
- [ ] Meta tags présents
- [ ] Bannière d'installation fonctionnelle
- [ ] Mode hors ligne basique
- [ ] Score Lighthouse > 90

## 🚀 Déploiement

### Prérequis

1. **HTTPS obligatoire** : Les PWA nécessitent HTTPS
2. **Icônes générées** : Créer toutes les tailles d'icônes
3. **Service worker accessible** : Doit être à la racine du domaine

### Étapes

1. Générer les icônes PWA (voir `/public/icons/README.md`)
2. Vérifier le manifest.json
3. Tester en local avec `npm run dev`
4. Build de production : `npm run build`
5. Déployer sur serveur HTTPS
6. Vérifier avec Lighthouse

### Configuration Vercel (recommandé)

```json
// vercel.json
{
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

## 📊 Métriques et analytics

### Événements à tracker

```javascript
// Installation réussie
window.addEventListener('appinstalled', () => {
  // Envoyer événement à Google Analytics
  gtag('event', 'pwa_install', {
    event_category: 'PWA',
    event_label: 'Installation réussie'
  });
});

// Bannière affichée
gtag('event', 'pwa_banner_shown', {
  event_category: 'PWA',
  event_label: 'Bannière affichée'
});

// Bannière fermée
gtag('event', 'pwa_banner_dismissed', {
  event_category: 'PWA',
  event_label: 'Bannière fermée'
});
```

## 🔄 Mises à jour

### Stratégie de mise à jour

1. **Service Worker** : Mise à jour automatique
2. **Cache** : Nettoyage des anciennes versions
3. **Notification** : Informer l'utilisateur (à implémenter)

### Code de mise à jour

```javascript
// Dans le service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

## 🐛 Dépannage

### Problèmes courants

1. **Service worker ne s'enregistre pas**
   - Vérifier HTTPS
   - Vérifier le chemin du fichier
   - Vérifier la console pour les erreurs

2. **Bannière n'apparaît pas**
   - Vérifier le manifest.json
   - Vérifier les icônes
   - Tester sur un appareil réel (pas l'émulateur)

3. **Mode hors ligne ne fonctionne pas**
   - Vérifier la stratégie de cache
   - Vérifier que les ressources sont mises en cache
   - Tester avec DevTools > Application > Service Workers

## 📚 Ressources

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google - PWA Checklist](https://web.dev/pwa-checklist/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox) (pour service worker avancé)

## 🔮 Améliorations futures

- [ ] Notifications push
- [ ] Synchronisation en arrière-plan
- [ ] Mode hors ligne avancé avec IndexedDB
- [ ] Partage natif
- [ ] Raccourcis d'application
- [ ] Badges d'application
- [ ] Gestion des mises à jour avec prompt utilisateur

---

**Version** : 1.0.0  
**Auteur** : Équipe EntreCoiffeur  
**Dernière mise à jour** : Novembre 2024
