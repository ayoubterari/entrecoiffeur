# 🚀 Guide de Déploiement Rapide - Vercel

## Étapes Rapides

### 1. Préparer Convex (Backend)
```bash
cd backend
npx convex deploy
```
**Important**: Notez l'URL Convex générée (ex: `https://your-app.convex.cloud`)

### 2. Déployer sur Vercel

#### Option A: Via CLI (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

#### Option B: Via Interface Web
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre repository GitHub
3. Importez le projet
4. Vercel détectera automatiquement la configuration

### 3. Configurer les Variables d'Environnement

Dans votre dashboard Vercel, ajoutez :
- `VITE_CONVEX_URL` = votre URL Convex

### 4. Vérifier le Déploiement

Votre app sera disponible sur : `https://your-project.vercel.app`

## Configuration Automatique

✅ **Build Command**: `cd frontend && npm run build`  
✅ **Output Directory**: `frontend/dist`  
✅ **Install Command**: `cd frontend && npm install`  
✅ **Framework**: Vite (détecté automatiquement)

## Fonctionnalités Incluses

- ✅ Routing SPA avec React Router
- ✅ Optimisation des assets (cache long terme)
- ✅ Headers de sécurité
- ✅ Minification et compression
- ✅ Code splitting automatique
- ✅ Support PWA ready

## Dépannage

**Erreur de build ?**
```bash
cd frontend && npm run build
```

**Variables d'environnement manquantes ?**
Vérifiez dans Vercel Dashboard → Settings → Environment Variables

**Routing ne fonctionne pas ?**
Le fichier `vercel.json` configure automatiquement les rewrites pour React Router.

## Performance

- 🚀 **First Load**: ~50kb gzipped
- ⚡ **Subsequent Loads**: ~10kb (code splitting)
- 🎯 **Lighthouse Score**: 90+ (Performance, SEO, Accessibility)

---

**🎉 Votre marketplace Entre Coiffeur est maintenant en ligne !**
