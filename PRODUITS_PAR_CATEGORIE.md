# Système de Produits par Catégorie - Page d'Accueil

## Vue d'ensemble

Nouvelle section affichant chaque catégorie avec ses 5 meilleurs produits sous forme de carousels, positionnée après la section "Produits en vedette" sur la page d'accueil.

## Fonctionnalités

### 1. Affichage Dynamique
- **Une section par catégorie** : Chaque catégorie ayant des produits obtient sa propre section
- **Top 5 produits** : Affichage des 5 meilleurs produits de chaque catégorie
- **Tri intelligent** :
  1. Produits en vedette (`featured`) en premier
  2. Puis par note (`rating`)
  3. Puis par date de création (`createdAt`)

### 2. Navigation Carousel
- **Carousel indépendant** : Chaque catégorie a son propre carousel
- **Boutons de navigation** : Flèches gauche/droite
- **Désactivation automatique** : Boutons désactivés aux extrémités
- **Indicateur visuel** : Opacité réduite pour les boutons désactivés

### 3. Header de Catégorie

Chaque section comprend :
- **Icône de catégorie** : Grande icône dans un badge coloré
- **Titre** : Nom de la catégorie
- **Sous-titre** : Description contextuelle
- **Bouton "Voir tout"** : Redirection vers `/explore` avec filtre de catégorie

## Design

### Header de Catégorie

```
┌────────────────────────────────────────────────────────────┐
│  [🛍️]  Shampoings                          [Voir tout →]  │
│        Découvrez notre sélection de shampoings             │
└────────────────────────────────────────────────────────────┘
```

