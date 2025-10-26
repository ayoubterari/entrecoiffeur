import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import ProductCard from '../components/ProductCard'
import styles from './Explore.module.css'

const Explore = ({ onAddToCart, onToggleFavorite, userId, isAuthenticated, onShowLogin }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [showFilters, setShowFilters] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [isSliderActive, setIsSliderActive] = useState(false)

  // Fetch data from Convex
  const allProducts = useQuery(api.products.getProducts, { limit: 100 })
  const categories = useQuery(api.products.getCategories)
  const mainCategories = useQuery(api.products.getMainCategories)
  const userFavorites = useQuery(
    api.favorites.getUserFavorites,
    userId ? { userId } : "skip"
  )

  // Price ranges presets
  const priceRanges = [
    { id: 'all', label: 'Tous les prix', min: 0, max: 10000 },
    { id: 'under20', label: 'Moins de 20€', min: 0, max: 20 },
    { id: '20to50', label: '20€ - 50€', min: 20, max: 50 },
    { id: '50to100', label: '50€ - 100€', min: 50, max: 100 },
    { id: '100to200', label: '100€ - 200€', min: 100, max: 200 },
    { id: 'over200', label: 'Plus de 200€', min: 200, max: 10000 },
  ]

  // Filter and sort products
  const filteredProducts = allProducts?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    
    return matchesSearch && matchesCategory && matchesPrice
  }) || []

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'newest':
        return new Date(b._creationTime) - new Date(a._creationTime)
      default:
        return 0
    }
  })

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      onShowLogin && onShowLogin('signin')
      return
    }
    onAddToCart && onAddToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      quantity: 1
    })
  }

  const handleToggleFavorite = (product) => {
    if (!isAuthenticated) {
      onShowLogin && onShowLogin('signin')
      return
    }
    onToggleFavorite && onToggleFavorite(product)
  }

  const isFavorite = (productId) => {
    return userFavorites?.some(fav => fav.productId === productId) || false
  }

  return (
    <div className={styles.exploreContainer}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour
        </button>
        <h1 className={styles.title}>Marketplace</h1>
        <div className={styles.headerActions}>
          <button className={styles.cartBtn} onClick={() => navigate('/')}>
            🛒
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
        <button 
          className={styles.filterToggleBtn}
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Filtres
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Sidebar Filters */}
        <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3>Filtres</h3>
            <button className={styles.closeSidebar} onClick={() => setShowFilters(false)}>✕</button>
          </div>

          {/* Categories with Subcategories */}
          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Catégories</h4>
            <div className={styles.categoryList}>
              <button
                className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <span>📚 Tous les produits</span>
                <span className={styles.count}>{allProducts?.length || 0}</span>
              </button>
              
              {mainCategories?.map(category => {
                const subcategories = categories?.filter(c => c.parentCategoryId === category._id) || []
                const isExpanded = expandedCategories.has(category._id)
                const categoryProductCount = allProducts?.filter(p => p.category === category.name).length || 0
                
                return (
                  <div key={category._id} className={styles.categoryGroup}>
                    <div className={styles.categoryBtnWrapper}>
                      <button
                        className={`${styles.categoryBtn} ${selectedCategory === category.name ? styles.active : ''} ${subcategories.length > 0 ? styles.hasSubcategories : ''}`}
                        onClick={() => {
                          setSelectedCategory(category.name)
                          // Auto-expand subcategories when clicking on main category
                          if (subcategories.length > 0) {
                            const newExpanded = new Set()
                            newExpanded.add(category._id)
                            setExpandedCategories(newExpanded)
                          } else {
                            // If no subcategories, close all expanded categories
                            setExpandedCategories(new Set())
                          }
                        }}
                      >
                        <span>{category.icon} {category.name}</span>
                      </button>
                    </div>
                    
                    {isExpanded && subcategories.length > 0 && (
                      <div className={styles.subcategoryList}>
                        {subcategories.map(subcat => {
                          const subcatProductCount = allProducts?.filter(p => p.category === subcat.name).length || 0
                          return (
                            <button
                              key={subcat._id}
                              className={`${styles.subcategoryBtn} ${selectedCategory === subcat.name ? styles.active : ''}`}
                              onClick={() => setSelectedCategory(subcat.name)}
                            >
                              <span className={styles.subcatIndicator}>└─</span>
                              <span>{subcat.icon} {subcat.name}</span>
                              <span className={styles.count}>{subcatProductCount}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Price Range with Presets */}
          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Prix</h4>
            
            {/* Price Range Presets */}
            <div className={styles.priceRangeList}>
              {priceRanges.map(range => (
                <button
                  key={range.id}
                  className={`${styles.priceRangeBtn} ${selectedPriceRange === range.id ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedPriceRange(range.id)
                    setPriceRange([range.min, range.max])
                  }}
                >
                  <span className={styles.priceRangeIcon}>💰</span>
                  <span>{range.label}</span>
                </button>
              ))}
            </div>
            
            {/* Custom Price Range Slider */}
            <div className={styles.customPriceRange}>
              <h5 className={styles.customPriceTitle}>Prix personnalisé</h5>
              <div className={styles.priceSliderContainer}>
                <div className={styles.priceValues}>
                  <span className={styles.priceValue}>{priceRange[0]}€</span>
                  <span className={styles.priceValue}>{priceRange[1]}€</span>
                </div>
                <div className={styles.sliderWrapper}>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = Number(e.target.value)
                      if (newMin <= priceRange[1]) {
                        setPriceRange([newMin, priceRange[1]])
                        setSelectedPriceRange('custom')
                      }
                    }}
                    onMouseDown={() => setIsSliderActive(true)}
                    onMouseUp={() => setIsSliderActive(false)}
                    onTouchStart={() => setIsSliderActive(true)}
                    onTouchEnd={() => setIsSliderActive(false)}
                    className={`${styles.priceSlider} ${styles.sliderMin} ${isSliderActive ? styles.active : ''}`}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = Number(e.target.value)
                      if (newMax >= priceRange[0]) {
                        setPriceRange([priceRange[0], newMax])
                        setSelectedPriceRange('custom')
                      }
                    }}
                    onMouseDown={() => setIsSliderActive(true)}
                    onMouseUp={() => setIsSliderActive(false)}
                    onTouchStart={() => setIsSliderActive(true)}
                    onTouchEnd={() => setIsSliderActive(false)}
                    className={`${styles.priceSlider} ${styles.sliderMax} ${isSliderActive ? styles.active : ''}`}
                  />
                  <div className={styles.sliderTrack}>
                    <div 
                      className={styles.sliderRange}
                      style={{
                        left: `${(priceRange[0] / 1000) * 100}%`,
                        width: `${((priceRange[1] - priceRange[0]) / 1000) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          <button 
            className={styles.resetBtn}
            onClick={() => {
              setSelectedCategory('all')
              setPriceRange([0, 1000])
              setSearchQuery('')
              setSelectedPriceRange('all')
              setExpandedCategories(new Set())
            }}
          >
            Réinitialiser les filtres
          </button>
        </aside>

        {/* Products Grid */}
        <main className={styles.productsSection}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.resultsInfo}>
              <h2>{sortedProducts.length} produits</h2>
              {searchQuery && (
                <span className={styles.searchInfo}>
                  pour "{searchQuery}"
                </span>
              )}
            </div>
            <div className={styles.sortContainer}>
              <label>Trier par:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="featured">Recommandés</option>
                <option value="newest">Nouveautés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className={styles.productsGrid}>
              {sortedProducts.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  onViewDetails={() => navigate(`/product/${product._id}`)}
                  isFavorite={isFavorite(product._id)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>Aucun produit trouvé</h3>
              <p>Essayez de modifier vos filtres ou votre recherche</p>
              <button 
                className={styles.resetFiltersBtn}
                onClick={() => {
                  setSelectedCategory('all')
                  setPriceRange([0, 1000])
                  setSearchQuery('')
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Overlay for mobile filters */}
      {showFilters && (
        <div 
          className={styles.overlay} 
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}

export default Explore
