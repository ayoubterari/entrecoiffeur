# Entre Coiffeur - Marketplace de Coiffure

Une application web moderne pour un marketplace de coiffure utilisant Convex pour le backend et React avec Vite pour le frontend.

## 🏗️ Architecture

- **Backend**: Convex (base de données temps réel + API)
- **Frontend**: React 18 + Vite
- **Authentification**: Email/mot de passe simple via Convex
- **Routing**: React Router DOM

## 📁 Structure du Projet

```
entre-coiffeur/
├── backend/                 # Backend Convex
│   ├── convex/
│   │   ├── auth.ts         # Fonctions d'authentification
│   │   ├── schema.ts       # Schéma de base de données
│   │   └── _generated/     # Fichiers générés par Convex
│   ├── convex.json         # Configuration Convex
│   └── package.json
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx   # Page de connexion/inscription
│   │   │   └── Home.jsx    # Page d'accueil marketplace
│   │   ├── App.jsx         # Routing et logique d'authentification
│   │   ├── main.jsx        # Point d'entrée React
│   │   └── index.css       # Styles CSS
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🚀 Installation et Démarrage

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn

### 1. Installation des dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configuration Convex

```bash
# Dans le dossier backend
cd backend
npx convex dev
```

Cette commande va :
- Créer un nouveau projet Convex
- Générer une URL de déploiement
- Démarrer le serveur de développement Convex

**Important**: Copiez l'URL de déploiement générée et mettez-la à jour dans `frontend/.env.local` :

```env
VITE_CONVEX_URL=https://votre-url-convex.convex.cloud
```

### 3. Démarrage du frontend

```bash
# Dans un nouveau terminal, dossier frontend
cd frontend
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔐 Fonctionnalités d'Authentification

### Pages disponibles

- **`/`** : Page de connexion/inscription (formulaire email + mot de passe)
- **`/home`** : Page d'accueil du marketplace (accessible uniquement si connecté)

### Logique de routing

- Si l'utilisateur est connecté → redirection automatique vers `/home`
- Si l'utilisateur n'est pas connecté → reste sur `/` (page de login)
- Tentative d'accès à `/home` sans être connecté → redirection vers `/`

### Fonctions backend disponibles

- `createUser(email, password)` : Création d'un nouveau compte
- `signIn(email, password)` : Connexion utilisateur
- `getCurrentUser(userId)` : Récupération des informations utilisateur

## 🎨 Interface Utilisateur

- Design moderne et responsive
- Formulaire de connexion/inscription avec basculement
- Page d'accueil avec template marketplace
- Gestion des erreurs et états de chargement
- Bouton de déconnexion

## 🔧 Développement

### Scripts disponibles

**Backend** :
```bash
npm run dev    # Démarrage du serveur Convex
```

**Frontend** :
```bash
npm run dev    # Démarrage du serveur de développement Vite
npm run build  # Build de production
npm run preview # Aperçu du build de production
```

### Modification du schéma de base de données

Le schéma est défini dans `backend/convex/schema.ts`. Après modification, Convex régénère automatiquement les types TypeScript.

### Ajout de nouvelles fonctions backend

Créez de nouveaux fichiers `.ts` dans `backend/convex/` et exportez vos fonctions avec `query`, `mutation`, ou `action`.

## 🚨 Notes de Sécurité

**⚠️ Important pour la production** :
- Les mots de passe sont actuellement stockés en clair
- Implémentez le hachage des mots de passe (bcrypt, etc.)
- Ajoutez la validation des données côté serveur
- Configurez HTTPS
- Ajoutez la limitation de taux (rate limiting)

## 📝 Prochaines Étapes

- [ ] Hachage des mots de passe
- [ ] Validation des formulaires
- [ ] Gestion des profils utilisateur
- [ ] Fonctionnalités marketplace (coiffeurs, réservations)
- [ ] Upload d'images
- [ ] Système de notation/avis

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request
