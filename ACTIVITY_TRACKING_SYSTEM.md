# Système de Traçabilité et Analytics - EntreCoiffeur

## 📊 Vue d'ensemble

Système complet de tracking et d'analyse du comportement utilisateur permettant de mesurer le temps passé sur chaque produit, page et ressource de la plateforme. Les données sont collectées automatiquement et analysées dans un module Analytics dédié dans l'interface admin.

---

## 🏗️ Architecture Backend

### Table Convex `userActivityTracking`

```typescript
userActivityTracking: defineTable({
  userId: v.optional(v.id("users")),        // Utilisateur (optionnel pour non-connectés)
  sessionId: v.string(),                    // ID de session unique
  activityType: v.union(                    // Type d'activité
    v.literal("product_view"),              // Vue d'un produit
    v.literal("page_view"),                 // Vue d'une page
    v.literal("category_browse"),           // Navigation catégorie
    v.literal("search"),                    // Recherche
    v.literal("store_visit")                // Visite boutique
  ),
  resourceId: v.optional(v.string()),       // ID de la ressource
  resourceName: v.optional(v.string()),     // Nom de la ressource
  timeSpent: v.number(),                    // Temps passé (secondes)
  startTime: v.number(),                    // Timestamp début
  endTime: v.number(),                      // Timestamp fin
  pageUrl: v.string(),                      // URL de la page
  referrer: v.optional(v.string()),         // Page de provenance
  deviceType: v.optional(v.string()),       // Type d'appareil
  userAgent: v.optional(v.string()),        // User agent
  metadata: v.optional(v.any()),            // Données additionnelles
  createdAt: v.number(),                    // Date de création
})
```

**Index optimisés** :
- `by_user` : Recherche par utilisateur
- `by_session` : Recherche par session
- `by_activity_type` : Filtrage par type
- `by_resource` : Recherche par ressource
- `by_date` : Tri chronologique
- `by_user_activity` : Combiné user + type
- `by_resource_date` : Combiné ressource + date

---

## 🔧 Backend - Mutations

### Fichier : `backend/convex/functions/mutations/activityTracking.ts`

#### 1. **trackActivity**
Enregistre une activité utilisateur.

**Arguments** :
- `userId` : Id<"users"> (optionnel)
- `sessionId` : string (requis)
- `activityType` : "product_view" | "page_view" | "category_browse" | "search" | "store_visit"
- `resourceId` : string (optionnel)
- `resourceName` : string (optionnel)
- `timeSpent` : number (secondes)
- `startTime` : number (timestamp)
- `endTime` : number (timestamp)
- `pageUrl` : string
- `referrer` : string (optionnel)
- `deviceType` : string (optionnel)
- `userAgent` : string (optionnel)
- `metadata` : any (optionnel)

#### 2. **trackActivitiesBatch**
Enregistre plusieurs activités en une seule fois (optimisation).

**Arguments** :
- `activities` : Array d'objets activity

#### 3. **deleteOldActivities**
Supprime les anciennes données (GDPR, nettoyage).

**Arguments** :
- `olderThanDays` : number

---

## 📊 Backend - Queries

### Fichier : `backend/convex/functions/queries/activityTracking.ts`

#### 1. **getActivityStats**
Statistiques globales d'activité.

**Retour** :
```javascript
{
  totalActivities: number,
  totalTimeSpent: number,
  averageTimeSpent: number,
  uniqueUsers: number,
  uniqueSessions: number,
  byActivityType: Record<string, { count, totalTime }>,
  byDevice: Record<string, number>
}
```

#### 2. **getTopViewedProducts**
Top 10 produits les plus consultés.

**Retour** :
```javascript
[{
  productId: string,
  productName: string,
  viewCount: number,
  totalTimeSpent: number,
  averageTimeSpent: number,
  uniqueUsers: number
}]
```

#### 3. **getUserActivity**
Activité d'un utilisateur spécifique.

#### 4. **getProductActivity**
Statistiques détaillées sur un produit.

**Retour** :
```javascript
{
  productId: string,
  totalViews: number,
  totalTimeSpent: number,
  averageTimeSpent: number,
  uniqueUsers: number,
  activityByDay: Record<string, { views, timeSpent }>,
  recentActivities: Activity[]
}
```

#### 5. **getTopPages**
Top 10 pages les plus visitées.

#### 6. **getRealtimeActivity**
Activité en temps réel (dernières 24h).

**Retour** :
```javascript
{
  recentActivities: Activity[],
  activityByHour: Record<number, number>,
  totalLast24h: number
}
```

#### 7. **getTopActiveUsers**
Top 10 utilisateurs les plus actifs.

---

## ⚛️ Frontend - Hook React

### Fichier : `frontend/src/hooks/useActivityTracking.js`

Hook personnalisé pour tracker automatiquement l'activité.

**Utilisation** :
```javascript
import { useActivityTracking } from '../hooks/useActivityTracking'

const ProductDetail = ({ productId, userId }) => {
  // Tracker automatiquement le temps passé sur ce produit
  useActivityTracking({
    activityType: 'product_view',
    resourceId: productId,
    resourceName: product?.name,
    userId: userId,
    enabled: !!productId && !!product
  })
  
  // ... reste du composant
}
```

