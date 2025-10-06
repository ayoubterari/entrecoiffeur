import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'

const ProductsManagement = () => {
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Convex queries et mutations
  const allProducts = useQuery(api.products.getProducts, { limit: 1000 })
  const categories = useQuery(api.products.getCategories)
  const createProduct = useMutation(api.products.createProduct)
  const updateProduct = useMutation(api.products.updateProduct)
  const deleteProduct = useMutation(api.products.deleteProduct)

  // État du formulaire
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    images: [],
    stock: '',
    brand: '',
    isOnSale: false,
    salePrice: '',
    isFeatured: false
  })

  // Filtrer les produits
  const filteredProducts = allProducts?.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesCategory
  }) || []

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    try {
      await createProduct({
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : undefined,
        images: productForm.images.length > 0 ? productForm.images : ['https://via.placeholder.com/300x300?text=Produit']
      })
      
      setProductForm({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        images: [],
        stock: '',
        brand: '',
        isOnSale: false,
        salePrice: '',
        isFeatured: false
      })
      setShowAddProduct(false)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: '', // On utilisera le nom de catégorie
      images: product.images || [],
      stock: product.stock?.toString() || '0',
      brand: product.brand || '',
      isOnSale: product.isOnSale || false,
      salePrice: product.salePrice?.toString() || '',
      isFeatured: product.isFeatured || false
    })
    setShowEditProduct(true)
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      await updateProduct({
        productId: editingProduct._id,
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : undefined
      })
      
      setShowEditProduct(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
    }
  }

  const handleDeleteProduct = (product) => {
    setProductToDelete(product)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return
    
    try {
      await deleteProduct({ productId: productToDelete._id })
      setShowDeleteConfirm(false)
      setProductToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Rupture', color: '#f44336' }
    if (stock < 10) return { label: 'Stock faible', color: '#ff9800' }
    return { label: 'En stock', color: '#4caf50' }
  }

  return (
    <div className="modern-products-management">
      <div className="modern-products-header">
        <div className="header-content">
          <h2>📦 Gestion des Produits</h2>
          <p>Gérez tous les produits de la plateforme avec style</p>
        </div>
        <button 
          className="modern-add-product-btn"
          onClick={() => setShowAddProduct(true)}
        >
          ➕ Ajouter un produit
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="modern-products-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes les catégories</option>
            {categories?.map((category) => (
              <option key={category._id} value={category.name}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="modern-products-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{allProducts?.length || 0}</h3>
            <p>Total produits</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-info">
            <h3>{allProducts?.filter(p => p.isFeatured).length || 0}</h3>
            <p>Mis en avant</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <h3>{allProducts?.filter(p => p.isOnSale).length || 0}</h3>
            <p>En promotion</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{allProducts?.filter(p => (p.stock || 0) < 10).length || 0}</h3>
            <p>Stock faible</p>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="modern-products-table-container">
        {filteredProducts.length > 0 ? (
          <div className="table-wrapper">
            <table className="modern-products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock || 0)
                  return (
                    <tr key={product._id}>
                      <td className="image-cell">
                        <div className="product-image-small">
                          <img 
                            src={product.images?.[0] || 'https://via.placeholder.com/60x60?text=📦'} 
                            alt={product.name}
                            className="table-product-img"
                          />
                        </div>
                      </td>
                      <td className="product-cell">
                        <div className="product-info-table">
                          <h4>{product.name}</h4>
                          <p className="product-description-short">
                            {product.description?.length > 50 
                              ? product.description.substring(0, 50) + '...' 
                              : product.description || 'Aucune description'}
                          </p>
                          {product.brand && (
                            <span className="product-brand">🏢 {product.brand}</span>
                          )}
                        </div>
                      </td>
                      <td className="category-cell">
                        <span className="category-badge-table">
                          🏷️ {product.category}
                        </span>
                      </td>
                      <td className="price-cell">
                        <div className="price-info">
                          {product.isOnSale && product.salePrice ? (
                            <>
                              <span className="sale-price">{formatPrice(product.salePrice)}</span>
                              <span className="original-price">{formatPrice(product.price)}</span>
                            </>
                          ) : (
                            <span className="current-price">{formatPrice(product.price)}</span>
                          )}
                        </div>
                      </td>
                      <td className="stock-cell">
                        <span 
                          className="stock-badge"
                          style={{ 
                            backgroundColor: stockStatus.color + '20',
                            color: stockStatus.color,
                            border: `1px solid ${stockStatus.color}40`
                          }}
                        >
                          {product.stock || 0} unités
                        </span>
                      </td>
                      <td className="status-cell">
                        <div className="status-badges">
                          {product.isFeatured && (
                            <span className="status-badge featured">⭐ Vedette</span>
                          )}
                          {product.isOnSale && (
                            <span className="status-badge sale">🏷️ Promo</span>
                          )}
                          {!product.isFeatured && !product.isOnSale && (
                            <span className="status-badge normal">📦 Normal</span>
                          )}
                        </div>
                      </td>
                      <td className="actions-cell">
                        <div className="table-actions">
                          <button 
                            className="table-btn edit"
                            onClick={() => handleEditProduct(product)}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button 
                            className="table-btn delete"
                            onClick={() => handleDeleteProduct(product)}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Aucun produit trouvé</h3>
            <p>Aucun produit ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Modal d'ajout de produit */}
      {showAddProduct && (
        <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Ajouter un produit</h3>
              <button className="modal-close" onClick={() => setShowAddProduct(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom du produit *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Marque</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  required
                  className="form-input"
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Prix *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Catégorie *</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})}
                  required
                  className="form-input"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={productForm.isOnSale}
                      onChange={(e) => setProductForm({...productForm, isOnSale: e.target.checked})}
                    />
                    En promotion
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({...productForm, isFeatured: e.target.checked})}
                    />
                    Mettre en avant
                  </label>
                </div>
              </div>
              
              {productForm.isOnSale && (
                <div className="form-group">
                  <label>Prix de promotion</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({...productForm, salePrice: e.target.value})}
                    className="form-input"
                  />
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddProduct(false)}>
                  Annuler
                </button>
                <button type="submit" className="save-btn">
                  Créer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditProduct && editingProduct && (
        <div className="modal-overlay" onClick={() => setShowEditProduct(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Modifier le produit</h3>
              <button className="modal-close" onClick={() => setShowEditProduct(false)}>×</button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom du produit *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Marque</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  required
                  className="form-input"
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Prix *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={productForm.isOnSale}
                      onChange={(e) => setProductForm({...productForm, isOnSale: e.target.checked})}
                    />
                    En promotion
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({...productForm, isFeatured: e.target.checked})}
                    />
                    Mettre en avant
                  </label>
                </div>
              </div>
              
              {productForm.isOnSale && (
                <div className="form-group">
                  <label>Prix de promotion</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({...productForm, salePrice: e.target.value})}
                    className="form-input"
                  />
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditProduct(false)}>
                  Annuler
                </button>
                <button type="submit" className="save-btn">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && productToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗑️ Supprimer le produit</h3>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            
            <div className="confirm-content">
              <p>Êtes-vous sûr de vouloir supprimer le produit <strong>{productToDelete.name}</strong> ?</p>
              <p className="warning">⚠️ Cette action est irréversible.</p>
            </div>
            
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </button>
              <button className="delete-btn" onClick={confirmDeleteProduct}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsManagement
