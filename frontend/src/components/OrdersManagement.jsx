import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'

const OrdersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Convex queries et mutations
  const allOrders = useQuery(api.orders.getAllOrders)
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus)

  // Filtrer les commandes
  const filteredOrders = allOrders?.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.sellerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  }) || []

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800'
      case 'confirmed': return '#2196f3'
      case 'shipped': return '#9c27b0'
      case 'delivered': return '#4caf50'
      case 'cancelled': return '#f44336'
      default: return '#757575'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return '⏳ En attente'
      case 'confirmed': return '✅ Confirmée'
      case 'shipped': return '🚚 Expédiée'
      case 'delivered': return '📦 Livrée'
      case 'cancelled': return '❌ Annulée'
      default: return status
    }
  }

  const calculateOrderTotal = (order) => {
    // Si c'est un tableau d'items (ancien format)
    if (Array.isArray(order)) {
      return order.reduce((total, item) => total + (item.price * item.quantity), 0) || 0
    }
    // Si c'est un objet order avec total direct (nouveau format)
    if (order && typeof order === 'object') {
      return order.total || (order.productPrice * order.quantity) || 0
    }
    return 0
  }

  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  return (
    <div className="orders-management">
      <div className="orders-header">
        <div className="header-content">
          <h2>📋 Gestion des Commandes</h2>
          <p>Gérez toutes les commandes de la plateforme</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="orders-filters">
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">⏳ En attente</option>
            <option value="confirmed">✅ Confirmées</option>
            <option value="shipped">🚚 Expédiées</option>
            <option value="delivered">📦 Livrées</option>
            <option value="cancelled">❌ Annulées</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="orders-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{allOrders?.length || 0}</h3>
            <p>Total commandes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{allOrders?.filter(o => o.status === 'pending').length || 0}</h3>
            <p>En attente</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{allOrders?.filter(o => o.status === 'confirmed').length || 0}</h3>
            <p>Confirmées</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{formatPrice(allOrders?.reduce((total, order) => total + calculateOrderTotal(order), 0) || 0)}</h3>
            <p>Chiffre d'affaires</p>
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="orders-table-container">
        {filteredOrders.length > 0 ? (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Vendeur</th>
                  <th>Articles</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
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
                    <td className="items-cell">
                      <span className="items-count">
                        📦 {order.quantity || 1} article(s)
                      </span>
                    </td>
                    <td className="total-cell">
                      <span className="order-total">
                        {formatPrice(calculateOrderTotal(order))}
                      </span>
                    </td>
                    <td className="status-order-cell">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`order-status-badge ${order.status}`}
                      >
                        <option value="pending">⏳ En attente</option>
                        <option value="confirmed">✅ Confirmée</option>
                        <option value="shipped">🚚 Expédiée</option>
                        <option value="delivered">📦 Livrée</option>
                        <option value="cancelled">❌ Annulée</option>
                      </select>
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
                          onClick={() => viewOrderDetails(order)}
                          title="Voir détails"
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Aucune commande trouvée</h3>
            <p>Aucune commande ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Modal des détails de commande */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Détails de la commande #{selectedOrder.orderNumber}</h3>
              <button className="modal-close" onClick={() => setShowOrderDetails(false)}>×</button>
            </div>
            
            <div className="order-details-content">
              {/* Informations générales */}
              <div className="details-section">
                <h4>📋 Informations générales</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Numéro de commande :</span>
                    <span>#{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date de commande :</span>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Statut :</span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total :</span>
                    <span className="total-amount">{formatPrice(calculateOrderTotal(selectedOrder))}</span>
                  </div>
                </div>
              </div>

              {/* Informations client/vendeur */}
              <div className="details-section">
                <h4>👥 Participants</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">👤 Client :</span>
                    <span>{selectedOrder.buyerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">🏪 Vendeur :</span>
                    <span>{selectedOrder.sellerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Articles commandés */}
              <div className="details-section">
                <h4>📦 Articles commandés</h4>
                <div className="order-items">
                  <div className="order-item">
                    <div className="item-image">
                      <img 
                        src={'https://via.placeholder.com/60x60?text=📦'} 
                        alt={selectedOrder.productName}
                      />
                    </div>
                    <div className="item-details">
                      <h5>{selectedOrder.productName}</h5>
                      <p>Quantité : {selectedOrder.quantity}</p>
                      <p>Prix unitaire : {formatPrice(selectedOrder.productPrice)}</p>
                    </div>
                    <div className="item-total">
                      {formatPrice(selectedOrder.productPrice * selectedOrder.quantity)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Adresse de livraison */}
              {selectedOrder.billingInfo && (
                <div className="details-section">
                  <h4>🚚 Adresse de livraison</h4>
                  <div className="shipping-address">
                    <p>{selectedOrder.billingInfo.firstName} {selectedOrder.billingInfo.lastName}</p>
                    <p>{selectedOrder.billingInfo.address}</p>
                    <p>{selectedOrder.billingInfo.city}, {selectedOrder.billingInfo.postalCode}</p>
                    <p>{selectedOrder.billingInfo.country}</p>
                    <p>📧 {selectedOrder.billingInfo.email}</p>
                  </div>
                </div>
              )}

              {/* Informations de paiement */}
              <div className="details-section">
                <h4>💳 Paiement</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Méthode :</span>
                    <span>{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">ID Transaction :</span>
                    <span>{selectedOrder.paymentId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Statut paiement :</span>
                    <span className="payment-status">✅ {selectedOrder.paymentStatus || 'Payé'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowOrderDetails(false)}
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

export default OrdersManagement
