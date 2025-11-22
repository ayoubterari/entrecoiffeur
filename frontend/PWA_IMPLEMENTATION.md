# PWA Implementation for EntreCoiffeur

Ce document décrit l'implémentation de la Progressive Web App (PWA) pour la marketplace EntreCoiffeur.

## 🎯 Objectifs

- Permettre l'installation de l'application sur mobile et desktop
- Fonctionnement hors ligne pour les pages essentielles
- Améliorer les performances avec le caching intelligent
- Offrir une expérience native sur mobile

## ✅ Fonctionnalités Implémentées

### 1. Web App Manifest
- **Fichier**: `public/manifest.json`
- **Caractéristiques**:
  - Nom et description en français
  - Couleur thème beige (#C0B4A5) correspondant au design
  - Mode d'affichage standalone
  - Orientation portrait préférée
  - Icônes multiples tailles (72x72 à 512x512)
  - Raccourcis vers Dashboard, Commandes, Marketplace

### 2. Service Worker
- **Plugin**: `vite-plugin-pwa`
- **Fonctionnalités**:
  - Enregistrement automatique du service worker
  - Stratégies de cache pour différents types de ressources
  - Fonctionnement hors ligne
  - Notifications de mise à jour

### 3. Stratégies de Cache

#### Ressources Statiques (JS, CSS)
- **Stratégie**: StaleWhileRevalidate
- **Durée**: 7 jours
- **Max Entries**: 50

#### Images (PNG, JPG, SVG, WebP)
- **Stratégie**: CacheFirst
- **Durée**: 30 jours
- **Max Entries**: 100

#### Fonts (Google Fonts)
- **Stratégie**: CacheFirst
- **Durée**: 1 an
- **Max Entries**: 10

## 📦 Installation

### 1. Installer les dépendances
```bash
cd frontend
npm install vite-plugin-pwa --save-dev
```

### 2. Générer les icônes PWA
Vous devez créer des icônes aux tailles suivantes dans `public/icons/`:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

**Outil recommandé**: [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

```bash
npx pwa-asset-generator logo.png public/icons --icon-only
```

### 3. Build l'application
```bash
npm run build
```

## 🚀 Utilisation

### Installation sur Mobile

#### Android (Chrome)
1. Ouvrir le site dans Chrome
2. Cliquer sur le menu (3 points)
3. Sélectionner "Installer l'application"
4. L'icône apparaîtra sur l'écran d'accueil

#### iOS (Safari)
1. Ouvrir le site dans Safari
2. Appuyer sur le bouton Partager
3. Sélectionner "Sur l'écran d'accueil"
4. Confirmer l'installation

### Installation sur Desktop

#### Chrome/Edge
1. Cliquer sur l'icône d'installation dans la barre d'adresse
2. Confirmer l'installation
3. L'application s'ouvrira dans une fenêtre dédiée

## 🎨 Personnalisation

### Modifier les Couleurs
Dans `manifest.json`:
```json
{
  "theme_color": "#C0B4A5",
  "background_color": "#ffffff"
}
```

### Ajouter des Raccourcis
Dans `manifest.json`, section `shortcuts`:
```json
{
  "name": "Nouveau Raccourci",
  "url": "/chemin",
  "icons": [...]
}
```

## 🧪 Tests

### Test Local
```bash
npm run build
npm run preview
```

### Audit PWA
1. Ouvrir Chrome DevTools
2. Aller dans l'onglet Lighthouse
3. Sélectionner "Progressive Web App"
4. Lancer l'audit

### Vérifications
- ✅ Manifest valide
- ✅ Service Worker enregistré
- ✅ Icônes présentes
- ✅ HTTPS en production
- ✅ Responsive design
- ✅ Temps de chargement < 3s

## 📱 Fonctionnalités Hors Ligne

### Pages Disponibles Hors Ligne
- Page d'accueil (cache)
- Produits consultés récemment
- Dashboard (données en cache)
- Panier (localStorage)

### Limitations Hors Ligne
- ❌ Pas de nouvelles commandes
- ❌ Pas de paiement
- ❌ Pas de mise à jour en temps réel
- ✅ Consultation des produits en cache
- ✅ Ajout au panier (synchronisation ultérieure)

## 🔧 Dépannage

### Service Worker ne s'enregistre pas
- Vérifier la console pour les erreurs
- S'assurer que HTTPS est activé en production
- Vérifier que le fichier SW existe après build

### Prompt d'installation n'apparaît pas
- Vérifier les critères PWA (Lighthouse)
- Valider le manifest.json
- Tester sur navigateurs supportés

### Problèmes de Cache
- Vider le cache du navigateur
- Vérifier le cache SW dans DevTools
- Ajuster les stratégies dans vite.config.js

## 📊 Métriques PWA

### Performance
- First Contentful Paint: < 2s
- Time to Interactive: < 3.5s
- Speed Index: < 4s

### Accessibilité
- Score Lighthouse: > 90
- Contraste des couleurs: WCAG AA
- Navigation au clavier: ✅

## 🔮 Améliorations Futures

### Prévues
- [ ] Notifications push pour nouvelles commandes
- [ ] Background sync pour actions hors ligne
- [ ] Mode sombre
- [ ] Partage natif (Web Share API)
- [ ] Géolocalisation pour livraison

### Optimisations
- [ ] Lazy loading des images
- [ ] Compression des assets en cache
- [ ] Invalidation intelligente du cache
- [ ] Préchargement des pages critiques

## 📚 Ressources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🆘 Support

Pour toute question ou problème:
1. Consulter la documentation ci-dessus
2. Vérifier les issues GitHub
3. Contacter l'équipe technique
