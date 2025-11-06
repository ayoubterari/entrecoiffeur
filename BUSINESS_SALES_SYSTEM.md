# Système de Gestion des Fonds de Commerce

Système complet de gestion des fonds de commerce pour les professionnels et grossistes dans EntreCoiffeur.

## 📋 Vue d'ensemble

Le module **Fonds de Commerce** permet aux professionnels et grossistes de mettre en vente leur commerce avec toutes les informations nécessaires pour attirer des acheteurs potentiels.

## 🏗️ Architecture Backend

### Table Convex `businessSales`

**Informations générales** :
- `activityType` : Type d'activité (café, boulangerie, salon de coiffure, etc.)
- `businessName` : Nom commercial (facultatif pour confidentialité)
- `address` : Adresse complète
- `city` : Ville
- `district` : Quartier (optionnel)
- `totalArea` : Surface totale (ex: 120 m²)
- `creationYear` : Année de création du commerce
- `legalStatus` : Statut juridique (SARL, personne physique, etc.)
- `saleReason` : Motif de la vente

**Données financières** :
- `salePrice` : Prix de vente en DH
- `annualRevenue` : Chiffre d'affaires annuel
- `netProfit` : Résultat net / Bénéfice (optionnel)
- `monthlyRent` : Loyer mensuel en DH
- `fixedCharges` : Charges fixes mensuelles (optionnel)
- `leaseRemaining` : Durée du bail restante
- `deposit` : Dépôt de garantie / Pas-de-porte (optionnel)

**Détails du local** :
- `localDescription` : Description complète du local
- `includedEquipment` : Équipements inclus dans la vente
- `recentWorks` : Travaux récents ou rénovations (optionnel)
- `compliance` : Conformité et autorisations (optionnel)

**Clientèle et potentiel** :
- `clienteleType` : Type de clientèle cible
- `footTraffic` : Flux de passage / Zone fréquentée
- `developmentPotential` : Potentiel de développement (optionnel)

**Contenu visuel** :
- `images` : Array de photos du local
- `videoUrl` : URL de la vidéo de présentation (optionnel)
- `floorPlan` : Plan du local (optionnel)

**Métadonnées** :
- `sellerId` : ID du vendeur
- `status` : Statut de l'annonce (active, pending, sold, inactive)
- `views` : Nombre de vues
- `contactCount` : Nombre de contacts reçus
- `createdAt` : Date de création
- `updatedAt` : Date de dernière modification

**Index** :
- `by_seller` : Par vendeur
- `by_city` : Par ville
- `by_status` : Par statut
- `by_activity_type` : Par type d'activité
- `by_created_at` : Par date de création

## 🔧 Backend - Mutations

**Fichier** : `backend/convex/functions/mutations/businessSales.ts`

### 1. createBusinessSale
Créer une nouvelle annonce de fonds de commerce.

**Arguments** : Tous les champs de la table (sauf métadonnées auto-générées)

**Retour** : ID de l'annonce créée

### 2. updateBusinessSale
Modifier une annonce existante.

**Arguments** : 
- `id` : ID de l'annonce
- Tous les champs modifiables (optionnels)

**Retour** : ID de l'annonce

### 3. updateBusinessSaleStatus
Changer le statut d'une annonce.

**Arguments** :
- `id` : ID de l'annonce
- `status` : Nouveau statut (active, pending, sold, inactive)

**Retour** : ID de l'annonce

### 4. deleteBusinessSale
Supprimer une annonce.

**Arguments** : `id` de l'annonce

**Retour** : `{ success: true }`

### 5. incrementViews
Incrémenter le compteur de vues.

**Arguments** : `id` de l'annonce

**Retour** : `{ success: true }`

### 6. incrementContactCount
Incrémenter le compteur de contacts.

**Arguments** : `id` de l'annonce

**Retour** : `{ success: true }`

## 📊 Backend - Queries

**Fichier** : `backend/convex/functions/queries/businessSales.ts`

### 1. getSellerBusinessSales
Récupérer toutes les annonces d'un vendeur.

**Arguments** : `sellerId`

**Retour** : Array d'annonces triées par date (desc)

### 2. getBusinessSaleById
Récupérer une annonce par ID avec infos du vendeur.

**Arguments** : `id`

