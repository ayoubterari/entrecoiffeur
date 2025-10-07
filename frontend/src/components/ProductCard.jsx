import React, { useState } from 'react'
import ProductImageDisplay from './ProductImageDisplay'
import './ProductCard.css'

const ProductCard = ({ product, onAddToCart, onToggleFavorite, onViewDetails, isFavorite = false }) => {
  const [isHovered, setIsHovered] = useState(false)

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div 
      className={`modern-product-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails && onViewDetails()}
    >
      {/* Image Container */}
      <div className="card-image-wrapper">
        <div className="card-image-container">
          <ProductImageDisplay 
            images={product.images}
            productName={product.name}
            className="card-product-image"
          />
          
          {/* Badges */}
          {product.onSale && discountPercentage > 0 && (
            <div className="card-badges">
              <span className="discount-badge">-{discountPercentage}%</span>
            </div>
          )}

          {/* Favorite Button */}
          <button 
            className={`wishlist-btn ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite && onToggleFavorite(product)
            }}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path 
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </svg>
          </button>

          {/* Quick Actions (visible on hover) */}
          <div className={`quick-actions ${isHovered ? 'visible' : ''}`}>
            <button 
              className="quick-view-btn"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails && onViewDetails()
              }}
              title="Aperçu rapide"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="card-content">
        {/* Category */}
        <div className="product-category-modern">
          {product.category || 'Beauté'}
        </div>
        
        {/* Product Name */}
        <h3 className="product-title-modern">{product.name}</h3>
        
        {/* Rating */}
        {product.rating && (
          <div className="rating-container">
            <div className="stars-modern">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`star-modern ${i < Math.floor(product.rating) ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="rating-count">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="price-container">
          <div className="price-main">
            <span className="current-price-modern">{product.price.toFixed(2)}€</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price-modern">{product.originalPrice.toFixed(2)}€</span>
            )}
          </div>
          {discountPercentage > 0 && (
            <div className="savings-text">
              Économisez {((product.originalPrice - product.price)).toFixed(2)}€
            </div>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="tags-container">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="tag-modern">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Add to Cart Button */}
        <button 
          className={`add-to-cart-modern ${product.stock === 0 ? 'out-of-stock' : ''} ${isHovered ? 'visible' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart && onAddToCart(product)
          }}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Rupture de stock
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Ajouter au panier
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ProductCard
