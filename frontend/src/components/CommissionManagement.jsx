import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'

const CommissionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [showCommissionDetails, setShowCommissionDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Convex queries
  const allOrders = useQuery(api.orders.getAllOrders)
  const commissionConfig = useQuery(api.commissions.getCommissionConfig)
  
  // Mutations
  const updateCommissionRate = useMutation(api.commissions.updateCommissionRate)

  // Taux de commission fixe à 10%
  const COMMISSION_RATE = 10

  // Calculer le total des commandes
  const calculateOrderTotal = (order) => {
    if (Array.isArray(order)) {
      return order.reduce((total, item) => total + (item.price * item.quantity), 0) || 0
    }
    if (order && typeof order === 'object') {
      return order.total || (order.productPrice * order.quantity) || 0
    }
    return 0
  }

  // Calculer la commission pour une commande
  const calculateCommission = (orderTotal) => {
    return (orderTotal * COMMISSION_RATE) / 100
  }

  // Filtrer les commandes par période
  const getFilteredOrders = () => {
    if (!allOrders) return []
    
    let filtered = allOrders.filter(order => {
      const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.sellerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })

    // Filtrer par période
    if (filterPeriod !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filterPeriod) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate)
    }

    return filtered
  }

  const filteredOrders = getFilteredOrders()

  // Calculer les statistiques des commissions
  const commissionStats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((total, order) => total + calculateOrderTotal(order), 0),
    totalCommissions: filteredOrders.reduce((total, order) => total + calculateCommission(calculateOrderTotal(order)), 0),
    averageCommission: filteredOrders.length > 0 ? 
      filteredOrders.reduce((total, order) => total + calculateCommission(calculateOrderTotal(order)), 0) / filteredOrders.length : 0
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const viewCommissionDetails = (order) => {
    setSelectedOrder(order)
    setShowCommissionDetails(true)
  }

  return (
    <div className="commission-management">
      <div className="commission-header">
        <div className="header-content">
          <h2>💰 Gestion des Commissions</h2>
          <p>Gérez les commissions de la plateforme (Taux fixe : {COMMISSION_RATE}%)</p>
        </div>
      </div>

      {/* Configuration des commissions */}
      <div className="commission-config">
        <div className="config-card">
          <div className="config-header">
            <h3>⚙️ Configuration des Commissions</h3>
          </div>
          <div className="config-content">
            <div className="config-item">
              <label>Taux de commission :</label>
              <div className="rate-display">
                <span className="rate-value">{COMMISSION_RATE}%</span>
                <span className="rate-info">Taux fixe appliqué à toutes les commandes</span>
              </div>
            </div>
            <div className="config-item">
              <label>Statut :</label>
              <span className="status-active">✅ Actif</span>
            </div>
            <div className="config-item">
              <label>Dernière mise à jour :</label>
              <span>{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="commission-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Rechercher une commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes les périodes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Statistiques des commissions */}
      <div className="commission-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{commissionStats.totalOrders}</h3>
            <p>Commandes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{formatPrice(commissionStats.totalRevenue)}</h3>
            <p>Chiffre d'affaires</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-info">
            <h3>{formatPrice(commissionStats.totalCommissions)}</h3>
            <p>Total commissions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{formatPrice(commissionStats.averageCommission)}</h3>
            <p>Commission moyenne</p>
          </div>
        </div>
      </div>

      {/* Tableau des commissions */}
      <div className="commission-table-container">
        {filteredOrders.length > 0 ? (
          <div className="table-wrapper">
            <table className="commission-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Vendeur</th>
                  <th>Montant HT</th>
                  <th>Commission ({COMMISSION_RATE}%)</th>
                  <th>Net Vendeur</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const orderTotal = calculateOrderTotal(order)
                  const commission = calculateCommission(orderTotal)
                  const netAmount = orderTotal - commission
                  
                  return (
                    <tr key={order._id}>
                      <td className="order-cell">
                        <div className="order-info-table">
                          <h4>#{order.orderNumber}</h4>
                          <p className="order-id">ID: {order._id.slice(-8)}</p>
                        </div>
                      </td>
                      <td className="customer-cell">
                        <span className="customer-name">{order.buyerEmail}</span>
                      </td>
                      <td className="seller-cell">
                        <span className="seller-name">{order.sellerEmail}</span>
                      </td>
                      <td className="amount-cell">
                        <span className="order-amount">
                          {formatPrice(orderTotal)}
                        </span>
                      </td>
                      <td className="commission-cell">
                        <span className="commission-amount">
                          {formatPrice(commission)}
                        </span>
                      </td>
                      <td className="net-cell">
                        <span className="net-amount">
                          {formatPrice(netAmount)}
                        </span>
                      </td>
                      <td className="date-cell">
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="table-actions">
                          <button 
                            className="table-btn view"
                            onClick={() => viewCommissionDetails(order)}
                            title="Voir détails"
                          >
                            👁️
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
            <div className="empty-icon">💰</div>
            <h3>Aucune commission trouvée</h3>
            <p>Aucune commande ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Modal des détails de commission */}
      {showCommissionDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowCommissionDetails(false)}>
          <div className="modal-content commission-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Détails de la commission - Commande #{selectedOrder.orderNumber}</h3>
              <button className="modal-close" onClick={() => setShowCommissionDetails(false)}>×</button>
            </div>
            
            <div className="commission-details-content">
              {/* Calcul de la commission */}
              <div className="details-section">
                <h4>💸 Calcul de la commission</h4>
                <div className="commission-calculation">
                  <div className="calc-row">
                    <span className="calc-label">Montant de la commande :</span>
                    <span className="calc-value">{formatPrice(calculateOrderTotal(selectedOrder))}</span>
                  </div>
                  <div className="calc-row">
                    <span className="calc-label">Taux de commission :</span>
                    <span className="calc-value">{COMMISSION_RATE}%</span>
                  </div>
                  <div className="calc-row commission-row">
                    <span className="calc-label">Commission prélevée :</span>
                    <span className="calc-value commission-amount">
                      {formatPrice(calculateCommission(calculateOrderTotal(selectedOrder)))}
                    </span>
                  </div>
                  <div className="calc-row net-row">
                    <span className="calc-label">Montant net vendeur :</span>
                    <span className="calc-value net-amount">
                      {formatPrice(calculateOrderTotal(selectedOrder) - calculateCommission(calculateOrderTotal(selectedOrder)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations de la commande */}
              <div className="details-section">
                <h4>📋 Informations de la commande</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Numéro :</span>
                    <span>#{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date :</span>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Client :</span>
                    <span>{selectedOrder.buyerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Vendeur :</span>
                    <span>{selectedOrder.sellerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Produit :</span>
                    <span>{selectedOrder.productName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Quantité :</span>
                    <span>{selectedOrder.quantity}</span>
                  </div>
                </div>
              </div>

              {/* Répartition financière */}
              <div className="details-section">
                <h4>💰 Répartition financière</h4>
                <div className="financial-breakdown">
                  <div className="breakdown-item total">
                    <span className="breakdown-label">💳 Total payé par le client</span>
                    <span className="breakdown-value">{formatPrice(calculateOrderTotal(selectedOrder))}</span>
                  </div>
                  <div className="breakdown-item commission">
                    <span className="breakdown-label">🏢 Commission plateforme ({COMMISSION_RATE}%)</span>
                    <span className="breakdown-value">- {formatPrice(calculateCommission(calculateOrderTotal(selectedOrder)))}</span>
                  </div>
                  <div className="breakdown-item net">
                    <span className="breakdown-label">👤 Montant versé au vendeur</span>
                    <span className="breakdown-value">
                      {formatPrice(calculateOrderTotal(selectedOrder) - calculateCommission(calculateOrderTotal(selectedOrder)))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowCommissionDetails(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommissionManagement
