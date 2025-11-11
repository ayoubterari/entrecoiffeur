# Système de Redirection Après Connexion

## Vue d'ensemble

Le système permet aux visiteurs non connectés de cliquer sur "Se connecter pour acheter" sur une page produit, d'être redirigés vers la page d'accueil avec le popup de connexion, puis de revenir automatiquement sur la page produit après connexion réussie.

## Flux Complet

### 1. Utilisateur non connecté sur une page produit

**Fichier** : `frontend/src/pages/ProductDetail.jsx`

```javascript
const handleBuyNow = () => {
  if (!isAuthenticated) {
    // Sauvegarder l'URL actuelle pour rediriger après connexion
    const currentProductUrl = `/product/${productId}`
    console.log('🔐 ProductDetail - User not authenticated, saving redirect URL:', currentProductUrl)
    localStorage.setItem('redirectAfterLogin', currentProductUrl)
    
    // Marquer qu'on doit afficher le popup de connexion
    localStorage.setItem('showLoginPopup', 'true')
    
    // Rediriger vers la page d'accueil
    console.log('🔄 ProductDetail - Redirecting to home')
    navigate('/')
    return
  }
  
  // ... reste du code pour utilisateur connecté
}
```

**Actions** :
- ✅ Sauvegarde l'URL du produit dans `localStorage.redirectAfterLogin`
- ✅ Active le flag `localStorage.showLoginPopup`
- ✅ Redirige vers la page d'accueil (`/`)

### 2. Page d'accueil détecte le flag et ouvre le popup

**Fichier** : `frontend/src/pages/Home.jsx`

```javascript
useEffect(() => {
  const shouldShowLogin = localStorage.getItem('showLoginPopup')
  
  console.log('🔍 Home - Checking login state:', {
    shouldShowLogin,
    isAuthenticated,
    hasOnShowLogin: !!onShowLogin
  })
  
  if (shouldShowLogin === 'true' && !isAuthenticated && onShowLogin) {
    console.log('✅ Home - Triggering login popup NOW')
    // Nettoyer immédiatement pour éviter les boucles
    localStorage.removeItem('showLoginPopup')
    
    // Déclencher le popup après un court délai pour s'assurer que la page est chargée
    setTimeout(() => {
      onShowLogin('signin')
    }, 300)
  }
}, [isAuthenticated, onShowLogin])
```

**Actions** :
- ✅ Vérifie le flag `showLoginPopup` dans localStorage
- ✅ Supprime le flag immédiatement pour éviter les boucles
- ✅ Ouvre le popup de connexion avec un délai de 300ms

### 3. Connexion réussie et redirection

**Fichier** : `frontend/src/App.jsx`

```javascript
const handleLoginSuccess = (newUserId) => {
  handleLogin(newUserId)
  setShowLoginModal(false)
  
  // Vérifier s'il y a une redirection après connexion (depuis ProductDetail)
  const redirectAfterLogin = localStorage.getItem('redirectAfterLogin')
  console.log('✅ App - Login success, checking redirect:', redirectAfterLogin)
  
  if (redirectAfterLogin) {
    console.log('🔄 App - Redirecting to:', redirectAfterLogin)
    localStorage.removeItem('redirectAfterLogin')
    setTimeout(() => {
      navigate(redirectAfterLogin)
    }, 100)
    return
  }
  
  // ... reste du code pour affiliation
}
```

**Actions** :
- ✅ Récupère l'URL sauvegardée dans `localStorage.redirectAfterLogin`
- ✅ Supprime le flag pour éviter les redirections futures non désirées
- ✅ Redirige vers la page produit avec un délai de 100ms

## Schéma du Flux

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Page Produit (Non connecté)                                  │
│    /product/jd794cqcy0yxmftv8qsppg6d817v28jz                    │
│                                                                  │
│    [Se connecter pour acheter] ← Clic                           │
│                                                                  │
│    Actions:                                                      │
│    • localStorage.setItem('redirectAfterLogin', '/product/...')│
│    • localStorage.setItem('showLoginPopup', 'true')            │
│    • navigate('/')                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Page d'Accueil                                               │
│    /                                                             │
│                                                                  │
│    useEffect détecte:                                           │
│    • showLoginPopup === 'true'                                  │
│    • !isAuthenticated                                           │
│                                                                  │
│    Actions:                                                      │
│    • localStorage.removeItem('showLoginPopup')                 │
│    • onShowLogin('signin') ← Ouvre le popup                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Popup de Connexion                                           │
│    [LoginModal]                                                 │
│                                                                  │
│    Utilisateur entre ses identifiants                           │
│    • Email                                                       │
│    • Mot de passe                                               │
│                                                                  │
│    [Se connecter] ← Clic                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Connexion Réussie                                            │
│    handleLoginSuccess()                                         │
│                                                                  │
│    Vérifie:                                                     │
│    • redirectAfterLogin = localStorage.getItem(...)            │
│                                                                  │
│    Actions:                                                      │
│    • localStorage.removeItem('redirectAfterLogin')             │
│    • navigate('/product/jd794cqcy0yxmftv8qsppg6d817v28jz')    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Retour sur la Page Produit (Connecté)                       │
│    /product/jd794cqcy0yxmftv8qsppg6d817v28jz                    │
│                                                                  │
│    Bouton change:                                               │
│    [Acheter] ← Maintenant actif                                │
│                                                                  │
│    L'utilisateur peut procéder à l'achat                        │
└─────────────────────────────────────────────────────────────────┘
```

## Variables localStorage Utilisées

| Clé | Type | Utilisation | Nettoyage |
|-----|------|-------------|-----------|
| `redirectAfterLogin` | string | URL de redirection après connexion | Supprimé après redirection dans `App.jsx` |
| `showLoginPopup` | string ('true') | Flag pour ouvrir le popup de connexion | Supprimé immédiatement dans `Home.jsx` |

## Logs de Débogage

Le système inclut des logs console pour faciliter le débogage :

### ProductDetail.jsx
```
🔐 ProductDetail - User not authenticated, saving redirect URL: /product/xxx
🔄 ProductDetail - Redirecting to home
```

### Home.jsx
```
🔍 Home - Checking login state: { shouldShowLogin, isAuthenticated, hasOnShowLogin }
✅ Home - Triggering login popup NOW
```

### App.jsx
```
✅ App - Login success, checking redirect: /product/xxx
🔄 App - Redirecting to: /product/xxx
```

## Points Clés

### ✅ Avantages
- Expérience utilisateur fluide
- Pas de perte de contexte (retour sur la même page)
- Nettoyage automatique des flags pour éviter les boucles
- Logs de débogage complets

### ⚠️ Points d'Attention
- Les délais (`setTimeout`) sont nécessaires pour laisser le temps aux composants de se charger
- Le nettoyage des flags localStorage est crucial pour éviter les boucles infinies
- La redirection doit se faire AVANT la gestion de l'affiliation dans `handleLoginSuccess`

## Test du Système

### Scénario de Test

1. **Déconnectez-vous** si vous êtes connecté
2. **Accédez** à une page produit : `http://localhost:3001/product/jd794cqcy0yxmftv8qsppg6d817v28jz`
3. **Cliquez** sur "Se connecter pour acheter"
4. **Vérifiez** :
   - ✅ Redirection vers la page d'accueil
   - ✅ Popup de connexion s'ouvre automatiquement
5. **Connectez-vous** avec vos identifiants
6. **Vérifiez** :
   - ✅ Redirection automatique vers la page produit
   - ✅ Bouton change en "Acheter"
   - ✅ Vous pouvez maintenant procéder à l'achat

### Console Logs Attendus

```
🔐 ProductDetail - User not authenticated, saving redirect URL: /product/jd794cqcy0yxmftv8qsppg6d817v28jz
🔄 ProductDetail - Redirecting to home
🔍 Home - Checking login state: { shouldShowLogin: 'true', isAuthenticated: false, hasOnShowLogin: true }
✅ Home - Triggering login popup NOW
✅ App - Login success, checking redirect: /product/jd794cqcy0yxmftv8qsppg6d817v28jz
🔄 App - Redirecting to: /product/jd794cqcy0yxmftv8qsppg6d817v28jz
```

## Fichiers Impliqués

| Fichier | Rôle |
|---------|------|
| `frontend/src/pages/ProductDetail.jsx` | Sauvegarde l'URL et redirige vers l'accueil |
| `frontend/src/pages/Home.jsx` | Détecte le flag et ouvre le popup |
| `frontend/src/App.jsx` | Gère la redirection après connexion |
| `frontend/src/components/LoginModal.jsx` | Popup de connexion |

## Améliorations Futures Possibles

- [ ] Ajouter un message de confirmation après redirection ("Vous pouvez maintenant procéder à l'achat")
- [ ] Sauvegarder également la quantité sélectionnée avant redirection
- [ ] Gérer le cas où l'utilisateur ferme le popup sans se connecter
- [ ] Ajouter un timeout pour nettoyer les flags après 5 minutes
- [ ] Permettre la redirection depuis d'autres pages (checkout, panier, etc.)
