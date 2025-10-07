import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import ProductCard from '../components/ProductCard'
import './SellerStore.css'

const SellerStore = () => {
  const { sellerId } = useParams()
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])

  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('userId')

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

  // Follow-related queries and mutations
  const followersCount = useQuery(
    api.follows.getFollowersCount,
    sellerId && sellerId !== 'undefined' ? { sellerId } : "skip"
  )

  const isFollowing = useQuery(
    api.follows.isFollowing,
    currentUserId && sellerId && sellerId !== 'undefined' ? 
    { followerId: currentUserId, followedId: sellerId } : "skip"
  )

  const toggleFollow = useMutation(api.follows.toggleFollow)

  // Afficher tous les produits sans filtrage
  const filteredProducts = sellerProducts || []

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

  const handleFollowClick = async () => {
    if (!currentUserId) {
      // Redirect to login if not authenticated
      navigate('/login')
      return
    }

    if (currentUserId === sellerId) {
      // Can't follow yourself
      return
    }

    try {
      await toggleFollow({
        followerId: currentUserId,
        followedId: sellerId
      })
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
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
      {/* Social Media Style Header */}
      <div className="seller-store-header">
        <div className="seller-store-header-content">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
            style={{
              background: 'linear-gradient(135deg, #ff6b9d, #fd79a8)',
              color: 'white',
              border: '2px solid #ff6b9d',
              padding: '0.75rem 1.5rem',
              borderRadius: '50px',
              fontWeight: '600',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)',
              zIndex: 10,
              position: 'relative',
              opacity: 1,
              visibility: 'visible'
            }}
          >
            ← Retour
          </button>
          
          {/* Profile Section - Social Media Style */}
          <div className="profile-section">
            <div className="profile-header">
              <div className="seller-avatar">
                <div className="avatar-logo">
                  <div className="logo-background">
                    <div className="beauty-pattern"></div>
                    <div className="sparkle sparkle-1">✨</div>
                    <div className="sparkle sparkle-2">💫</div>
                    <div className="sparkle sparkle-3">⭐</div>
                  </div>
                  <div className="logo-letter">
                    {seller.firstName?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                  <div className="logo-crown">👑</div>
                  <div className="beauty-icons">
                    <span className="beauty-icon icon-1">💄</span>
                    <span className="beauty-icon icon-2">✂️</span>
                    <span className="beauty-icon icon-3">💅</span>
                  </div>
                </div>
                <div className="online-indicator"></div>
              </div>
              
              <div className="profile-info">
                <div className="profile-names">
                  <h1 className="seller-name">
                    {seller.firstName} {seller.lastName}
                  </h1>
                  <p className="seller-username">@{seller.firstName?.toLowerCase()}{seller.lastName?.toLowerCase()}</p>
                </div>
                
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-number">{sellerProducts.length}</span>
                    <span className="stat-label">Produits</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">
                      {followersCount !== undefined ? 
                        followersCount >= 1000 ? 
                          `${(followersCount / 1000).toFixed(1)}K` : 
                          followersCount 
                        : '0'
                      }
                    </span>
                    <span className="stat-label">Followers</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">4.8</span>
                    <span className="stat-label">Rating</span>
                  </div>
                </div>
              </div>
              
              <div className="profile-actions">
                {currentUserId && currentUserId !== sellerId ? (
                  <button 
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowClick}
                    disabled={!currentUserId}
                  >
                    {isFollowing ? (
                      <>
                        <span className="follow-icon">✓</span>
                        Suivi(e)
                      </>
                    ) : (
                      <>
                        <span className="follow-icon">+</span>
                        Suivre
                      </>
                    )}
                  </button>
                ) : currentUserId === sellerId ? (
                  <button className="follow-btn own-store" disabled>
                    <span className="follow-icon">👤</span>
                    Votre store
                  </button>
                ) : (
                  <button 
                    className="follow-btn"
                    onClick={() => navigate('/login')}
                  >
                    <span className="follow-icon">+</span>
                    Suivre
                  </button>
                )}
                <button className="message-btn">Message</button>
                <button className="share-btn">Partager</button>
              </div>
            </div>
            
            {/* Bio Section */}
            <div className="profile-bio">
              <p className="bio-text">
                ✨ {seller.userType === 'professionnel' ? 'Professionnel' : 'Passionné'} de beauté & coiffure
                {seller.companyName && ` • ${seller.companyName}`}
              </p>
              <p className="bio-description">
                🌟 Découvrez ma sélection de produits de qualité premium
                📍 Livraison rapide partout en France
                💬 N'hésitez pas à me contacter pour des conseils personnalisés
              </p>
              <div className="profile-badges">
                <span className="badge verified">✓ Vérifié</span>
                <span className="badge pro">👑 Pro</span>
                <span className="badge fast-shipping">🚀 Expédition rapide</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Navigation Tabs */}
      <div className="profile-navigation">
        <div className="nav-tabs">
          <button className="nav-tab active">
            <span className="tab-icon">🛍️</span>
            <span className="tab-text">Boutique</span>
          </button>
          <button className="nav-tab">
            <span className="tab-icon">📸</span>
            <span className="tab-text">Posts</span>
          </button>
          <button className="nav-tab">
            <span className="tab-icon">⭐</span>
            <span className="tab-text">Avis</span>
          </button>
          <button className="nav-tab">
            <span className="tab-icon">ℹ️</span>
            <span className="tab-text">À propos</span>
          </button>
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
