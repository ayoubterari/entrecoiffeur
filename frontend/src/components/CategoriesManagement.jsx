import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'

const CategoriesManagement = () => {
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showEditCategory, setShowEditCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedParentCategory, setSelectedParentCategory] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [showCategoriesPopup, setShowCategoriesPopup] = useState(false)

  // Convex queries et mutations
  const categories = useQuery(api.products.getCategories)
  const mainCategories = useQuery(api.products.getMainCategories)
  const createCategory = useMutation(api.products.createCategory)
  const updateCategory = useMutation(api.products.updateCategory)
  const deleteCategory = useMutation(api.products.deleteCategory)

  // État du formulaire
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '',
    description: '',
    parentCategoryId: null,
    isSubcategory: false
  })

  // Filtrer les catégories
  const filteredCategories = categories?.filter(category => 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    
    if (!categoryForm.name.trim()) {
      alert('Le nom de la catégorie est requis')
      return
    }
    
    try {
      await createCategory({
        name: categoryForm.name.trim(),
        icon: categoryForm.icon || '📦',
        description: categoryForm.description.trim(),
        parentCategoryId: categoryForm.isSubcategory ? categoryForm.parentCategoryId : undefined,
        level: categoryForm.isSubcategory ? 1 : 0
      })
      
      setCategoryForm({
        name: '',
        icon: '',
        description: '',
        parentCategoryId: null,
        isSubcategory: false
      })
      setShowAddCategory(false)
      
      // Message de succès
      console.log('Catégorie créée avec succès!')
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      
      // Afficher l'erreur à l'utilisateur
      if (error.message?.includes('already exists')) {
        alert('Une catégorie avec ce nom existe déjà')
      } else {
        alert('Erreur lors de la création de la catégorie: ' + error.message)
      }
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      icon: category.icon,
      description: category.description || '',
      parentCategoryId: category.parentCategoryId || null,
      isSubcategory: !!category.parentCategoryId
    })
    setShowEditCategory(true)
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    
    if (!categoryForm.name.trim()) {
      alert('Le nom de la catégorie est requis')
      return
    }
    
    try {
      await updateCategory({
        categoryId: editingCategory._id,
        name: categoryForm.name.trim(),
        icon: categoryForm.icon || '📦',
        description: categoryForm.description.trim()
      })
      
      setShowEditCategory(false)
      setEditingCategory(null)
      setCategoryForm({
        name: '',
        icon: '',
        description: '',
        parentCategoryId: null,
        isSubcategory: false
      })
      
      console.log('Catégorie modifiée avec succès!')
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      
      if (error.message?.includes('already exists')) {
        alert('Une catégorie avec ce nom existe déjà')
      } else {
        alert('Erreur lors de la modification: ' + error.message)
      }
    }
  }

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    try {
      await deleteCategory({ categoryId: categoryToDelete._id })
      setShowDeleteConfirm(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Impossible de supprimer cette catégorie. Elle est peut-être utilisée par des produits.')
    }
  }

  // Icônes prédéfinies
  const predefinedIcons = [
    '💄', '✂️', '🧴', '🪒', '💅', '🧽', '🎨', '👑', 
    '💎', '🌟', '✨', '🔥', '💖', '🌸', '🌺', '🦋',
    '📦', '🏷️', '🎯', '⭐', '🎪', '🎭', '🎨', '🎪'
  ]

  return (
    <div className="categories-management">
      <div className="categories-header">
        <div className="header-content">
          <h2>🏷️ Gestion des Catégories</h2>
          <p>Organisez vos produits par catégories</p>
        </div>
        <button 
          className="add-category-btn"
          onClick={() => setShowAddCategory(true)}
        >
          ➕ Ajouter une catégorie
        </button>
      </div>

      {/* Bouton Toutes catégories */}
      <div className="categories-quick-access">
        <button 
          className="all-categories-btn"
          onClick={() => setShowCategoriesPopup(true)}
        >
          <div className="btn-icon">📋</div>
          <div className="btn-content">
            <h3>Toutes catégories</h3>
            <p>{categories?.length || 0} catégories disponibles</p>
          </div>
          <div className="btn-arrow">→</div>
        </button>
      </div>

      {/* Popup de gestion des catégories */}
      {showCategoriesPopup && (
        <div className="modal-overlay" onClick={() => setShowCategoriesPopup(false)}>
          <div className="modal-content categories-popup" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏷️ Gestion des Catégories</h3>
              <button className="modal-close" onClick={() => setShowCategoriesPopup(false)}>×</button>
            </div>

            {/* Filtres et recherche dans la popup */}
            <div className="categories-filters">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Statistiques rapides dans la popup */}
            <div className="categories-stats">
              <div className="stat-card">
                <div className="stat-icon">🏷️</div>
                <div className="stat-info">
                  <h3>{categories?.length || 0}</h3>
                  <p>Total catégories</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{filteredCategories.length}</h3>
                  <p>Affichées</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎨</div>
                <div className="stat-info">
                  <h3>{categories?.filter(c => c.icon && c.icon !== '📦').length || 0}</h3>
                  <p>Avec icônes</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-info">
                  <h3>{categories?.filter(c => c.description).length || 0}</h3>
                  <p>Avec description</p>
                </div>
              </div>
            </div>

            {/* Liste des catégories hiérarchique dans la popup */}
            <div className="categories-list popup-list">
        {mainCategories && mainCategories.length > 0 ? (
          <div className="categories-hierarchy">
            {mainCategories
              .filter(cat => 
                !searchTerm || 
                cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((category) => {
                const subcategories = categories?.filter(c => c.parentCategoryId === category._id) || []
                const isExpanded = expandedCategories.has(category._id)
                
                return (
                  <div key={category._id} className="category-hierarchy-item">
                    {/* Catégorie principale */}
                    <div className="category-card main-category">
                      <div className="category-header">
                        {subcategories.length > 0 && (
                          <button 
                            className="expand-btn"
                            onClick={() => {
                              const newExpanded = new Set(expandedCategories)
                              if (isExpanded) {
                                newExpanded.delete(category._id)
                              } else {
                                newExpanded.add(category._id)
                              }
                              setExpandedCategories(newExpanded)
                            }}
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        )}
                        <div className="category-icon-large">
                          {category.icon || '📦'}
                        </div>
                        
                        <div className="category-info">
                          <h4>{category.name}</h4>
                          {category.description && (
                            <p className="category-description">{category.description}</p>
                          )}
                          {subcategories.length > 0 && (
                            <span className="subcategory-count">
                              {subcategories.length} sous-catégorie{subcategories.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        <div className="category-actions">
                          <button 
                            className="add-sub-btn"
                            onClick={() => {
                              setCategoryForm({
                                name: '',
                                icon: '',
                                description: '',
                                parentCategoryId: category._id,
                                isSubcategory: true
                              })
                              setShowAddCategory(true)
                            }}
                            title="Ajouter une sous-catégorie"
                          >
                            ➕ Sous-catégorie
                          </button>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditCategory(category)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sous-catégories */}
                    {isExpanded && subcategories.length > 0 && (
                      <div className="subcategories-list">
                        {subcategories.map((subcat) => (
                          <div key={subcat._id} className="category-card subcategory">
                            <div className="subcategory-indicator">└─</div>
                            <div className="category-icon-small">
                              {subcat.icon || '📦'}
                            </div>
                            
                            <div className="category-info">
                              <h5>{subcat.name}</h5>
                              {subcat.description && (
                                <p className="category-description">{subcat.description}</p>
                              )}
                            </div>
                            
                            <div className="category-actions">
                              <button 
                                className="edit-btn"
                                onClick={() => handleEditCategory(subcat)}
                                title="Modifier cette sous-catégorie"
                              >
                                ✏️ Modifier
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeleteCategory(subcat)}
                                title="Supprimer cette sous-catégorie"
                              >
                                🗑️ Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏷️</div>
            <h3>Aucune catégorie trouvée</h3>
            <p>Commencez par créer des catégories principales.</p>
          </div>
        )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de catégorie */}
      {showAddCategory && (
        <div className="modal-overlay" onClick={() => setShowAddCategory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Ajouter une catégorie</h3>
              <button className="modal-close" onClick={() => setShowAddCategory(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="category-form">
              <div className="form-group">
                <label>Nom de la catégorie *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                  className="form-input"
                  placeholder="Ex: Shampoings"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  className="form-input"
                  rows="3"
                  placeholder="Description de la catégorie..."
                />
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={categoryForm.isSubcategory}
                    onChange={(e) => setCategoryForm({...categoryForm, isSubcategory: e.target.checked, parentCategoryId: null})}
                  />
                  {' '}C'est une sous-catégorie
                </label>
              </div>
              
              {categoryForm.isSubcategory && (
                <div className="form-group">
                  <label>Catégorie parente *</label>
                  <select
                    value={categoryForm.parentCategoryId || ''}
                    onChange={(e) => setCategoryForm({...categoryForm, parentCategoryId: e.target.value || null})}
                    required
                    className="form-input"
                  >
                    <option value="">Sélectionner une catégorie parente</option>
                    {mainCategories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label>Icône</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                  className="form-input"
                  placeholder="Emoji ou icône"
                />
                
                <div className="icon-picker">
                  <p>Icônes suggérées :</p>
                  <div className="icon-grid">
                    {predefinedIcons.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`icon-option ${categoryForm.icon === icon ? 'selected' : ''}`}
                        onClick={() => setCategoryForm({...categoryForm, icon})}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddCategory(false)}>
                  Annuler
                </button>
                <button type="submit" className="save-btn">
                  Créer la catégorie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditCategory && editingCategory && (
        <div className="modal-overlay" onClick={() => setShowEditCategory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Modifier la catégorie</h3>
              <button className="modal-close" onClick={() => setShowEditCategory(false)}>×</button>
            </div>
            
            <form onSubmit={handleUpdateCategory} className="category-form">
              <div className="form-group">
                <label>Nom de la catégorie *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  className="form-input"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Icône</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                  className="form-input"
                />
                
                <div className="icon-picker">
                  <p>Icônes suggérées :</p>
                  <div className="icon-grid">
                    {predefinedIcons.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`icon-option ${categoryForm.icon === icon ? 'selected' : ''}`}
                        onClick={() => setCategoryForm({...categoryForm, icon})}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditCategory(false)}>
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
      {showDeleteConfirm && categoryToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗑️ Supprimer la catégorie</h3>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            
            <div className="confirm-content">
              <div className="category-preview">
                <div className="category-icon-large">{categoryToDelete.icon}</div>
                <h4>{categoryToDelete.name}</h4>
                {categoryToDelete.parentCategoryId && (
                  <span className="category-type-badge">Sous-catégorie</span>
                )}
              </div>
              <p>Êtes-vous sûr de vouloir supprimer cette {categoryToDelete.parentCategoryId ? 'sous-catégorie' : 'catégorie'} ?</p>
              {!categoryToDelete.parentCategoryId && (
                <p className="warning">⚠️ Cette action est irréversible. Les produits de cette catégorie devront être recatégorisés.</p>
              )}
              {categoryToDelete.parentCategoryId && (
                <p className="info">ℹ️ Cette sous-catégorie sera supprimée de sa catégorie parente.</p>
              )}
            </div>
            
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </button>
              <button className="delete-btn" onClick={confirmDeleteCategory}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesManagement
