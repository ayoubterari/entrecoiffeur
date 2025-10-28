# 🚀 Quick Start - Dashboard V2

Guide rapide pour démarrer avec le Dashboard V2 d'EntreCoiffeur.

## ⚡ Démarrage rapide

### 1. Lancer le serveur de développement

```bash
cd frontend
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### 2. Accéder au Dashboard V2

1. Connectez-vous à l'application : `http://localhost:3000`
2. Cliquez sur le bouton "Profil" ou connectez-vous
3. Depuis le Dashboard V1, cliquez sur **"Essayer Dashboard V2 🚀"**
4. Ou accédez directement à : `http://localhost:3000/dashboard-v2`

### 3. Navigation

- **Dashboard V1 → V2** : Bouton dans le header du Dashboard V1
- **Dashboard V2 → V1** : Bouton "Dashboard V1" dans la sidebar
- **Dashboard V2 → Marketplace** : Bouton "Marketplace" dans la sidebar

## 📂 Structure des fichiers créés

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                          # Composants shadcn/ui
│   │   │   ├── button.jsx               ✅ Créé
│   │   │   ├── card.jsx                 ✅ Créé
│   │   │   ├── avatar.jsx               ✅ Créé
│   │   │   └── separator.jsx            ✅ Créé
│   │   └── dashboardv2/                 # Composants Dashboard V2
│   │       ├── Sidebar.jsx              ✅ Créé
│   │       └── Header.jsx               ✅ Créé
│   ├── pages/
│   │   └── DashboardV2.jsx              ✅ Créé
│   ├── styles/
│   │   └── globals.css                  ✅ Créé
│   └── lib/
│       └── utils.js                     ✅ Créé
├── tailwind.config.js                   ✅ Créé
├── postcss.config.js                    ✅ Modifié
├── DASHBOARD_V2_README.md               ✅ Créé
├── DASHBOARD_V2_ROADMAP.md              ✅ Créé
└── QUICK_START_V2.md                    ✅ Créé (ce fichier)
```

## 🎨 Composants disponibles

### Button

```jsx
import { Button } from '../components/ui/button'

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

### Card

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Mon titre</CardTitle>
    <CardDescription>Ma description</CardDescription>
  </CardHeader>
  <CardContent>
    Mon contenu
  </CardContent>
  <CardFooter>
    Mes actions
  </CardFooter>
</Card>
```

### Avatar

```jsx
import { Avatar, AvatarFallback } from '../components/ui/avatar'

<Avatar>
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

## 👥 Types d'utilisateurs

Le Dashboard V2 s'adapte automatiquement selon le type d'utilisateur :

### Particulier (👤)
- Profil
- Mes achats
- Messages
- Support
- Affiliation
- Paramètres
- Dev Tools
- Mes Coupons (si membre du groupe)

### Professionnel (💼)
Tout ce que le particulier a, plus :
- **Mes Produits** (max 2 produits)
- **Mes ventes**
- **Réclamations**
- **Statistiques**

### Grossiste (🏢)
Tout ce que le professionnel a, mais :
- **Mes Produits** (illimité)

## 🛠️ Ajouter un nouveau module

### 1. Créer le composant

```jsx
// src/components/dashboardv2/MonModule.jsx
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

const MonModule = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mon Module</h2>
        <p className="text-muted-foreground">Description du module</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Contenu</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Votre contenu ici */}
        </CardContent>
      </Card>
    </div>
  )
}

export default MonModule
```

### 2. Ajouter dans la Sidebar

```jsx
// src/components/dashboardv2/Sidebar.jsx
import { MonIcon } from 'lucide-react'

const getMenuItems = () => {
  const baseItems = [
    // ... items existants
    { id: 'mon-module', name: 'Mon Module', icon: MonIcon },
  ]
  return baseItems
}
```

### 3. Ajouter dans DashboardV2

```jsx
// src/pages/DashboardV2.jsx
import MonModule from '../components/dashboardv2/MonModule'

// Dans le render
{activeTab === 'mon-module' && <MonModule />}
```

## 🎨 Personnaliser les couleurs

Éditez `src/styles/globals.css` :

```css
:root {
  --primary: 222.2 47.4% 11.2%;        /* Couleur principale */
  --primary-foreground: 210 40% 98%;   /* Texte sur primary */
  --secondary: 210 40% 96.1%;          /* Couleur secondaire */
  /* ... */
}
```

## 🔍 Debugging

### Vérifier l'authentification

```javascript
// Dans la console du navigateur
console.log('User ID:', localStorage.getItem('userId'))
console.log('User Type:', localStorage.getItem('userType'))
console.log('User Email:', localStorage.getItem('userEmail'))
```

### Vérifier les données Convex

```javascript
// Dans un composant
const currentUser = useQuery(api.auth.getCurrentUser, { userId })
console.log('Current User:', currentUser)
```

## 📝 Classes Tailwind utiles

```jsx
// Spacing
className="p-4"        // padding
className="m-4"        // margin
className="space-y-4"  // espace vertical entre enfants

// Layout
className="flex items-center justify-between"
className="grid grid-cols-2 gap-4"

// Text
className="text-sm font-medium"
className="text-muted-foreground"

// Colors
className="bg-primary text-primary-foreground"
className="border border-input"

// Responsive
className="hidden md:block"  // caché sur mobile, visible sur desktop
className="grid-cols-1 md:grid-cols-2"  // 1 col mobile, 2 cols desktop
```

## 🚨 Problèmes courants

### Les styles Tailwind ne s'appliquent pas

1. Vérifiez que `globals.css` est importé dans `DashboardV2.jsx`
2. Redémarrez le serveur de dev : `npm run dev`
3. Videz le cache du navigateur

### Erreur "Cannot read properties of undefined"

Vérifiez que l'utilisateur est bien authentifié :
```jsx
const currentUser = useQuery(api.auth.getCurrentUser, userId ? { userId } : "skip")
```

### Les icônes Lucide ne s'affichent pas

Vérifiez l'import :
```jsx
import { Home, User, Settings } from 'lucide-react'
```

## 📚 Ressources

- **Documentation complète** : `DASHBOARD_V2_README.md`
- **Roadmap** : `DASHBOARD_V2_ROADMAP.md`
- **shadcn/ui** : https://ui.shadcn.com/
- **TailwindCSS** : https://tailwindcss.com/docs
- **Lucide Icons** : https://lucide.dev/

## 🎯 Prochaines étapes

1. **Explorer le Dashboard V2** : Testez tous les onglets
2. **Comparer avec V1** : Notez les différences
3. **Lire la roadmap** : Voir les modules à venir
4. **Commencer le développement** : Module "Mes Produits" recommandé

## 💡 Conseils

- Utilisez `cn()` pour fusionner les classes Tailwind
- Suivez les conventions de nommage shadcn/ui
- Testez avec différents types d'utilisateurs
- Gardez la compatibilité avec V1
- Documentez vos modifications

## 🤝 Besoin d'aide ?

1. Consultez `DASHBOARD_V2_README.md` pour la doc complète
2. Vérifiez `DASHBOARD_V2_ROADMAP.md` pour le plan d'implémentation
3. Inspectez les composants existants pour des exemples
4. Utilisez les DevTools React pour débugger

---

**Bon développement ! 🚀**
