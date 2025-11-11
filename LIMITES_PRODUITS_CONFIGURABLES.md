# Système de Limites de Produits Configurables

## Vue d'ensemble

Système permettant aux **superadmins** de configurer dynamiquement les limites d'ajout de produits pour les professionnels et grossistes via une interface d'administration, remplaçant les valeurs codées en dur dans le code.

## Problème Résolu

### Avant
```javascript
// ❌ Limites codées en dur dans le code
if (seller.userType === "professionnel") {
  if (existingProducts.length >= 2) {
    throw new Error("Limite atteinte : 2 produits maximum")
  }
}
```

**Inconvénients** :
- Modification nécessite un déploiement
- Pas de flexibilité
- Impossible de tester différentes configurations
- Pas d'historique des modifications

### Après
```javascript
// ✅ Limites configurables depuis l'interface admin
const productLimits = await getProductLimits()
if (existingProducts.length >= productLimits.professionnel) {
  throw new Error(`Limite atteinte : ${productLimits.professionnel} produits maximum`)
}
```

**Avantages** :
- ✅ Configuration en temps réel
- ✅ Interface admin intuitive
- ✅ Flexibilité totale
- ✅ Traçabilité des modifications

## Architecture

### 1. Base de Données

#### Nouvelle Table : `systemSettings`

```typescript
systemSettings: defineTable({
  key: v.string(),              // Clé unique (ex: "product_limits")
  value: v.any(),               // Valeur (objet, nombre, string, etc.)
  description: v.optional(v.string()),
  updatedBy: v.optional(v.id("users")),
  updatedAt: v.number(),
  createdAt: v.number(),
}).index("by_key", ["key"])
```

#### Exemple de Document

```json
{
  "_id": "jd794cqcy0yxmftv8qsppg6d817v28jz",
  "key": "product_limits",
  "value": {
    "professionnel": 2,
    "grossiste": -1
  },
  "description": "Limites de produits par type d'utilisateur",
  "updatedBy": "admin_user_id",
  "updatedAt": 1699564800000,
  "createdAt": 1699564800000
}
```

### 2. Backend (Convex)

#### Queries

**Fichier** : `backend/convex/functions/queries/systemSettings.ts`

```typescript
// Récupérer les limites de produits
export const getProductLimits = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", "product_limits"))
      .first()
    
    // Valeurs par défaut
    return setting?.value || {
      professionnel: 2,
      grossiste: -1
    }
  }
})
```

#### Mutations

**Fichier** : `backend/convex/functions/mutations/systemSettings.ts`

```typescript
// Mettre à jour les limites
export const updateProductLimits = mutation({
  args: {
    professionnel: v.number(),
    grossiste: v.number()
  },
  handler: async (ctx, args) => {
    // Vérification superadmin
    const user = await getCurrentUser(ctx)
    if (user.userType !== "superadmin") {
      throw new Error("Accès refusé")
    }
    
    // Validation
    if (args.professionnel < -1 || args.grossiste < -1) {
      throw new Error("Les limites doivent être >= -1")
    }
    
    // Mise à jour ou création
    // ...
  }
})
```

#### Validation dans createProduct

**Fichier** : `backend/convex/products.ts`

```typescript
// Récupérer les limites configurables
const productLimitsSetting = await ctx.db
  .query("systemSettings")
  .withIndex("by_key", (q) => q.eq("key", "product_limits"))
  .first()

const productLimits = productLimitsSetting?.value || {
  professionnel: 2,
  grossiste: -1
}

// Vérifier la limite pour les professionnels
if (seller.userType === "professionnel" && productLimits.professionnel !== -1) {
  const existingProducts = await ctx.db
    .query("products")
    .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
    .collect()
  
  if (existingProducts.length >= productLimits.professionnel) {
    throw new ConvexError(`Limite atteinte : ${productLimits.professionnel} produit(s) maximum`)
  }
}

// Vérifier la limite pour les grossistes
if (seller.userType === "grossiste" && productLimits.grossiste !== -1) {
  // ... même logique
}
```

### 3. Frontend

#### ProductsModule.jsx

