import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import ProductCard from '../components/ProductCard'
import MessagePopup from '../components/MessagePopup'
import SellerPostsTab from '../components/SellerPostsTab'
import SellerReviewsTab from '../components/SellerReviewsTab'
import ShareModal from '../components/ShareModal'
import { useAffiliateTracking } from '../hooks/useAffiliateTracking'
import './SellerStore.css'

const SellerStore = ({ onAddToCart, onToggleFavorite, isAuthenticated, userId }) => {
  const { sellerId } = useParams()
  const navigate = useNavigate()
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('boutique')
  const [showCartToast, setShowCartToast] = useState(false)
  const [showFavoriteToast, setShowFavoriteToast] = useState(false)

  // Use userId from props instead of localStorage
  const currentUserId = userId

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

  // Get seller review stats for rating display
  const sellerReviewStats = useQuery(
    api.orderReviews.getSellerReviewStats,
    sellerId && sellerId !== 'undefined' ? { sellerId } : "skip"
  )

  // Get user favorite product IDs for efficient checking
  const userFavoriteIds = useQuery(api.favorites.getUserFavoriteIds, currentUserId ? { userId: currentUserId } : "skip")

  const toggleFollow = useMutation(api.follows.toggleFollow)

  // Hook pour le tracking d'affiliation
  const { preserveAffiliateForAuth } = useAffiliateTracking()

  // Afficher tous les produits sans filtrage - avec vérification de sécurité
  const filteredProducts = Array.isArray(sellerProducts) ? sellerProducts : []

  // Helper function to check if a product is favorite
  const isProductFavorite = (productId) => {
    return userFavoriteIds?.includes(productId) || false
  }

  const handleAddToCart = (product) => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      // Préserver le code d'affiliation avant redirection
      preserveAffiliateForAuth()
      // Rediriger vers la page de connexion
      navigate('/login')
      return
    }

    // Formater les données pour le panier global
    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || '🛍️'
    }
    
    onAddToCart(cartItem)
    
    // Afficher notification
    setShowCartToast(true)
    setTimeout(() => setShowCartToast(false), 3000)
  }

  const handleToggleFavorite = (product) => {
    onToggleFavorite(product)
    
    // Afficher notification
    setShowFavoriteToast(true)
    setTimeout(() => setShowFavoriteToast(false), 3000)
  }

  const handleFollowClick = async () => {
    try {
      if (!currentUserId) {
        // Préserver le code d'affiliation avant redirection
        preserveAffiliateForAuth()
        // Redirect to login if not authenticated
        navigate('/login')
        return
      }

      if (currentUserId === sellerId) {
        // Can't follow yourself
        return
      }

      await toggleFollow({
        followerId: currentUserId,
        followedId: sellerId
      })
    } catch (error) {
      console.error('Error toggling follow:', error)
      // Optionally show user-friendly error message
    }
  }

  const handleMessageClick = () => {
    if (!currentUserId) {
      // Préserver le code d'affiliation avant redirection
      preserveAffiliateForAuth()
      // Redirect to login if not authenticated
      navigate('/login')
      return
    }

    if (currentUserId === sellerId) {
      // Can't message yourself
      return
    }

    setIsMessagePopupOpen(true)
  }

  const handleShareClick = () => {
    if (!currentUserId) {
      // Préserver le code d'affiliation avant redirection
      preserveAffiliateForAuth()
      // Redirect to login if not authenticated
      navigate('/login')
      return
    }

    setIsShareModalOpen(true)
  }

  // Loading state avec vérification de sécurité
  if (!seller || sellerProducts === undefined) {
    return (
      <div className="seller-store-loading">
        <div className="loading-spinner">Chargement du store...</div>
      </div>
    )
  }

  // Vérification de sécurité pour les données du vendeur
  if (!seller || typeof seller !== 'object') {
    return (
      <div className="seller-store-error">
        <div className="error-message">
          <h3>Erreur de chargement</h3>
          <p>Impossible de charger les informations du vendeur</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Retour
          </button>
        </div>
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
              background: 'linear-gradient(135deg, #2d2d2d, #404040)',
              color: 'white',
              border: '2px solid #2d2d2d',
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
            Retour
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
                    <span className="stat-number">
                      {sellerReviewStats?.averageRating ? 
                        sellerReviewStats.averageRating : 'Nouveau'
                      }
                    </span>
                    <span className="stat-label">
                      {sellerReviewStats?.totalReviews > 0 ? 
                        `Rating (${sellerReviewStats.totalReviews} avis)` : 'Rating'
                      }
                    </span>
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
                <button 
                  className="message-btn"
                  onClick={handleMessageClick}
                >
                  Message
                </button>
                <button 
                  className="share-btn"
                  onClick={handleShareClick}
                >
                  Partager
                </button>
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
          <button 
            className={`nav-tab ${activeTab === 'boutique' ? 'active' : ''}`}
            onClick={() => setActiveTab('boutique')}
          >
            <span className="tab-icon">🛍️</span>
            <span className="tab-text">Boutique</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <span className="tab-icon">📸</span>
            <span className="tab-text">Posts</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'avis' ? 'active' : ''}`}
            onClick={() => setActiveTab('avis')}
          >
            <span className="tab-icon">⭐</span>
            <span className="tab-text">Avis</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'apropos' ? 'active' : ''}`}
            onClick={() => setActiveTab('apropos')}
          >
            <span className="tab-icon">ℹ️</span>
            <span className="tab-text">À propos</span>
          </button>
        </div>
      </div>


      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'boutique' && (
          <div className="store-products">
            <div className="products-header">
              <h2>
                Tous les produits ({filteredProducts.length})
              </h2>
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
                    isFavorite={isProductFavorite(product._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <div className="empty-store">
                  <span className="empty-icon">📦</span>
                  <h3>Aucun produit disponible</h3>
                  <p>Ce vendeur n'a pas encore ajouté de produits à sa boutique</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <SellerPostsTab
            sellerId={sellerId}
            currentUserId={currentUserId}
            isOwner={currentUserId === sellerId}
          />
        )}

        {activeTab === 'avis' && (
          <SellerReviewsTab sellerId={sellerId} />
        )}

        {activeTab === 'apropos' && (
          <div className="about-tab">
            <div className="about-content">
              <div className="about-section">
                <h3>À propos de {seller.firstName} {seller.lastName}</h3>
                <div className="seller-details">
                  <div className="detail-item">
                    <span className="detail-label">Type de compte :</span>
                    <span className="detail-value">
                      {seller.userType === 'professionnel' ? '👑 Professionnel' : '💎 Particulier'}
                    </span>
                  </div>
                  {seller.companyName && (
                    <div className="detail-item">
                      <span className="detail-label">Entreprise :</span>
                      <span className="detail-value">{seller.companyName}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Membre depuis :</span>
                    <span className="detail-value">
                      {new Date(seller.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Produits en vente :</span>
                    <span className="detail-value">{filteredProducts.length} produits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Popup */}
      <MessagePopup
        isOpen={isMessagePopupOpen}
        onClose={() => setIsMessagePopupOpen(false)}
        sellerId={sellerId}
        sellerName={`${seller.firstName} ${seller.lastName}`}
        currentUserId={currentUserId}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sellerId={sellerId}
        sellerName={`${seller.firstName} ${seller.lastName}`}
        currentUserId={currentUserId}
      />

      {/* Toast Notifications */}
      {showCartToast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, #00d084, #00b894)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0, 208, 132, 0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'slideIn 0.3s ease-out',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          ✓ Produit ajouté au panier
        </div>
      )}
      
      {showFavoriteToast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, #2d2d2d, #404040)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(255, 107, 157, 0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'slideIn 0.3s ease-out',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          ❤️ Favori mis à jour
        </div>
      )}
    </div>
  )
}

export default SellerStore
