import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import ProductDetailImages from '../components/ProductDetailImages'
import './ProductDetail.css'

const ProductDetail = ({ productId, onBack, onAddToCart, isAuthenticated, onLogin }) => {
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showFullDescription, setShowFullDescription] = useState(false)
  
  // Vérifier si productId est valide
  if (!productId) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Produit non trouvé...</p>
      </div>
    )
  }

  // Récupérer les détails du produit
  const product = useQuery(api.products.getById, { productId })
  const seller = useQuery(api.auth.getCurrentUser, product?.sellerId ? { userId: product.sellerId } : "skip")
  
  // Récupérer les évaluations du produit
  const productReviewStats = useQuery(api.orderReviews.getProductReviewStats, 
    productId ? { productId } : "skip"
  )
  const productReviews = useQuery(api.orderReviews.getProductReviews, 
    productId ? { productId, limit: 10 } : "skip"
  )
  
  if (!product) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du produit...</p>
      </div>
    )
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      onLogin()
      return
    }
    
    onAddToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[0] || '🛍️'
    })
    
    // Reset quantity after adding to cart
    setQuantity(1)
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      onLogin()
      return
    }

    // Créer les données de commande
    const orderData = {
      items: [{
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images?.[0] || '🛍️'
      }],
      subtotal: product.price * quantity,
      shipping: product.price * quantity >= 50 ? 0 : 5.99,
      tax: 0,
      total: 0
    }

    // Calculer la TVA (20%)
    orderData.tax = (orderData.subtotal + orderData.shipping) * 0.20
    orderData.total = orderData.subtotal + orderData.shipping + orderData.tax

    // Naviguer vers la page de checkout
    navigate('/checkout', {
      state: { orderData }
    })
  }

  const totalPrice = (product.price * quantity).toFixed(2)
  const savings = product.originalPrice ? ((product.originalPrice - product.price) * quantity).toFixed(2) : 0

  return (
    <div className="product-detail-page">
      {/* Header avec navigation */}
      <div className="product-detail-header">
        <button className="back-button" onClick={onBack}>
          ← Retour aux produits
        </button>
        <div className="breadcrumb">
          <span>Accueil</span> / <span>Produits</span> / <span className="current">{product.name}</span>
        </div>
      </div>

      <div className="product-detail-container">
        {/* Section Images */}
        <div className="product-images-section">
          <div className="main-image">
            <ProductDetailImages 
              images={product.images}
              productName={product.name}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
            />
            
            {/* Badges */}
            <div className="product-badges">
              {product.featured && <span className="badge featured">⭐ Vedette</span>}
              {product.onSale && <span className="badge sale">🔥 Promo</span>}
              {product.stock < 10 && <span className="badge low-stock">⚠️ Stock limité</span>}
            </div>
          </div>
        </div>

        {/* Section Informations */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            
            {/* Prix */}
            <div className="price-section">
              <div className="current-price">{product.price}€</div>
              {product.originalPrice && (
                <div className="original-price">{product.originalPrice}€</div>
              )}
              {savings > 0 && (
                <div className="savings">Économisez {savings}€</div>
              )}
            </div>

            {/* Rating et avis */}
            <div className="rating-section">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(productReviewStats?.averageRating || 0) ? 'filled' : ''}`}>
                    ⭐
                  </span>
                ))}
              </div>
              <span className="rating-text">
                {productReviewStats?.averageRating ? 
                  `${productReviewStats.averageRating}/5` : 'Nouveau'
                } ({productReviewStats?.totalReviews || 0} avis)
              </span>
              {productReviewStats?.recommendationRate > 0 && (
                <span className="recommendation-rate">
                  👍 {productReviewStats.recommendationRate}% recommandent ce produit
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="product-description">
            <h3>Description</h3>
            <div className={`description-text ${showFullDescription ? 'expanded' : ''}`}>
              {product.description}
            </div>
            {product.description.length > 150 && (
              <button 
                className="toggle-description"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="product-tags">
              <h4>Caractéristiques</h4>
              <div className="tags-list">
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Informations vendeur */}
          <div className="seller-section">
            <h4>Vendu par</h4>
            <div 
              className="seller-info clickable-seller"
              onClick={() => navigate(`/seller/${product.sellerId}`)}
              title="Cliquez pour visiter le store de ce vendeur"
            >
              <div className="seller-store-badge">
                🏪 Voir le Store
              </div>
              <div className="seller-avatar">
                <div className="avatar-circle">
                  {seller?.firstName?.charAt(0)?.toUpperCase() || 'V'}
                </div>
              </div>
              <div className="seller-details">
                <h3>{seller?.firstName} {seller?.lastName}</h3>
                <span className="seller-badge">{seller?.userType === 'professionnel' ? 'Pro' : 'Particulier'}</span>
                <p className="seller-company">{seller?.companyName || 'Disway'}</p>
              </div>
              <div className="seller-arrow">
                →
              </div>
            </div>
          </div>

          {/* Section Achat */}
          <div className="purchase-section">
            <div className="stock-info">
              <span className={`stock-status ${product.stock > 10 ? 'in-stock' : 'low-stock'}`}>
                {product.stock > 10 ? '✅ En stock' : `⚠️ Plus que ${product.stock} en stock`}
              </span>
            </div>

            <div className="quantity-selector">
              <label>Quantité</label>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="total-price">
              <div className="price-breakdown">
                <div className="line-item">
                  <span>Prix unitaire:</span>
                  <span>{product.price}€</span>
                </div>
                <div className="line-item">
                  <span>Quantité:</span>
                  <span>{quantity}</span>
                </div>
                <div className="line-item total">
                  <span>Total:</span>
                  <span className="total-amount">{totalPrice}€</span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {!isAuthenticated ? '🔐 Se connecter pour acheter' : 
                 product.stock === 0 ? '❌ Rupture de stock' : 
                 '🛒 Ajouter au panier'}
              </button>
              
              <button 
                className="buy-now-btn" 
                onClick={handleBuyNow}
                disabled={!isAuthenticated || product.stock === 0}
              >
                ⚡ Acheter maintenant
              </button>
            </div>

            {/* Informations de livraison */}
            <div className="shipping-info">
              <div className="shipping-item">
                <span className="icon">🚚</span>
                <span>Livraison gratuite dès 50€</span>
              </div>
              <div className="shipping-item">
                <span className="icon">📦</span>
                <span>Expédition sous 24h</span>
              </div>
              <div className="shipping-item">
                <span className="icon">🔄</span>
                <span>Retour gratuit 30 jours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Avis et Évaluations */}
      {productReviewStats && productReviewStats.totalReviews > 0 && (
        <div className="reviews-section">
          <div className="reviews-header">
            <h3>⭐ Avis clients ({productReviewStats.totalReviews})</h3>
            
            {/* Statistiques détaillées */}
            <div className="review-stats">
              <div className="overall-rating">
                <div className="rating-display">
                  <span className="big-rating">{productReviewStats.averageRating}</span>
                  <div className="rating-details">
                    <div className="stars-large">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < Math.floor(productReviewStats.averageRating) ? 'filled' : ''}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="rating-subtitle">sur 5 étoiles</span>
                  </div>
                </div>
              </div>

              {/* Distribution des notes */}
              <div className="rating-distribution">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="rating-bar">
                    <span className="stars-count">{stars} ⭐</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${productReviewStats.totalReviews > 0 ? 
                            (productReviewStats.ratingDistribution[stars] / productReviewStats.totalReviews) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="count">({productReviewStats.ratingDistribution[stars]})</span>
                  </div>
                ))}
              </div>

              {/* Statistiques détaillées */}
              <div className="detailed-stats">
                {productReviewStats.averageDeliveryRating > 0 && (
                  <div className="stat-item">
                    <span className="stat-icon">🚚</span>
                    <span className="stat-label">Livraison</span>
                    <span className="stat-value">{productReviewStats.averageDeliveryRating}/5</span>
                  </div>
                )}
                {productReviewStats.averageProductQualityRating > 0 && (
                  <div className="stat-item">
                    <span className="stat-icon">📦</span>
                    <span className="stat-label">Qualité</span>
                    <span className="stat-value">{productReviewStats.averageProductQualityRating}/5</span>
                  </div>
                )}
                {productReviewStats.averageSellerServiceRating > 0 && (
                  <div className="stat-item">
                    <span className="stat-icon">👤</span>
                    <span className="stat-label">Service</span>
                    <span className="stat-value">{productReviewStats.averageSellerServiceRating}/5</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Liste des avis */}
          <div className="reviews-list">
            {productReviews && productReviews.length > 0 ? (
              productReviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.buyerFirstName?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div className="reviewer-details">
                        <h4>{review.displayName}</h4>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="review-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <div className="review-comment">
                      <p>{review.comment}</p>
                    </div>
                  )}

                  {/* Notes détaillées si disponibles */}
                  {(review.deliveryRating || review.productQualityRating || review.sellerServiceRating) && (
                    <div className="review-detailed-ratings">
                      {review.deliveryRating && (
                        <div className="detailed-rating">
                          <span className="rating-label">🚚 Livraison:</span>
                          <div className="mini-stars">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`mini-star ${i < review.deliveryRating ? 'filled' : ''}`}>⭐</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {review.productQualityRating && (
                        <div className="detailed-rating">
                          <span className="rating-label">📦 Qualité:</span>
                          <div className="mini-stars">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`mini-star ${i < review.productQualityRating ? 'filled' : ''}`}>⭐</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {review.sellerServiceRating && (
                        <div className="detailed-rating">
                          <span className="rating-label">👤 Service:</span>
                          <div className="mini-stars">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`mini-star ${i < review.sellerServiceRating ? 'filled' : ''}`}>⭐</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {review.isRecommended !== null && (
                    <div className="review-recommendation">
                      {review.isRecommended ? (
                        <span className="recommendation positive">👍 Recommande ce produit</span>
                      ) : (
                        <span className="recommendation negative">👎 Ne recommande pas ce produit</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <div className="no-reviews-icon">⭐</div>
                <h4>Aucun avis pour le moment</h4>
                <p>Soyez le premier à laisser un avis sur ce produit !</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section produits similaires */}
      <div className="related-products">
        <h3>Produits similaires</h3>
        <div className="related-grid">
          {/* Cette section sera remplie avec des produits de la même catégorie */}
          <div className="coming-soon">
            <p>Produits similaires bientôt disponibles</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
