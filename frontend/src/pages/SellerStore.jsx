import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import ProductCard from '../components/ProductCard'

const SellerStore = () => {
  const { sellerId } = useParams()
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])

  // Récupérer les informations du vendeur
  const seller = useQuery(
    api.auth.getUserById, 
    sellerId && sellerId !== 'undefined' ? { userId: sellerId } : "skip"
  )
  
  // Récupérer tous les produits du vendeur
  const sellerProducts = useQuery(
    api.products.getProductsBySeller, 
    sellerId && sellerId !== 'undefined' ? { sellerId } : "skip"
  )

  // Récupérer les catégories pour les filtres
  const categories = useQuery(api.products.getCategories)

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrer les produits
  const filteredProducts = sellerProducts?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  }) || []

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item._id === product._id)
      if (existingItem) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const handleToggleFavorite = (product) => {
    setFavorites(prev => {
      const isFavorite = prev.some(item => item._id === product._id)
      if (isFavorite) {
        return prev.filter(item => item._id !== product._id)
      }
      return [...prev, product]
    })
  }

  if (!seller || !sellerProducts) {
    return (
      <div className="seller-store-loading">
        <div className="loading-spinner">Chargement du store...</div>
      </div>
    )
  }

  return (
    <div className="seller-store">
      {/* Header du store */}
      <div className="seller-store-header">
        <div className="seller-store-header-content">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            Retour
          </button>
          
          <div className="seller-info">
            <div className="seller-avatar">
              <div className="avatar-circle">
                {seller.firstName?.charAt(0)?.toUpperCase() || 'V'}
              </div>
            </div>
            
            <div className="seller-details">
              <h1 className="seller-name">
                {seller.firstName} {seller.lastName}
              </h1>
              <p className="seller-email">{seller.email}</p>
              <div className="seller-stats">
                <span className="stat">
                  📦 {sellerProducts.length} produit{sellerProducts.length > 1 ? 's' : ''}
                </span>
                <span className="stat">
                  🏷️ {seller.userType === 'professionnel' ? 'Professionnel' : 'Particulier'}
                </span>
                {seller.companyName && (
                  <span className="stat">
                    🏢 {seller.companyName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="store-filters">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher dans ce store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="category-filters">
            <button
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Tous ({sellerProducts.length})
            </button>
            {categories?.map((category) => {
              const categoryCount = sellerProducts.filter(p => p.category === category.name).length
              if (categoryCount === 0) return null
              
              return (
                <button
                  key={category._id}
                  className={`filter-btn ${selectedCategory === category.name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.icon} {category.name} ({categoryCount})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Produits du vendeur */}
      <div className="store-products">
        <div className="products-header">
          <h2>
            {selectedCategory === 'all' 
              ? `Tous les produits (${filteredProducts.length})`
              : `${selectedCategory} (${filteredProducts.length})`
            }
          </h2>
          {searchQuery && (
            <p className="search-results">
              Résultats pour "{searchQuery}"
            </p>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                onViewDetails={() => navigate(`/product/${product._id}`)}
                isFavorite={favorites.some(item => item._id === product._id)}
              />
            ))}
          </div>
        ) : (
          <div className="no-products">
            {searchQuery ? (
              <div className="no-results">
                <span className="no-results-icon">🔍</span>
                <h3>Aucun produit trouvé</h3>
                <p>Essayez avec d'autres mots-clés</p>
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  Effacer la recherche
                </button>
              </div>
            ) : (
              <div className="empty-store">
                <span className="empty-icon">📦</span>
                <h3>Aucun produit dans cette catégorie</h3>
                <p>Ce vendeur n'a pas encore ajouté de produits dans cette catégorie</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerStore
