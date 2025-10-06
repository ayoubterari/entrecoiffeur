import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import MockDataInitializer from '../components/MockDataInitializer'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import ImageUpload from '../components/ImageUpload'

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

  const tabs = [
    { id: 'profile', name: 'Profil', icon: '👤' },
    { id: 'products', name: 'Mes Produits', icon: '📦' },
    { id: 'orders', name: 'Orders (Vendeur)', icon: '📋' },
    { id: 'purchases', name: 'Mes Commandes', icon: '🛒' },
    { id: 'analytics', name: 'Statistiques', icon: '📊' },
    { id: 'settings', name: 'Paramètres', icon: '⚙️' },
    { id: 'dev', name: 'Dev Tools', icon: '🛠️' },
  ]

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
  
  const createProduct = useMutation(api.products.createProduct)
  const updateProduct = useMutation(api.products.updateProduct)
  const deleteProduct = useMutation(api.products.deleteProduct)
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus)

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
      // Convertir les images en URLs (temporaire - à remplacer par un service de stockage)
      const imageUrls = productImages.map(img => img.url)
      
      await createProduct({
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        categoryId: productForm.categoryId,
        sellerId: userId,
        stock: parseInt(productForm.stock),
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: imageUrls,
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
      tags: product.tags.join(', '),
      images: product.images,
      featured: product.featured || false,
      onSale: product.onSale || false
    })
    setShowEditProduct(true)
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      await updateProduct({
        productId: editingProduct._id,
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        categoryId: productForm.categoryId,
        stock: parseInt(productForm.stock),
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: productForm.images,
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
                </div>
                <button 
                  className="add-product-btn"
                  onClick={() => setShowAddProduct(!showAddProduct)}
                >
                  {showAddProduct ? '❌ Annuler' : '➕ Ajouter un produit'}
                </button>
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
                    <p>Vous n'avez pas encore ajouté de produits.</p>
                    <button 
                      className="add-product-btn"
                      onClick={() => setShowAddProduct(true)}
                    >
                      Ajouter votre premier produit
                    </button>
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
      </div>
    </div>
  )
}

export default Dashboard
