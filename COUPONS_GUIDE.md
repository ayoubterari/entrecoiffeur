# 🎫 Guide du Système de Coupons - Entre Coiffeur

## Vue d'ensemble

Le système de coupons permet aux administrateurs de créer et gérer des codes de réduction pour offrir des promotions aux clients. Les coupons peuvent être configurés avec différents paramètres comme le pourcentage de réduction, les limites d'utilisation, les dates de validité, et les montants minimums.

## 🏗️ Architecture

### Backend (Convex)

#### Schema
```typescript
coupons: defineTable({
  code: v.string(),                    // Code unique (ex: "SUMMER20")
  discountPercentage: v.number(),      // Pourcentage de réduction (1-100)
  description: v.optional(v.string()), // Description optionnelle
  isActive: v.boolean(),               // Statut actif/inactif
  usageLimit: v.optional(v.number()),  // Limite d'utilisation (null = illimité)
  usageCount: v.number(),              // Nombre d'utilisations actuelles
  validFrom: v.number(),               // Date de début (timestamp)
  validUntil: v.optional(v.number()),  // Date de fin (timestamp, null = pas d'expiration)
  minimumAmount: v.optional(v.number()), // Montant minimum de commande
  createdBy: v.id("users"),            // ID de l'admin créateur
  createdAt: v.number(),               // Date de création
  updatedAt: v.number(),               // Date de modification
})
```