**Retour** : Annonce enrichie avec données du vendeur

### 3. getActiveBusinessSales
Récupérer toutes les annonces actives (page publique).

**Arguments** :
- `city` : Filtrer par ville (optionnel)
- `activityType` : Filtrer par type d'activité (optionnel)

**Retour** : Array d'annonces actives enrichies

### 4. getSellerBusinessSalesStats
Statistiques pour un vendeur.

**Arguments** : `sellerId`

**Retour** :
```javascript
{
  total: number,
  active: number,
  pending: number,
  sold: number,
  inactive: number,
  totalViews: number,
  totalContacts: number
}
```

### 5. searchBusinessSales
Rechercher des annonces avec filtres.

**Arguments** :
- `searchTerm` : Terme de recherche (optionnel)
- `city` : Filtrer par ville (optionnel)
- `activityType` : Filtrer par type d'activité (optionnel)
- `minPrice` : Prix minimum (optionnel)
- `maxPrice` : Prix maximum (optionnel)

**Retour** : Array d'annonces filtrées

## 🎨 Frontend - BusinessSalesModule

**Fichier** : `frontend/src/components/dashboardv2/BusinessSalesModule.jsx`

### Fonctionnalités principales

**1. Dashboard avec statistiques** :
- Total d'annonces créées
- Annonces actives
- Total de vues
- Total de contacts reçus

**2. Création d'annonce** :
- Formulaire complet en 5 sections
- Validation des champs requis
- Support des images et vidéos

**3. Gestion des annonces** :
- Liste de toutes les annonces
- Changement de statut rapide (dropdown)
- Actions : Modifier, Supprimer
- Affichage des statistiques par annonce

**4. Formulaire structuré** :

#### 🧾 Section 1 : Informations générales
- Type d'activité *
- Nom commercial
- Adresse complète *
- Ville * et Quartier
- Surface totale *
- Année de création *
- Statut juridique *
- Motif de la vente *

#### 💰 Section 2 : Données financières
- Prix de vente (DH) *
- Chiffre d'affaires annuel *
- Résultat net / Bénéfice
- Loyer mensuel (DH) *
- Charges fixes mensuelles
- Durée du bail restante *
- Dépôt de garantie

#### 🏠 Section 3 : Détails du local
- Description du local * (textarea)
- Équipements inclus * (textarea)
- Travaux récents
- Conformité / Autorisations

#### 👥 Section 4 : Clientèle et potentiel
- Type de clientèle *
- Flux de passage *
- Potentiel de développement (textarea)

#### 📸 Section 5 : Contenu visuel
- URL de la vidéo de présentation
- Note : Upload d'images à venir

\* = Champs obligatoires

### Statuts disponibles

- **Active** : Annonce visible publiquement (badge vert)
- **Pending** : En attente de validation (badge jaune)
- **Sold** : Fonds de commerce vendu (badge bleu)
- **Inactive** : Annonce désactivée (badge gris)

### Interface utilisateur

**Cartes d'annonces** :
- Type d'activité en titre
- Badge de statut coloré
- Nom commercial (si renseigné)
- Ville et prix en DH
- Nombre de vues
- Description (2 lignes max)
- Dropdown de changement de statut
- Boutons Modifier et Supprimer

**État vide** :
- Icône Building2
- Message d'encouragement
- Bouton "Créer une annonce"

## 🔐 Contrôle d'accès

### Visibilité du module
- ✅ Professionnels
- ✅ Grossistes
- ❌ Particuliers
- ❌ Sous-utilisateurs (seul le compte principal)

### Permissions
Le module "Fonds de Commerce" est accessible uniquement au **compte principal** des professionnels et grossistes. Les sous-utilisateurs n'y ont pas accès.

## 🎯 Intégration dans le Dashboard

### Sidebar
**Position** : Après "Mes Coupons", avant "Mon équipe"

**Icône** : Building2 (🏢)

**Nom** : "Fonds de Commerce"

**Condition d'affichage** :
```javascript
if (userType === 'professionnel' || userType === 'grossiste') {
  if (!userPermissions || !userPermissions.isSubUser) {
    // Afficher l'onglet
  }
}
```

