# Intégration de la Section "Mes Annonces"

## 🎯 Objectif

Créer une nouvelle section "Mes Annonces" dans le tableau de bord pour les utilisateurs professionnels et grossistes, regroupant les produits et les fonds de commerce en un seul endroit avec un processus de création unifié.

## ✨ Fonctionnalités

### 1. Vue Unifiée
- **Regroupement** : Tous les produits et fonds de commerce dans une seule interface
- **Statistiques globales** : Vue d'ensemble du nombre total d'annonces
- **Filtres par type** : Onglets pour afficher tous, produits uniquement, ou fonds de commerce uniquement

### 2. Processus de Création
Lors de la création d'une nouvelle annonce, l'utilisateur choisit :
- **Produit** → Redirigé vers le processus d'ajout de produit existant
- **Fonds de Commerce** → Redirigé vers le processus d'ajout de fonds de commerce existant

### 3. Navigation Intelligente
- Clic sur une carte produit → Redirige vers "Mes Produits"
- Clic sur une carte fonds de commerce → Redirige vers "Fonds de Commerce"
- Boutons "Voir tous" pour accéder aux sections complètes

## 📁 Fichiers Créés/Modifiés

### Nouveau Fichier

#### `frontend/src/components/dashboardv2/AnnoncesModule.jsx`
Composant principal de la section "Mes Annonces"

**Fonctionnalités** :
- Affichage des statistiques (total annonces, produits actifs, fonds de commerce)
- Modal de sélection du type d'annonce
- Onglets de filtrage (Toutes, Produits, Fonds de Commerce)
- Cartes produits et fonds de commerce avec aperçu
- Navigation vers les sections détaillées

**Props** :
```jsx
{
  userId: string,              // ID de l'utilisateur
  userType: string,            // Type d'utilisateur (professionnel/grossiste)
  onNavigateToProducts: func,  // Callback pour naviguer vers Mes Produits
  onNavigateToBusinessSales: func // Callback pour naviguer vers Fonds de Commerce
}
```

### Fichiers Modifiés

#### 1. `frontend/src/pages/DashboardV2.jsx`

**Modifications** :
- Import du composant `AnnoncesModule`
- Ajout du rendu conditionnel pour l'onglet "announcements"
- Callbacks de navigation vers produits et fonds de commerce

```jsx
// Import
import AnnoncesModule from '../components/dashboardv2/AnnoncesModule'

// Rendu
{(userType === 'professionnel' || userType === 'grossiste') && 
 activeTab === 'announcements' && 
 hasAccess('announcements') && (
  <AnnoncesModule 
    userId={userId} 
    userType={userType}
    onNavigateToProducts={() => setActiveTab('products')}
    onNavigateToBusinessSales={() => setActiveTab('business-sales')}
  />
)}
```

#### 2. `frontend/src/components/dashboardv2/Sidebar.jsx`

**Modifications** :
- Import de l'icône `Megaphone`
- Ajout de l'élément de menu "Mes Annonces"

```jsx
// Import
import { Megaphone } from 'lucide-react'

// Menu
if (!hasAccess || hasAccess('announcements')) {
  allItems.push({ 
    id: 'announcements', 
    name: 'Mes Annonces', 
    icon: Megaphone 
  })
}
```

## 🎨 Interface Utilisateur

### Écran Principal

```
┌─────────────────────────────────────────────────────────┐
│ Mes Annonces                    [+ Nouvelle annonce]    │
│ Gérez vos produits et fonds de commerce en un seul...   │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │ Total        │ │ Produits     │ │ Fonds de     │    │
│ │ Annonces     │ │ Actifs       │ │ Commerce     │    │
│ │   15         │ │   12         │ │   3          │    │
│ └──────────────┘ └──────────────┘ └──────────────┘    │
├─────────────────────────────────────────────────────────┤
│ [Toutes (15)] [Produits (12)] [Fonds de Commerce (3)]  │
├─────────────────────────────────────────────────────────┤
│ Produits (12)                                           │
│ ┌────────┐ ┌────────┐ ┌────────┐                      │
│ │ Image  │ │ Image  │ │ Image  │                      │
│ │ Produit│ │ Produit│ │ Produit│                      │
│ │ 25€    │ │ 30€    │ │ 15€    │                      │
│ └────────┘ └────────┘ └────────┘                      │
│                                                          │
│ Fonds de Commerce (3)                                   │
│ ┌────────┐ ┌────────┐                                  │
│ │ Image  │ │ Image  │                                  │
│ │ Salon  │ │ Institut│                                 │
│ │ 50000€ │ │ 75000€ │                                  │
│ └────────┘ └────────┘                                  │
└─────────────────────────────────────────────────────────┘
```

### Modal de Sélection

```
┌─────────────────────────────────────────┐
│ Choisir le type d'annonce               │
│ Sélectionnez le type d'annonce...       │
├─────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐     │
│ │   📦         │  │   🏢         │     │
│ │              │  │              │     │
│ │  Produit     │  │ Fonds de     │     │
│ │              │  │ Commerce     │     │
│ │ Ajoutez un   │  │ Mettez en    │     │
│ │ produit à    │  │ vente un     │     │
│ │ vendre       │  │ salon        │     │
│ │              │  │              │     │
│ │ 12 produits  │  │ 3 fonds      │     │
│ └──────────────┘  └──────────────┘     │
│                                         │
│                      [Annuler]          │
└─────────────────────────────────────────┘
```

## 🔄 Flux Utilisateur

### Création d'une Annonce

```
1. Utilisateur clique sur "Nouvelle annonce"
   ↓
2. Modal s'ouvre avec 2 options :
   - Produit
   - Fonds de Commerce
   ↓
3a. Si "Produit" sélectionné :
    → Navigation vers onglet "Mes Produits"
    → Processus d'ajout de produit existant
    
3b. Si "Fonds de Commerce" sélectionné :
    → Navigation vers onglet "Fonds de Commerce"
    → Processus d'ajout de fonds de commerce existant
```

### Consultation des Annonces

```
1. Vue "Toutes" par défaut
   - Affiche produits + fonds de commerce
   - Limité à 6 de chaque type
   - Bouton "Voir tous" si plus de 6
   ↓
2. Filtrage par onglet :
   - "Toutes" : Tous les types
   - "Produits" : Produits uniquement
   - "Fonds de Commerce" : Fonds uniquement
   ↓
3. Clic sur une carte :
   - Produit → Navigation vers "Mes Produits"
   - Fonds → Navigation vers "Fonds de Commerce"
```

## 📊 Statistiques Affichées

### Carte 1 : Total Annonces
- **Valeur** : Nombre total (produits + fonds de commerce)
- **Détail** : "X produits, Y fonds de commerce"

### Carte 2 : Produits Actifs
- **Valeur** : Nombre de produits en stock (stock > 0)
- **Détail** : "En stock et disponibles"

### Carte 3 : Fonds de Commerce
- **Valeur** : Nombre de fonds de commerce actifs (status = 'active')
- **Détail** : "Actifs et en ligne"

## 🎨 Composants Visuels