```javascript
// Récupérer les limites
const productLimits = useQuery(api.functions.queries.systemSettings.getProductLimits)

// Vérifier si l'utilisateur peut ajouter un produit
const canAddProduct = () => {
  if (!userType || !productLimits) return false
  if (userType === 'particulier') return false
  
  const currentProductCount = userProducts?.length || 0
  const limit = productLimits[userType]
  
  // -1 = illimité
  if (limit === -1) return true
  
  return currentProductCount < limit
}

// Message de limitation
const getLimitationMessage = () => {
  const limit = productLimits[userType]
  
  if (limit === -1) {
    return `En tant que ${userType}, vous pouvez ajouter un nombre illimité de produits.`
  }
  
  if (currentProductCount >= limit) {
    return `Limite atteinte : Les ${userType}s peuvent ajouter maximum ${limit} produit(s).`
  }
  
  return `Vous pouvez ajouter ${limit - currentProductCount} produit(s) supplémentaire(s).`
}
```

#### SystemSettingsModule.jsx (Admin)

**Fichier** : `frontend/src/components/dashboardv2/SystemSettingsModule.jsx`

Interface d'administration complète avec :
- ✅ Affichage des limites actuelles
- ✅ Formulaire de modification
- ✅ Bouton "Illimité" pour définir -1
- ✅ Validation en temps réel
- ✅ Messages de succès/erreur
- ✅ Bouton de réinitialisation
- ✅ Exemples de configuration
- ✅ Informations importantes

## Interface Admin

### Vue Principale

```
┌─────────────────────────────────────────────────────┐
│ ⚙️ Paramètres Système                               │
│ Configurez les paramètres globaux de la plateforme │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📦 Limites d'Ajout de Produits                     │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Limites Actuelles                           │   │
│ │ 👥 Professionnels: 2 produits               │   │
│ │ 👥 Grossistes: Illimité                     │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ 👥 Limite pour les Professionnels                  │
│ ┌──────────────────┬──────────┐                    │
│ │ [    2    ]      │ Illimité │                    │
│ └──────────────────┴──────────┘                    │
│ Nombre maximum de produits (-1 = illimité)         │
│                                                     │
│ 👥 Limite pour les Grossistes                      │
│ ┌──────────────────┬──────────┐                    │
│ │ [   -1    ]      │ Illimité │                    │
│ └──────────────────┴──────────┘                    │
│ Nombre maximum de produits (-1 = illimité)         │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ✅ Limites mises à jour avec succès !       │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌──────────────────────┬────────────────┐          │
│ │ 💾 Enregistrer       │ 🔄 Réinitialiser│          │
│ └──────────────────────┴────────────────┘          │
└─────────────────────────────────────────────────────┘
```

### Informations Importantes

```
┌─────────────────────────────────────────────────────┐
│ ℹ️ Informations Importantes                         │
├─────────────────────────────────────────────────────┤
│ • Les modifications prennent effet immédiatement    │
│ • Une valeur de -1 signifie "illimité"             │
│ • Une valeur de 0 empêche l'ajout de produits      │
│ • Les produits existants ne sont pas affectés      │
│ • Les particuliers ne peuvent jamais vendre        │
└─────────────────────────────────────────────────────┘
```

### Exemples de Configuration

```
┌─────────────────────────────────────────────────────┐
│ Exemples de Configuration                           │
├─────────────────────────────────────────────────────┤
│ 📌 Exemple 1: Configuration Standard                │
│    Professionnels: 2 produits                       │
│    Grossistes: Illimité                             │
│    → Limite les pros, liberté totale aux grossistes │
│                                                     │
│ 📌 Exemple 2: Configuration Restrictive             │
│    Professionnels: 5 produits                       │
│    Grossistes: 50 produits                          │
│    → Contrôle la croissance du catalogue            │
│                                                     │
│ 📌 Exemple 3: Configuration Ouverte                 │
│    Professionnels: Illimité                         │
│    Grossistes: Illimité                             │
│    → Aucune restriction                             │
└─────────────────────────────────────────────────────┘
```

## Valeurs Spéciales

| Valeur | Signification | Comportement |
|--------|---------------|--------------|
| **-1** | Illimité | Aucune restriction d'ajout |
| **0** | Aucun | Impossible d'ajouter des produits |
| **1+** | Limite fixe | Maximum X produits autorisés |

## Flux de Configuration

### Scénario 1 : Admin Modifie les Limites

