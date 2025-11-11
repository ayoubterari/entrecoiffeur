# Restriction d'Accès aux Coupons pour les Professionnels

## Vue d'ensemble

Modification du système de permissions pour **exclure les utilisateurs de type "professionnel"** de l'accès au module "Mes Coupons" dans le dashboard.

## Contexte

### Avant la Modification

**Accès aux Coupons** :
- ✅ **Grossistes** : Accès complet
- ✅ **Professionnels** : Accès complet
- ✅ **Membres de groupe** : Accès aux coupons de groupe

### Après la Modification

**Accès aux Coupons** :
- ✅ **Grossistes** : Accès complet (inchangé)
- ❌ **Professionnels** : Accès retiré
- ✅ **Membres de groupe (sauf professionnels)** : Accès aux coupons de groupe

## Raison de la Modification

Les professionnels ne doivent pas avoir accès au système de création et gestion de coupons de réduction. Cette fonctionnalité est réservée aux grossistes qui ont des volumes de vente plus importants et peuvent offrir des réductions à leurs clients.

## Modifications Apportées

### 1. Sidebar.jsx (Dashboard v2)

**Fichier** : `frontend/src/components/dashboardv2/Sidebar.jsx`

**Avant** :
```javascript
if (!hasAccess || hasAccess('coupons')) {
  allItems.push({ id: 'coupons', name: 'Mes Coupons', icon: Ticket })
}
```

**Après** :
```javascript
// Mes Coupons - uniquement pour les grossistes
if (userType === 'grossiste' && (!hasAccess || hasAccess('coupons'))) {
  allItems.push({ id: 'coupons', name: 'Mes Coupons', icon: Ticket })
}
```

**Ligne modifiée** : 74-77

**Impact** :
- Les professionnels ne voient plus l'option "Mes Coupons" dans le menu latéral
- Les grossistes conservent l'accès complet
- Les sous-utilisateurs respectent les permissions définies par le compte principal

### 2. Dashboard.jsx (Dashboard v1)

**Fichier** : `frontend/src/pages/Dashboard.jsx`

**Avant** :
```javascript
// Ajouter l'onglet Coupons uniquement pour les membres de groupe
if (currentUser?.isGroupMember) {
  baseTabs.push({ id: 'coupons', name: 'Mes Coupons', icon: '🎫' })
}
```

**Après** :
```javascript
// Ajouter l'onglet Coupons uniquement pour les membres de groupe qui ne sont pas professionnels
if (currentUser?.isGroupMember && userType !== 'professionnel') {
  baseTabs.push({ id: 'coupons', name: 'Mes Coupons', icon: '🎫' })
}
```

**Ligne modifiée** : 211-214

**Impact** :
- Les professionnels membres de groupe ne voient plus l'onglet "Mes Coupons"
- Les particuliers et grossistes membres de groupe conservent l'accès
- Cohérence entre les deux versions du dashboard

## Types d'Utilisateurs

### Grossiste
```
Type: 'grossiste'
Accès Coupons: ✅ OUI
Fonctionnalités:
  - Créer des coupons de réduction
  - Gérer les codes promo
  - Définir les conditions d'utilisation
  - Suivre l'utilisation des coupons
```

### Professionnel
```
Type: 'professionnel'
Accès Coupons: ❌ NON
Fonctionnalités disponibles:
  - Mes Produits
  - Mes Ventes
  - Mes Factures
  - Réclamations
  - Fonds de Commerce
```

### Particulier (Membre de Groupe)
```
Type: 'particulier'
Membre de Groupe: true
Accès Coupons: ✅ OUI (coupons de groupe uniquement)
Fonctionnalités:
  - Utiliser les coupons du groupe
  - Voir les coupons disponibles
```

## Logique de Permissions

### Sidebar (Dashboard v2)

```javascript
// Onglets pour professionnels et grossistes
if (userType === 'professionnel' || userType === 'grossiste') {
  // Produits, Ventes, Factures, Réclamations
  
  // Mes Coupons - UNIQUEMENT GROSSISTES
  if (userType === 'grossiste' && (!hasAccess || hasAccess('coupons'))) {
    allItems.push({ id: 'coupons', name: 'Mes Coupons', icon: Ticket })
  }
  
  // Fonds de Commerce
  // Mon équipe (grossistes uniquement)
}
```

### Dashboard (v1)

```javascript
// Coupons de groupe - EXCLUSION DES PROFESSIONNELS
if (currentUser?.isGroupMember && userType !== 'professionnel') {
  baseTabs.push({ id: 'coupons', name: 'Mes Coupons', icon: '🎫' })
}
```

