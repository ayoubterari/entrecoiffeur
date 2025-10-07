import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import ProductDetailImages from '../components/ProductDetailImages'

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
                  <span key={i} className={`star ${i < (product.rating || 0) ? 'filled' : ''}`}>
                    ⭐
                  </span>
                ))}
              </div>
              <span className="rating-text">
                {product.rating || 'Nouveau'} ({product.reviewCount || 0} avis)
              </span>
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
