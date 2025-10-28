# Admin V2 - Interface d'Administration

## 📋 Vue d'ensemble

Admin V2 est une nouvelle interface d'administration pour EntreCoiffeur, basée sur le template [shadcn-admin](https://github.com/satnaing/shadcn-admin). Cette interface moderne utilise shadcn/ui et TailwindCSS pour offrir une expérience utilisateur optimale.

## 🎯 Objectif

Créer une alternative moderne à l'interface admin existante (`/admin`) avec :
- Design moderne et responsive basé sur shadcn/ui
- Architecture propre et séparée de l'existant
- Setup initial sans développement complet des modules
- Possibilité d'évolution progressive

## 📁 Structure des fichiers

```
frontend/
├── src/
│   ├── components/
│   │   ├── adminv2/              # Composants spécifiques à AdminV2
│   │   │   ├── Sidebar.jsx       # Navigation latérale
│   │   │   ├── Header.jsx        # En-tête avec recherche et profil
│   │   │   └── DashboardContent.jsx  # Contenu du dashboard
│   │   └── ui/                   # Composants UI shadcn (déjà existants)
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── avatar.jsx
│   │       ├── dropdown-menu.jsx
│   │       └── separator.jsx
│   └── pages/
│       ├── Admin.jsx             # Ancien admin (conservé)
│       └── AdminV2.jsx           # Nouvelle interface admin
└── ADMIN_V2_README.md           # Ce fichier
```

## 🚀 Accès à l'interface

### Routes disponibles
- `/admin` - Interface admin existante (conservée)
- `/admin-v2` - Nouvelle interface AdminV2

### Authentification requise
- Type d'utilisateur : `superadmin`
- L'accès est protégé et redirige vers `/dashboard` si l'utilisateur n'est pas superadmin

## 🎨 Design et Technologies

### Stack technique
- **UI Framework** : React
- **Composants** : shadcn/ui (basé sur Radix UI)
- **Styling** : TailwindCSS
- **Icons** : Lucide React
- **Backend** : Convex (existant)

### Composants principaux

#### 1. Sidebar (`Sidebar.jsx`)
- Navigation latérale fixe
- Menu avec icônes Lucide
- État actif avec highlight
- Footer avec version

**Modules disponibles** :
- Dashboard
- Utilisateurs
- Produits
- Catégories
- Commandes
- Commissions
- Net Vendeur
- Paiement
- Blog
- Coupons
- Support
- Statistiques
- Paramètres

#### 2. Header (`Header.jsx`)
- Barre de recherche
- Notifications avec badge
- Menu utilisateur avec dropdown
- Bouton de déconnexion

#### 3. DashboardContent (`DashboardContent.jsx`)
- Cartes de statistiques avec tendances
- Alertes et actions requises
- Activité récente
- Statistiques de support

## 📊 Données et Statistiques

L'interface récupère les données en temps réel via Convex :
- Utilisateurs (total, par type)
- Produits (total, featured, stock)
- Commandes (total, statut, revenue)
- Catégories
- Support (tickets)

## 🔧 État actuel

### ✅ Implémenté
- [x] Structure de base (Sidebar, Header, Layout)
- [x] Dashboard avec statistiques
- [x] Navigation entre modules
- [x] Authentification et protection des routes
- [x] Design responsive
- [x] Intégration avec les données Convex existantes

### 🚧 En attente de développement
- [ ] Module Utilisateurs
- [ ] Module Produits
- [ ] Module Catégories
- [ ] Module Commandes
- [ ] Module Commissions
- [ ] Module Net Vendeur
- [ ] Module Configuration Paiement
- [ ] Module Blog
- [ ] Module Coupons
- [ ] Module Support
- [ ] Module Statistiques avancées
- [ ] Module Paramètres

## 🎯 Prochaines étapes recommandées

### Phase 1 : Modules critiques
1. **Module Utilisateurs** - Gestion complète des utilisateurs
2. **Module Produits** - CRUD avec upload d'images
3. **Module Commandes** - Suivi et gestion des commandes

### Phase 2 : Modules financiers
4. **Module Commissions** - Configuration et calcul
5. **Module Net Vendeur** - Rapports financiers
6. **Module Paiement** - Configuration Stripe/PayPal

### Phase 3 : Modules de contenu
7. **Module Blog** - Gestion des articles
8. **Module Coupons** - Codes de réduction
9. **Module Support** - Système de tickets

### Phase 4 : Analytics et paramètres
10. **Module Statistiques** - Graphiques et rapports
11. **Module Paramètres** - Configuration globale

## 💡 Conseils de développement

### Ajouter un nouveau module

1. **Créer le composant** dans `src/components/adminv2/`
```jsx
// Exemple: UsersModule.jsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const UsersModule = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Utilisateurs</h2>
        <p className="text-muted-foreground">
          Gestion des utilisateurs de la plateforme
        </p>
      </div>
      {/* Votre contenu ici */}
    </div>
  )
}

export default UsersModule
```

2. **Importer dans AdminV2.jsx**
```jsx
import UsersModule from '../components/adminv2/UsersModule'
```

3. **Ajouter dans le switch**
```jsx
{activeTab === 'users' && <UsersModule />}
```

### Utiliser les composants shadcn/ui

Tous les composants shadcn/ui sont disponibles dans `src/components/ui/` :
- `Button` - Boutons avec variants
- `Card` - Cartes de contenu
- `Avatar` - Avatars utilisateur
- `DropdownMenu` - Menus déroulants
- `Separator` - Séparateurs
- Et plus encore...

## 🔐 Sécurité

- Vérification de l'authentification à chaque route
- Contrôle du type d'utilisateur (superadmin uniquement)
- Nettoyage du localStorage à la déconnexion
- Redirection automatique si non autorisé

## 📝 Notes importantes

1. **Coexistence** : L'ancien admin (`/admin`) et le nouveau (`/admin-v2`) coexistent sans conflit
2. **Données partagées** : Les deux interfaces utilisent les mêmes queries Convex
3. **Indépendance** : Les fichiers AdminV2 sont dans des dossiers séparés (`adminv2/`)
4. **Migration progressive** : Possibilité de migrer module par module

## 🤝 Contribution

Pour ajouter de nouvelles fonctionnalités :
1. Créer les composants dans `src/components/adminv2/`
2. Utiliser les composants UI existants de shadcn
3. Suivre le pattern de design existant
4. Tester l'authentification et les permissions

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation shadcn/ui : https://ui.shadcn.com
- Vérifier le template de référence : https://github.com/satnaing/shadcn-admin
- Consulter la documentation Convex pour les queries

---

**Version** : 1.0.0  
**Date** : Octobre 2024  
**Status** : Setup initial - Prêt pour développement des modules