```
1. Admin se connecte au dashboard
   ↓
2. Accède à "Paramètres Système"
   ↓
3. Voit les limites actuelles :
   - Professionnels: 2
   - Grossistes: -1 (illimité)
   ↓
4. Modifie la limite des professionnels à 5
   ↓
5. Clique sur "Enregistrer"
   ↓
6. Backend vérifie les permissions (superadmin)
   ↓
7. Valide les valeurs (>= -1)
   ↓
8. Met à jour systemSettings
   ↓
9. Message de succès affiché
   ↓
10. Limites prennent effet immédiatement
```

### Scénario 2 : Professionnel Ajoute un Produit

```
1. Professionnel se connecte
   ↓
2. Accède à "Mes Produits"
   ↓
3. Frontend récupère productLimits
   - professionnel: 5
   - grossiste: -1
   ↓
4. Compte les produits existants: 3
   ↓
5. Affiche: "Vous pouvez ajouter 2 produit(s) supplémentaire(s)"
   ↓
6. Clique sur "Ajouter un produit"
   ↓
7. Remplit le formulaire
   ↓
8. Soumet le formulaire
   ↓
9. Backend vérifie la limite:
   - Récupère productLimits
   - Compte les produits: 3
   - Limite: 5
   - 3 < 5 ✅ OK
   ↓
10. Produit créé avec succès
```

### Scénario 3 : Professionnel Atteint la Limite

```
1. Professionnel a 5 produits (limite = 5)
   ↓
2. Tente d'ajouter un 6ème produit
   ↓
3. Frontend affiche:
   "Limite atteinte : Les professionnels peuvent ajouter maximum 5 produit(s)"
   ↓
4. Bouton "Ajouter" désactivé
   ↓
5. Si contournement et envoi au backend:
   ↓
6. Backend vérifie:
   - Produits existants: 5
   - Limite: 5
   - 5 >= 5 ❌ ERREUR
   ↓
7. Erreur retournée:
   "Limite atteinte : Les professionnels peuvent ajouter maximum 5 produit(s)"
```

## Sécurité

### Contrôles d'Accès

```typescript
// ✅ Vérification superadmin obligatoire
const user = await getCurrentUser(ctx)
if (!user || user.userType !== "superadmin") {
  throw new Error("Accès refusé : réservé aux superadmins")
}
```

### Validation des Données

```typescript
// ✅ Validation des valeurs
if (args.professionnel < -1 || args.grossiste < -1) {
  throw new Error("Les limites doivent être >= -1 (-1 = illimité)")
}
```

### Double Vérification

```
Frontend                    Backend
   ↓                           ↓
Vérifie limite          Vérifie limite
   ↓                           ↓
Désactive bouton        Rejette si dépassé
   ↓                           ↓
Message utilisateur     Erreur ConvexError
```

## Valeurs par Défaut

Si aucune configuration n'existe dans `systemSettings` :

```javascript
{
  professionnel: 2,    // 2 produits maximum
  grossiste: -1        // Illimité
}
```

## Messages Utilisateur

### Professionnels

| Situation | Message |
|-----------|---------|
| Limite: 2, Produits: 0 | "Vous pouvez ajouter 2 produit(s) supplémentaire(s)." |
| Limite: 2, Produits: 1 | "Vous pouvez ajouter 1 produit(s) supplémentaire(s)." |
| Limite: 2, Produits: 2 | "Limite atteinte : Les professionnels peuvent ajouter maximum 2 produit(s)." |
| Limite: -1 | "En tant que professionnel, vous pouvez ajouter un nombre illimité de produits." |

### Grossistes

| Situation | Message |
|-----------|---------|
| Limite: -1 | "En tant que grossiste, vous pouvez ajouter un nombre illimité de produits." |
| Limite: 50, Produits: 45 | "Vous pouvez ajouter 5 produit(s) supplémentaire(s)." |
| Limite: 50, Produits: 50 | "Limite atteinte : Les grossistes peuvent ajouter maximum 50 produit(s)." |

### Particuliers

| Situation | Message |
|-----------|---------|
| Toujours | "Les particuliers ne peuvent pas vendre de produits. Vous pouvez uniquement acheter." |

## Fichiers Modifiés/Créés

### Backend

