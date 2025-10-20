import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import Carousel from '../components/Carousel'
import ProductCard from '../components/ProductCard'
import GroupWelcomeModal from '../components/GroupWelcomeModal'
import SupportModal from '../components/SupportModal'
import styles from '../components/Home.module.css'

const Home = ({ onLogout, onLogin, isAuthenticated, userEmail, userFirstName, userLastName, onAddToCart, cart, onOpenCart, onShowLogin, onToggleFavorite, favoritesCount, userId, onOpenFavorites }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showGroupWelcomeModal, setShowGroupWelcomeModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [featuredCarouselIndex, setFeaturedCarouselIndex] = useState(0)
  const [flashSaleCarouselIndex, setFlashSaleCarouselIndex] = useState(0)

  // Get real data from Convex
  const categoriesData = useQuery(api.products.getCategories)
  const allProducts = useQuery(api.products.getProducts, { limit: 20 })
  
  // Get search results when searching
  const searchData = useQuery(
    api.functions.queries.search.searchProducts,
    searchQuery.length >= 2 ? { query: searchQuery, limit: 20 } : "skip"
  )
  
  // Get user favorite product IDs for efficient checking
  const userFavoriteIds = useQuery(api.favorites.getUserFavoriteIds, userId ? { userId } : "skip")
  
  // Get current user data to check group membership
  const currentUser = useQuery(api.auth.getCurrentUser, userId ? { userId } : "skip")

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

  // Vérifier si l'utilisateur est un nouveau membre de groupe et afficher le modal
  useEffect(() => {
    if (isAuthenticated && currentUser && userId) {
      // Vérifier si l'utilisateur est membre d'un groupe et n'a pas encore vu le modal de bienvenue
      if (currentUser.isGroupMember && 
          currentUser.groupAccessCode === "123456" && 
          !currentUser.hasSeenGroupWelcome) {
        
        // Délai pour laisser la page se charger complètement
        const timer = setTimeout(() => {
          setShowGroupWelcomeModal(true)
        }, 1000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated, currentUser, userId])
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
    if (!isAuthenticated) {
      onShowLogin('signin')
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
  }

  // Helper function to check if a product is favorite
  const isProductFavorite = (productId) => {
    return userFavoriteIds?.includes(productId) || false
  }

  // Logique d'affichage des produits avec recherche intelligente
  const getDisplayProducts = () => {
    // Si on est en mode recherche, afficher les résultats de recherche
    if (isSearching && searchResults.length > 0) {
      return searchResults
    }
    
    // Sinon, filtrer par catégorie comme avant
    if (selectedCategory === 'all') {
      return displayProducts
    }
    
    return displayProducts.filter(p => p.categoryId === selectedCategory)
  }

  const filteredProducts = getDisplayProducts()

  const handleShowLogin = (mode = 'signin') => {
    onShowLogin(mode)
  }

  // Carousel functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(nextSlide, 4000)
    return () => clearInterval(interval)
  }, [])

  // Mettre à jour les résultats de recherche quand searchData change
  useEffect(() => {
    if (searchData) {
      setSearchResults(searchData)
      setIsSearching(true)
    } else if (searchQuery.length < 2) {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [searchData, searchQuery])

  // Gestion de la recherche intelligente
  const handleSearch = (query) => {
    setSearchQuery(query)
    
    if (query && query.length >= 2) {
      setIsSearching(true)
      // Les résultats seront mis à jour via useEffect quand searchData change
      console.log('Recherche:', query)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  // Gestion de la sélection d'un produit depuis la recherche
  const handleProductSelect = (product) => {
    navigate(`/product/${product._id}`)
  }

  // Réinitialiser la recherche quand on change de catégorie
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setSearchQuery('')
      setSearchResults([])
      setIsSearching(false)
    }
  }, [selectedCategory])

  return (
    <div className={styles.homeContainer}>
      {/* Header Mobile-First */}
      <header className={styles.mobileHeader}>
        <div className={styles.headerContent}>
          {/* Gauche: Recherche, Favoris, Panier */}
          <div className={styles.headerLeft}>
            <button className={styles.searchBtn} title="Rechercher">
              🔍
            </button>
            <button 
              className={styles.headerBtn} 
              title="Favoris"
              onClick={onOpenFavorites}
            >
              ❤️ <span className={styles.badge}>{favoritesCount}</span>
            </button>
            <button 
              className={styles.headerBtn} 
              title="Panier"
              onClick={onOpenCart}
            >
              🛒 <span className={styles.badge}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </button>
            
            {/* Logo au centre (dans la section gauche pour le layout) */}
            <div className={styles.marketplaceLogo}>
              <h1 className={styles.marketplaceTitle}>Entre Coiffeur</h1>
              <p className={styles.marketplaceSubtitle}>Marketplace beauté & coiffure</p>
            </div>
          </div>

          {/* Droite: Profil/Connexion */}
          <div className={styles.headerActions}>
            {isAuthenticated ? (
              <>
                <button className={styles.userProfileBtn} onClick={() => navigate('/dashboard')}>
                  <div className={styles.userAvatarSmall}>
                    {userFirstName ? userFirstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{userFirstName || 'Profil'}</span>
                </button>
                <button className={styles.logoutBtn} onClick={onLogout}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button className={styles.signinBtn} onClick={() => handleShowLogin('signin')}>
                  Se connecter
                </button>
                <button className={styles.signupBtn} onClick={() => handleShowLogin('signup')}>
                  S'inscrire
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Categories Mobile - Moved after header */}
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <div className={styles.categoriesGrid}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryCard} ${selectedCategory === category.id ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryName}>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Carousel Mobile */}
      <section className={styles.heroCarousel}>
        <div className={styles.carousel}>
          <div className={styles.carouselWrapper}>
            <div 
              className={styles.carouselContent}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {bannerSlides.map((slide, index) => (
                <div key={index} className={styles.bannerSlide}>
                  <div className={styles.bannerContent}>
                    <h2 className={styles.bannerContentH2}>{slide.title}</h2>
                    <p className={styles.bannerContentP}>{slide.description}</p>
                    <button className={styles.signupBtn}>{slide.buttonText}</button>
                  </div>
                  <div className={styles.bannerImage}>{slide.image}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <button className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`} onClick={prevSlide}>
            ‹
          </button>
          <button className={`${styles.carouselBtn} ${styles.carouselBtnNext}`} onClick={nextSlide}>
            ›
          </button>
          
          {/* Dots Navigation */}
          <div className={styles.carouselDots}>
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                className={`${styles.carouselDot} ${index === currentSlide ? styles.active : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* User Type Banners */}
      <div className={styles.userTypeBanners}>
        <div className={`${styles.userTypeBanner} ${styles.particulier}`}>
          <span className={styles.bannerIcon}>🛍️</span>
          <h3 className={styles.bannerTitle}>Particulier</h3>
          <p className={styles.bannerDescription}>
            Découvrez nos produits de qualité à prix attractifs
          </p>
          <button className={styles.bannerCTA} onClick={() => navigate('/products')}>
            <span>Voir les produits</span>
            <span>→</span>
          </button>
        </div>

        <div className={`${styles.userTypeBanner} ${styles.grossiste}`}>
          <span className={styles.bannerIcon}>📦</span>
          <h3 className={styles.bannerTitle}>Grossiste</h3>
          <p className={styles.bannerDescription}>
            Commandes en gros avec tarifs préférentiels
          </p>
          <button className={styles.bannerCTA} onClick={() => isAuthenticated ? navigate('/dashboard') : handleShowLogin('signup')}>
            <span>Devenir grossiste</span>
            <span>→</span>
          </button>
        </div>

        <div className={`${styles.userTypeBanner} ${styles.professionnel}`}>
          <span className={styles.bannerIcon}>💼</span>
          <h3 className={styles.bannerTitle}>Professionnel</h3>
          <p className={styles.bannerDescription}>
            Solutions adaptées aux professionnels de la beauté
          </p>
          <button className={styles.bannerCTA} onClick={() => isAuthenticated ? navigate('/dashboard') : handleShowLogin('signup')}>
            <span>Espace pro</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Flash Sales - Carousel */}
      {displaySaleProducts.length > 0 && (
        <section className={styles.productsSection}>
          <div className={styles.container}>
            <h3 className={styles.sectionTitle}>⚡ Ventes Flash - Offres limitées</h3>
            <div className={styles.featuredCarousel}>
              <div className={styles.featuredCarouselWrapper}>
                <div 
                  className={styles.featuredCarouselContent}
                  style={{
                    transform: `translateX(-${flashSaleCarouselIndex * (160 + 12)}px)`
                  }}
                >
                  {displaySaleProducts.slice(0, 10).map((product) => (
                    <div key={product._id} className={styles.featuredProductCard}>
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onToggleFavorite={onToggleFavorite}
                        onViewDetails={() => navigate(`/product/${product._id}`)}
                        isFavorite={isProductFavorite(product._id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {displaySaleProducts.length > 2 && (
                <>
                  <button
                    className={`${styles.carouselNavBtn} ${styles.carouselNavBtnPrev}`}
                    onClick={() => setFlashSaleCarouselIndex(Math.max(0, flashSaleCarouselIndex - 1))}
                    disabled={flashSaleCarouselIndex === 0}
                    style={{ opacity: flashSaleCarouselIndex === 0 ? 0.3 : 1 }}
                  >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className={`${styles.carouselNavBtn} ${styles.carouselNavBtnNext}`}
                    onClick={() => setFlashSaleCarouselIndex(Math.min(displaySaleProducts.length - 2, flashSaleCarouselIndex + 1))}
                    disabled={flashSaleCarouselIndex >= displaySaleProducts.length - 2}
                    style={{ opacity: flashSaleCarouselIndex >= displaySaleProducts.length - 2 ? 0.3 : 1 }}
                  >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Banner */}
      <div className={styles.ctaBanner}>
        <h2 className={styles.ctaBannerText}>C'est le moment de vendre</h2>
        <button 
          className={styles.ctaBannerButton} 
          onClick={() => {
            if (isAuthenticated) {
              // Rediriger vers le dashboard avec l'onglet "Mes Produits" actif
              navigate('/dashboard', { state: { activeTab: 'products' } })
            } else {
              // Rediriger vers la page de connexion
              onShowLogin()
            }
          }}
        >
          <span>📦</span>
          Déposer une annonce
        </button>
      </div>

      {/* Featured Products Mobile */}
      <section className={styles.productsSection}>
        <div className={styles.container}>
          <h3 className={styles.sectionTitle}>
            {isSearching && searchQuery ? (
              `Résultats pour "${searchQuery}" (${filteredProducts.length})`
            ) : selectedCategory === 'all' ? (
              'Produits en vedette'
            ) : (
              `Catégorie: ${categories.find(c => c.id === selectedCategory)?.name}`
            )}
          </h3>
          
          {filteredProducts.length > 0 ? (
            <div className={styles.featuredCarousel}>
              <div className={styles.featuredCarouselWrapper}>
                <div 
                  className={styles.featuredCarouselContent}
                  style={{
                    transform: `translateX(-${featuredCarouselIndex * (160 + 12)}px)`
                  }}
                >
                  {filteredProducts.slice(0, 10).map((product) => (
                    <div key={product._id} className={styles.featuredProductCard}>
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onToggleFavorite={onToggleFavorite}
                        onViewDetails={() => navigate(`/product/${product._id}`)}
                        isFavorite={isProductFavorite(product._id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {filteredProducts.length > 2 && (
                <>
                  <button
                    className={`${styles.carouselNavBtn} ${styles.carouselNavBtnPrev}`}
                    onClick={() => setFeaturedCarouselIndex(Math.max(0, featuredCarouselIndex - 1))}
                    disabled={featuredCarouselIndex === 0}
                    style={{ opacity: featuredCarouselIndex === 0 ? 0.3 : 1 }}
                  >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className={`${styles.carouselNavBtn} ${styles.carouselNavBtnNext}`}
                    onClick={() => setFeaturedCarouselIndex(Math.min(filteredProducts.length - 2, featuredCarouselIndex + 1))}
                    disabled={featuredCarouselIndex >= filteredProducts.length - 2}
                    style={{ opacity: featuredCarouselIndex >= filteredProducts.length - 2 ? 0.3 : 1 }}
                  >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              {isSearching && searchQuery ? (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>😔</div>
                  <h4 style={{ color: '#2d3436', marginBottom: '1rem' }}>
                    Aucun produit trouvé pour "{searchQuery}"
                  </h4>
                  <p style={{ color: '#636e72', marginBottom: '1.5rem' }}>
                    Essayez avec des mots-clés différents ou plus généraux
                  </p>
                  <button 
                    className={styles.signupBtn}
                    onClick={() => handleSearch('')}
                  >
                    Voir tous les produits
                  </button>
                </div>
              ) : !isAuthenticated ? (
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <button 
                    className={styles.signupBtn} 
                    onClick={() => handleShowLogin('signup')}
                  >
                    Inscrivez-vous
                  </button> 
                  pour commencer à vendre vos produits !
                </p>
              ) : (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛍️</div>
                  <p style={{ color: '#636e72' }}>
                    Aucun produit disponible dans cette catégorie pour le moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Mobile */}
      <section className={styles.newsletterSection}>
        <div className={styles.newsletterCard}>
          <h3>Restez informé(e) des dernières nouveautés</h3>
          <p>Recevez nos offres exclusives et les tendances beauté</p>
          <div className={styles.newsletterForm}>
            <input 
              type="email" 
              placeholder="Votre adresse email"
              className={styles.newsletterInput}
            />
            <button className={styles.newsletterBtn}>S'abonner</button>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className={styles.supportSection}>
        <div className={styles.container}>
          <div className={styles.supportCard}>
            <div className={styles.supportContent}>
              <div className={styles.supportIcon}>🎧</div>
              <div className={styles.supportText}>
                <h3>Besoin d'aide ?</h3>
                <p>Notre équipe support est là pour vous accompagner. Posez vos questions, signalez un problème ou demandez des clarifications.</p>
              </div>
            </div>
            <div className={styles.supportActions}>
              <button 
                className={styles.supportBtn}
                onClick={() => setShowSupportModal(true)}
              >
                <span>💬</span>
                Contacter le support
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Mobile */}
      <footer className={styles.ecommerceFooter}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>Entre Coiffeur</h4>
            <p>Votre marketplace beauté & coiffure de référence</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Liens utiles</h4>
            <ul>
              <li><a href="#apropos">À propos</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/community">Community</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Service client</h4>
            <ul>
              <li><a href="#">Retours</a></li>
              <li><a href="#">Garantie</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2025 Entre Coiffeur - Tous droits réservés</p>
        </div>
      </footer>

      {/* Modal de bienvenue pour les membres de groupe */}
      <GroupWelcomeModal
        isOpen={showGroupWelcomeModal}
        onClose={() => setShowGroupWelcomeModal(false)}
        userId={userId}
      />

      {/* Modal de support */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        userId={userId}
        userEmail={userEmail}
        userFirstName={userFirstName}
        userLastName={userLastName}
      />
    </div>
  )
}

export default Home
