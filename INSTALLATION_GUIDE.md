# Guide d'Installation - Entre Coiffeur

## Prérequis

- Node.js (version 18 ou supérieure)
- npm (généralement installé avec Node.js)
- Git (optionnel, pour cloner le projet)

## Installation Rapide

### Windows (Méthode recommandée)

1. **Installation automatique avec Batch**
   ```cmd
   install.bat
   ```

2. **Installation avec PowerShell** (plus de fonctionnalités)
   ```powershell
   .\install.ps1
   ```

### Installation Manuelle

1. **Installer les dépendances du backend**
   ```bash
   cd backend
   npm install
   ```

2. **Installer les dépendances du frontend**
   ```bash
   cd frontend
   npm install
   ```

## Démarrage de l'Application

### Méthode Automatique (Windows)

1. **Avec Batch**
   ```cmd
   start-dev.bat
   ```

2. **Avec PowerShell**
   ```powershell
   .\start-dev.ps1
   ```

### Méthode Manuelle

Ouvrez deux terminaux séparés :

**Terminal 1 - Backend Convex:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend Vite:**
```bash
cd frontend
npm run dev
```

## URLs de l'Application

- **Frontend:** http://localhost:3000
- **Backend Convex:** Dashboard disponible dans le terminal du backend

## Fonctionnalités PWA

L'application est configurée comme une Progressive Web App (PWA) avec :

- Installation sur mobile via le bouton "Installer"
- Mode hors ligne partiel
- Mise en cache des ressources statiques
- Manifest pour l'installation native

### Installation sur Mobile

1. Ouvrez l'application sur votre navigateur mobile
2. Cliquez sur le bouton "Installer" dans l'en-tête
3. Suivez les instructions du navigateur

## Structure du Projet

```
entrecoiffeur/
├── backend/          # Backend Convex
│   ├── convex/       # Fonctions et schémas Convex
│   └── package.json  # Dépendances backend
├── frontend/         # Frontend React + Vite
│   ├── src/          # Code source
│   ├── public/       # Ressources statiques
│   └── package.json  # Dépendances frontend
├── install.bat       # Script d'installation Windows
├── install.ps1       # Script d'installation PowerShell
├── start-dev.bat     # Script de démarrage Windows
└── start-dev.ps1     # Script de démarrage PowerShell
```

## Commandes Disponibles

### Backend
- `npm run dev` - Démarre le serveur de développement Convex
- `npm run deploy` - Déploie sur Convex Cloud

### Frontend
- `npm run dev` - Démarre le serveur de développement Vite
- `npm run build` - Compile l'application pour la production
- `npm run preview` - Prévisualise la version de production
- `npm run lint` - Vérifie le code avec ESLint

## Dépannage

### Problème : "Node.js n'est pas installé"
**Solution:** Téléchargez et installez Node.js depuis [nodejs.org](https://nodejs.org)

### Problème : "npm install échoue"
**Solutions:**
1. Supprimez `node_modules` et `package-lock.json`
2. Réexécutez `npm install`
3. Vérifiez votre connexion internet

### Problème : "Port 3000 déjà utilisé"
**Solution:** Modifiez le port dans `frontend/vite.config.js`

### Problème : "Convex ne se connecte pas"
**Solutions:**
1. Vérifiez votre fichier `.env` dans le backend
2. Assurez-vous que les clés Convex sont correctes
3. Vérifiez votre connexion internet

## Support

Pour toute question ou problème, consultez la documentation ou créez une issue sur le dépôt du projet.
