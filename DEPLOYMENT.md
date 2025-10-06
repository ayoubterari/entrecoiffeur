# Déploiement Vercel - Entre Coiffeur

## Prérequis

1. Compte Vercel (https://vercel.com)
2. Compte Convex (https://convex.dev)
3. Repository Git configuré

## Étapes de déploiement

### 1. Configuration Convex

Avant de déployer sur Vercel, vous devez configurer Convex pour la production :

```bash
cd backend
npx convex deploy
```

Cela va créer votre déploiement Convex et vous donner une URL de production.

### 2. Variables d'environnement

Dans votre dashboard Vercel, configurez les variables d'environnement suivantes :

- `VITE_CONVEX_URL` : L'URL de votre déploiement Convex (ex: https://your-app.convex.cloud)

### 3. Déploiement sur Vercel

#### Option A: Via CLI Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Option B: Via GitHub
1. Connectez votre repository GitHub à Vercel
2. Vercel détectera automatiquement la configuration
3. Le déploiement se fera automatiquement

### 4. Configuration du build

Le projet est configuré pour :
- Build directory: `frontend/dist`
- Build command: `cd frontend && npm run vercel-build`
- Install command: `cd frontend && npm install`

### 5. Domaine personnalisé (optionnel)

Vous pouvez configurer un domaine personnalisé dans les paramètres Vercel.

## Structure des fichiers de configuration

- `vercel.json` : Configuration principale Vercel
- `frontend/vercel.json` : Configuration spécifique au frontend
- `.vercelignore` : Fichiers à ignorer lors du déploiement
- `frontend/vite.config.js` : Configuration optimisée pour la production

## Notes importantes

1. Assurez-vous que votre déploiement Convex est actif avant de déployer sur Vercel
2. Toutes les variables d'environnement doivent être configurées dans Vercel
3. Le frontend est une SPA (Single Page Application) avec routing côté client
4. Les assets sont optimisés avec cache long terme

## Dépannage

Si le déploiement échoue :
1. Vérifiez les logs de build dans Vercel
2. Assurez-vous que toutes les dépendances sont installées
3. Vérifiez que l'URL Convex est correcte
4. Testez le build localement avec `npm run build`