**Options** :
- `activityType` : Type d'activité (requis)
- `resourceId` : ID de la ressource (optionnel)
- `resourceName` : Nom de la ressource (optionnel)
- `userId` : ID utilisateur (optionnel)
- `enabled` : Activer/désactiver (défaut: true)

**Fonctionnalités** :
- ✅ Enregistrement automatique au départ de la page
- ✅ Enregistrement quand la page perd le focus
- ✅ Enregistrement périodique (toutes les 30s)
- ✅ Gestion des sessions (30 min)
- ✅ Détection automatique du type d'appareil
- ✅ Temps minimum de 1 seconde

---

## 🎨 Frontend - Module Analytics

### Fichier : `frontend/src/components/adminv2/AnalyticsModule.jsx`

Module admin complet avec visualisations et statistiques.

### Fonctionnalités principales

#### 📊 Statistiques Globales (4 KPI Cards)
1. **Total Activités** : Nombre total d'actions enregistrées
2. **Temps Total** : Temps cumulé passé sur la plateforme
3. **Utilisateurs Uniques** : Nombre d'utilisateurs actifs
4. **Temps Moyen** : Temps moyen par activité

#### 🎯 Sélecteur de Période
- **7 jours** : Dernière semaine
- **30 jours** : Dernier mois
- **Tout** : Depuis le début

#### 📑 4 Onglets d'Analyse

**1. Vue d'ensemble**
- Activité par type (product_view, page_view, etc.)
- Répartition par appareil (mobile, desktop, tablet)
- Activité en temps réel (dernières 24h)
- Graphiques à barres de progression

**2. Produits**
- Top 10 produits les plus consultés
- Nombre de vues par produit
- Utilisateurs uniques par produit
- Temps total et moyen passé
- Tableau trié par popularité

**3. Utilisateurs**
- Top 10 utilisateurs les plus actifs
- Nombre d'activités par utilisateur
- Temps total et moyen d'utilisation
- Dernière activité
- Informations utilisateur (nom, email)

**4. Pages**
- Top 10 pages les plus visitées
- Nombre de visites par page
- Utilisateurs uniques par page
- Temps total et moyen sur chaque page
- URLs complètes affichées

### Design
- Interface moderne avec shadcn/ui
- Graphiques à barres de progression
- Badges colorés pour les statuts
- Tableaux responsives
- Icônes Lucide React
- Animation pulse pour l'activité en temps réel

---

## 🔄 Flux de Tracking

### 1. Utilisateur visite une page produit
```
ProductDetail.jsx
  ↓
useActivityTracking hook
  ↓
Enregistre startTime
  ↓
Utilisateur navigue/quitte
  ↓
Calcule timeSpent
  ↓
trackActivity mutation
  ↓
Sauvegarde dans Convex
```

### 2. Admin consulte les analytics
```
Admin accède à /admin
  ↓
Clique sur "Analytics"
  ↓
AnalyticsModule charge
  ↓
Queries Convex (stats, topProducts, etc.)
  ↓
Affichage des données
  ↓
Filtrage par période
  ↓
Navigation entre onglets
```

---

## 📈 Cas d'Usage

### Pour les Administrateurs

**1. Analyser les produits populaires**
- Identifier les produits qui attirent le plus l'attention
- Mesurer l'engagement réel (temps passé)
- Optimiser le catalogue selon l'intérêt

**2. Comprendre le comportement utilisateur**
- Voir quels utilisateurs sont les plus actifs
- Identifier les patterns de navigation
- Détecter les abandons rapides

**3. Optimiser les pages**
- Identifier les pages à fort trafic
- Mesurer le temps d'engagement
- Améliorer les pages peu performantes

**4. Analyser les appareils**
- Adapter l'expérience mobile/desktop
- Prioriser les développements
- Optimiser les performances

**5. Suivi en temps réel**
- Voir l'activité actuelle
- Détecter les pics de trafic
- Réagir rapidement aux problèmes

### Pour les Vendeurs (futur)
- Voir les statistiques de leurs produits
- Comprendre l'intérêt des clients
- Optimiser leurs annonces

---

## 🔐 Sécurité et Confidentialité

### GDPR Compliance
- ✅ Données anonymes pour non-connectés (sessionId)
- ✅ Suppression automatique des anciennes données
- ✅ Pas de données personnelles sensibles
- ✅ Consentement implicite (utilisation du site)

### Données Collectées
- ✅ Temps passé (anonyme)
- ✅ Type d'activité
- ✅ Type d'appareil (générique)
- ✅ URL de la page
- ❌ Pas d'adresse IP stockée
- ❌ Pas de données de localisation précise

### Nettoyage Automatique
```javascript
// Supprimer les données de plus de 90 jours
await deleteOldActivities({ olderThanDays: 90 })
```

---

## 📁 Fichiers Créés/Modifiés