## Hiérarchie des Permissions

### Ordre de Vérification

1. **Type d'utilisateur** : `userType === 'grossiste'`
2. **Permissions du sous-utilisateur** : `hasAccess('coupons')`
3. **Membre de groupe** : `isGroupMember && userType !== 'professionnel'`

### Tableau de Permissions

| Type Utilisateur | Compte Principal | Sous-Utilisateur | Membre de Groupe | Accès Coupons |
|------------------|------------------|------------------|------------------|---------------|
| Grossiste | ✅ | ✅ (si autorisé) | ✅ | ✅ OUI |
| Professionnel | ❌ | ❌ | ❌ | ❌ NON |
| Particulier | N/A | N/A | ✅ | ✅ OUI (groupe) |

## Menu Latéral - Professionnels

### Avant
```
Dashboard
├─ 👤 Profil
├─ 🛒 Mes achats
├─ ⭐ Mes avis
├─ 📦 Mes Produits
├─ 📋 Mes ventes
├─ 📄 Mes Factures
├─ ⚠️ Réclamations
├─ 🎫 Mes Coupons        ← RETIRÉ
├─ 🏢 Fonds de Commerce
├─ 💬 Messages
├─ 🎧 Support
└─ 👤 Changement de compte
```

### Après
```
Dashboard
├─ 👤 Profil
├─ 🛒 Mes achats
├─ ⭐ Mes avis
├─ 📦 Mes Produits
├─ 📋 Mes ventes
├─ 📄 Mes Factures
├─ ⚠️ Réclamations
├─ 🏢 Fonds de Commerce
├─ 💬 Messages
├─ 🎧 Support
└─ 👤 Changement de compte
```

## Menu Latéral - Grossistes

### Inchangé
```
Dashboard
├─ 👤 Profil
├─ 🛒 Mes achats
├─ ⭐ Mes avis
├─ 📦 Mes Produits
├─ 📋 Mes ventes
├─ 📄 Mes Factures
├─ ⚠️ Réclamations
├─ 🎫 Mes Coupons        ← CONSERVÉ
├─ 🏢 Fonds de Commerce
├─ 👥 Mon équipe
├─ 💬 Messages
├─ 🎧 Support
└─ 👤 Changement de compte
```

## Cas d'Usage

### Scénario 1 : Professionnel se connecte

```
1. Utilisateur : Type = 'professionnel'
   ↓
2. Dashboard charge le menu latéral
   ↓
3. Vérification : userType === 'grossiste' ? NON
   ↓
4. "Mes Coupons" n'est PAS ajouté au menu
   ↓
5. Menu affiché sans l'option Coupons
```

### Scénario 2 : Grossiste se connecte

```
1. Utilisateur : Type = 'grossiste'
   ↓
2. Dashboard charge le menu latéral
   ↓
3. Vérification : userType === 'grossiste' ? OUI
   ↓
4. "Mes Coupons" est ajouté au menu
   ↓
5. Menu affiché avec l'option Coupons
```

### Scénario 3 : Professionnel membre de groupe

```
1. Utilisateur : Type = 'professionnel', isGroupMember = true
   ↓
2. Dashboard charge les onglets
   ↓
3. Vérification : isGroupMember && userType !== 'professionnel' ? NON
   ↓
4. Onglet "Mes Coupons" n'est PAS ajouté
   ↓
5. Pas d'accès aux coupons de groupe
```

### Scénario 4 : Particulier membre de groupe

```
1. Utilisateur : Type = 'particulier', isGroupMember = true
   ↓
2. Dashboard charge les onglets
   ↓
3. Vérification : isGroupMember && userType !== 'professionnel' ? OUI
   ↓
4. Onglet "Mes Coupons" est ajouté
   ↓
5. Accès aux coupons de groupe
```

## Sécurité Backend

### Important

Cette modification côté frontend doit être accompagnée de vérifications côté backend pour garantir la sécurité :

```typescript
// backend/convex/functions/mutations/coupons.ts
export const createCoupon = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    
    // Vérifier que l'utilisateur est un grossiste
    if (user.userType !== 'grossiste') {
      throw new Error('Seuls les grossistes peuvent créer des coupons')
    }
    
    // Créer le coupon...
  }
})
```

### Endpoints à Protéger

- ✅ `createCoupon` : Création de coupons
- ✅ `updateCoupon` : Modification de coupons
- ✅ `deleteCoupon` : Suppression de coupons
- ✅ `getCoupons` : Liste des coupons (filtrer par type)
- ✅ `applyCoupon` : Application d'un coupon (autoriser tous)

## Tests Recommandés

