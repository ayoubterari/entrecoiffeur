# Système de Gestion des Utilisateurs pour Professionnels et Grossistes

## Vue d'ensemble

Le système permet aux professionnels et grossistes de créer des comptes pour leurs employés avec des accès limités à certains modules du dashboard. Cela offre une gestion granulaire des permissions et une meilleure organisation du travail en équipe.

## Architecture

### 1. Table Convex `sellerUsers`

Nouvelle table dans le schéma pour gérer les sous-utilisateurs :

```typescript
sellerUsers: defineTable({
  userId: v.id("users"),              // Référence vers le compte utilisateur créé
  parentSellerId: v.id("users"),      // ID du professionnel/grossiste parent
  email: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  role: v.union(
    v.literal("manager"),             // Gestionnaire avec accès étendu
    v.literal("employee"),            // Employé avec accès limité
    v.literal("viewer")               // Observateur en lecture seule
  ),
  permissions: v.object({
    profile: v.boolean(),             // Accès au profil
    products: v.boolean(),            // Gestion des produits
    orders: v.boolean(),              // Gestion des commandes/ventes
    purchases: v.boolean(),           // Voir les achats
    messages: v.boolean(),            // Accès aux messages
    complaints: v.boolean(),          // Gestion des réclamations
    coupons: v.boolean(),             // Gestion des coupons
    support: v.boolean(),             // Accès au support
    stats: v.boolean(),               // Voir les statistiques
    settings: v.boolean(),            // Modifier les paramètres
  }),
  isActive: v.boolean(),              // Compte actif ou désactivé
  createdBy: v.id("users"),           // Qui a créé ce sous-utilisateur
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

### 2. Rôles disponibles

- **🛡️ Manager** : Gestionnaire avec accès étendu à la plupart des modules
- **👤 Employee** : Employé avec accès standard aux modules de base
- **👁️ Viewer** : Observateur en lecture seule, accès limité

### 3. Modules avec permissions

10 modules configurables :

1. **profile** - Accès au profil
2. **products** - Gestion des produits
3. **orders** - Gestion des commandes/ventes
4. **purchases** - Voir les achats
5. **messages** - Accès aux messages
6. **complaints** - Gestion des réclamations
7. **coupons** - Gestion des coupons
8. **support** - Accès au support
9. **stats** - Voir les statistiques
10. **settings** - Modifier les paramètres

## Backend Convex

### Mutations (`functions/mutations/sellerUsers.ts`)

#### `createSellerUserComplete`
Créer un compte utilisateur complet avec permissions.

```typescript
Args:
- email: string
- password: string (min 6 caractères)
- firstName: string
- lastName: string
- parentSellerId: Id<"users">
- role: "manager" | "employee" | "viewer"
- permissions: { profile: boolean, products: boolean, ... }

Returns: { userId, sellerUserId }
```

**Flux** :
1. Vérifie que le parent est bien un professionnel/grossiste
2. Vérifie que l'email n'existe pas déjà
3. Crée le compte utilisateur avec le même `userType` que le parent
4. Crée l'entrée `sellerUser` avec les permissions
5. Retourne les IDs créés

#### `updateSellerUserPermissions`
Modifier les permissions d'un sous-utilisateur.

```typescript
Args:
- sellerUserId: Id<"sellerUsers">
- permissions: { profile: boolean, products: boolean, ... }
- updatedBy: Id<"users">
```

#### `updateSellerUserRole`
Changer le rôle d'un sous-utilisateur.

```typescript
Args:
- sellerUserId: Id<"sellerUsers">
- role: "manager" | "employee" | "viewer"
- updatedBy: Id<"users">
```

#### `toggleSellerUserStatus`
Activer/Désactiver un sous-utilisateur.

```typescript
Args:
- sellerUserId: Id<"sellerUsers">
- updatedBy: Id<"users">

Returns: { success: boolean, isActive: boolean }
```

#### `deleteSellerUser`
Supprimer un sous-utilisateur.

```typescript
Args:
- sellerUserId: Id<"sellerUsers">
- deletedBy: Id<"users">
```

### Queries (`functions/queries/sellerUsers.ts`)

#### `getSellerUsersByParent`
Récupérer tous les sous-utilisateurs d'un vendeur.

```typescript
Args:
- parentSellerId: Id<"users">

Returns: SellerUser[]
```

#### `getActiveSellerUsers`
Récupérer uniquement les sous-utilisateurs actifs.

```typescript
Args:
- parentSellerId: Id<"users">

Returns: SellerUser[]
```

#### `getUserPermissions`
Récupérer les permissions d'un utilisateur.

```typescript
Args:
- userId: Id<"users">

Returns: SellerUser | null
```

#### `checkModuleAccess`
Vérifier l'accès à un module spécifique.

```typescript
Args:
- userId: Id<"users">
- module: string

Returns: boolean
```

#### `getSellerUserById`
Récupérer les détails d'un sous-utilisateur.

```typescript
Args:
- sellerUserId: Id<"sellerUsers">

Returns: SellerUser with parent info
```

#### `getSellerUsersStats`
Récupérer les statistiques des sous-utilisateurs.

```typescript
Args:
- parentSellerId: Id<"users">

