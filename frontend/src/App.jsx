import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from './lib/convex'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import DashboardV2 from './pages/DashboardV2'
import AdminV2 from './pages/AdminV2'
import ProductDetail from './pages/ProductDetail'
import SellerStore from './pages/SellerStore'
import BlogDynamic from './pages/BlogDynamic'
import Community from './pages/Community'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Favorites from './pages/Favorites'
import Explore from './pages/Explore'
import BusinessSaleDetail from './pages/BusinessSaleDetail'
import CartToast from './components/CartToast'
import CartModal from './components/CartModal'
import LoginModal from './components/LoginModal'
import FavoritesModal from './components/FavoritesModal'
import NotificationPrompt from './components/NotificationPrompt'
import { useAffiliateTracking } from './hooks/useAffiliateTracking'

// Wrapper pour ProductDetail qui utilise les paramètres d'URL
function ProductDetailWrapper({ onAddToCart, isAuthenticated, onLogin, userId }) {
  const navigate = useNavigate()
  const { productId } = useParams()

  const handleBack = () => {
    navigate('/')
  }

  return (
    <ProductDetail 
      productId={productId}
      onBack={handleBack}
      onAddToCart={onAddToCart}
      isAuthenticated={isAuthenticated}
      onLogin={onLogin}
      userId={userId}
    />
  )
}

