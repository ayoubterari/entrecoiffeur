import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import ProductDetailImages from '../components/ProductDetailImages'
import './ProductDetail.css'
import './ProductDetailMobileSimple.css'

const ProductDetail = ({ productId, onBack, onAddToCart, isAuthenticated, onLogin }) => {
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showDetailedInfo, setShowDetailedInfo] = useState(false)
  
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
    <div className="product-detail-page" style={{ position: 'relative', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)', margin: 0, padding: 0 }}>
      {/* Header avec navigation */}
      <div className="product-detail-header" style={{ position: 'relative', width: '100%', background: 'transparent', zIndex: 10 }}>
        <button className="back-button" onClick={onBack} style={{ position: 'relative', zIndex: 11 }}>
          Retour aux produits
        </button>
      </div>

      <div className="product-detail-container" style={{ position: 'relative', width: '100%', background: 'transparent', zIndex: 2 }}>
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
            <div className="price-section" style={{ background: 'white' }}>
              <div className="current-price">{product.price.toFixed(2)}€</div>
              {product.originalPrice && (
                <div className="original-price">{product.originalPrice.toFixed(2)}€</div>
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

            {/* Informations détaillées - Design créatif avec accordéon */}
            {(product.marque || product.contenance || product.typeProduit || product.typePublic || 
              product.genre || product.specificiteHygiene || product.contenanceBeaute || product.pourQui || 
              product.textureHygiene || product.protectionUV || product.produitsBio) && (
              <div style={{ 
                marginTop: '2rem',
                background: 'linear-gradient(135deg, #f8f5f2 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '2px solid #C0B4A5',
                boxShadow: '0 4px 20px rgba(192, 180, 165, 0.15)',
                overflow: 'hidden'
              }}>
                {/* Header cliquable */}
                <div 
                  onClick={() => setShowDetailedInfo(!showDetailedInfo)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease',
                    background: showDetailedInfo ? 'rgba(192, 180, 165, 0.05)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!showDetailedInfo) {
                      e.currentTarget.style.background = 'rgba(192, 180, 165, 0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showDetailedInfo) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #C0B4A5 0%, #A89985 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}>
                      ✨
                    </div>
                    <h4 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700',
                      color: '#2d2d2d',
                      margin: 0,
                      letterSpacing: '-0.5px'
                    }}>Caractéristiques détaillées</h4>
                  </div>
                  
                  {/* Icône toggle */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #C0B4A5',
                    transition: 'transform 0.3s ease',
                    transform: showDetailedInfo ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M4 6L8 10L12 6" 
                        stroke="#C0B4A5" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Contenu avec animation */}
                <div style={{
                  maxHeight: showDetailedInfo ? '2000px' : '0',
                  opacity: showDetailedInfo ? '1' : '0',
                  transition: 'max-height 0.5s ease, opacity 0.3s ease',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '0 1.5rem 1.5rem 1.5rem',
                    borderTop: showDetailedInfo ? '2px solid #C0B4A5' : 'none'
                  }}>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                  gap: '1rem',
                  marginTop: '1.5rem'
                }}>
                  {product.marque && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🏷️</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Marque</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.marque}</span>
                    </div>
                  )}

                  {product.contenance && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>📏</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contenance</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.contenance}</span>
                    </div>
                  )}

                  {product.typeProduit && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🧴</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type de Produit</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.typeProduit}</span>
                    </div>
                  )}

                  {product.typePublic && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>👥</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type de public</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.typePublic}</span>
                    </div>
                  )}

                  {product.genre && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>💆</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Genre</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.genre}</span>
                    </div>
                  )}

                  {product.specificiteHygiene && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>✨</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Spécificités</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.specificiteHygiene}</span>
                    </div>
                  )}

                  {product.contenanceBeaute && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>💄</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contenance Beauté</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.contenanceBeaute}</span>
                    </div>
                  )}

                  {product.pourQui && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🎯</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pour qui ?</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.pourQui}</span>
                    </div>
                  )}

                  {product.textureHygiene && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🧪</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Texture</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.textureHygiene}</span>
                    </div>
                  )}

                  {product.protectionUV && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>☀️</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Protection UV</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.protectionUV}</span>
                    </div>
                  )}

                  {product.produitsBio && (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e9e4df',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(192, 180, 165, 0.2)';
                      e.currentTarget.style.borderColor = '#C0B4A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9e4df';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🌿</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#C0B4A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Produits Bio</span>
                      </div>
                      <span style={{ fontSize: '0.95rem', color: '#2d2d2d', fontWeight: '600', display: 'block' }}>{product.produitsBio}</span>
                    </div>
                  )}
                </div>
                  </div>
                </div>
              </div>
            )}
          </div>

     

          {/* Informations vendeur */}
          <div className="seller-section">
            <h4>Vendu par</h4>
            <div 
              className="seller-info clickable-seller"
              onClick={() => navigate(`/seller/${product.sellerId}`)}
              title="Cliquez pour visiter le store de ce vendeur"
            >
              <div className="seller-content">
                <div className="seller-main-line">
                  <span className="store-name">{seller?.companyName || 'Disway'}</span>
                  <span className="seller-badge">{seller?.userType === 'professionnel' ? 'Pro' : 'Particulier'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Achat */}
          <div className="purchase-section">
            <div className="stock-info">
              <span className={`stock-status ${product.stock > 10 ? 'in-stock' : 'low-stock'}`}>
                {product.stock > 10 ? '✓ En stock' : `⚠ Plus que ${product.stock} en stock`}
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
                  <span>{product.price.toFixed(2)}€</span>
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

            <button 
              onClick={handleBuyNow}
              disabled={!isAuthenticated || product.stock === 0}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2d2d2d 0%, #2d2d2d 50%, #2d2d2d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 30px',
                fontSize: '1rem',
                fontWeight: '700',
                fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
                cursor: 'pointer',
                marginTop: '1rem',
                boxShadow: '0 4px 15px rgba(192, 180, 165, 0.25)',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(192, 180, 165, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(192, 180, 165, 0.25)';
              }}
            >
              {!isAuthenticated ? 'Se connecter pour acheter' : 
               product.stock === 0 ? 'Rupture de stock' : 
               'Acheter'}
            </button>

            {/* Informations de livraison */}
            <div className="shipping-info">
              <div className="shipping-item">
                <span className="icon">🚚</span>
                <span>Livraison gratuite dès 50€</span>
              </div>
              <div className="shipping-item">
                <span className="icon">□</span>
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
            <h3>⭐ Avis clients</h3>
            
            {/* Résumé des avis */}
            <div className="reviews-summary">
              <div className="overall-score">
                <div className="score-display">
                  <span className="big-score">{productReviewStats.averageRating}</span>
                  <div className="score-details">
                    <div className="stars-row">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < Math.floor(productReviewStats.averageRating) ? 'filled' : ''}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
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
                          <span className="rating-label">Qualité:</span>
                          <div className="mini-stars">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`mini-star ${i < review.productQualityRating ? 'filled' : ''}`}>⭐</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {review.sellerServiceRating && (
                        <div className="detailed-rating">
                          <span className="rating-label">Service:</span>
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


    </div>
  )
}

export default ProductDetail