Returns: {
  total: number,
  active: number,
  inactive: number,
  byRole: { manager: number, employee: number, viewer: number }
}
```

## Frontend

### Module TeamModule (`components/dashboardv2/TeamModule.jsx`)

Interface complète de gestion des utilisateurs avec :

#### Fonctionnalités

1. **Statistiques** :
   - Total des utilisateurs créés
   - Comptes actifs
   - Nombre de gestionnaires
   - Nombre d'employés

2. **Création d'utilisateur** :
   - Formulaire avec email, mot de passe, prénom, nom
   - Sélection du rôle (manager, employee, viewer)
   - Configuration des permissions par module avec switches
   - Validation côté client et serveur

3. **Liste des utilisateurs** :
   - Recherche par nom ou email
   - Affichage avec avatar coloré selon le rôle
   - Badges de statut (Actif/Désactivé) et de rôle
   - Nombre de modules accessibles affiché

4. **Actions disponibles** :
   - ✏️ **Modifier** : Éditer les permissions via dialog
   - 👁️ **Activer/Désactiver** : Toggle du statut
   - 🗑️ **Supprimer** : Retirer l'utilisateur

5. **Modification des permissions** :
   - Dialog avec tous les modules
   - Switches pour activer/désactiver chaque module
   - Icônes pour identifier rapidement les modules
   - Enregistrement en temps réel

### Contrôle d'accès dans DashboardV2

#### Fonction `hasAccess(module)`

```javascript
const hasAccess = (module) => {
  // Si pas un sous-utilisateur, accès complet
  if (!userPermissions || !userPermissions.isSubUser) {
    return true
  }

  // Si compte désactivé, pas d'accès
  if (!userPermissions.isActive) {
    return false
  }

  // Vérifier la permission spécifique
  return userPermissions.permissions?.[module] || false
}
```

#### Filtrage de la Sidebar

La sidebar filtre automatiquement les modules selon les permissions :

```javascript
// Exemple : Mes Produits
if (!hasAccess || hasAccess('products')) {
  allItems.push({ id: 'products', name: 'Mes Produits', icon: Package })
}
```

**Modules cachés pour les sous-utilisateurs** :
- **Mon équipe** : Seul le compte principal peut gérer l'équipe
- **Changement de compte** : Seul le compte principal peut changer de type

#### Protection des modules

Chaque module vérifie l'accès avant le rendu :

```javascript
{activeTab === 'products' && hasAccess('products') && (
  <ProductsModule userId={userId} userType={userType} />
)}
```

**Message d'accès refusé** :
Si un sous-utilisateur tente d'accéder à un module non autorisé, un message s'affiche :

```
Accès refusé
Vous n'avez pas la permission d'accéder à ce module.
Contactez l'administrateur de votre compte pour obtenir l'accès à ce module.
```

## Flux d'utilisation

### 1. Créer un sous-utilisateur

1. Professionnel/Grossiste accède à **Dashboard > Mon équipe**
2. Clique sur **"Nouvel utilisateur"**
3. Remplit le formulaire :
   - Email (unique)
   - Mot de passe (min 6 caractères)
   - Prénom et Nom
   - Rôle (manager/employee/viewer)
   - Modules accessibles (switches)
4. Valide la création
5. **Un nouveau compte utilisateur est créé automatiquement**
6. Le sous-utilisateur peut se connecter immédiatement

### 2. Connexion d'un sous-utilisateur

1. Utilisateur se connecte avec email/mot de passe
2. DashboardV2 récupère ses permissions via `getUserPermissions`
3. Sidebar affiche uniquement les modules autorisés
4. Tentative d'accès à un module non autorisé = message d'erreur

### 3. Modifier les permissions

1. Compte principal ouvre **Mon équipe**
2. Clique sur ✏️ pour un utilisateur
3. Ajuste les switches des permissions
4. Enregistre les modifications
5. Le sous-utilisateur voit immédiatement les changements

### 4. Désactiver temporairement

1. Compte principal ouvre **Mon équipe**
2. Clique sur 👁️ pour désactiver
3. Le compte est désactivé mais pas supprimé
4. Peut être réactivé à tout moment

### 5. Supprimer un utilisateur

1. Compte principal ouvre **Mon équipe**
2. Clique sur 🗑️ pour supprimer
3. Confirme la suppression
4. L'entrée `sellerUser` est supprimée
5. Le compte utilisateur principal reste (pour l'historique)

## Sécurité

### Vérifications côté serveur

- ✅ **Validation du parent** : Seuls les professionnels/grossistes peuvent créer des sous-utilisateurs
- ✅ **Email unique** : Pas de doublons dans la base
- ✅ **Permissions strictes** : Seul le parent peut modifier/supprimer ses sous-utilisateurs
- ✅ **Traçabilité** : Chaque action enregistre qui l'a effectuée

### Vérifications côté client

- ✅ **Filtrage UI** : Sidebar affiche uniquement les modules autorisés
- ✅ **Protection des routes** : Modules protégés par vérification d'accès
- ✅ **Messages d'erreur** : Feedback clair en cas d'accès refusé
- ✅ **Désactivation temporaire** : Sans supprimer les données

### Hiérarchie des accès

```
Compte Principal (Professionnel/Grossiste)
  ├─ Accès complet à tous les modules
  ├─ Peut créer des sous-utilisateurs
  ├─ Peut modifier les permissions
  ├─ Peut activer/désactiver/supprimer
  └─ Accès au module "Mon équipe"

