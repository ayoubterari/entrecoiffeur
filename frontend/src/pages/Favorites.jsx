import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import ProductCard from '../components/ProductCard'
import styles from '../components/Home.module.css'

const Favorites = ({ 
  userId, 
  onAddToCart, 
  onToggleFavorite, 
  isAuthenticated,
  onLogin 
}) => {
  const navigate = useNavigate()
  
  // Get user favorites
  const userFavorites = useQuery(api.favorites.getUserFavorites, userId ? { userId } : "skip")
  const userFavoriteIds = useQuery(api.favorites.getUserFavoriteIds, userId ? { userId } : "skip")

  // Helper function to check if a product is favorite
  const isProductFavorite = (productId) => {
    return userFavoriteIds?.includes(productId) || false
  }

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`)
  }

  // Helper function to handle add to cart with proper formatting
  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      onLogin('signin')
      return
    }
    
    // Format data for cart (same as in Home.jsx)
    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || '🛍️'
    }
    
    onAddToCart(cartItem)
  }

  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <header className={styles.mobileHeader}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <button 
              onClick={() => navigate('/')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'inherit', 
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              <h1 className={styles.marketplaceTitle}>← Mes Favoris</h1>
            </button>
            <p className={styles.marketplaceSubtitle}>Vos produits préférés</p>
          </div>
        </div>
      </header>

      {/* Favorites Content */}
      <section className={styles.productsSection} style={{ paddingTop: '2rem' }}>
        <div className={styles.container}>
          {!isAuthenticated ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❤️</div>
              <h2 style={{ marginBottom: '1rem', color: '#374151' }}>Connectez-vous pour voir vos favoris</h2>
              <p style={{ marginBottom: '2rem', color: '#6b7280', lineHeight: '1.6' }}>
                Sauvegardez vos produits préférés en vous connectant à votre compte.
              </p>
              <button 
                className={styles.signupBtn}
                onClick={() => onLogin('signin')}
              >
                Se connecter
              </button>
            </div>
          ) : userFavorites && userFavorites.length > 0 ? (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <h3 className={styles.sectionTitle}>
                  {userFavorites.length} produit{userFavorites.length > 1 ? 's' : ''} en favoris
                </h3>
              </div>
              <div className={styles.productsGrid}>
                {userFavorites.map((favorite) => (
                  <ProductCard
                    key={favorite.favoriteId}
                    product={favorite.product}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={onToggleFavorite}
                    onViewDetails={() => handleViewDetails(favorite.product._id)}
                    isFavorite={isProductFavorite(favorite.product._id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💔</div>
              <h2 style={{ marginBottom: '1rem', color: '#374151' }}>Aucun favori pour le moment</h2>
              <p style={{ marginBottom: '2rem', color: '#6b7280', lineHeight: '1.6' }}>
                Découvrez nos produits et ajoutez vos préférés en cliquant sur le cœur.
              </p>
              <button 
                className={styles.signupBtn}
                onClick={() => navigate('/')}
              >
                Découvrir les produits
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Favorites
