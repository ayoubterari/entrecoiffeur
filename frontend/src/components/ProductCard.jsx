import React, { useState } from 'react'

const ProductCard = ({ product, onAddToCart, onToggleFavorite, onViewDetails, isFavorite = false }) => {
  const [isHovered, setIsHovered] = useState(false)

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="product-card-image">
        <div className="product-image-container">
          {product.images && product.images[0] ? (
            // Vérifier si c'est une URL d'image ou un emoji
            product.images[0].startsWith('blob:') || product.images[0].startsWith('http') || product.images[0].startsWith('data:') ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  // Fallback en cas d'erreur de chargement
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : (
              <span className="product-emoji">{product.images[0]}</span>
            )
          ) : (
            <div className="product-placeholder">📦</div>
          )}
          {/* Fallback emoji caché par défaut */}
          <div className="product-placeholder" style={{ display: 'none' }}>📦</div>
        </div>
        
        {/* Badges */}
        <div className="product-badges">
          {product.onSale && discountPercentage > 0 && (
            <span className="badge sale-badge">-{discountPercentage}%</span>
          )}
          {product.featured && (
            <span className="badge featured-badge">⭐ Vedette</span>
          )}
        </div>

        {/* View Details Icon */}
        <button 
          className="view-details-icon"
          onClick={() => onViewDetails && onViewDetails()}
          title="Voir les détails du produit"
        >
          👁️
        </button>

        {/* Favorite Button */}
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite && onToggleFavorite(product)}
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Product Info */}
      <div className="product-card-info">
        <div className="product-category">
          {product.category?.name || 'Produit'}
        </div>
        
        <h4 className="product-name">{product.name}</h4>
        
        <div className="product-rating">
          {product.rating && (
            <>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(product.rating) ? 'star filled' : 'star'}>
                    ⭐
                  </span>
                ))}
              </div>
              <span className="rating-text">
                {product.rating} ({product.reviewCount || 0})
              </span>
            </>
          )}
        </div>

        <div className="product-price">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="original-price">{product.originalPrice.toFixed(2)}€</span>
          )}
          <span className="current-price">{product.price.toFixed(2)}€</span>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="product-tags">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="product-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="product-actions">
          <button 
            className="view-details-btn"
            onClick={() => onViewDetails && onViewDetails()}
          >
            👁️ Voir détails
          </button>
          
          <button 
            className={`add-to-cart-btn ${product.stock === 0 ? 'disabled' : ''}`}
            onClick={() => onAddToCart && onAddToCart(product)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Rupture de stock' : '🛒 Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