Sous-utilisateur (Manager/Employee/Viewer)
  ├─ Accès selon les permissions définies
  ├─ Ne peut pas créer d'autres utilisateurs
  ├─ Ne peut pas modifier ses propres permissions
  ├─ Pas d'accès au module "Mon équipe"
  └─ Pas d'accès au "Changement de compte"
```

## Avantages

### Pour les professionnels/grossistes

- 🎯 **Délégation efficace** : Attribuer des tâches spécifiques à chaque membre
- 🔐 **Sécurité renforcée** : Limiter l'accès aux données sensibles
- 📊 **Traçabilité** : Savoir qui fait quoi dans l'équipe
- ⚡ **Flexibilité** : Modifier les permissions à tout moment
- 👥 **Gestion d'équipe** : Vue d'ensemble de tous les membres

### Pour les employés

- 🎨 **Interface simplifiée** : Voir uniquement les modules nécessaires
- 🚀 **Accès immédiat** : Se connecter et travailler directement
- 🔒 **Sécurité** : Pas d'accès aux données non nécessaires
- 📱 **Multi-appareils** : Se connecter depuis n'importe où

### Pour la plateforme

- 💼 **Professionnalisation** : Offrir une solution B2B complète
- 📈 **Scalabilité** : Supporter les grandes équipes
- 🔧 **Maintenance** : Système centralisé et facile à gérer
- 🎯 **Différenciation** : Fonctionnalité unique sur le marché

## Exemples d'utilisation

### Cas 1 : Salon de coiffure

**Compte principal** : Propriétaire du salon
- Accès complet à tous les modules

**Manager** : Responsable du salon
- ✅ Produits : Gérer le catalogue
- ✅ Commandes : Traiter les ventes
- ✅ Messages : Répondre aux clients
- ✅ Réclamations : Gérer le SAV
- ❌ Achats : Pas d'accès
- ❌ Paramètres : Pas d'accès

**Employé** : Coiffeur
- ✅ Produits : Voir le catalogue
- ✅ Messages : Répondre aux clients
- ❌ Commandes : Pas d'accès
- ❌ Réclamations : Pas d'accès
- ❌ Achats : Pas d'accès

### Cas 2 : Grossiste

**Compte principal** : Directeur commercial
- Accès complet à tous les modules

**Manager** : Chef des ventes
- ✅ Produits : Gérer le catalogue
- ✅ Commandes : Suivre les ventes
- ✅ Messages : Communication clients
- ✅ Support : Assistance technique
- ✅ Stats : Voir les performances
- ❌ Paramètres : Pas d'accès

**Employee** : Commercial
- ✅ Produits : Consulter le catalogue
- ✅ Messages : Répondre aux prospects
- ✅ Support : Créer des tickets
- ❌ Commandes : Pas d'accès
- ❌ Stats : Pas d'accès

**Viewer** : Stagiaire
- ✅ Produits : Voir le catalogue
- ✅ Messages : Lire les conversations
- ❌ Tout le reste : Lecture seule

## Fichiers créés/modifiés

### Backend
- ✅ `backend/convex/schema.ts` (table sellerUsers)
- ✅ `backend/convex/functions/mutations/sellerUsers.ts` (5 mutations)
- ✅ `backend/convex/functions/queries/sellerUsers.ts` (6 queries)

### Frontend
- ✅ `frontend/src/components/dashboardv2/TeamModule.jsx` (module complet)
- ✅ `frontend/src/components/dashboardv2/Sidebar.jsx` (filtrage des menus)
- ✅ `frontend/src/pages/DashboardV2.jsx` (contrôle d'accès)

### Documentation
- ✅ `SELLER_USERS_SYSTEM.md` (ce fichier)

## Prochaines améliorations possibles

### Court terme
- [ ] Notifications par email lors de la création d'un compte
- [ ] Historique des actions des sous-utilisateurs
- [ ] Export de la liste des utilisateurs (CSV/PDF)
- [ ] Filtres avancés dans la liste (par rôle, statut, date)

### Moyen terme
- [ ] Permissions plus granulaires (lecture/écriture séparées)
- [ ] Groupes d'utilisateurs avec permissions partagées
- [ ] Logs d'audit détaillés
- [ ] Statistiques d'utilisation par utilisateur

### Long terme
- [ ] Intégration avec des systèmes RH externes
- [ ] API pour la gestion programmatique
- [ ] Authentification à deux facteurs (2FA)
- [ ] Single Sign-On (SSO)

## Support

Pour toute question ou problème :
- 📧 Email : support@entrecoiffeur.com
- 📱 Téléphone : +212 XXX XXX XXX
- 💬 Chat : Disponible dans le dashboard

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Auteur** : Équipe EntreCoiffeur
