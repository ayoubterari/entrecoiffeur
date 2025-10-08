import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import './CouponsManagement.css'

const CouponsManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, expired, used

  // Queries
  const couponsData = useQuery(api.functions.queries.coupons.getAllCoupons, { limit: 100 })
  const couponStats = useQuery(api.functions.queries.coupons.getCouponStats)

  // Mutations
  const createCoupon = useMutation(api.functions.mutations.coupons.createCoupon)
  const updateCoupon = useMutation(api.functions.mutations.coupons.updateCoupon)
  const deleteCoupon = useMutation(api.functions.mutations.coupons.deleteCoupon)
  const toggleCouponStatus = useMutation(api.functions.mutations.coupons.toggleCouponStatus)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    description: '',
    usageLimit: '',
    validFrom: '',
    validUntil: '',
    minimumAmount: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('userId')

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      discountPercentage: '',
      description: '',
      usageLimit: '',
      validFrom: '',
      validUntil: '',
      minimumAmount: ''
    })
    setError('')
    setSuccess('')
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Format date for input
  const formatDateForInput = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
  }

  // Parse date from input
  const parseDateFromInput = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).getTime()
  }

  // Handle create coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.code || !formData.discountPercentage || !formData.validFrom) {
        throw new Error('Code, pourcentage et date de début sont obligatoires')
      }

      const couponData = {
        code: formData.code.toUpperCase(),
        discountPercentage: parseInt(formData.discountPercentage),
        description: formData.description || undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        validFrom: parseDateFromInput(formData.validFrom),
        validUntil: formData.validUntil ? parseDateFromInput(formData.validUntil) : undefined,
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
        createdBy: currentUserId
      }

      await createCoupon(couponData)
      setSuccess('Coupon créé avec succès!')
      resetForm()
      setShowCreateModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit coupon
  const handleEditCoupon = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const updates = {}
      
      if (formData.code) updates.code = formData.code.toUpperCase()
      if (formData.discountPercentage) updates.discountPercentage = parseInt(formData.discountPercentage)
      if (formData.description !== undefined) updates.description = formData.description || undefined
      if (formData.usageLimit !== undefined) updates.usageLimit = formData.usageLimit ? parseInt(formData.usageLimit) : undefined
      if (formData.validFrom) updates.validFrom = parseDateFromInput(formData.validFrom)
      if (formData.validUntil !== undefined) updates.validUntil = formData.validUntil ? parseDateFromInput(formData.validUntil) : undefined
      if (formData.minimumAmount !== undefined) updates.minimumAmount = formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined

      await updateCoupon({
        couponId: selectedCoupon._id,
        ...updates
      })

      setSuccess('Coupon modifié avec succès!')
      resetForm()
      setShowEditModal(false)
      setSelectedCoupon(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete coupon
  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce coupon ?')) {
      return
    }

    try {
      await deleteCoupon({ couponId })
      setSuccess('Coupon supprimé avec succès!')
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle toggle status
  const handleToggleStatus = async (couponId) => {
    try {
      await toggleCouponStatus({ couponId })
      setSuccess('Statut du coupon modifié!')
    } catch (err) {
      setError(err.message)
    }
  }

  // Open edit modal
  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage.toString(),
      description: coupon.description || '',
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      validFrom: formatDateForInput(coupon.validFrom),
      validUntil: formatDateForInput(coupon.validUntil),
      minimumAmount: coupon.minimumAmount ? coupon.minimumAmount.toString() : ''
    })
    setShowEditModal(true)
  }

  // Filter coupons
  const filteredCoupons = couponsData?.coupons?.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (!matchesSearch) return false

    const now = Date.now()
    
    switch (filterStatus) {
      case 'active':
        return coupon.isActive && 
               now >= coupon.validFrom && 
               (!coupon.validUntil || now <= coupon.validUntil) &&
               (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)
      case 'expired':
        return coupon.validUntil && now > coupon.validUntil
      case 'used':
        return coupon.usageCount > 0
      default:
        return true
    }
  }) || []

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Aucune'
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get coupon status
  const getCouponStatus = (coupon) => {
    const now = Date.now()
    
    if (!coupon.isActive) return { status: 'inactive', label: 'Inactif', color: '#6c757d' }
    if (now < coupon.validFrom) return { status: 'pending', label: 'En attente', color: '#ffc107' }
    if (coupon.validUntil && now > coupon.validUntil) return { status: 'expired', label: 'Expiré', color: '#dc3545' }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { status: 'exhausted', label: 'Épuisé', color: '#fd7e14' }
    
    return { status: 'active', label: 'Actif', color: '#28a745' }
  }

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('')
        setError('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  return (
    <div className="coupons-management">
      <div className="coupons-header">
        <div className="header-title">
          <h2>🎫 Gestion des Coupons</h2>
          <p>Créez et gérez les codes de réduction</p>
        </div>
        <button 
          className="create-coupon-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <span>➕</span>
          Nouveau Coupon
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <span>❌</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <span>✅</span>
          {success}
        </div>
      )}

      {/* Statistics */}
      {couponStats && (
        <div className="coupons-stats">
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-content">
              <h3>{couponStats.total}</h3>
              <p>Total Coupons</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{couponStats.active}</h3>
              <p>Actifs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{couponStats.totalUsage}</h3>
              <p>Utilisations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{couponStats.averageDiscount}%</h3>
              <p>Réduction Moy.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="coupons-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher par code ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-buttons">
          <button 
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            Tous
          </button>
          <button 
            className={filterStatus === 'active' ? 'active' : ''}
            onClick={() => setFilterStatus('active')}
          >
            Actifs
          </button>
          <button 
            className={filterStatus === 'expired' ? 'active' : ''}
            onClick={() => setFilterStatus('expired')}
          >
            Expirés
          </button>
          <button 
            className={filterStatus === 'used' ? 'active' : ''}
            onClick={() => setFilterStatus('used')}
          >
            Utilisés
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="coupons-table-container">
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Réduction</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Utilisations</th>
              <th>Validité</th>
              <th>Créé par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">🎫</span>
                    <p>Aucun coupon trouvé</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCoupons.map(coupon => {
                const status = getCouponStatus(coupon)
                return (
                  <tr key={coupon._id}>
                    <td>
                      <div className="coupon-code">
                        <strong>{coupon.code}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="discount-badge">
                        {coupon.discountPercentage}%
                      </div>
                    </td>
                    <td>
                      <div className="coupon-description">
                        {coupon.description || '-'}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="usage-info">
                        {coupon.usageCount}
                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                      </div>
                    </td>
                    <td>
                      <div className="validity-dates">
                        <div>Du: {formatDate(coupon.validFrom)}</div>
                        <div>Au: {formatDate(coupon.validUntil)}</div>
                      </div>
                    </td>
                    <td>
                      <div className="creator-info">
                        {coupon.creatorName}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(coupon)}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          className={`toggle-btn ${coupon.isActive ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleStatus(coupon._id)}
                          title={coupon.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {coupon.isActive ? '🔒' : '🔓'}
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Créer un nouveau coupon</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateCoupon} className="coupon-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Code du coupon *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Ex: SUMMER20"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="form-group">
                  <label>Pourcentage de réduction * (%)</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description du coupon (optionnel)"
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Limite d'utilisation</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="Illimité si vide"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Montant minimum (€)</label>
                  <input
                    type="number"
                    name="minimumAmount"
                    value={formData.minimumAmount}
                    onChange={handleInputChange}
                    placeholder="Aucun minimum si vide"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date de début *</label>
                  <input
                    type="datetime-local"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date de fin</label>
                  <input
                    type="datetime-local"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer le coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCoupon && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Modifier le coupon</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditCoupon} className="coupon-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Code du coupon</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="form-group">
                  <label>Pourcentage de réduction (%)</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Limite d'utilisation</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Montant minimum (€)</label>
                  <input
                    type="number"
                    name="minimumAmount"
                    value={formData.minimumAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date de début</label>
                  <input
                    type="datetime-local"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Date de fin</label>
                  <input
                    type="datetime-local"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Modification...' : 'Modifier le coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CouponsManagement