**Composants** :
1. **Icône** (60x60px) :
   - Fond : Gradient beige (#C0B4A5 → #D4C9BC)
   - Ombre : 0 4px 12px rgba(192, 180, 165, 0.3)
   - Border-radius : 1rem

2. **Texte** :
   - Titre : 1.5rem, bold, noir
   - Sous-titre : 0.85rem, gris, medium

3. **Bouton "Voir tout"** :
   - Fond : Gradient beige (#C0B4A5 → #A89985)
   - Couleur : Blanc
   - Border-radius : 2rem
   - Icône flèche animée au hover

### Carousel de Produits

- **Réutilisation** : Utilise les mêmes styles que les carousels existants
- **Largeur carte** : 160px
- **Gap** : 12px
- **Animation** : Transform translateX

### États Visuels

#### Normal
- Fond header : Gradient beige clair (#f8f5f2 → #ffffff)
- Bordure : 2px solid #e9e4df
- Ombre : 0 4px 15px rgba(192, 180, 165, 0.15)

#### Hover (Bouton "Voir tout")
- Transform : translateY(-2px)
- Ombre : 0 6px 16px rgba(192, 180, 165, 0.4)
- Fond : Gradient plus foncé (#A89985 → #8B7E6F)
- Flèche : translateX(4px)

## Implémentation Technique

### État du Composant

```javascript
const [categoryCarouselIndexes, setCategoryCarouselIndexes] = useState({})
```

**Structure** : `{ [categoryId]: carouselIndex }`

### Logique de Filtrage et Tri

```javascript
const productsByCategory = React.useMemo(() => {
  if (!allProducts || !categoriesData) return []
  
  return categoriesData.map(category => {
    // Filtrer les produits de cette catégorie
    const categoryProducts = allProducts.filter(product => 
      product.categoryId === category._id || product.category === category.name
    )
    
    // Trier par featured, puis par rating, puis par date
    const sortedProducts = categoryProducts.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      if ((a.rating || 0) !== (b.rating || 0)) return (b.rating || 0) - (a.rating || 0)
      return (b.createdAt || 0) - (a.createdAt || 0)
    })
    
    // Prendre les 5 premiers
    return {
      category,
      products: sortedProducts.slice(0, 5)
    }
  }).filter(item => item.products.length > 0) // Ne garder que les catégories avec des produits
}, [allProducts, categoriesData])
```

### Gestion de la Navigation

```javascript
const handleCategoryCarouselNav = (categoryId, direction) => {
  setCategoryCarouselIndexes(prev => {
    const currentIndex = prev[categoryId] || 0
    const categoryData = productsByCategory.find(item => item.category._id === categoryId)
    const maxIndex = categoryData ? categoryData.products.length - 2 : 0
    
    let newIndex = currentIndex
    if (direction === 'prev') {
      newIndex = Math.max(0, currentIndex - 1)
    } else {
      newIndex = Math.min(maxIndex, currentIndex + 1)
    }
    
    return { ...prev, [categoryId]: newIndex }
  })
}
```

### Rendu JSX

```jsx
{productsByCategory.length > 0 && productsByCategory.map((categoryData) => {
  const carouselIndex = categoryCarouselIndexes[categoryData.category._id] || 0
  
  return (
    <section key={categoryData.category._id} className={styles.productsSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.categoryHeader}>
          <div className={styles.categoryHeaderContent}>
            <div className={styles.categoryIconWrapper}>
              <span className={styles.categoryIconLarge}>{categoryData.category.icon}</span>
            </div>
            <div className={styles.categoryText}>
              <h3 className={styles.categoryTitle}>{categoryData.category.name}</h3>
              <p className={styles.categorySubtitle}>
                Découvrez notre sélection de {categoryData.category.name.toLowerCase()}
              </p>
            </div>
            <button 
              className={styles.categoryViewAllBtn}
              onClick={() => navigate(`/explore?category=${categoryData.category._id}`)}
            >
              <span>Voir tout</span>
              <svg>...</svg>
            </button>
          </div>
        </div>
        
        {/* Carousel */}
        <div className={styles.featuredCarousel}>
          {/* ... ProductCards ... */}
          {/* ... Navigation buttons ... */}
        </div>
      </div>
    </section>
  )
})}
```

## Position dans la Page

```
┌─────────────────────────────────────────┐
│ Hero Banner / Carousel                  │
├─────────────────────────────────────────┤
│ User Type Banners                       │
├─────────────────────────────────────────┤
│ Carte Interactive Banner                │
├─────────────────────────────────────────┤
│ Ventes Flash (Flash Sales)              │
├─────────────────────────────────────────┤
│ Call to Action - Vendre                 │
├─────────────────────────────────────────┤
│ Produits en Vedette                     │
├─────────────────────────────────────────┤
│ ✨ NOUVEAU: Produits par Catégorie      │ ← ICI
│   - Shampoings (Top 5)                  │
│   - Colorations (Top 5)                 │
│   - Soins (Top 5)                       │
│   - Accessoires (Top 5)                 │
│   - etc.                                │
├─────────────────────────────────────────┤
│ Newsletter                              │
└─────────────────────────────────────────┘
```

## Flux Utilisateur

### Scénario 1 : Navigation dans le Carousel

```
1. Utilisateur voit la section "Shampoings"
   ↓
2. 5 produits affichés (2 visibles sur mobile)
   ↓
3. Utilisateur clique sur flèche droite →
   ↓
4. Carousel glisse vers la gauche
   ↓
5. Produits suivants visibles
   ↓
6. Bouton gauche ← devient actif
```

### Scénario 2 : Voir Tous les Produits

```
1. Utilisateur voit la section "Colorations"
   ↓
2. Utilisateur clique sur "Voir tout"
   ↓
3. Redirection vers /explore?category={categoryId}
   ↓
4. Page Explore affiche tous les produits de la catégorie
```

### Scénario 3 : Clic sur un Produit

```
1. Utilisateur voit un produit dans "Soins"
   ↓
2. Utilisateur clique sur la carte produit
   ↓
3. Redirection vers /product/{productId}
   ↓
4. Page détail du produit s'affiche
```

## Avantages

### Expérience Utilisateur
- ✅ **Découverte facilitée** : Exploration par catégorie
- ✅ **Navigation intuitive** : Carousels familiers
- ✅ **Accès rapide** : Bouton "Voir tout" pour chaque catégorie
- ✅ **Visuellement attrayant** : Design moderne et cohérent

### Performance
- ✅ **Optimisé** : useMemo pour éviter les recalculs
- ✅ **Léger** : Maximum 5 produits par catégorie
- ✅ **Lazy rendering** : Sections rendues uniquement si produits disponibles

### SEO
- ✅ **Structure sémantique** : Balises HTML appropriées
- ✅ **Contenu riche** : Titres et descriptions par catégorie
- ✅ **Navigation claire** : Liens vers pages de catégories

## Responsive Design

### Desktop (≥ 768px)
- Header : Horizontal
- Icône : 60x60px
- Titre : 1.5rem
- Bouton : À droite

### Mobile (< 768px)
- Header : Vertical, centré
- Icône : 50x50px
- Titre : 1.25rem
- Bouton : Pleine largeur en bas

## Styles CSS

### Classes Principales

```css
.categoryHeader { }
.categoryHeaderContent { }
.categoryIconWrapper { }
.categoryIconLarge { }
.categoryText { }
.categoryTitle { }
.categorySubtitle { }
.categoryViewAllBtn { }
```

### Animations

**Hover sur "Voir tout"** :
```css
.categoryViewAllBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(192, 180, 165, 0.4);
}

.categoryViewAllBtn:hover svg {
  transform: translateX(4px);
}
```

## Exemples de Catégories

### Shampoings
```
┌────────────────────────────────────────────┐
│ 🧴 Shampoings                  [Voir tout] │
│    Découvrez notre sélection de shampoings │
├────────────────────────────────────────────┤
│ [Produit 1] [Produit 2] [Produit 3] ...   │
└────────────────────────────────────────────┘
```

### Colorations
```
┌────────────────────────────────────────────┐
│ 🎨 Colorations                 [Voir tout] │
│    Découvrez notre sélection de colorations│
├────────────────────────────────────────────┤
│ [Produit 1] [Produit 2] [Produit 3] ...   │
└────────────────────────────────────────────┘
```

### Soins
```
┌────────────────────────────────────────────┐
│ 💆 Soins                       [Voir tout] │
│    Découvrez notre sélection de soins     │
├────────────────────────────────────────────┤
│ [Produit 1] [Produit 2] [Produit 3] ...   │
└────────────────────────────────────────────┘
```

## Gestion des Cas Limites

### Catégorie sans Produits
- ❌ **Non affichée** : La section n'est pas rendue
- ✅ **Filtrage automatique** : `.filter(item => item.products.length > 0)`

### Moins de 5 Produits
- ✅ **Affichage normal** : Tous les produits disponibles sont affichés
- ✅ **Carousel adapté** : Navigation désactivée si ≤ 2 produits

### Moins de 3 Produits Visibles
- ✅ **Pas de navigation** : Boutons de carousel non affichés
- ✅ **Affichage statique** : Produits visibles sans scroll

## Intégration avec Autres Fonctionnalités

### Favoris
- ✅ **Support complet** : Bouton cœur sur chaque carte
- ✅ **État synchronisé** : `isProductFavorite(productId)`

### Panier
- ✅ **Ajout direct** : Bouton "Ajouter au panier" sur chaque carte
- ✅ **Authentification** : Redirection vers login si non connecté

### Recherche Avancée
- ✅ **Compatible** : Bouton "Voir tout" utilise les mêmes paramètres URL
- ✅ **Filtrage cohérent** : `/explore?category={categoryId}`

## Améliorations Futures

- [ ] **Pagination** : Charger plus de produits au scroll
- [ ] **Filtres rapides** : Prix, marque, etc. directement dans la section
- [ ] **Animations** : Transitions plus fluides entre produits
- [ ] **Préférences utilisateur** : Ordre des catégories personnalisable
- [ ] **Analytics** : Tracking des clics par catégorie
- [ ] **Lazy loading** : Charger les images à la demande
- [ ] **Skeleton loading** : Placeholders pendant le chargement

## Fichiers Modifiés

### Frontend
- `frontend/src/pages/Home.jsx` :
  - État `categoryCarouselIndexes`
  - Logique `productsByCategory` (useMemo)
  - Fonction `handleCategoryCarouselNav`
  - Section JSX des produits par catégorie

- `frontend/src/components/Home.module.css` :
  - Styles `.categoryHeader`
  - Styles `.categoryHeaderContent`
  - Styles `.categoryIconWrapper`
  - Styles `.categoryViewAllBtn`
  - Media queries responsive

### Lignes Ajoutées
- **JavaScript** : ~100 lignes
- **CSS** : ~130 lignes

## Dépendances

- `react` : Hooks (useState, useMemo)
- `react-router-dom` : Navigation (useNavigate)
- `convex/react` : Queries (useQuery)
- `ProductCard` : Composant de carte produit

## Compatibilité

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

## Test du Système

### Scénario de Test

1. **Accéder à la page d'accueil**
2. **Scroller jusqu'après "Produits en vedette"**
3. **Vérifier** :
   - ✅ Sections de catégories affichées
   - ✅ 5 produits maximum par catégorie
   - ✅ Headers avec icône, titre, sous-titre
   - ✅ Bouton "Voir tout" présent
4. **Cliquer sur flèche droite d'un carousel**
5. **Vérifier** :
   - ✅ Carousel glisse
   - ✅ Produits suivants visibles
   - ✅ Bouton gauche activé
6. **Cliquer sur "Voir tout"**
7. **Vérifier** :
   - ✅ Redirection vers /explore
   - ✅ Filtre de catégorie appliqué
8. **Cliquer sur une carte produit**
9. **Vérifier** :
   - ✅ Redirection vers page produit
10. **Tester sur mobile**
11. **Vérifier** :
    - ✅ Layout responsive
    - ✅ Bouton "Voir tout" pleine largeur
    - ✅ Carousels fonctionnels

Le système de produits par catégorie est maintenant entièrement fonctionnel ! 🎉
