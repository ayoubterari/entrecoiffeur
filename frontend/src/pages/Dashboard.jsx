import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import MockDataInitializer from '../components/MockDataInitializer'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import ImageUpload from '../components/ImageUpload'
import MessagePopup from '../components/MessagePopup'
import OrderReviewModal from '../components/OrderReviewModal'
import AffiliateTab from '../components/AffiliateTab'
import SupportResponses from '../components/SupportResponses'
import SellerComplaintsManagement from '../components/SellerComplaintsManagement'
import './Dashboard.css'

const Dashboard = ({ userEmail, userFirstName, userLastName, userId, userType, companyName }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [toast, setToast] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [productImages, setProductImages] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false)
  const [couponCopied, setCouponCopied] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null)

  // Fonction pour vérifier les permissions d'ajout de produit
  const canAddProduct = () => {
    if (!userType) return false
    
    // Particulier : ne peut pas ajouter de produits
    if (userType === 'particulier') return false
    
    // Professionnel : limité à 2 produits
    if (userType === 'professionnel') {
      const currentProductCount = userProducts?.length || 0
      return currentProductCount < 2
    }
    
    // Grossiste : aucune limite
    if (userType === 'grossiste') return true
    
    return false
  }

  // Fonction pour obtenir le message de limitation
  const getLimitationMessage = () => {
    if (userType === 'particulier') {
      return "Les particuliers ne peuvent pas vendre de produits. Vous pouvez uniquement acheter."
    }
    
    if (userType === 'professionnel') {
      const currentProductCount = userProducts?.length || 0
      if (currentProductCount >= 2) {
        return "Limite atteinte : Les professionnels peuvent ajouter maximum 2 produits."
      }
      return `Vous pouvez ajouter ${2 - currentProductCount} produit(s) supplémentaire(s).`
    }
    
    if (userType === 'grossiste') {
      return "En tant que grossiste, vous pouvez ajouter un nombre illimité de produits."
    }
    
    return ""
  }

  // Get categories and user products
  const categories = useQuery(api.products.getCategories)
  const userProducts = useQuery(api.products.getProductsBySeller, 
    userId ? { sellerId: userId } : "skip"
  )
  
  // Get orders data
  const sellerOrders = useQuery(api.orders.getSellerOrders, 
    userId ? { sellerId: userId } : "skip"
  )
  const buyerOrders = useQuery(api.orders.getBuyerOrders, 
    userId ? { buyerId: userId } : "skip"
  )
  const orderStats = useQuery(api.orders.getSellerOrderStats, 
    userId ? { sellerId: userId } : "skip"
  )
  
  // Get current user data to check group membership
  const currentUser = useQuery(api.auth.getCurrentUser, userId ? { userId } : "skip")
  
  // Get FBGROUP coupon if user is a group member
  const fbGroupCoupon = useQuery(api.functions.queries.coupons.getCouponByCode, 
    currentUser?.isGroupMember ? { code: "FBGROUP" } : "skip"
  )

  // Get pending review orders for buyer
  const pendingReviewOrders = useQuery(api.orderReviews.getPendingReviewOrders,
    userId ? { buyerId: userId } : "skip"
  )

  // Get buyer reviews
  const buyerReviews = useQuery(api.orderReviews.getBuyerReviews,
    userId ? { buyerId: userId, limit: 10 } : "skip"
  )

  // Filtrer les onglets selon le rôle utilisateur
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'profile', name: 'Profil', icon: '👤' },
      { id: 'messages', name: 'Messages', icon: '💬' },
      { id: 'purchases', name: 'Mes Commandes', icon: '🛒' },
      { id: 'support', name: 'Support', icon: '🎧' },
      { id: 'affiliate', name: 'Affiliation', icon: '💰' },
      { id: 'settings', name: 'Paramètres', icon: '⚙️' },
      { id: 'dev', name: 'Dev Tools', icon: '🛠️' },
    ]
    
    // Ajouter les onglets de vente uniquement pour professionnels et grossistes
    if (userType === 'professionnel' || userType === 'grossiste') {
      baseTabs.splice(5, 0, 
        { id: 'products', name: 'Mes Produits', icon: '📦' },
        { id: 'orders', name: 'Orders (Vendeur)', icon: '📋' },
        { id: 'complaints', name: 'Réclamations', icon: '😠' },
        { id: 'analytics', name: 'Statistiques', icon: '📊' }
      )
    }
    
    // Ajouter l'onglet Coupons uniquement pour les membres de groupe
    if (currentUser?.isGroupMember) {
      baseTabs.push({ id: 'coupons', name: 'Mes Coupons', icon: '🎫' })
    }
    
    return baseTabs
  }
  
  const tabs = getAvailableTabs()
  
  // Messages queries
  const conversations = useQuery(api.messaging.getUserConversations,
    userId ? { userId } : "skip"
  )
  const unreadCount = useQuery(api.messaging.getUnreadMessageCount,
    userId ? { userId } : "skip"
  )
  
  const createProduct = useMutation(api.products.createProduct)
  const updateProduct = useMutation(api.products.updateProduct)
  const deleteProduct = useMutation(api.products.deleteProduct)
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus)
  const markAsRead = useMutation(api.messaging.markConversationAsRead)

  // Removed mock data - using real data from Convex queries

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    stock: '',
    tags: '',
    images: ['🛍️'], // Default emoji
    featured: false,
    onSale: false
  })

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    if (!userId) {
      setToast({ type: 'error', message: 'Utilisateur non connecté' })
      return
    }

    // Validation des images
    if (productImages.length === 0) {
      setToast({ type: 'error', message: 'Veuillez ajouter au moins une image du produit' })
      return
    }
    
    try {
      // Utiliser les storageIds des images uploadées
      const imageStorageIds = productImages.map(img => img.storageId)
      
      await createProduct({
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        categoryId: productForm.categoryId,
        sellerId: userId,
        stock: parseInt(productForm.stock),
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: imageStorageIds,
        featured: productForm.featured,
        onSale: productForm.onSale
      })
      
      // Reset form
      setProductForm({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        categoryId: '',
        stock: '',
        tags: '',
        images: ['🛍️'],
        featured: false,
        onSale: false
      })
      setProductImages([]) // Reset images
      setShowAddProduct(false)
      setToast({ message: 'Produit créé avec succès !', type: 'success' })
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error)
      setToast({ message: 'Erreur lors de la création du produit', type: 'error' })
    }
  }

  const handleDeleteProduct = (product) => {
    setProductToDelete(product)
    setShowDeleteConfirm(true)
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({
        orderId: orderId,
        status: newStatus
      })
      
      setToast({
        message: `Statut de la commande mis à jour: ${newStatus}`,
        type: 'success'
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      setToast({
        message: 'Erreur lors de la mise à jour du statut',
        type: 'error'
      })
    }
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct({ productId: productToDelete._id })
      setToast({ message: 'Produit supprimé avec succès !', type: 'success' })
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setToast({ message: 'Erreur lors de la suppression du produit', type: 'error' })
    } finally {
      setShowDeleteConfirm(false)
      setProductToDelete(null)
    }
  }

  const cancelDeleteProduct = () => {
    setShowDeleteConfirm(false)
    setProductToDelete(null)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      tags: product.tags?.join(', ') || '',
      images: product.images,
      featured: product.featured || false,
      onSale: product.onSale || false
    })
    
    // Convertir les images existantes pour le composant ImageUpload
    const existingImages = product.images?.map((imageId, index) => ({
      storageId: imageId,
      name: `Image ${index + 1}`,
      size: 0, // Taille inconnue pour les images existantes
      type: 'image/jpeg', // Type par défaut
      previewUrl: null // Sera chargé par ConvexImage
    })) || []
    
    setProductImages(existingImages)
    setShowEditProduct(true)
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      // Utiliser les storageIds des images uploadées
      const imageStorageIds = productImages.map(img => img.storageId)
      
      await updateProduct({
        productId: editingProduct._id,
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        categoryId: productForm.categoryId,
        stock: parseInt(productForm.stock),
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: imageStorageIds,
        featured: productForm.featured,
        onSale: productForm.onSale
      })
      
      // Reset form and close modal
      setProductForm({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        categoryId: '',
        stock: '',
        tags: '',
        images: ['🛍️'],
        featured: false,
        onSale: false
      })
      setProductImages([]) // Reset images
      setShowEditProduct(false)
      setEditingProduct(null)
      setToast({ message: 'Produit modifié avec succès !', type: 'success' })
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      setToast({ message: 'Erreur lors de la modification du produit', type: 'error' })
    }
  }

  const handleCancelEdit = () => {
    setShowEditProduct(false)
    setEditingProduct(null)
    setProductImages([]) // Reset images
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      stock: '',
      tags: '',
      images: ['🛍️'],
      featured: false,
      onSale: false
    })
  }

  // Message handlers
  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation)
    setIsMessagePopupOpen(true)
    
    // Mark as read
    if (userId) {
      markAsRead({ 
        conversationId: conversation._id, 
        userId: userId 
      })
    }
  }

  const isUnread = (conversation) => {
    if (!userId) return false
    
    if (conversation.userRole === 'buyer') {
      return !conversation.isReadByBuyer
    } else {
      return !conversation.isReadBySeller
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'À l\'instant'
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `Il y a ${diffInDays}j`
    }
  }

  // Function to copy coupon code
  const copyCouponCode = () => {
    if (fbGroupCoupon?.code) {
      navigator.clipboard.writeText(fbGroupCoupon.code)
      setCouponCopied(true)
      setTimeout(() => setCouponCopied(false), 2000)
    }
  }

  // Handle review order
  const handleReviewOrder = (order) => {
    setSelectedOrderForReview(order)
    setShowReviewModal(true)
  }

  // Handle close review modal
  const handleCloseReviewModal = () => {
    setShowReviewModal(false)
    setSelectedOrderForReview(null)
  }

  // Ajouter une classe au body pour supprimer les marges
  React.useEffect(() => {
    document.body.classList.add('dashboard-body')
    document.documentElement.classList.add('dashboard-html')
    
    return () => {
      document.body.classList.remove('dashboard-body')
      document.documentElement.classList.remove('dashboard-html')
    }
  }, [])

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Retour au marketplace
        </button>
        <h1 className="dashboard-title">Mon Dashboard</h1>
      </div>

      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="user-card">
            <div className="user-avatar">
              {userFirstName ? userFirstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <h3>{userFirstName ? `${userFirstName} ${userLastName || ''}` : 'Utilisateur'}</h3>
              <p>{userEmail}</p>
              {userType && (
                <div className="user-type-badge">
                  {userType === 'particulier' && '👤 Particulier'}
                  {userType === 'professionnel' && '💼 Professionnel'}
                  {userType === 'grossiste' && '🏢 Grossiste'}
                </div>
              )}
              {companyName && (
                <p className="company-name">{companyName}</p>
              )}
            </div>
          </div>

          <nav className="dashboard-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                {tab.name}
                {tab.id === 'messages' && unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2>Informations du Profil</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label>Prénom</label>
                  <input 
                    type="text" 
                    defaultValue={userFirstName || ''} 
                    className="form-input"
                    placeholder="Votre prénom"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input 
                    type="text" 
                    defaultValue={userLastName || ''} 
                    className="form-input"
                    placeholder="Votre nom"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={userEmail || ''} 
                    className="form-input"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Type de compte</label>
                  <input 
                    type="text" 
                    value={
                      userType === 'particulier' ? '👤 Particulier' :
                      userType === 'professionnel' ? '💼 Professionnel' :
                      userType === 'grossiste' ? '🏢 Grossiste' : 'Non défini'
                    }
                    className="form-input"
                    readOnly
                  />
                </div>
                {companyName && (
                  <div className="form-group">
                    <label>Entreprise</label>
                    <input 
                      type="text" 
                      value={companyName} 
                      className="form-input"
                      readOnly
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Téléphone</label>
                  <input 
                    type="tel" 
                    className="form-input"
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
                <div className="form-group">
                  <label>Adresse</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Votre adresse complète"
                    rows="3"
                  ></textarea>
                </div>
                <button className="save-btn">Sauvegarder</button>
              </div>


              {/* Section Coupon de Groupe */}
              {currentUser?.isGroupMember && fbGroupCoupon && (
                <div className="group-coupon-section">
                  <h3>🎫 Votre Coupon de Groupe</h3>
                  <div className="group-coupon-card">
                    <div className="coupon-header">
                      <div className="coupon-icon">🎁</div>
                      <div className="coupon-info">
                        <h4>Coupon Exclusif Membre</h4>
                        <p>Réservé aux membres du groupe</p>
                      </div>
                      <div className="group-badge">
                        <span>👥 Groupe</span>
                      </div>
                    </div>
                    
                    <div className="coupon-details">
                      <div className="coupon-code-section">
                        <label>Code promo :</label>
                        <div className="coupon-code-container">
                          <span className="coupon-code">{fbGroupCoupon.code}</span>
                          <button 
                            className={`copy-coupon-btn ${couponCopied ? 'copied' : ''}`}
                            onClick={copyCouponCode}
                            title="Copier le code"
                          >
                            {couponCopied ? '✓' : '📋'}
                          </button>
                        </div>
                        {couponCopied && (
                          <span className="copy-success">Code copié !</span>
                        )}
                      </div>
                      
                      <div className="coupon-discount">
                        <div className="discount-badge">
                          <span className="discount-value">{fbGroupCoupon.discountPercentage}%</span>
                          <span className="discount-label">de réduction</span>
                        </div>
                      </div>
                      
                      {fbGroupCoupon.description && (
                        <div className="coupon-description">
                          <p>{fbGroupCoupon.description}</p>
                        </div>
                      )}
                      
                      <div className="coupon-conditions">
                        {fbGroupCoupon.minimumAmount && (
                          <div className="condition-item">
                            <span className="condition-icon">💰</span>
                            <span>Commande minimum : {fbGroupCoupon.minimumAmount}€</span>
                          </div>
                        )}
                        
                        {fbGroupCoupon.validUntil && (
                          <div className="condition-item">
                            <span className="condition-icon">📅</span>
                            <span>Valide jusqu'au : {new Date(fbGroupCoupon.validUntil).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                        
                        {fbGroupCoupon.usageLimit && (
                          <div className="condition-item">
                            <span className="condition-icon">🔢</span>
                            <span>Utilisations restantes : {fbGroupCoupon.usageLimit - fbGroupCoupon.usageCount}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="coupon-actions">
                        <button 
                          className="use-coupon-btn"
                          onClick={() => navigate('/')}
                        >
                          <span>🛍️</span>
                          Utiliser maintenant
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="tab-content">
              <div className="messages-header">
                <h2>💬 Messages</h2>
                <p>Gérez vos conversations avec les clients</p>
                {unreadCount > 0 && (
                  <div className="unread-count-badge">
                    {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                  </div>
                )}
              </div>

              <div className="conversations-list">
                {!conversations || conversations.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <h3>Aucune conversation</h3>
                    <p>Vos conversations avec les clients apparaîtront ici</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      className={`conversation-item ${isUnread(conversation) ? 'unread' : ''}`}
                      onClick={() => handleConversationClick(conversation)}
                    >
                      <div className="conversation-avatar">
                        <span className="avatar-letter">
                          {conversation.otherParticipant?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        {isUnread(conversation) && <div className="unread-dot"></div>}
                      </div>
                      
                      <div className="conversation-info">
                        <div className="conversation-header">
                          <h4 className="participant-name">
                            {conversation.otherParticipant?.firstName} {conversation.otherParticipant?.lastName}
                          </h4>
                          <span className="conversation-time">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                        
                        <div className="conversation-preview">
                          <p className="last-message">
                            {conversation.lastMessage || 'Nouvelle conversation'}
                          </p>
                          <div className="conversation-meta">
                            <span className="user-role">
                              {conversation.userRole === 'seller' ? '🏪 Vendeur' : '🛒 Acheteur'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="conversation-actions">
                        <button className="reply-btn">
                          <span>💬</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="tab-content">
              <div className="orders-header">
                <h2>📋 Orders - Commandes reçues</h2>
                <p>Gérez les commandes de vos produits</p>
              </div>

              {orderStats && (
                <div className="order-stats">
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                      <h3>{orderStats.totalOrders}</h3>
                      <p>Total commandes</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                      <h3>{orderStats.totalRevenue?.toFixed(2)}€</h3>
                      <p>Chiffre d'affaires</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                      <h3>{orderStats.confirmedOrders}</h3>
                      <p>En cours</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <h3>{orderStats.deliveredOrders}</h3>
                      <p>Livrées</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="orders-list">
                {sellerOrders && sellerOrders.length > 0 ? (
                  sellerOrders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div className="order-number">#{order.orderNumber}</div>
                        <div className={`order-status status-${order.status}`}>
                          {order.status === 'confirmed' && '✅ Confirmée'}
                          {order.status === 'preparing' && '📦 Préparation'}
                          {order.status === 'shipped' && '🚚 Expédiée'}
                          {order.status === 'delivered' && '🏠 Livrée'}
                          {order.status === 'cancelled' && '❌ Annulée'}
                        </div>
                      </div>
                      
                      <div className="order-content">
                        <div className="order-product">
                          <h4>{order.productName}</h4>
                          <p>Quantité: {order.quantity} × {order.productPrice}€</p>
                        </div>
                        
                        <div className="order-customer">
                          <h5>Client:</h5>
                          <p>{order.billingInfo.firstName} {order.billingInfo.lastName}</p>
                          <p>{order.billingInfo.email}</p>
                          <p>{order.billingInfo.address}, {order.billingInfo.city}</p>
                        </div>
                        
                        <div className="order-total">
                          <h4>{order.total.toFixed(2)}€</h4>
                          <p>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      
                      <div className="order-actions">
                        <select 
                          value={order.status} 
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="confirmed">✅ Confirmée</option>
                          <option value="preparing">📦 Préparation</option>
                          <option value="shipped">🚚 Expédiée</option>
                          <option value="delivered">🏠 Livrée</option>
                          <option value="cancelled">❌ Annulée</option>
                        </select>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>Aucune commande reçue</h3>
                    <p>Vos commandes apparaîtront ici une fois que des clients achèteront vos produits.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="products-header">
                <div className="header-content">
                  <h2>📦 Mes Produits</h2>
                  <p>Gérez votre catalogue de produits</p>
                  {/* Message d'information sur les limitations */}
                  <div className={`role-limitation-info ${userType}`}>
                    <span className="role-badge">
                      {userType === 'professionnel' && '💼 Professionnel'}
                      {userType === 'grossiste' && '🏢 Grossiste'}
                    </span>
                    <p className="limitation-message">{getLimitationMessage()}</p>
                  </div>
                </div>
                {canAddProduct() && (
                  <button 
                    className="add-product-btn"
                    onClick={() => setShowAddProduct(!showAddProduct)}
                  >
                    {showAddProduct ? '❌ Annuler' : '➕ Ajouter un produit'}
                  </button>
                )}
                {!canAddProduct() && userType !== 'particulier' && (
                  <button 
                    className="add-product-btn disabled"
                    disabled
                    title={getLimitationMessage()}
                  >
                    🚫 Limite atteinte
                  </button>
                )}
              </div>

              {showAddProduct && (
                <div className="add-product-form">
                  <h3>Ajouter un nouveau produit</h3>
                  <form onSubmit={handleProductSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nom du produit *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={productForm.name}
                          onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Catégorie *</label>
                        <select
                          className="form-input"
                          value={productForm.categoryId}
                          onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})}
                          required
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories?.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        className="form-textarea"
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        rows="3"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Prix (€) *</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={productForm.price}
                          onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Prix original (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={productForm.originalPrice}
                          onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Stock *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Tags (séparés par des virgules)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={productForm.tags}
                        onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                        placeholder="ex: professionnel, bio, cheveux secs"
                      />
                    </div>

                    {/* Upload d'images */}
                    <ImageUpload 
                      images={productImages}
                      onImagesChange={setProductImages}
                      maxImages={5}
                    />

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                          />
                          Produit en vedette
                        </label>
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={productForm.onSale}
                            onChange={(e) => setProductForm({...productForm, onSale: e.target.checked})}
                          />
                          En promotion
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="save-btn">
                      Créer le produit
                    </button>
                  </form>
                </div>
              )}

              {showEditProduct && editingProduct && (
                <div className="edit-product-modal">
                  <div className="modal-overlay" onClick={handleCancelEdit}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <h3>Modifier le produit</h3>
                        <button className="modal-close" onClick={handleCancelEdit}>
                          ×
                        </button>
                      </div>
                      
                      <form onSubmit={handleUpdateProduct}>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Nom du produit *</label>
                            <input
                              type="text"
                              className="form-input"
                              value={productForm.name}
                              onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Catégorie *</label>
                            <select
                              className="form-input"
                              value={productForm.categoryId}
                              onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})}
                              required
                            >
                              <option value="">Sélectionner une catégorie</option>
                              {categories?.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                  {cat.icon} {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Description *</label>
                          <textarea
                            className="form-textarea"
                            value={productForm.description}
                            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                            rows="3"
                            required
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Prix (€) *</label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-input"
                              value={productForm.price}
                              onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Prix original (€)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-input"
                              value={productForm.originalPrice}
                              onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label>Stock *</label>
                            <input
                              type="number"
                              className="form-input"
                              value={productForm.stock}
                              onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Tags (séparés par des virgules)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={productForm.tags}
                            onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                            placeholder="ex: professionnel, bio, cheveux secs"
                          />
                        </div>

                        {/* Upload d'images pour l'édition */}
                        <ImageUpload 
                          images={productImages}
                          onImagesChange={setProductImages}
                          maxImages={5}
                        />

                        <div className="form-row">
                          <div className="form-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={productForm.featured}
                                onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                              />
                              Produit en vedette
                            </label>
                          </div>
                          <div className="form-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={productForm.onSale}
                                onChange={(e) => setProductForm({...productForm, onSale: e.target.checked})}
                              />
                              En promotion
                            </label>
                          </div>
                        </div>

                        <div className="modal-actions">
                          <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                            Annuler
                          </button>
                          <button type="submit" className="save-btn">
                            Sauvegarder les modifications
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              <div className="products-list">
                {userProducts?.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>Aucun produit ajouté</h3>
                    <p>
                      {userType === 'particulier' 
                        ? "En tant que particulier, vous ne pouvez pas vendre de produits. Explorez notre marketplace pour faire vos achats !"
                        : "Vous n'avez pas encore ajouté de produits à votre catalogue."
                      }
                    </p>
                    {canAddProduct() && (
                      <button 
                        className="add-product-btn"
                        onClick={() => setShowAddProduct(true)}
                      >
                        ➕ Ajouter votre premier produit
                      </button>
                    )}
                    {userType === 'particulier' && (
                      <button 
                        className="browse-products-btn"
                        onClick={() => navigate('/')}
                      >
                        🛍️ Parcourir les produits
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="products-grid">
                    {userProducts?.map((product) => (
                      <div key={product._id} className="product-management-card">
                        <div className="product-image">
                          {product.images && product.images[0] ? (
                            // Vérifier si c'est une URL d'image ou un emoji
                            product.images[0].startsWith('blob:') || product.images[0].startsWith('http') || product.images[0].startsWith('data:') ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="dashboard-product-image"
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
                            <div className="product-placeholder">🛍️</div>
                          )}
                          {/* Fallback emoji caché par défaut */}
                          <div className="product-placeholder" style={{ display: 'none' }}>🛍️</div>
                        </div>
                        <div className="product-details">
                          <div className="product-header">
                            <h4>{product.name}</h4>
                            <div className="action-icons">
                              <button 
                                className="action-icon edit-icon"
                                onClick={() => handleEditProduct(product)}
                                title="Modifier le produit"
                                aria-label={`Modifier le produit ${product.name}`}
                              >
                                ✏️
                              </button>
                              <button 
                                className="action-icon delete-icon"
                                onClick={() => handleDeleteProduct(product)}
                                title="Supprimer le produit"
                                aria-label={`Supprimer le produit ${product.name}`}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <p className="product-description">{product.description}</p>
                          <div className="product-meta">
                            <span className="product-price">{product.price}€</span>
                            <span className="product-stock">Stock: {product.stock}</span>
                          </div>
                          <div className="product-badges">
                            {product.featured && <span className="badge featured">Vedette</span>}
                            {product.onSale && <span className="badge sale">Promo</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="tab-content">
              <SupportResponses userId={userId} userEmail={userEmail} />
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="tab-content">
              <SellerComplaintsManagement sellerId={userId} />
            </div>
          )}

          {activeTab === 'affiliate' && (
            <div className="tab-content">
              <AffiliateTab userId={userId} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2>Paramètres</h2>
              <div className="settings-section">
                <h3>Notifications</h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Recevoir les offres promotionnelles
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Notifications de commande
                  </label>
                </div>
              </div>
              <div className="settings-section">
                <h3>Confidentialité</h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    Profil public
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="tab-content">
              <div className="purchases-header">
                <h2>🛒 Mes Commandes</h2>
                <p>Suivez vos achats et commandes</p>
              </div>

              {/* Section des évaluations en attente */}
              {pendingReviewOrders && pendingReviewOrders.length > 0 && (
                <div className="pending-reviews-section">
                  <h3>⭐ Évaluations en attente</h3>
                  <p>Vos commandes livrées en attente d'évaluation</p>
                  <div className="pending-reviews-grid">
                    {pendingReviewOrders.map((order) => (
                      <div key={order._id} className="pending-review-card">
                        <div className="review-card-header">
                          <div className="order-info">
                            <span className="order-number">#{order.orderNumber}</span>
                            <span className="delivered-badge">🏠 Livrée</span>
                          </div>
                        </div>
                        
                        <div className="review-card-content">
                          <div className="product-info">
                            {order.productImage && (
                              <img src={order.productImage} alt={order.productName} className="product-thumb" />
                            )}
                            <div className="product-details">
                              <h4>{order.productName}</h4>
                              <p>Vendeur : {order.sellerName}</p>
                              {order.sellerCompany && <p>{order.sellerCompany}</p>}
                            </div>
                          </div>
                          
                          <div className="review-action">
                            <button 
                              className="review-btn"
                              onClick={() => handleReviewOrder(order)}
                            >
                              ⭐ Évaluer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="purchases-list">
                {buyerOrders && buyerOrders.length > 0 ? (
                  buyerOrders.map((order) => (
                    <div key={order._id} className="purchase-card">
                      <div className="purchase-header">
                        <div className="order-number">#{order.orderNumber}</div>
                        <div className={`order-status status-${order.status}`}>
                          {order.status === 'confirmed' && '✅ Confirmée'}
                          {order.status === 'preparing' && '📦 Préparation'}
                          {order.status === 'shipped' && '🚚 En transit'}
                          {order.status === 'delivered' && '🏠 Livrée'}
                          {order.status === 'cancelled' && '❌ Annulée'}
                        </div>
                      </div>
                      
                      <div className="purchase-content">
                        <div className="purchase-product">
                          <h4>{order.productName}</h4>
                          <p>Quantité: {order.quantity} × {order.productPrice}€</p>
                        </div>
                        
                        <div className="purchase-details">
                          <p><strong>Paiement:</strong> {order.paymentMethod}</p>
                          <p><strong>Livraison:</strong> {order.billingInfo.address}</p>
                        </div>
                        
                        <div className="purchase-total">
                          <h4>{order.total.toFixed(2)}€</h4>
                          <p>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      
                      <div className="purchase-timeline">
                        <div className={`timeline-step ${['confirmed', 'preparing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="step-icon">✅</div>
                          <span>Confirmée</span>
                        </div>
                        <div className={`timeline-step ${['preparing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="step-icon">📦</div>
                          <span>Préparation</span>
                        </div>
                        <div className={`timeline-step ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="step-icon">🚚</div>
                          <span>Expédition</span>
                        </div>
                        <div className={`timeline-step ${order.status === 'delivered' ? 'completed' : ''}`}>
                          <div className="step-icon">🏠</div>
                          <span>Livraison</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🛒</div>
                    <h3>Aucune commande passée</h3>
                    <p>Vos achats apparaîtront ici. Commencez par explorer nos produits !</p>
                    <button 
                      className="browse-products-btn"
                      onClick={() => navigate('/')}
                    >
                      🛍️ Parcourir les produits
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dev' && (
            <div className="tab-content">
              <MockDataInitializer />
            </div>
          )}

          {activeTab === 'coupons' && currentUser?.isGroupMember && (
            <div className="tab-content">
              <div className="coupons-header">
                <h2>🎫 Mes Coupons Exclusifs</h2>
                <p>Vos coupons de réduction en tant que membre du groupe</p>
                <div className="group-member-badge">
                  <span>👥 Membre de Groupe</span>
                </div>
              </div>

              <div className="coupons-grid">
                {fbGroupCoupon ? (
                  <div className="coupon-card-large">
                    <div className="coupon-card-header">
                      <div className="coupon-type-badge">
                        <span className="badge-icon">🎁</span>
                        <span>Coupon Exclusif</span>
                      </div>
                      <div className="coupon-status active">
                        <span>✅ Actif</span>
                      </div>
                    </div>
                    
                    <div className="coupon-main-content">
                      <div className="coupon-code-display">
                        <label>Code promo :</label>
                        <div className="code-container">
                          <span className="code-text">{fbGroupCoupon.code}</span>
                          <button 
                            className={`copy-code-btn ${couponCopied ? 'copied' : ''}`}
                            onClick={copyCouponCode}
                            title="Copier le code"
                          >
                            {couponCopied ? '✓ Copié' : '📋 Copier'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="coupon-value">
                        <div className="discount-display">
                          <span className="discount-number">{fbGroupCoupon.discountPercentage}%</span>
                          <span className="discount-text">de réduction</span>
                        </div>
                      </div>
                    </div>
                    
                    {fbGroupCoupon.description && (
                      <div className="coupon-description">
                        <p>{fbGroupCoupon.description}</p>
                      </div>
                    )}
                    
                    <div className="coupon-details-grid">
                      {fbGroupCoupon.minimumAmount && (
                        <div className="detail-item">
                          <span className="detail-icon">💰</span>
                          <div className="detail-content">
                            <span className="detail-label">Commande minimum</span>
                            <span className="detail-value">{fbGroupCoupon.minimumAmount}€</span>
                          </div>
                        </div>
                      )}
                      
                      {fbGroupCoupon.validUntil && (
                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <div className="detail-content">
                            <span className="detail-label">Valide jusqu'au</span>
                            <span className="detail-value">
                              {new Date(fbGroupCoupon.validUntil).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {fbGroupCoupon.usageLimit && (
                        <div className="detail-item">
                          <span className="detail-icon">🔢</span>
                          <div className="detail-content">
                            <span className="detail-label">Utilisations restantes</span>
                            <span className="detail-value">
                              {fbGroupCoupon.usageLimit - fbGroupCoupon.usageCount}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="detail-item">
                        <span className="detail-icon">📊</span>
                        <div className="detail-content">
                          <span className="detail-label">Utilisé</span>
                          <span className="detail-value">{fbGroupCoupon.usageCount} fois</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="coupon-actions">
                      <button 
                        className="use-now-btn"
                        onClick={() => navigate('/')}
                      >
                        <span>🛍️</span>
                        Utiliser maintenant
                      </button>
                      <button 
                        className="share-coupon-btn"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: 'Code promo Entre Coiffeur',
                              text: `Utilisez le code ${fbGroupCoupon.code} pour ${fbGroupCoupon.discountPercentage}% de réduction !`,
                              url: window.location.origin
                            })
                          }
                        }}
                      >
                        <span>📤</span>
                        Partager
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="coupon-loading">
                    <div className="loading-spinner"></div>
                    <p>Chargement de vos coupons...</p>
                  </div>
                )}
              </div>

              {/* Section avantages membres */}
              <div className="member-benefits-section">
                <h3>🌟 Avantages Membres du Groupe</h3>
                <div className="benefits-grid">
                  <div className="benefit-card">
                    <div className="benefit-icon">🎁</div>
                    <h4>Coupons Exclusifs</h4>
                    <p>Accès à des codes promo réservés aux membres</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-icon">⚡</div>
                    <h4>Accès Prioritaire</h4>
                    <p>Découvrez les nouveautés en avant-première</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-icon">💬</div>
                    <h4>Support Dédié</h4>
                    <p>Assistance client prioritaire et personnalisée</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-icon">🚀</div>
                    <h4>Offres Flash</h4>
                    <p>Promotions spéciales et ventes privées</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteProduct}
        onConfirm={confirmDeleteProduct}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${productToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Message Popup */}
      {selectedConversation && (
        <MessagePopup
          isOpen={isMessagePopupOpen}
          onClose={() => {
            setIsMessagePopupOpen(false)
            setSelectedConversation(null)
          }}
          sellerId={selectedConversation.otherParticipant?._id}
          sellerName={`${selectedConversation.otherParticipant?.firstName} ${selectedConversation.otherParticipant?.lastName}`}
          currentUserId={userId}
          existingConversationId={selectedConversation._id}
        />
      )}

      {/* Order Review Modal */}
      <OrderReviewModal
        isOpen={showReviewModal}
        onClose={handleCloseReviewModal}
        order={selectedOrderForReview}
      />
      </div>
    </div>
  )
}

export default Dashboard
