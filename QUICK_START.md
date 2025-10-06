# 🚀 Guide de Démarrage Rapide - Entre Coiffeur

## Démarrage en 3 étapes

### 1. Installation des dépendances
```bash
# Double-cliquez sur setup.bat ou exécutez :
setup.bat
```

### 2. Démarrage du backend
```bash
# Double-cliquez sur start-backend.bat ou exécutez :
start-backend.bat
```

**Important** : 
1. Copiez l'URL Convex qui s'affiche (ex: `https://xxx.convex.cloud`) et collez-la dans `frontend/.env.local`
2. Après que Convex génère les fichiers API, vous devez remplacer le fichier `frontend/src/lib/convex.js` par le vrai API généré

```env
VITE_CONVEX_URL=https://votre-url-convex.convex.cloud
```

**Étapes détaillées pour connecter l'API** :
1. Une fois `npx convex dev` démarré, Convex va générer `backend/convex/_generated/api.js`
2. Copiez tout le contenu de ce fichier
3. Remplacez complètement le contenu de `frontend/src/lib/convex.js` par le contenu copié
4. Redémarrez le frontend si nécessaire

### 3. Démarrage du frontend
```bash
# Dans un nouveau terminal, double-cliquez sur start-frontend.bat ou exécutez :
start-frontend.bat
```

## ✅ Test de l'application

1. Ouvrez http://localhost:3000
2. Créez un compte avec email/mot de passe
3. Connectez-vous
4. Vous devriez être redirigé vers la page "Marketplace Coiffure"

## 🔧 Commandes manuelles (alternative)

Si les scripts .bat ne fonctionnent pas :

**Backend** :
```bash
cd backend
npm install
npx convex dev
```

**Frontend** :
```bash
cd frontend
npm install
npm run dev
```

## 🚨 Problèmes courants

- **Erreur Convex URL** : Vérifiez que l'URL dans `.env.local` est correcte
- **Port 3000 occupé** : Vite proposera automatiquement un autre port
- **Erreur de dépendances** : Supprimez `node_modules` et relancez `npm install`

## 📱 Fonctionnalités disponibles

- ✅ Création de compte (signup)
- ✅ Connexion (signin)  
- ✅ Redirection automatique selon l'état de connexion
- ✅ Page d'accueil marketplace
- ✅ Déconnexion
- ✅ Persistance de session (localStorage)
