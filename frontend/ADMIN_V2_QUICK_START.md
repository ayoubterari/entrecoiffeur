# 🚀 Guide de démarrage rapide - Admin V2

## Accès immédiat

### 1. Démarrer le serveur de développement
```bash
cd frontend
npm run dev
```

### 2. Se connecter en tant que superadmin
- Email: `admin@entre-coiffeur.com`
- Mot de passe: Votre mot de passe superadmin

### 3. Accéder à l'interface
Ouvrez votre navigateur et allez sur :
```
http://localhost:5173/admin-v2
```

## 🎨 Aperçu de l'interface

### Navigation principale (Sidebar)
- **Dashboard** - Vue d'ensemble avec statistiques
- **Utilisateurs** - Gestion des comptes (à développer)
- **Produits** - Catalogue (à développer)
- **Catégories** - Organisation (à développer)
- **Commandes** - Suivi des ventes (à développer)
- **Commissions** - Calculs financiers (à développer)
- **Net Vendeur** - Rapports vendeurs (à développer)
- **Paiement** - Configuration (à développer)
- **Blog** - Articles (à développer)
- **Coupons** - Réductions (à développer)
- **Support** - Tickets clients (à développer)
- **Statistiques** - Analytics (à développer)
- **Paramètres** - Configuration (à développer)

### Header
- 🔍 Barre de recherche
- 🔔 Notifications
- 👤 Menu utilisateur avec déconnexion

### Dashboard (Page d'accueil)
- 📊 4 cartes de statistiques principales
- ⚠️ Alertes et actions requises
- 📈 Activité récente
- 🎧 Statistiques support

## 🔄 Comparaison Admin vs Admin V2

| Fonctionnalité | Admin (ancien) | Admin V2 (nouveau) |
|----------------|----------------|-------------------|
| Route | `/admin` | `/admin-v2` |
| Design | CSS custom | shadcn/ui + Tailwind |
| Layout | Tabs horizontales | Sidebar + Header |
| Composants | Custom | Radix UI + shadcn |
| Icons | Emojis | Lucide React |
| État | Complet | Setup initial |

## 📝 Développer un module

### Exemple : Module Utilisateurs

1. **Créer le fichier**
```bash
# Dans frontend/src/components/adminv2/
touch UsersModule.jsx
```

2. **Code de base**
```jsx
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Users, UserPlus } from 'lucide-react'

const UsersModule = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Utilisateurs</h2>
          <p className="text-muted-foreground">
            Gérez les utilisateurs de la plateforme
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            Tous les utilisateurs enregistrés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Votre tableau ou liste ici */}
          <p>Contenu à développer...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default UsersModule
```

3. **Intégrer dans AdminV2.jsx**
```jsx
// Import
import UsersModule from '../components/adminv2/UsersModule'

// Dans le render
{activeTab === 'users' && <UsersModule />}
```

## 🎯 Composants UI disponibles

Tous les composants shadcn/ui sont prêts à l'emploi :

```jsx
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu'
import { Separator } from '../ui/separator'
```

### Exemples d'utilisation

**Button**
```jsx
<Button variant="default">Enregistrer</Button>
<Button variant="outline">Annuler</Button>
<Button variant="destructive">Supprimer</Button>
```

**Card**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu de la carte
  </CardContent>
</Card>
```

## 🔧 Commandes utiles

### Développement
```bash
npm run dev          # Démarrer le serveur
npm run build        # Build production
npm run preview      # Prévisualiser le build
```

### Ajouter des composants shadcn (si nécessaire)
Les composants de base sont déjà installés. Pour en ajouter d'autres :
```bash
# Exemple : ajouter le composant Table
npx shadcn-ui@latest add table
```

## 🐛 Dépannage

### L'interface ne charge pas
1. Vérifiez que vous êtes connecté en tant que superadmin
2. Vérifiez la console pour les erreurs
3. Assurez-vous que Convex est bien démarré

### Erreur d'import de composants
1. Vérifiez que le composant existe dans `src/components/ui/`
2. Vérifiez le chemin d'import
3. Redémarrez le serveur de développement

### Styles ne s'appliquent pas
1. Vérifiez que TailwindCSS est bien configuré
2. Vérifiez `src/styles/globals.css`
3. Redémarrez le serveur

## 📚 Ressources

- **shadcn/ui** : https://ui.shadcn.com
- **Lucide Icons** : https://lucide.dev
- **TailwindCSS** : https://tailwindcss.com
- **Radix UI** : https://www.radix-ui.com
- **Template de référence** : https://github.com/satnaing/shadcn-admin

## ✅ Checklist de développement

Avant de développer un module :
- [ ] Définir les fonctionnalités requises
- [ ] Identifier les queries Convex nécessaires
- [ ] Choisir les composants UI à utiliser
- [ ] Créer le composant dans `adminv2/`
- [ ] Tester l'authentification
- [ ] Tester le responsive
- [ ] Documenter les changements

---

**Bon développement ! 🚀**
