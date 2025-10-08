# 🔍 Guide de la Recherche Intelligente - Entre Coiffeur

## Vue d'ensemble

Le système de recherche intelligente permet aux utilisateurs de trouver facilement des produits avec des recommandations en temps réel, des suggestions automatiques et un scoring de pertinence avancé.

## 🏗️ Architecture

### Backend (Convex)

#### Fonctions de Recherche
```typescript
// Recherche principale avec scoring intelligent
searchProducts(query, limit?, categoryId?)
- Recherche dans nom, description, tags
- Scoring de pertinence avec pondération
- Filtrage par catégorie optionnel
- Tri par score de pertinence

// Suggestions automatiques
getSearchSuggestions(query, limit?)
- Suggestions basées sur les produits existants
- Autocomplétion intelligente
- Suggestions populaires par défaut

// Recherches tendances
getTrendingSearches()
- Termes de recherche populaires
- Statistiques d'utilisation
- Recommandations personnalisées

// Recherche par catégorie
searchByCategory(categoryId, query?, limit?)
- Recherche ciblée dans une catégorie
- Combinaison catégorie + mots-clés
```

### Frontend (React)

#### Composant SmartSearch
```javascript
<SmartSearch
  onSearch={handleSearch}           // Callback recherche
  onProductSelect={handleProductSelect} // Sélection produit
  placeholder="Rechercher..."       // Texte placeholder
/>
```

## 🎯 Fonctionnalités

### **Recherche Intelligente**

#### Scoring de Pertinence
- **Nom du produit** : Score maximum (100 points)
- **Début du nom** : Bonus +50 points
- **Description** : 30 points
- **Tags** : 20 points par tag
- **Produits vedette** : Bonus +10 points
- **Stock disponible** : Bonus +5 points
- **Mots-clés individuels** : Points variables

#### Algorithme de Recherche
```javascript
// Exemple de scoring
const calculateScore = (product) => {
  let score = 0;
  const searchTerm = query.toLowerCase();
  
  // Correspondance exacte dans le nom
  if (product.name.toLowerCase().includes(searchTerm)) {
    score += 100;
    if (product.name.toLowerCase().startsWith(searchTerm)) {
      score += 50; // Bonus début de nom
    }
  }
  
  // Correspondance dans description
  if (product.description.toLowerCase().includes(searchTerm)) {
    score += 30;
  }
  
  // Correspondance dans les tags
  product.tags.forEach(tag => {
    if (tag.toLowerCase().includes(searchTerm)) {
      score += 20;
    }
  });
  
  return score;
}
```

### **Interface Utilisateur**

#### Dropdown de Résultats
- **Sections organisées** : Produits, Suggestions, Tendances
- **Navigation clavier** : Flèches, Enter, Escape
- **Highlighting** : Mise en évidence des termes recherchés
- **Images produits** : Aperçu visuel des résultats
- **Informations produit** : Prix, stock, badges

#### États d'Interface
- **Recherche active** : Résultats en temps réel
- **Pas de résultats** : Suggestions d'amélioration
- **Recherches populaires** : Quand pas de saisie
- **Loading** : Indicateurs de chargement

### **Expérience Utilisateur**

#### Interactions Avancées
- **Autocomplétion** : Suggestions pendant la saisie
- **Sélection rapide** : Clic ou Enter pour sélectionner
- **Navigation fluide** : Redirection vers produit/résultats
- **Historique** : Mémorisation des recherches

#### Responsive Design
- **Mobile-first** : Interface tactile optimisée
- **Desktop** : Hover effects et raccourcis clavier
- **Tablette** : Adaptation automatique

## 🎨 Design et UX