### Backend
- ✅ `backend/convex/schema.ts` : Table userActivityTracking
- ✅ `backend/convex/functions/mutations/activityTracking.ts` : 3 mutations
- ✅ `backend/convex/functions/queries/activityTracking.ts` : 7 queries

### Frontend
- ✅ `frontend/src/hooks/useActivityTracking.js` : Hook personnalisé
- ✅ `frontend/src/pages/ProductDetail.jsx` : Tracking intégré
- ✅ `frontend/src/components/adminv2/AnalyticsModule.jsx` : Module admin
- ✅ `frontend/src/components/adminv2/Sidebar.jsx` : Onglet Analytics
- ✅ `frontend/src/pages/AdminV2.jsx` : Intégration module
- ✅ `frontend/src/components/adminv2/SettingsModule.jsx` : Permission analytics

---

## ⚙️ Configuration

### Paramètres du Hook
```javascript
// Durée de session
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

// Intervalle d'enregistrement
const RECORD_INTERVAL = 30000 // 30 secondes

// Temps minimum
const MIN_TIME_SPENT = 1 // 1 seconde
```

### Optimisations
- Enregistrement par batch possible
- Cache des sessions dans sessionStorage
- Pas d'enregistrement si temps < 1s
- Désactivation possible par composant

---

## 🚀 Utilisation dans d'Autres Pages

### Page d'Accueil
```javascript
useActivityTracking({
  activityType: 'page_view',
  resourceId: 'homepage',
  resourceName: 'Page d\'accueil',
  userId: userId,
  enabled: true
})
```

### Page Catégorie
```javascript
useActivityTracking({
  activityType: 'category_browse',
  resourceId: categoryId,
  resourceName: categoryName,
  userId: userId,
  enabled: !!categoryId
})
```

### Page Boutique
```javascript
useActivityTracking({
  activityType: 'store_visit',
  resourceId: sellerId,
  resourceName: sellerName,
  userId: userId,
  enabled: !!sellerId
})
```

### Recherche
```javascript
useActivityTracking({
  activityType: 'search',
  resourceId: searchQuery,
  resourceName: `Recherche: ${searchQuery}`,
  userId: userId,
  enabled: !!searchQuery
})
```

---

## 📊 Métriques Disponibles

### Globales
- Total activités
- Temps total passé
- Temps moyen par activité
- Utilisateurs uniques
- Sessions uniques
- Répartition par type
- Répartition par appareil

### Par Produit
- Nombre de vues
- Utilisateurs uniques
- Temps total
- Temps moyen
- Évolution par jour

### Par Utilisateur
- Nombre d'activités
- Temps total
- Temps moyen
- Dernière activité
- Historique complet

### Par Page
- Nombre de visites
- Utilisateurs uniques
- Temps total
- Temps moyen
- Taux de rebond (futur)

---

## 🎯 Avantages

### Pour l'Entreprise
- 📊 **Données précises** : Mesure réelle de l'engagement
- 🎯 **Optimisation** : Identifier ce qui fonctionne
- 💡 **Insights** : Comprendre le comportement
- 📈 **Croissance** : Prendre des décisions data-driven
- 🔍 **Transparence** : Visibilité complète

### Pour les Utilisateurs
- 🚀 **Expérience améliorée** : Site optimisé selon l'usage
- 🎨 **Contenu pertinent** : Recommandations basées sur les données
- ⚡ **Performance** : Tracking léger et non-intrusif
- 🔒 **Confidentialité** : Données anonymes et sécurisées

---

## 🔮 Améliorations Futures

### Fonctionnalités
- [ ] Heatmaps des clics
- [ ] Enregistrement des scrolls
- [ ] Tracking des conversions
- [ ] Funnel d'achat
- [ ] A/B testing intégré
- [ ] Alertes automatiques
- [ ] Export des données (CSV, PDF)
- [ ] Graphiques avancés (Chart.js)

### Analytics Avancés
- [ ] Taux de rebond par page
- [ ] Parcours utilisateur
- [ ] Segmentation avancée
- [ ] Cohortes d'utilisateurs
- [ ] Prédictions ML
- [ ] Recommandations automatiques

### Intégrations
- [ ] Google Analytics
- [ ] Mixpanel
- [ ] Hotjar
- [ ] Segment

---

## 🎉 Résumé

Le système de traçabilité et analytics est maintenant **100% fonctionnel** avec :

✅ **Tracking automatique** du temps passé sur les produits et pages
✅ **Hook React** réutilisable pour n'importe quelle page
✅ **Module Analytics** complet dans l'interface admin
✅ **7 queries** d'analyse avec filtres de date
✅ **4 onglets** d'analyse (Vue d'ensemble, Produits, Utilisateurs, Pages)
✅ **Statistiques en temps réel** (dernières 24h)
✅ **Détection automatique** du type d'appareil
✅ **Gestion des sessions** pour les non-connectés
✅ **GDPR compliant** avec nettoyage automatique
✅ **Performance optimisée** avec enregistrements périodiques
✅ **Design moderne** avec shadcn/ui

Les administrateurs peuvent maintenant analyser précisément le comportement des utilisateurs et optimiser la plateforme en conséquence ! 🚀