#### Fonctions Mutations
- `createCoupon` : Créer un nouveau coupon
- `updateCoupon` : Modifier un coupon existant
- `deleteCoupon` : Supprimer un coupon
- `toggleCouponStatus` : Activer/désactiver un coupon
- `validateCoupon` : Valider un code coupon pour une commande
- `applyCoupon` : Appliquer un coupon (incrémenter le compteur d'usage)

#### Fonctions Queries
- `getAllCoupons` : Récupérer tous les coupons (admin)
- `getActiveCoupons` : Récupérer les coupons actifs
- `getCouponById` : Récupérer un coupon par ID
- `getCouponByCode` : Récupérer un coupon par code
- `getCouponStats` : Statistiques des coupons
- `searchCoupons` : Rechercher des coupons
- `getCouponsByCreator` : Coupons créés par un admin

### Frontend (React)

#### Composants
1. **CouponsManagement** : Interface admin complète
2. **CouponInput** : Composant pour appliquer des coupons au checkout

## 🎯 Fonctionnalités

### Interface Admin

#### Dashboard Coupons
- **Statistiques en temps réel** : Total, actifs, utilisations, réduction moyenne
- **Recherche et filtres** : Par code, description, statut
- **Gestion CRUD complète** : Créer, modifier, supprimer, activer/désactiver
- **Tableau détaillé** : Informations complètes sur chaque coupon

#### Création de Coupon
```javascript
// Exemple de données pour créer un coupon
const couponData = {
  code: "SUMMER20",                    // Code unique
  discountPercentage: 20,              // 20% de réduction
  description: "Promo d'été",          // Description
  usageLimit: 100,                     // 100 utilisations max
  validFrom: Date.now(),               // Valide maintenant
  validUntil: Date.now() + 30*24*60*60*1000, // Expire dans 30 jours
  minimumAmount: 50,                   // Commande minimum 50€
  createdBy: adminUserId
}
```

#### Validation et Règles
- **Code unique** : Vérification d'unicité automatique
- **Pourcentage** : Entre 1% et 100%
- **Dates** : Date de fin > date de début
- **Montants** : Validation des montants minimums

### Interface Client

#### Application de Coupon
```javascript
// Utilisation du composant CouponInput
<CouponInput 
  orderAmount={orderTotal}
  onCouponApplied={(couponData) => {
    // Mettre à jour le total de la commande
    setOrderTotal(couponData.finalAmount)
    setDiscount(couponData.discountAmount)
  }}
  onCouponRemoved={() => {
    // Restaurer le total original
    setOrderTotal(originalAmount)
    setDiscount(0)
  }}
/>
```

## 🔧 Configuration et Utilisation

### 1. Accès Admin
- Connectez-vous en tant que **superadmin**
- Accédez à l'interface d'administration
- Cliquez sur l'onglet **"🎫 Coupons"**

### 2. Créer un Coupon
1. Cliquez sur **"➕ Nouveau Coupon"**
2. Remplissez les informations :
   - **Code** : Identifiant unique (ex: WELCOME10)
   - **Pourcentage** : Réduction en % (obligatoire)
   - **Description** : Explication du coupon (optionnel)
   - **Limite d'usage** : Nombre max d'utilisations (optionnel)
   - **Montant minimum** : Commande minimum requise (optionnel)
   - **Dates** : Période de validité
3. Cliquez sur **"Créer le coupon"**

### 3. Gérer les Coupons
- **Modifier** : Cliquez sur l'icône ✏️
- **Activer/Désactiver** : Cliquez sur l'icône 🔒/🔓
- **Supprimer** : Cliquez sur l'icône 🗑️
- **Rechercher** : Utilisez la barre de recherche
- **Filtrer** : Par statut (Tous, Actifs, Expirés, Utilisés)

### 4. Statistiques
Le dashboard affiche :
- **Total des coupons** créés
- **Coupons actifs** actuellement
- **Total des utilisations**
- **Réduction moyenne** en pourcentage

## 🎨 Design et UX

### Style Moderne 2025
- **Glass Morphism** : Effets de transparence et flou
- **Gradient Rose** : Cohérent avec la charte graphique (#ff6b9d → #fd79a8)
- **Animations Fluides** : Transitions cubic-bezier naturelles
- **Responsive Design** : Mobile-first avec breakpoints adaptatifs

### Interactions
- **Hover Effects** : Élévation et transformations
- **Loading States** : Indicateurs de chargement
- **Feedback Visuel** : Messages de succès/erreur
- **Micro-animations** : Effets subtils pour l'engagement

## 🔐 Sécurité

### Validations Backend
- **Unicité des codes** : Vérification automatique
- **Limites d'usage** : Contrôle du nombre d'utilisations
- **Dates de validité** : Vérification des périodes
- **Montants minimums** : Validation des seuils

### Authentification
- **Admin uniquement** : Création/modification réservée aux superadmins
- **Validation utilisateur** : Vérification de l'authentification pour l'application

## 📊 Exemples d'Usage

### Coupons Populaires
```javascript
// Coupon de bienvenue
{
  code: "WELCOME10",
  discountPercentage: 10,
  description: "10% de réduction pour votre première commande",
  usageLimit: null, // Illimité
  minimumAmount: 25
}

// Promo saisonnière
{
  code: "SUMMER20",
  discountPercentage: 20,
  description: "Promo d'été - 20% de réduction",
  usageLimit: 500,
  validUntil: new Date('2024-08-31').getTime()
}

// Coupon VIP
{
  code: "VIP30",
  discountPercentage: 30,
  description: "Réduction VIP pour clients fidèles",
  minimumAmount: 100,
  usageLimit: 50
}
```

### Intégration Checkout
```javascript
// Dans le processus de commande
const handleCouponApplied = (couponData) => {
  setOrderSummary(prev => ({
    ...prev,
    subtotal: prev.subtotal,
    discount: couponData.discountAmount,
    total: couponData.finalAmount,
    couponCode: couponData.code,
    couponId: couponData.couponId
  }))
}

// Lors de la finalisation
const finalizeOrder = async () => {
  // Appliquer le coupon (incrémenter usage)
  if (orderSummary.couponId) {
    await applyCoupon({ couponId: orderSummary.couponId })
  }
  
  // Créer la commande avec les détails du coupon
  await createOrder({
    ...orderData,
    couponCode: orderSummary.couponCode,
    discountAmount: orderSummary.discount,
    total: orderSummary.total
  })
}
```

## 🚀 Déploiement

### Prérequis
1. **Backend Convex** : Fonctions coupons déployées
2. **Schema** : Table coupons configurée
3. **Frontend** : Composants intégrés
4. **Permissions** : Accès superadmin configuré

### Vérifications
- [ ] Schema coupons créé
- [ ] Fonctions backend déployées
- [ ] Interface admin accessible
- [ ] Composant checkout intégré
- [ ] Tests de validation effectués

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs Convex
2. Testez avec des codes simples
3. Vérifiez les permissions utilisateur
4. Consultez la documentation Convex

---

*Guide créé pour Entre Coiffeur - Système de coupons v1.0*
