import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import ProductCard from './ProductCard'
import './FavoritesModal.css'

const FavoritesModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  onAddToCart, 
  onToggleFavorite, 
  onViewDetails,
  isAuthenticated,
  onLogin 
}) => {
  // Get user favorites
  const userFavorites = useQuery(api.favorites.getUserFavorites, userId ? { userId } : "skip")
  const userFavoriteIds = useQuery(api.favorites.getUserFavoriteIds, userId ? { userId } : "skip")

  // Helper function to check if a product is favorite
  const isProductFavorite = (productId) => {
    return userFavoriteIds?.includes(productId) || false
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

  if (!isOpen) return null

  return (
    <div className="favorites-modal-overlay" onClick={onClose}>
      <div className="favorites-modal" onClick={(e) => e.stopPropagation()}>
        <div className="favorites-modal-header">
          <h2>Mes Favoris</h2>
          <button className="favorites-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="favorites-modal-content">
          {!isAuthenticated ? (
            <div className="favorites-empty">
              <div className="favorites-empty-icon">❤️</div>
              <h3>Connectez-vous pour voir vos favoris</h3>
              <p>Sauvegardez vos produits préférés en vous connectant à votre compte.</p>
              <button className="favorites-login-btn" onClick={() => { onClose(); onLogin('signin'); }}>
                Se connecter
              </button>
            </div>
          ) : userFavorites && userFavorites.length > 0 ? (
            <div className="favorites-grid">
              {userFavorites.map((favorite) => (
                <ProductCard
                  key={favorite.favoriteId}
                  product={favorite.product}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={onToggleFavorite}
                  onViewDetails={() => { onClose(); onViewDetails(favorite.product._id); }}
                  isFavorite={isProductFavorite(favorite.product._id)}
                />
              ))}
            </div>
          ) : (
            <div className="favorites-empty">
              <div className="favorites-empty-icon">💔</div>
              <h3>Aucun favori pour le moment</h3>
              <p>Découvrez nos produits et ajoutez vos préférés en cliquant sur le cœur.</p>
              <button className="favorites-browse-btn" onClick={onClose}>
                Découvrir les produits
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FavoritesModal