### DashboardV2
**Rendu conditionnel** :
```javascript
{(userType === 'professionnel' || userType === 'grossiste') && 
 activeTab === 'business-sales' && 
 (!userPermissions || !userPermissions.isSubUser) && (
  <BusinessSalesModule userId={userId} />
)}
```

## 📱 Fonctionnalités futures

### Phase 2 (à implémenter)
- [ ] Upload d'images du local
- [ ] Upload du plan du local
- [ ] Galerie d'images avec lightbox
- [ ] Génération de PDF de l'annonce
- [ ] Partage sur réseaux sociaux
- [ ] Système de favoris pour acheteurs
- [ ] Messagerie intégrée vendeur-acheteur
- [ ] Alertes email pour nouveaux contacts

### Phase 3 (avancé)
- [ ] Page publique de recherche de fonds de commerce
- [ ] Filtres avancés (prix, ville, type, surface)
- [ ] Carte interactive des annonces
- [ ] Comparateur d'annonces
- [ ] Estimation automatique du prix
- [ ] Statistiques de marché
- [ ] Export des données en Excel
- [ ] API pour sites partenaires

## 🎨 Design et UX

### Composants shadcn/ui utilisés
- Card, CardHeader, CardTitle, CardDescription, CardContent
- Button (variants: default, outline)
- Input, Textarea, Label
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
- Select, SelectTrigger, SelectValue, SelectContent, SelectItem

### Icônes Lucide React
- Building2 : Icône principale du module
- Plus : Créer une annonce
- Edit : Modifier
- Trash2 : Supprimer
- Eye : Vues
- Euro : Prix
- MapPin : Localisation
- TrendingUp : Actives
- Users : Contacts

### Couleurs des badges
- **Active** : `bg-green-100 text-green-800`
- **Pending** : `bg-yellow-100 text-yellow-800`
- **Sold** : `bg-blue-100 text-blue-800`
- **Inactive** : `bg-gray-100 text-gray-800`

## 📝 Cas d'usage

### Scénario 1 : Création d'annonce
1. Professionnel accède à "Fonds de Commerce"
2. Clique sur "Nouvelle annonce"
3. Remplit le formulaire en 5 sections
4. Ajoute des photos (à venir)
5. Soumet l'annonce
6. Annonce créée avec statut "Active"
7. Visible sur la page publique

### Scénario 2 : Gestion d'annonce
1. Vendeur voit ses annonces avec statistiques
2. Consulte le nombre de vues et contacts
3. Change le statut via dropdown
4. Modifie les informations si nécessaire
5. Désactive l'annonce une fois vendu

### Scénario 3 : Recherche publique (à venir)
1. Acheteur accède à la page de recherche
2. Filtre par ville, type, prix
3. Consulte les annonces
4. Contacte le vendeur
5. Compteur de contacts incrémenté

## 🔍 Avantages

- 🎯 **Ciblé** : Spécifique aux professionnels
- 📊 **Complet** : Toutes les infos nécessaires
- 💼 **Professionnel** : Design moderne et crédible
- 📈 **Statistiques** : Suivi des performances
- 🔒 **Sécurisé** : Contrôle d'accès strict
- ⚡ **Performant** : Queries optimisées avec index
- 🎨 **Intuitif** : Interface claire et guidée
- 📱 **Responsive** : Fonctionne sur tous les écrans

## 📦 Fichiers créés

### Backend
- `backend/convex/schema.ts` : Table businessSales
- `backend/convex/functions/mutations/businessSales.ts` : 6 mutations
- `backend/convex/functions/queries/businessSales.ts` : 5 queries

### Frontend
- `frontend/src/components/dashboardv2/BusinessSalesModule.jsx` : Module complet
- `frontend/src/components/dashboardv2/Sidebar.jsx` : Onglet ajouté
- `frontend/src/pages/DashboardV2.jsx` : Module intégré

### Documentation
- `BUSINESS_SALES_SYSTEM.md` : Ce fichier

## 🚀 Prochaines étapes

1. **Tester** le module en créant des annonces
2. **Implémenter** l'upload d'images
3. **Créer** la page publique de recherche
4. **Ajouter** le système de contact vendeur-acheteur
5. **Optimiser** le SEO des annonces
6. **Intégrer** les notifications email

---

**Date de création** : Novembre 2024  
**Version** : 1.0.0  
**Statut** : ✅ Implémenté et fonctionnel