### ProductCard
Affiche un aperçu de produit :
- Image du produit (ou icône Package si pas d'image)
- Badge "Rupture" si stock = 0
- Badge "Promo" si onSale = true
- Nom du produit (tronqué)
- Prix (avec prix original barré si promo)
- Badge stock

### BusinessCard
Affiche un aperçu de fonds de commerce :
- Image du commerce (ou icône Building2 si pas d'image)
- Badge de statut (Actif/Inactif)
- Nom du commerce (tronqué)
- Type de commerce (Salon/Institut)
- Prix
- Localisation

## 🔐 Permissions

### Accès au Module
- **Requis** : `userType === 'professionnel' || userType === 'grossiste'`
- **Permission** : `hasAccess('announcements')`

### Sous-utilisateurs
- Les sous-utilisateurs peuvent accéder au module si la permission "announcements" leur est accordée
- Ils suivent les mêmes règles de navigation vers produits/fonds de commerce

## 🧪 Tests à Effectuer

### Test 1 : Affichage Initial
- [ ] Connexion en tant que professionnel
- [ ] Vérifier que "Mes Annonces" apparaît dans le menu
- [ ] Cliquer sur "Mes Annonces"
- [ ] Vérifier l'affichage des statistiques
- [ ] Vérifier l'affichage des produits et fonds de commerce

### Test 2 : Création d'Annonce - Produit
- [ ] Cliquer sur "Nouvelle annonce"
- [ ] Modal s'ouvre
- [ ] Cliquer sur "Produit"
- [ ] Vérifier la redirection vers "Mes Produits"
- [ ] Vérifier que le processus d'ajout de produit fonctionne

### Test 3 : Création d'Annonce - Fonds de Commerce
- [ ] Cliquer sur "Nouvelle annonce"
- [ ] Modal s'ouvre
- [ ] Cliquer sur "Fonds de Commerce"
- [ ] Vérifier la redirection vers "Fonds de Commerce"
- [ ] Vérifier que le processus d'ajout fonctionne

### Test 4 : Navigation
- [ ] Cliquer sur une carte produit
- [ ] Vérifier la navigation vers "Mes Produits"
- [ ] Revenir à "Mes Annonces"
- [ ] Cliquer sur une carte fonds de commerce
- [ ] Vérifier la navigation vers "Fonds de Commerce"

### Test 5 : Filtres
- [ ] Tester l'onglet "Toutes"
- [ ] Tester l'onglet "Produits"
- [ ] Tester l'onglet "Fonds de Commerce"
- [ ] Vérifier que les compteurs sont corrects

### Test 6 : États Vides
- [ ] Tester avec 0 produit
- [ ] Tester avec 0 fonds de commerce
- [ ] Tester avec 0 annonce au total
- [ ] Vérifier les messages d'état vide

### Test 7 : Responsive
- [ ] Tester sur mobile
- [ ] Tester sur tablette
- [ ] Tester sur desktop
- [ ] Vérifier que le modal est responsive

### Test 8 : Permissions
- [ ] Tester en tant que particulier (ne doit pas voir l'onglet)
- [ ] Tester en tant que sous-utilisateur sans permission
- [ ] Tester en tant que sous-utilisateur avec permission

## 🚀 Avantages de cette Approche

### Pour l'Utilisateur
- ✅ **Vue centralisée** : Toutes les annonces au même endroit
- ✅ **Processus simplifié** : Un seul point d'entrée pour créer une annonce
- ✅ **Navigation intuitive** : Accès rapide aux sections détaillées
- ✅ **Statistiques claires** : Vue d'ensemble de l'activité

### Pour le Code
- ✅ **Réutilisation** : Utilise les processus existants (produits/fonds de commerce)
- ✅ **Maintenabilité** : Pas de duplication de code
- ✅ **Extensibilité** : Facile d'ajouter d'autres types d'annonces
- ✅ **Cohérence** : Suit les patterns existants du dashboard

## 📝 Notes Techniques

### Queries Convex Utilisées
```javascript
// Produits de l'utilisateur
api.products.getProductsBySeller({ sellerId: userId })

// Fonds de commerce de l'utilisateur
api.businessSales.getBusinessSalesBySeller({ sellerId: userId })
```

### État Local
```javascript
const [activeAnnouncementType, setActiveAnnouncementType] = useState('all')
const [showTypeSelector, setShowTypeSelector] = useState(false)
```

### Navigation
```javascript
// Vers Mes Produits
onNavigateToProducts={() => setActiveTab('products')}

// Vers Fonds de Commerce
onNavigateToBusinessSales={() => setActiveTab('business-sales')}
```

## 🎉 Résultat

La section "Mes Annonces" est maintenant disponible pour les professionnels et grossistes ! Elle offre :

- 📊 **Vue d'ensemble** de toutes les annonces
- ➕ **Création simplifiée** avec choix du type
- 🔄 **Navigation fluide** vers les sections détaillées
- 📱 **Interface responsive** et moderne
- 🎨 **Design cohérent** avec le reste du dashboard

Les utilisateurs peuvent maintenant gérer tous leurs produits et fonds de commerce depuis un seul endroit ! 🚀