### Test 1 : Professionnel ne voit pas "Mes Coupons"
```
1. Se connecter en tant que professionnel
2. Accéder au dashboard
3. Vérifier que "Mes Coupons" n'apparaît pas dans le menu
4. ✅ PASS si l'option est absente
```

### Test 2 : Grossiste voit "Mes Coupons"
```
1. Se connecter en tant que grossiste
2. Accéder au dashboard
3. Vérifier que "Mes Coupons" apparaît dans le menu
4. Cliquer sur "Mes Coupons"
5. ✅ PASS si le module s'affiche correctement
```

### Test 3 : Professionnel membre de groupe
```
1. Se connecter en tant que professionnel membre de groupe
2. Accéder au dashboard (v1)
3. Vérifier que l'onglet "Mes Coupons" n'apparaît pas
4. ✅ PASS si l'onglet est absent
```

### Test 4 : Particulier membre de groupe
```
1. Se connecter en tant que particulier membre de groupe
2. Accéder au dashboard (v1)
3. Vérifier que l'onglet "Mes Coupons" apparaît
4. Cliquer sur l'onglet
5. ✅ PASS si les coupons de groupe s'affichent
```

### Test 5 : Sous-utilisateur grossiste avec permissions
```
1. Se connecter en tant que sous-utilisateur d'un grossiste
2. Vérifier les permissions : hasAccess('coupons') = true
3. Accéder au dashboard
4. Vérifier que "Mes Coupons" apparaît
5. ✅ PASS si l'option est présente
```

### Test 6 : Sous-utilisateur grossiste sans permissions
```
1. Se connecter en tant que sous-utilisateur d'un grossiste
2. Vérifier les permissions : hasAccess('coupons') = false
3. Accéder au dashboard
4. Vérifier que "Mes Coupons" n'apparaît pas
5. ✅ PASS si l'option est absente
```

## Impact sur l'Expérience Utilisateur

### Professionnels
- ✅ **Simplification** : Menu plus épuré
- ✅ **Clarté** : Fonctionnalités adaptées au rôle
- ✅ **Pas de confusion** : Pas d'accès à des fonctionnalités non pertinentes

### Grossistes
- ✅ **Aucun changement** : Accès complet maintenu
- ✅ **Fonctionnalités avancées** : Gestion de coupons disponible

### Particuliers
- ✅ **Coupons de groupe** : Accès maintenu (si membre)
- ✅ **Pas d'impact** : Fonctionnalités inchangées

## Fichiers Modifiés

### Frontend
1. **`frontend/src/components/dashboardv2/Sidebar.jsx`**
   - Ligne 74-77 : Condition modifiée
   - Ajout de `userType === 'grossiste'`

2. **`frontend/src/pages/Dashboard.jsx`**
   - Ligne 211-214 : Condition modifiée
   - Ajout de `&& userType !== 'professionnel'`

### Lignes Modifiées
- **Total** : 2 fichiers, 4 lignes

## Compatibilité

- ✅ Dashboard v1 (Dashboard.jsx)
- ✅ Dashboard v2 (Sidebar.jsx)
- ✅ Système de permissions des sous-utilisateurs
- ✅ Système de groupes

## Améliorations Futures

- [ ] **Backend validation** : Ajouter des vérifications côté serveur
- [ ] **Logs d'audit** : Tracer les tentatives d'accès non autorisées
- [ ] **Message informatif** : Expliquer pourquoi l'option n'est pas disponible
- [ ] **Documentation utilisateur** : Mettre à jour le guide utilisateur
- [ ] **Tests automatisés** : Ajouter des tests E2E pour les permissions

## Rollback

En cas de besoin de revenir en arrière :

### Sidebar.jsx
```javascript
// Restaurer la condition originale
if (!hasAccess || hasAccess('coupons')) {
  allItems.push({ id: 'coupons', name: 'Mes Coupons', icon: Ticket })
}
```

### Dashboard.jsx
```javascript
// Restaurer la condition originale
if (currentUser?.isGroupMember) {
  baseTabs.push({ id: 'coupons', name: 'Mes Coupons', icon: '🎫' })
}
```

## Conclusion

La restriction d'accès aux coupons pour les professionnels a été implémentée avec succès. Cette modification :

- ✅ **Simplifie l'interface** pour les professionnels
- ✅ **Maintient les fonctionnalités** pour les grossistes
- ✅ **Respecte la hiérarchie** des types d'utilisateurs
- ✅ **Est cohérente** entre les deux versions du dashboard

Les professionnels n'ont plus accès au module "Mes Coupons", conformément aux exigences métier. 🎉
