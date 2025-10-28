# Dashboard V2 - EntreCoiffeur

## 📋 Vue d'ensemble

Le Dashboard V2 est une refonte complète du tableau de bord utilisateur, basé sur le template [shadcn-admin](https://github.com/satnaing/shadcn-admin.git). Cette nouvelle version utilise des technologies modernes pour offrir une expérience utilisateur améliorée tout en conservant la compatibilité avec l'ancienne version.

## 🎯 Objectifs

- **Modernisation** : Interface utilisateur moderne et élégante avec TailwindCSS et shadcn/ui
- **Coexistence** : Les deux versions (V1 et V2) fonctionnent en parallèle
- **Évolutivité** : Architecture modulaire facilitant l'ajout de nouvelles fonctionnalités
- **Accessibilité** : Composants Radix UI pour une meilleure accessibilité

## 🛠️ Technologies utilisées

### Core
- **React 18.2.0** : Framework JavaScript
- **Vite 5.0.8** : Build tool et dev server
- **React Router DOM 6.8.0** : Routing

### UI & Styling
- **TailwindCSS 3.x** : Framework CSS utility-first
- **Radix UI** : Composants accessibles et non stylés
  - @radix-ui/react-slot
  - @radix-ui/react-avatar
  - @radix-ui/react-separator
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-dialog
  - @radix-ui/react-label
- **Lucide React 0.546.0** : Icônes modernes
- **class-variance-authority** : Gestion des variants de composants
- **clsx** : Utilitaire pour les classes conditionnelles
- **tailwind-merge** : Fusion intelligente des classes Tailwind

### Backend
- **Convex 1.5.0** : Backend as a Service (partagé avec V1)

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                      # Composants UI shadcn/ui
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── avatar.jsx
│   │   │   └── separator.jsx
│   │   └── dashboardv2/             # Composants spécifiques Dashboard V2
│   │       ├── Sidebar.jsx
│   │       └── Header.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx            # Dashboard V1 (existant)
│   │   └── DashboardV2.jsx          # Dashboard V2 (nouveau)
│   ├── styles/
│   │   └── globals.css              # Styles Tailwind et variables CSS
│   └── lib/
│       └── utils.js                 # Utilitaires (cn helper)
├── tailwind.config.js               # Configuration Tailwind
├── postcss.config.js                # Configuration PostCSS
└── DASHBOARD_V2_README.md           # Cette documentation
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js 16+ installé
- npm ou yarn

### Installation
Les dépendances sont déjà installées. Si besoin de réinstaller :

```bash
cd frontend
npm install
```

### Démarrage du serveur de développement
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## 🔗 Routes

- **`/dashboard`** : Dashboard V1 (version existante)
- **`/dashboard-v2`** : Dashboard V2 (nouvelle version)
- **Navigation** : Boutons de navigation entre les deux versions dans les headers

## 👥 Gestion des rôles

Le Dashboard V2 supporte trois types d'utilisateurs avec des permissions différentes :

### 1. Particulier (👤)
- ✅ Profil
- ✅ Mes achats
- ✅ Messages
- ✅ Support
- ✅ Affiliation
- ✅ Paramètres
- ✅ Dev Tools
- ✅ Mes Coupons (si membre du groupe)

### 2. Professionnel (💼)
Tout ce que le particulier a, plus :
- ✅ Mes Produits (limité à 2 produits)
- ✅ Mes ventes
- ✅ Réclamations
- ✅ Statistiques

### 3. Grossiste (🏢)
Tout ce que le professionnel a, mais :
- ✅ Mes Produits (illimité)

## 🎨 Composants UI disponibles

### Button
```jsx
import { Button } from '../components/ui/button'

<Button variant="default">Cliquez-moi</Button>
<Button variant="destructive">Supprimer</Button>
<Button variant="outline">Annuler</Button>
<Button variant="secondary">Secondaire</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Lien</Button>

// Tailles
<Button size="default">Normal</Button>
<Button size="sm">Petit</Button>
<Button size="lg">Grand</Button>
<Button size="icon">🔍</Button>
```

### Card
```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu de la carte
  </CardContent>
  <CardFooter>
    Actions
  </CardFooter>
</Card>
```

### Avatar
```jsx
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar'

<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Separator
```jsx
import { Separator } from '../components/ui/separator'

<Separator />
<Separator orientation="vertical" />
```

## 🎯 Modules implémentés

### ✅ Module Profil
- Affichage des informations utilisateur (lecture seule)
- Affichage du type de compte
- Affichage de l'entreprise (si applicable)
- Badge de statut utilisateur

### 🚧 Modules à implémenter

Les modules suivants sont prévus avec des placeholders :

1. **Mes achats** : Historique des commandes avec filtres et recherche
2. **Mes Produits** : CRUD complet avec gestion d'images
3. **Mes ventes** : Gestion des commandes reçues avec statistiques
4. **Messages** : Chat en temps réel avec les clients/vendeurs
5. **Support** : Système de tickets de support
6. **Affiliation** : Programme d'affiliation et suivi des gains
7. **Réclamations** : Gestion SAV pour professionnels/grossistes
8. **Statistiques** : Analytics et rapports de vente
9. **Paramètres** : Configuration du compte
10. **Dev Tools** : Outils de développement
11. **Mes Coupons** : Gestion des coupons (membres du groupe)

## 🔧 Configuration

### TailwindCSS
Le fichier `tailwind.config.js` est configuré avec :
- Thème shadcn/ui
- Variables CSS personnalisées
- Support du dark mode (classe)
- Breakpoints responsive

### Variables CSS
Les variables de couleur sont définies dans `src/styles/globals.css` :
- Mode clair et sombre
- Couleurs sémantiques (primary, secondary, destructive, etc.)
- Radius personnalisables

## 🎨 Personnalisation

### Modifier les couleurs
Éditez les variables CSS dans `src/styles/globals.css` :

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... autres variables */
}
```

### Ajouter un nouveau composant UI
1. Créer le fichier dans `src/components/ui/`
2. Utiliser le helper `cn()` pour les classes
3. Suivre les conventions shadcn/ui

### Ajouter un nouveau module
1. Ajouter l'onglet dans `Sidebar.jsx` (getMenuItems)
2. Ajouter la condition dans `DashboardV2.jsx`
3. Créer le composant du module

## 📱 Responsive Design

Le Dashboard V2 est entièrement responsive :
- **Desktop** : Sidebar fixe + contenu principal
- **Tablet** : Sidebar collapsible
- **Mobile** : Navigation en bas ou menu hamburger (à implémenter)

## 🔐 Sécurité

- Authentification requise pour accéder au dashboard
- Redirection automatique vers `/` si non authentifié
- Permissions basées sur le type d'utilisateur
- Données utilisateur stockées dans localStorage et Convex

## 🐛 Debugging

### Warnings CSS
Les warnings `Unknown at rule @tailwind` sont normaux - ce sont des directives TailwindCSS traitées au build.

### Vérifier l'authentification
```javascript
console.log('User ID:', localStorage.getItem('userId'))
console.log('User Type:', localStorage.getItem('userType'))
```

## 📚 Ressources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Convex Documentation](https://docs.convex.dev/)

## 🚀 Prochaines étapes

1. Implémenter le module "Mes Produits" avec Table, Dialog et Form
2. Ajouter la pagination et les filtres avancés
3. Implémenter le système de messages en temps réel
4. Ajouter les statistiques et graphiques
5. Optimiser pour mobile avec menu hamburger
6. Ajouter le mode sombre
7. Tests unitaires et d'intégration

## 💡 Conseils de développement

- Utiliser `cn()` pour fusionner les classes Tailwind
- Suivre les conventions de nommage shadcn/ui
- Tester sur différents types d'utilisateurs
- Vérifier la compatibilité avec V1
- Documenter les nouveaux composants

## 🤝 Contribution

Pour ajouter un nouveau module :
1. Créer le composant dans `src/components/dashboardv2/`
2. Ajouter l'entrée dans le menu de la Sidebar
3. Ajouter la route dans DashboardV2.jsx
4. Tester avec différents types d'utilisateurs
5. Mettre à jour cette documentation

---

**Version** : 1.0.0  
**Date** : Octobre 2024  
**Auteur** : EntreCoiffeur Team