### **Style Moderne 2025**
- **Glass Morphism** : Transparence et flou d'arrière-plan
- **Gradients Roses** : Cohérence avec la charte (#ff6b9d → #fd79a8)
- **Animations Fluides** : Transitions cubic-bezier naturelles
- **Micro-interactions** : Feedback visuel immédiat

### **Composants Visuels**
- **Barre de recherche** : Bordures arrondies, ombres élégantes
- **Dropdown** : Fond transparent, sections colorées
- **Éléments** : Hover effects, sélection active
- **Icônes** : Emojis expressifs pour chaque type

## 🔧 Configuration et Utilisation

### **Intégration dans Home.jsx**
```javascript
// Import du composant
import SmartSearch from '../components/SmartSearch'

// État de recherche
const [searchQuery, setSearchQuery] = useState('')
const [searchResults, setSearchResults] = useState([])
const [isSearching, setIsSearching] = useState(false)

// Query Convex pour les résultats
const searchData = useQuery(
  api.functions.queries.search.searchProducts,
  searchQuery.length >= 2 ? { query: searchQuery, limit: 20 } : "skip"
)

// Handlers
const handleSearch = (query) => {
  setSearchQuery(query)
  setIsSearching(!!query && query.length >= 2)
}

const handleProductSelect = (product) => {
  navigate(`/product/${product._id}`)
}
```

### **Personnalisation**

#### Termes Populaires
```javascript
// Dans getTrendingSearches()
const trendingTerms = [
  { term: "shampooing bio", count: 156 },
  { term: "masque réparateur", count: 142 },
  { term: "huile argan", count: 128 },
  // ... autres termes
]
```

#### Scoring Personnalisé
```javascript
// Ajuster les poids dans calculateScore()
const WEIGHTS = {
  NAME_EXACT: 100,
  NAME_START: 50,
  DESCRIPTION: 30,
  TAGS: 20,
  FEATURED: 10,
  IN_STOCK: 5
}
```

## 📊 Exemples d'Usage

### **Recherches Typiques**
- **"shampooing"** → Tous les shampooings avec score de pertinence
- **"bio"** → Produits bio dans nom, description, tags
- **"cheveux bouclés"** → Produits spécifiques aux cheveux bouclés
- **"argan"** → Produits contenant de l'huile d'argan

### **Suggestions Intelligentes**
- Saisie : **"sham"** → Suggestions : "shampooing", "shampooing bio"
- Saisie : **"masque"** → Suggestions : "masque cheveux", "masque réparateur"
- Saisie : **"huile"** → Suggestions : "huile argan", "huile capillaire"

### **Résultats Pondérés**
```javascript
// Exemple de résultats pour "shampooing bio"
[
  { name: "Shampooing Bio Argan", score: 150 },      // Nom exact + bio
  { name: "Bio Shampooing Naturel", score: 130 },    // Nom + bio
  { name: "Shampooing Cheveux Gras", score: 100 },   // Nom seulement
  { name: "Après-shampooing Bio", score: 50 }        // Tags bio
]
```

## 🚀 Performance et Optimisation

### **Optimisations Backend**
- **Index Convex** : Sur nom, description, tags
- **Limite de résultats** : Pagination intelligente
- **Cache** : Mémorisation des recherches fréquentes
- **Debouncing** : Éviter les requêtes excessives

### **Optimisations Frontend**
- **Lazy Loading** : Chargement différé des images
- **Virtualization** : Pour les longues listes
- **Memoization** : Cache des composants
- **Debounced Input** : Réduction des appels API

## 🔐 Sécurité et Validation

### **Validation des Entrées**
- **Longueur minimum** : 2 caractères pour déclencher la recherche
- **Sanitization** : Nettoyage des termes de recherche
- **Rate Limiting** : Limitation des requêtes par utilisateur
- **Injection Prevention** : Protection contre les attaques

### **Privacy**
- **Pas de stockage** : Les recherches ne sont pas sauvegardées
- **Anonymisation** : Pas de tracking personnel
- **RGPD Compliant** : Respect de la vie privée

## 📱 Responsive et Accessibilité

### **Mobile**
- **Touch-friendly** : Zones de tap optimisées
- **Keyboard mobile** : Type de clavier adapté
- **Scroll** : Navigation tactile fluide
- **Performance** : Optimisé pour mobile

### **Accessibilité**
- **ARIA Labels** : Support des lecteurs d'écran
- **Navigation clavier** : Flèches, Tab, Enter, Escape
- **Contraste** : Couleurs accessibles
- **Focus visible** : Indication claire du focus

---

*Guide créé pour Entre Coiffeur - Recherche Intelligente v1.0*
