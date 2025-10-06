import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import Carousel from '../components/Carousel'
import ProductCard from '../components/ProductCard'
import LoginModal from '../components/LoginModal'

const Home = ({ onLogout, onLogin, isAuthenticated, userEmail, userFirstName, userLastName }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginMode, setLoginMode] = useState('signin') // 'signin' ou 'signup'

  // Get real data from Convex
  const categoriesData = useQuery(api.products.getCategories)
  const allProducts = useQuery(api.products.getProducts, { limit: 20 })

  // Redirection automatique pour les superadmins
  useEffect(() => {
    if (isAuthenticated) {
      const userType = localStorage.getItem('userType')
      
      console.log('Home - Checking for admin redirect')
      console.log('Home - userType:', userType)
      console.log('Home - userEmail:', userEmail)
      
      // Vérifier si c'est un superadmin
      if (userType === 'superadmin') {
        console.log('Home - Redirecting to admin dashboard')
        navigate('/admin')
        return
      }
    }
  }, [isAuthenticated, userEmail, navigate])
  const featuredProductsData = useQuery(api.products.getFeaturedProducts)
  const saleProductsData = useQuery(api.products.getSaleProducts)

  // Prepare categories with "all" option
  const categories = [
    { id: 'all', name: 'Tous', icon: '🛍️', color: '#ff6b9d' },
    ...(categoriesData?.map(cat => ({
      id: cat._id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color
    })) || [])
  ]

  const bannerSlides = [
    {
      type: 'banner',
      title: 'Soldes d\'Hiver',
      description: 'Jusqu\'à -50% sur une sélection de produits',
      buttonText: 'Découvrir',
      image: '❄️',
      color: 'linear-gradient(135deg, #ff6b9d, #fd79a8)'
    },
    {
      type: 'banner',
      title: 'Nouveautés 2025',
      description: 'Les dernières tendances coiffure',
      buttonText: 'Voir tout',
      image: '✨',
      color: 'linear-gradient(135deg, #e84393, #ffeaa7)'
    },
    {
      type: 'banner',
      title: 'Livraison Gratuite',
      description: 'Dès 50€ d\'achat partout en France',
      buttonText: 'Commander',
      image: '🚚',
      color: 'linear-gradient(135deg, #fd79a8, #ff6b9d)'
    }
  ]

  // Use real products data or fallback to empty array
  const displayProducts = allProducts || []
  const displayFeaturedProducts = featuredProductsData || []
  const displaySaleProducts = (saleProductsData || []).map(p => ({
    ...p,
    type: 'product'
  }))

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id)
      if (existing) {
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

  const filteredProducts = selectedCategory === 'all' 
    ? displayProducts 
    : displayProducts.filter(p => p.categoryId === selectedCategory)

  const handleShowLogin = (mode = 'signin') => {
    setLoginMode(mode)
    setShowLoginModal(true)
  }

  const handleCloseModal = () => {
    setShowLoginModal(false)
  }

  const handleLoginSuccess = (userId) => {
    onLogin(userId)
    setShowLoginModal(false)
  }

  return (
    <div className="ecommerce-container">
      {/* Header */}
      <header className="ecommerce-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="marketplace-title">Entre Coiffeur</h1>
            <p className="marketplace-subtitle">Marketplace beauté & coiffure</p>
          </div>
          
          <div className="header-search">
            <div className="search-bar-header">
              <input 
                type="text" 
                placeholder="Rechercher des produits..." 
                className="search-input-header"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn-header">🔍</button>
            </div>
          </div>

          <div className="header-actions">
            <button className="header-btn" title="Favoris">
              ❤️ <span className="badge">{favorites.length}</span>
            </button>
            <button className="header-btn" title="Panier">
              🛒 <span className="badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </button>
            
            {isAuthenticated ? (
              <>
                <button className="user-profile-btn" onClick={() => navigate('/dashboard')}>
                  <div className="user-avatar-small">
                    {userFirstName ? userFirstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{userFirstName || 'Profil'}</span>
                </button>
                <button className="logout-btn" onClick={onLogout}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button className="signin-btn" onClick={() => handleShowLogin('signin')}>
                  Se connecter
                </button>
                <button className="signup-btn" onClick={() => handleShowLogin('signup')}>
                  S'inscrire
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="hero-carousel">
        <Carousel items={bannerSlides} autoPlay={true} interval={4000} />
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h3 className="section-title">Catégories</h3>
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                style={{ '--category-color': category.color }}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sales Carousel */}
      {displaySaleProducts.length > 0 && (
        <section className="flash-sales">
          <div className="container">
            <Carousel 
              items={displaySaleProducts} 
              title="⚡ Ventes Flash - Offres limitées"
              autoPlay={true}
              interval={3000}
            />
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="products-section">
        <div className="container">
          <h3 className="section-title">
            {selectedCategory === 'all' ? 'Produits en vedette' : `Catégorie: ${categories.find(c => c.id === selectedCategory)?.name}`}
          </h3>
          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  onViewDetails={() => navigate(`/product/${product._id}`)}
                  isFavorite={favorites.some(item => item._id === product._id)}
                />
              ))
            ) : (
              <div className="empty-products">
                {!isAuthenticated && (
                  <p>
                    <button 
                      className="signin-btn" 
                      onClick={() => handleShowLogin('signup')}
                    >
                      Inscrivez-vous
                    </button> 
                    pour commencer à vendre vos produits !
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <h3>Restez informé(e) des dernières nouveautés</h3>
            <p>Recevez nos offres exclusives et les tendances beauté</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Votre adresse email"
                className="newsletter-input"
              />
              <button className="newsletter-btn">S'abonner</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ecommerce-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Entre Coiffeur</h4>
              <p>Votre marketplace beauté & coiffure de référence</p>
            </div>
            <div className="footer-section">
              <h4>Liens utiles</h4>
              <ul>
                <li><a href="#apropos">À propos</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/community">Community</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Service client</h4>
              <ul>
                <li><a href="#">Retours</a></li>
                <li><a href="#">Garantie</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Entre Coiffeur - Tous droits réservés</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLoginSuccess}
        initialMode={loginMode}
      />
    </div>
  )
}

export default Home