function AppContent() {
  const navigate = useNavigate()
  const { restoreAffiliateAfterAuth, getAffiliateReturnUrl } = useAffiliateTracking()
  const [userId, setUserId] = useState(localStorage.getItem('userId'))
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'))
  const [userFirstName, setUserFirstName] = useState(localStorage.getItem('userFirstName'))
  const [userLastName, setUserLastName] = useState(localStorage.getItem('userLastName'))
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart') || '[]'))
  const [showCartToast, setShowCartToast] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showFavoriteToast, setShowFavoriteToast] = useState(false)
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)
  const [loginMode, setLoginMode] = useState('signin')

  // Query to get current user info
  const currentUser = useQuery(api.auth.getCurrentUser, userId ? { userId } : "skip")
  
  // Query to get user favorites count
  const favoritesCount = useQuery(api.favorites.getFavoritesCount, userId ? { userId } : "skip")
  
  // Mutation to toggle favorite
  const toggleFavorite = useMutation(api.favorites.toggleFavorite)

  useEffect(() => {
    if (currentUser) {
      setUserEmail(currentUser.email)
      setUserFirstName(currentUser.firstName || '')
      setUserLastName(currentUser.lastName || '')
      localStorage.setItem('userEmail', currentUser.email)
      localStorage.setItem('userFirstName', currentUser.firstName || '')
      localStorage.setItem('userLastName', currentUser.lastName || '')
      localStorage.setItem('userType', currentUser.userType || '')
      localStorage.setItem('companyName', currentUser.companyName || '')
    }
  }, [currentUser])

  const handleLogin = (newUserId) => {
    setUserId(newUserId)
    localStorage.setItem('userId', newUserId)
    // Forcer une mise à jour immédiate de l'état d'authentification
    setUserEmail(localStorage.getItem('userEmail') || '')
    setUserFirstName(localStorage.getItem('userFirstName') || '')
    setUserLastName(localStorage.getItem('userLastName') || '')
  }

  const handleShowLogin = (mode = 'signin') => {
    setLoginMode(mode)
    setShowLoginModal(true)
  }

  const handleCloseLoginModal = () => {
    setShowLoginModal(false)
  }

  const handleLoginSuccess = (newUserId) => {
    handleLogin(newUserId)
    setShowLoginModal(false)
    
    // Vérifier s'il y a une redirection après connexion (depuis ProductDetail)
    const redirectAfterLogin = localStorage.getItem('redirectAfterLogin')
    console.log('✅ App - Login success, checking redirect:', redirectAfterLogin)
    
    if (redirectAfterLogin) {
      console.log('🔄 App - Redirecting to:', redirectAfterLogin)
      localStorage.removeItem('redirectAfterLogin')
      setTimeout(() => {
        navigate(redirectAfterLogin)
      }, 100)
      return
    }
    
    // Restaurer le code d'affiliation après connexion
    const affiliateRestored = restoreAffiliateAfterAuth()
    const returnUrl = getAffiliateReturnUrl()
    
    // Si un code d'affiliation a été restauré et qu'il y a une URL de retour
    if (affiliateRestored && returnUrl) {
      // Rediriger vers la page d'origine avec un petit délai pour laisser le temps à l'état de se mettre à jour
      setTimeout(() => {
        window.location.href = returnUrl
      }, 100)
    }
  }

  const handleLogout = () => {
    setUserId(null)
    setUserEmail(null)
    setUserFirstName(null)
    setUserLastName(null)
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userFirstName')
    localStorage.removeItem('userLastName')
    localStorage.removeItem('userType')
    localStorage.removeItem('companyName')
  }

  // Pour le mode test admin, permettre l'authentification même sans currentUser
  const isTestAdmin = localStorage.getItem('userType') === 'superadmin' && localStorage.getItem('userEmail') === 'admin@entre-coiffeur.com'
  // Amélioration : considérer authentifié si userId existe, même si currentUser n'est pas encore chargé
  const isAuthenticated = userId || isTestAdmin

  const handleAddToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.productId === item.productId)
    
    let newCart
    if (existingItem) {
      newCart = cart.map(cartItem =>
        cartItem.productId === item.productId
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      )
    } else {
      newCart = [...cart, item]
    }
    
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    
    // Show toast notification
    setLastAddedItem(item)
    setShowCartToast(true)
  }

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId)
      return
    }
    
    const newCart = cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    )
    
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const handleRemoveItem = (productId) => {
    const newCart = cart.filter(item => item.productId !== productId)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const handleToggleFavorite = async (product) => {
    if (!isAuthenticated) {
      handleShowLogin('signin')
      return
    }

    try {
      await toggleFavorite({
        userId,
        productId: product._id
      })
      
      // Afficher notification
      setShowFavoriteToast(true)
      setTimeout(() => setShowFavoriteToast(false), 3000)
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error)
    }
  }

  return (
      <div className="App">
        <Routes>
          {/* Page d'accueil */}
          <Route 
            path="/" 
            element={
              <Home 
                onLogout={handleLogout}
                onLogin={handleLogin}
                isAuthenticated={isAuthenticated}
                userEmail={userEmail}
                userFirstName={userFirstName || ''}
                userLastName={userLastName || ''}
                onAddToCart={handleAddToCart}
                cart={cart}
                onOpenCart={() => setShowCartModal(true)}
                onShowLogin={handleShowLogin}
                onToggleFavorite={handleToggleFavorite}
                favoritesCount={favoritesCount || 0}
                userId={userId}
                onOpenFavorites={() => setShowFavoritesModal(true)}
                userType={localStorage.getItem('userType') || ''}
              />
            } 
          />
          
          {/* Dashboard utilisateur - Version 2 (principale) */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <DashboardV2 
                  userEmail={userEmail}
                  userFirstName={userFirstName || ''}
                  userLastName={userLastName || ''}
                  userType={localStorage.getItem('userType') || ''}
                  companyName={localStorage.getItem('companyName') || ''}
                  userId={userId}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Ancien Dashboard - Accessible pour référence */}
          <Route 
            path="/dashboard-old" 
            element={
              isAuthenticated ? (
                <Dashboard 
                  userEmail={userEmail}
                  userFirstName={userFirstName || ''}
                  userLastName={userLastName || ''}
                  userType={localStorage.getItem('userType') || ''}
                  companyName={localStorage.getItem('companyName') || ''}
                  userId={userId}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Dashboard Admin - Interface moderne basée sur shadcn-admin */}
          <Route 
            path="/admin" 
            element={
              <AdminV2 
                isAuthenticated={isAuthenticated}
                userEmail={userEmail}
                userFirstName={userFirstName || ''}
                userLastName={userLastName || ''}
                userType={localStorage.getItem('userType') || ''}
                userId={userId}
                onLogout={handleLogout}
              />
            } 
          />
          
          {/* Page de détails produit */}
          <Route 
            path="/product/:productId" 
            element={
              <ProductDetailWrapper 
                onAddToCart={handleAddToCart}
                isAuthenticated={isAuthenticated}
                onLogin={handleLogin}
                userId={userId}
              />
            } 
          />
          
          {/* Page de checkout */}
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                isAuthenticated={isAuthenticated}
                onLogin={handleShowLogin}
                userEmail={userEmail}
                userFirstName={userFirstName || ''}
                userLastName={userLastName || ''}
              />
            } 
          />
          
          {/* Page de succès de commande */}
          <Route 
            path="/order-success" 
            element={<OrderSuccess />} 
          />
          
          {/* Store du vendeur */}
          <Route 
            path="/seller/:sellerId" 
            element={
              <SellerStore 
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isAuthenticated={isAuthenticated}
                userId={userId}
              />
            } 
          />
          
          {/* Blog */}
          <Route path="/blog" element={<BlogDynamic />} />
          
          {/* Community */}
          <Route 
            path="/community" 
            element={
              <Community 
                isAuthenticated={isAuthenticated}
                userEmail={userEmail}
                userFirstName={userFirstName}
                userLastName={userLastName}
              />
            } 
          />
          
          {/* Favorites */}
          <Route 
            path="/favorites" 
            element={
              <Favorites 
                userId={userId}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isAuthenticated={isAuthenticated}
                onLogin={handleShowLogin}
              />
            } 
          />
          
          {/* Explore */}
          <Route 
            path="/explore" 
            element={
              <Explore 
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                userId={userId}
                isAuthenticated={isAuthenticated}
                onShowLogin={handleShowLogin}
                userType={localStorage.getItem('userType') || ''}
              />
            } 
          />
          
          {/* Business Sale Detail */}
          <Route 
            path="/business-sale/:id" 
            element={<BusinessSaleDetail />} 
          />
          
          {/* Route par défaut - redirection vers accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Cart Toast Notification */}
        <CartToast
          show={showCartToast}
          product={lastAddedItem}
          onClose={() => setShowCartToast(false)}
        />
        
        {/* Favorite Toast Notification */}
        {showFavoriteToast && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'linear-gradient(135deg, #2d2d2d, #404040)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(255, 107, 157, 0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'slideIn 0.3s ease-out',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}>
            ❤️ Favori mis à jour
          </div>
        )}
        
        {/* Cart Modal */}
        <CartModal
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          isAuthenticated={isAuthenticated}
          onLogin={handleShowLogin}
        />
        
        {/* Global Login Modal */}
        <LoginModal 
          isOpen={showLoginModal}
          onClose={handleCloseLoginModal}
          onLogin={handleLoginSuccess}
          initialMode={loginMode}
        />
        
        {/* Favorites Modal */}
        <FavoritesModal
          isOpen={showFavoritesModal}
          onClose={() => setShowFavoritesModal(false)}
          userId={userId}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          onViewDetails={(productId) => {
            setShowFavoritesModal(false)
            navigate(`/product/${productId}`)
          }}
          isAuthenticated={isAuthenticated}
          onLogin={handleShowLogin}
        />

        {/* Notification Prompt - Pour les vendeurs uniquement */}
        {isAuthenticated && userId && (
          <NotificationPrompt 
            userId={userId} 
            userType={currentUser?.userType}
          />
        )}
      </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