1. ✅ `backend/convex/schema.ts`
   - Ajout de la table `systemSettings`

2. ✅ `backend/convex/functions/queries/systemSettings.ts` (NOUVEAU)
   - `getSettingByKey`
   - `getProductLimits`
   - `getAllSettings`

3. ✅ `backend/convex/functions/mutations/systemSettings.ts` (NOUVEAU)
   - `updateSetting`
   - `updateProductLimits`
   - `deleteSetting`

4. ✅ `backend/convex/products.ts`
   - Lignes 219-253 : Remplacement des limites codées en dur

### Frontend

5. ✅ `frontend/src/components/dashboardv2/ProductsModule.jsx`
   - Lignes 67-108 : Utilisation des limites dynamiques

6. ✅ `frontend/src/pages/Dashboard.jsx`
   - Lignes 57-99 : Utilisation des limites dynamiques

7. ✅ `frontend/src/components/dashboardv2/SystemSettingsModule.jsx` (NOUVEAU)
   - Interface admin complète

## Intégration dans le Dashboard Admin

Pour ajouter le module dans le dashboard admin, modifier le fichier de routing :

```javascript
// Dans le composant Dashboard Admin
import SystemSettingsModule from '../components/dashboardv2/SystemSettingsModule'

// Ajouter l'onglet
const tabs = [
  // ... autres onglets
  { id: 'system-settings', name: 'Paramètres Système', icon: Settings }
]

// Dans le rendu
{activeTab === 'system-settings' && <SystemSettingsModule />}
```

## Tests Recommandés

### Test 1 : Admin Modifie les Limites
```
1. Se connecter en tant que superadmin
2. Accéder à "Paramètres Système"
3. Modifier limite professionnels: 5
4. Modifier limite grossistes: 100
5. Cliquer sur "Enregistrer"
6. ✅ PASS si message de succès affiché
7. Recharger la page
8. ✅ PASS si nouvelles valeurs affichées
```

### Test 2 : Professionnel Voit la Nouvelle Limite
```
1. Admin définit limite à 5
2. Se connecter en tant que professionnel
3. Accéder à "Mes Produits"
4. ✅ PASS si message indique "5 produits"
5. Ajouter 5 produits
6. ✅ PASS si bouton "Ajouter" désactivé
```

### Test 3 : Backend Valide la Limite
```
1. Admin définit limite à 3
2. Professionnel a 2 produits
3. Tenter d'ajouter un 3ème produit
4. ✅ PASS si création réussit
5. Tenter d'ajouter un 4ème produit
6. ✅ PASS si erreur "Limite atteinte"
```

### Test 4 : Limite Illimitée
```
1. Admin définit limite à -1
2. Se connecter en tant que professionnel
3. ✅ PASS si message "illimité"
4. Ajouter 10 produits
5. ✅ PASS si tous créés avec succès
```

### Test 5 : Sécurité
```
1. Se connecter en tant que professionnel
2. Tenter d'accéder à SystemSettingsModule
3. ✅ PASS si accès refusé
4. Tenter d'appeler updateProductLimits via API
5. ✅ PASS si erreur "Accès refusé"
```

## Améliorations Futures

- [ ] **Historique des modifications** : Tracer qui a modifié quoi et quand
- [ ] **Limites par catégorie** : Différentes limites selon les catégories de produits
- [ ] **Limites temporaires** : Augmenter temporairement les limites pour des événements
- [ ] **Notifications** : Alerter les utilisateurs quand ils approchent de la limite
- [ ] **Analytics** : Statistiques sur l'utilisation des limites
- [ ] **Limites par abonnement** : Différentes limites selon le plan d'abonnement
- [ ] **API publique** : Permettre aux intégrations tierces de consulter les limites

## Conclusion

Le système de limites configurables offre :

- ✅ **Flexibilité** : Modification en temps réel sans déploiement
- ✅ **Simplicité** : Interface admin intuitive
- ✅ **Sécurité** : Validation côté frontend et backend
- ✅ **Évolutivité** : Architecture extensible pour d'autres paramètres
- ✅ **Traçabilité** : Historique des modifications (updatedBy, updatedAt)

Les administrateurs peuvent maintenant ajuster les limites selon les besoins métier sans intervention technique ! 🎉
