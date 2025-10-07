import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from './lib/convex'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import ProductDetail from './pages/ProductDetail'
import SellerStore from './pages/SellerStore'
import BlogDynamic from './pages/BlogDynamic'
import Community from './pages/Community'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import CartToast from './components/CartToast'
import CartModal from './components/CartModal'
import LoginModal from './components/LoginModal'

// Wrapper pour ProductDetail qui utilise les paramètres d'URL
function ProductDetailWrapper({ onAddToCart, isAuthenticated, onLogin }) {
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
    />
  )
}

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId'))
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'))
  const [userFirstName, setUserFirstName] = useState(localStorage.getItem('userFirstName'))
  const [userLastName, setUserLastName] = useState(localStorage.getItem('userLastName'))
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart') || '[]'))
  const [showCartToast, setShowCartToast] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginMode, setLoginMode] = useState('signin')

  // Query to get current user info
  const currentUser = useQuery(api.auth.getCurrentUser, userId ? { userId } : "skip")

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

  return (
    <Router>
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
              />
            } 
          />
          
          {/* Dashboard utilisateur */}
          <Route 
            path="/dashboard" 
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

          {/* Dashboard Admin */}
          <Route 
            path="/admin" 
            element={
              <Admin 
                isAuthenticated={isAuthenticated}
                userEmail={userEmail}
                userFirstName={userFirstName || ''}
                userLastName={userLastName || ''}
                userType={localStorage.getItem('userType') || ''}
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
            element={<SellerStore />} 
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
          
          {/* Route par défaut - redirection vers accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Cart Toast Notification */}
        <CartToast
          show={showCartToast}
          product={lastAddedItem}
          onClose={() => setShowCartToast(false)}
        />
        
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
      </div>
    </Router>
  )
}

export default App
