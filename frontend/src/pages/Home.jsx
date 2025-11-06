import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import Carousel from '../components/Carousel'
import ProductCard from '../components/ProductCard'
import GroupWelcomeModal from '../components/GroupWelcomeModal'
import SupportModal from '../components/SupportModal'
import MobileMenu from '../components/MobileMenu'
import FranceMapModalLeaflet from '../components/FranceMapModalLeaflet'
import styles from '../components/Home.module.css'

const Home = ({ onLogout, onLogin, isAuthenticated, userEmail, userFirstName, userLastName, onAddToCart, cart, onOpenCart, onShowLogin, onToggleFavorite, favoritesCount, userId, onOpenFavorites, userType }) => {
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [storesCarouselIndex, setStoresCarouselIndex] = useState(0)
  const [showMapModal, setShowMapModal] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)

  // Get real data from Convex with visibility filtering
  const categoriesData = useQuery(api.products.getCategories)
  const allProducts = useQuery(api.products.getProducts, { 
    limit: 20,
    userType: userType && userType !== '' ? userType : undefined
  })
  const storesData = useQuery(api.auth.getStores, { limit: 20 })
  
  // Get search results when searching
  const searchData = useQuery(
    api.functions.queries.search.searchProducts,
    searchQuery.length >= 2 ? { query: searchQuery, limit: 20 } : "skip"
  )
  
  // Get user favorite product IDs for efficient checking
  const userFavoriteIds = useQuery(api.favorites.getUserFavoriteIds, userId ? { userId } : "skip")
  
  // Get current user data to check group membership
  const currentUser = useQuery(api.auth.getCurrentUser, userId ? { userId } : "skip")
  
  // Vérifier si l'utilisateur a des permissions admin
  const userPermissions = useQuery(
    api.functions.queries.adminUsers.getUserPermissions,
    userId ? { userId } : "skip"
  )

  // Mutation pour s'abonner à la newsletter
  const subscribeToNewsletter = useMutation(api.functions.mutations.newsletter.subscribeToNewsletter)

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
    { id: 'all', name: 'Tous', icon: '🛍️', color: '#2d2d2d' },
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
      color: 'linear-gradient(135deg, #4E4A43 0%, #A2988B 50%, #C0B4A5 100%)'
    },
    {
      type: 'banner',
      title: 'Nouveautés 2025',
      description: 'Les dernières tendances coiffure',
      buttonText: 'Voir tout',
      image: '✨',
      color: 'linear-gradient(135deg, #A2988B 0%, #C0B4A5 50%, #DACCBB 100%)'
    },
    {
      type: 'banner',
      title: 'Livraison Gratuite',
      description: 'Dès 50€ d\'achat partout en France',
      buttonText: 'Commander',
      image: '🚚',
      color: 'linear-gradient(135deg, #C0B4A5 0%, #DACCBB 50%, #A2988B 100%)'
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

  // Gérer l'abonnement à la newsletter
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    
    // Réinitialiser les messages
    setNewsletterMessage('')
    setNewsletterSuccess(false)
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!newsletterEmail || !emailRegex.test(newsletterEmail)) {
      setNewsletterMessage('Veuillez entrer une adresse email valide')
      return
    }
    
    setNewsletterLoading(true)
    
    try {
      const result = await subscribeToNewsletter({
        email: newsletterEmail,
        source: 'homepage'
      })
      
      if (result.success) {
        setNewsletterSuccess(true)
        setNewsletterMessage(result.message)
        setNewsletterEmail('') // Réinitialiser le champ
      } else {
        setNewsletterMessage(result.message)
      }
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error)
      setNewsletterMessage('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setNewsletterLoading(false)
      
      // Effacer le message après 5 secondes
      setTimeout(() => {
        setNewsletterMessage('')
        setNewsletterSuccess(false)
      }, 5000)
    }
  }

  return (
    <div className={styles.homeContainer}>
      {/* Header Mobile-First */}
      <header className={styles.mobileHeader}>
        <div className={styles.headerContent}>
          {/* Mobile: Hamburger à gauche */}
          <button 
            className={styles.hamburgerBtn} 
            onClick={() => setIsMobileMenuOpen(true)}
            title="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Desktop: Actions à gauche (Search, Favoris, Panier) */}
          <div className={styles.headerActionsLeft}>
            <button className={styles.searchBtn} title="Rechercher">
              ⚲
            </button>
            <button 
              className={styles.headerBtn} 
              title="Favoris"
              onClick={onOpenFavorites}
            >
              ♡ <span className={styles.badge}>{favoritesCount}</span>
            </button>
            <button 
              className={styles.headerBtn} 
              title="Panier"
              onClick={onOpenCart}
            >
              🛒 <span className={styles.badge}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </button>
          </div>

          {/* Logo - Centré sur desktop, à droite sur mobile */}
          <div className={styles.marketplaceLogo}>
            <h1 className={styles.marketplaceTitle}>Entre Coiffeurs</h1>
            <p className={styles.marketplaceSubtitle}>Marketplace beauté & coiffure</p>
          </div>

          {/* Desktop: Actions à droite (Profil/Connexion) */}
          <div className={styles.headerActions}>
            {isAuthenticated ? (
              <>
                {/* Bouton Dashboard Admin si l'utilisateur a des permissions */}
                {userPermissions && (
                  <button 
                    onClick={() => navigate('/admin')}
                    style={{
                      background: 'linear-gradient(135deg, #6B5D56 0%, #8B7D76 100%)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      marginRight: '10px',
                      boxShadow: '0 2px 4px rgba(107, 93, 86, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)'
                      e.target.style.background = 'linear-gradient(135deg, #7B6D66 0%, #9B8D86 100%)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                      e.target.style.background = 'linear-gradient(135deg, #6B5D56 0%, #8B7D76 100%)'
                    }}
                  >
                    <span>⚙️</span>
                    <span>Dashboard Admin</span>
                  </button>
                )}
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
                    <button 
                      className={styles.signupBtn}
                      onClick={() => navigate('/explore')}
                    >
                      {slide.buttonText}
                    </button>
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
          <button className={styles.bannerCTA} onClick={() => navigate('/explore')}>
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

      {/* Banner Carte Interactive */}
      <div className={styles.mapBannerContainer}>
        <div className={styles.mapBanner}>
          <div className={styles.mapBannerContent}>
            <div className={styles.mapBannerLeft}>
              <div className={styles.mapBannerIcon}>
                <span className={styles.mapIconPulse}>📍</span>
                <span className={styles.mapIconGlobe}>🗺️</span>
              </div>
              <div className={styles.mapBannerText}>
                <h2 className={styles.mapBannerTitle}>
                  Découvrez où vivent vos Produits !
                </h2>
                <p className={styles.mapBannerDescription}>
                  Explorez notre carte interactive et trouvez les produits disponibles près de chez vous dans toute la France
                </p>
                <div className={styles.mapBannerFeatures}>
                  <span className={styles.mapFeature}>
                    <span className={styles.mapFeatureIcon}>🎯</span>
                    Localisation précise
                  </span>
                  <span className={styles.mapFeature}>
                    <span className={styles.mapFeatureIcon}>🏙️</span>
                    Toutes les régions
                  </span>
                  <span className={styles.mapFeature}>
                    <span className={styles.mapFeatureIcon}>⚡</span>
                    Temps réel
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.mapBannerRight}>
              <button 
                className={styles.mapBannerCTA}
                onClick={() => setShowMapModal(true)}
              >
                <span className={styles.mapBannerCTAText}>Explorer la carte</span>
                <span className={styles.mapBannerCTAIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </button>
              <div className={styles.mapBannerStats}>
                <div className={styles.mapStat}>
                  <span className={styles.mapStatNumber}>{allProducts?.length || 0}</span>
                  <span className={styles.mapStatLabel}>Produits</span>
                </div>
                <div className={styles.mapStat}>
                  <span className={styles.mapStatNumber}>{storesData?.length || 0}</span>
                  <span className={styles.mapStatLabel}>Vendeurs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sales - Carousel */}
      {displaySaleProducts.length > 0 && (
        <section className={styles.productsSection}>
          <div className={styles.container}>
            <div className={styles.flashSalesHeader}>
              <div className={styles.flashSalesHeaderContent}>
                <div className={styles.flashSalesIconGroup}>
                  <span className={styles.flashIcon1}>⚡</span>
                  <span className={styles.flashIcon2}>🔥</span>
                  <span className={styles.flashIcon3}>💥</span>
                </div>
                <div className={styles.flashSalesText}>
                  <h3 className={styles.flashSalesTitle}>Ventes Flash</h3>
                  <p className={styles.flashSalesSubtitle}>Offres limitées - Profitez-en maintenant !</p>
                </div>
                <div className={styles.flashSalesTimer}>
                  <span className={styles.timerIcon}>⏰</span>
                  <span className={styles.timerText}>Expire bientôt</span>
                </div>
              </div>
            </div>
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

      {/* Call to Action Banner - Sell Your Products */}
      <div className={styles.sellBannerContainer}>
        <div className={styles.sellBanner}>
          <div className={styles.sellBannerBackground}>
            <div className={styles.sellBannerCircle1}></div>
            <div className={styles.sellBannerCircle2}></div>
            <div className={styles.sellBannerCircle3}></div>
          </div>
          
          <div className={styles.sellBannerContent}>
            <div className={styles.sellBannerLeft}>
              <div className={styles.sellBannerIconGroup}>
                <span className={styles.sellIcon1}>💰</span>
                <span className={styles.sellIcon2}>📦</span>
                <span className={styles.sellIcon3}>✨</span>
              </div>
            </div>
            
            <div className={styles.sellBannerCenter}>
              <h2 className={styles.sellBannerTitle}>
                C'est le moment de vendre !
              </h2>
              <p className={styles.sellBannerSubtitle}>
                Rejoignez des milliers de vendeurs et développez votre activité
              </p>
              <div className={styles.sellBannerBenefits}>
                <div className={styles.sellBenefit}>
                  <span className={styles.sellBenefitIcon}>⚡</span>
                  <span className={styles.sellBenefitText}>Publication rapide</span>
                </div>
                <div className={styles.sellBenefit}>
                  <span className={styles.sellBenefitIcon}>💳</span>
                  <span className={styles.sellBenefitText}>Paiement sécurisé</span>
                </div>
                <div className={styles.sellBenefit}>
                  <span className={styles.sellBenefitIcon}>📈</span>
                  <span className={styles.sellBenefitText}>Visibilité maximale</span>
                </div>
              </div>
            </div>
            
            <div className={styles.sellBannerRight}>
              <button 
                className={styles.sellBannerButton} 
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/dashboard', { state: { activeTab: 'products' } })
                  } else {
                    onShowLogin()
                  }
                }}
              >
                <span className={styles.sellButtonIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </span>
                <span className={styles.sellButtonText}>Déposer une annonce</span>
                <span className={styles.sellButtonArrow}>→</span>
              </button>
              
              <div className={styles.sellBannerNote}>
                <span className={styles.sellNoteIcon}>🎁</span>
                <span className={styles.sellNoteText}>Inscription gratuite</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Mobile */}
      <section className={styles.productsSection}>
        <div className={styles.container}>
          <div className={styles.featuredHeader}>
            <div className={styles.featuredHeaderContent}>
              <div className={styles.featuredIconGroup}>
                <span className={styles.featuredIcon1}>⭐</span>
                <span className={styles.featuredIcon2}>✨</span>
                <span className={styles.featuredIcon3}>🌟</span>
              </div>
              <div className={styles.featuredText}>
                <h3 className={styles.featuredTitle}>Produits en vedette</h3>
                <p className={styles.featuredSubtitle}>Nos meilleures sélections pour vous</p>
              </div>
              <div className={styles.featuredBadge}>
                <span className={styles.badgeIcon}>👑</span>
                <span className={styles.badgeText}>Premium</span>
              </div>
            </div>
          </div>
          
          {displayFeaturedProducts.length > 0 ? (
            <div className={styles.featuredCarousel}>
              <div className={styles.featuredCarouselWrapper}>
                <div 
                  className={styles.featuredCarouselContent}
                  style={{
                    transform: `translateX(-${featuredCarouselIndex * (160 + 12)}px)`
                  }}
                >
                  {displayFeaturedProducts.map((product) => (
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
              
              {displayFeaturedProducts.length > 2 && (
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
                    onClick={() => setFeaturedCarouselIndex(Math.min(displayFeaturedProducts.length - 2, featuredCarouselIndex + 1))}
                    disabled={featuredCarouselIndex >= displayFeaturedProducts.length - 2}
                    style={{ opacity: featuredCarouselIndex >= displayFeaturedProducts.length - 2 ? 0.3 : 1 }}
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
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐</div>
              <p style={{ color: '#636e72' }}>
                Aucun produit en vedette pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section - Creative Design */}
      <section className={styles.newsletterSection}>
        <div className={styles.newsletterContainer}>
          <div className={styles.newsletterBackground}>
            <div className={styles.newsletterCircle1}></div>
            <div className={styles.newsletterCircle2}></div>
            <div className={styles.newsletterPattern}></div>
          </div>
          
          <div className={styles.newsletterContent}>
            <div className={styles.newsletterLeft}>
              <div className={styles.newsletterIconWrapper}>
                <span className={styles.newsletterIcon1}>📧</span>
                <span className={styles.newsletterIcon2}>✨</span>
                <span className={styles.newsletterIcon3}>🎁</span>
              </div>
            </div>
            
            <div className={styles.newsletterCenter}>
              <h3 className={styles.newsletterTitle}>
                Restez informé(e) des dernières nouveautés
              </h3>
              <p className={styles.newsletterSubtitle}>
                Recevez nos offres exclusives et les tendances beauté directement dans votre boîte mail
              </p>
              <div className={styles.newsletterBadges}>
                <span className={styles.newsletterBadge}>
                  <span className={styles.badgeIcon}>🎯</span>
                  Offres exclusives
                </span>
                <span className={styles.newsletterBadge}>
                  <span className={styles.badgeIcon}>💎</span>
                  Nouveautés en avant-première
                </span>
                <span className={styles.newsletterBadge}>
                  <span className={styles.badgeIcon}>🔔</span>
                  Alertes promotions
                </span>
              </div>
            </div>
            
            <div className={styles.newsletterRight}>
              <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
                <div className={styles.newsletterInputWrapper}>
                  <span className={styles.newsletterInputIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input 
                    type="email" 
                    placeholder="votre@email.com"
                    className={styles.newsletterInput}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={newsletterLoading}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.newsletterBtn}
                  disabled={newsletterLoading}
                  style={{ opacity: newsletterLoading ? 0.7 : 1 }}
                >
                  <span className={styles.newsletterBtnText}>
                    {newsletterLoading ? 'Envoi...' : 'S\'abonner'}
                  </span>
                  <span className={styles.newsletterBtnIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </button>
              </form>
              {newsletterMessage && (
                <p 
                  className={styles.newsletterNote}
                  style={{ 
                    color: newsletterSuccess ? '#10b981' : '#ef4444',
                    fontWeight: '500',
                    marginTop: '8px'
                  }}
                >
                  <span className={styles.newsletterNoteIcon}>
                    {newsletterSuccess ? '✅' : '⚠️'}
                  </span>
                  {newsletterMessage}
                </p>
              )}
              <p className={styles.newsletterNote}>
                <span className={styles.newsletterNoteIcon}>🔒</span>
                Vos données sont sécurisées et ne seront jamais partagées
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stores Carousel Section */}
      <section className={styles.storesSection}>
        <div className={styles.storesHeaderContainer}>
          <div className={styles.storesHeaderContent}>
            <div className={styles.storesIconGroup}>
              <span className={styles.storeIcon1}>🏪</span>
              <span className={styles.storeIcon2}>🛍️</span>
              <span className={styles.storeIcon3}>💼</span>
            </div>
            <div className={styles.storesTextContent}>
              <h2 className={styles.storesMainTitle}>Découvrez nos boutiques</h2>
              <p className={styles.storesSubtitle}>Visitez les boutiques de nos vendeurs professionnels</p>
            </div>
            <div className={styles.storesCountBadge}>
              <span className={styles.countIcon}>🎯</span>
              <span className={styles.countText}>{storesData?.length || 0} Boutiques</span>
            </div>
          </div>
        </div>
        
        <div className={styles.storesCarouselContainer}>
          <button 
            className={`${styles.storesCarouselBtn} ${styles.storesCarouselBtnPrev}`}
            onClick={() => setStoresCarouselIndex(Math.max(0, storesCarouselIndex - 5))}
            disabled={storesCarouselIndex === 0}
          >
            ‹
          </button>
          
          <div className={styles.storesCarousel}>
            <div 
              className={styles.storesTrack}
              style={{ transform: `translateX(-${storesCarouselIndex * 20}%)` }}
            >
              {storesData && storesData.map((store) => (
                <div 
                  key={store._id} 
                  className={styles.storeCard}
                  onClick={() => navigate(`/seller/${store._id}`)}
                >
                  {store.avatarUrl ? (
                    <img 
                      src={store.avatarUrl} 
                      alt={store.companyName || `${store.firstName} ${store.lastName}`}
                      className={styles.storeAvatarImage}
                    />
                  ) : (
                    <div className={styles.storeAvatar}>
                      {store.companyName?.charAt(0) || store.firstName?.charAt(0) || '?'}
                    </div>
                  )}
                  <h3 className={styles.storeName}>
                    {store.companyName || `${store.firstName} ${store.lastName}`}
                  </h3>
                  <p className={styles.storeType}>
                    {store.userType === 'professionnel' ? '💼 Professionnel' : '🏢 Grossiste'}
                  </p>
                  <p className={styles.storeProducts}>
                    {store.productCount} produit{store.productCount > 1 ? 's' : ''}
                  </p>
                  <button className={styles.visitStoreBtn}>
                    Visiter la boutique
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className={`${styles.storesCarouselBtn} ${styles.storesCarouselBtnNext}`}
            onClick={() => setStoresCarouselIndex(Math.min((storesData?.length || 0) - 5, storesCarouselIndex + 5))}
            disabled={!storesData || storesCarouselIndex >= (storesData.length - 5)}
          >
            ›
          </button>
        </div>
      </section>

      {/* Support Section - Creative Design */}
      <section className={styles.supportSection}>
        <div className={styles.supportContainer}>
          <div className={styles.supportBackground}>
            <div className={styles.supportWave1}></div>
            <div className={styles.supportWave2}></div>
            <div className={styles.supportDots}></div>
          </div>
          
          <div className={styles.supportContent}>
            <div className={styles.supportLeft}>
              <div className={styles.supportIconGroup}>
                <span className={styles.supportIcon1}>🎧</span>
                <span className={styles.supportIcon2}>💬</span>
                <span className={styles.supportIcon3}>❓</span>
              </div>
            </div>
            
            <div className={styles.supportCenter}>
              <h3 className={styles.supportTitle}>
                Besoin d'aide ?
              </h3>
              <p className={styles.supportSubtitle}>
                Notre équipe support est là pour vous accompagner. Posez vos questions, signalez un problème ou demandez des clarifications.
              </p>
              <div className={styles.supportFeatures}>
                <div className={styles.supportFeature}>
                  <span className={styles.featureIcon}>⚡</span>
                  <span className={styles.featureText}>Réponse rapide</span>
                </div>
                <div className={styles.supportFeature}>
                  <span className={styles.featureIcon}>👥</span>
                  <span className={styles.featureText}>Équipe dédiée</span>
                </div>
                <div className={styles.supportFeature}>
                  <span className={styles.featureIcon}>🔧</span>
                  <span className={styles.featureText}>Solutions efficaces</span>
                </div>
              </div>
            </div>
            
            <div className={styles.supportRight}>
              <button 
                className={styles.supportBtn}
                onClick={() => setShowSupportModal(true)}
              >
                <span className={styles.supportBtnIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </span>
                <span className={styles.supportBtnText}>Contacter le support</span>
                <span className={styles.supportBtnArrow}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </button>
              
              <div className={styles.supportInfo}>
                <div className={styles.supportInfoItem}>
                  <span className={styles.supportInfoIcon}>🕐</span>
                  <span className={styles.supportInfoText}>Disponible 24/7</span>
                </div>
                <div className={styles.supportInfoItem}>
                  <span className={styles.supportInfoIcon}>📧</span>
                  <span className={styles.supportInfoText}>support@entrecoiffeur.com</span>
                </div>
              </div>
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

      {/* Menu Mobile */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
        onOpenFavorites={onOpenFavorites}
        onOpenCart={onOpenCart}
        favoritesCount={favoritesCount}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        userFirstName={userFirstName}
        userId={userId}
        onShowLogin={onShowLogin}
      />

      {/* Modal Carte Interactive */}
      <FranceMapModalLeaflet
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        products={allProducts}
      />
    </div>
  )
}

export default Home
