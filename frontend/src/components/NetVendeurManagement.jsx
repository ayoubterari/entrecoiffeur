import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'

const NetVendeurManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showTransferDetails, setShowTransferDetails] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [processingTransfers, setProcessingTransfers] = useState(new Set())

  // Convex queries
  const allOrders = useQuery(api.orders.getAllOrders)
  const sellerPayments = useQuery(api.netVendeur.getSellerPayments)
  const allUsers = useQuery(api.auth.getAllUsers)
  
  // Mutations
  const markTransferCompleted = useMutation(api.netVendeur.markTransferCompleted)
  const createTransferBatch = useMutation(api.netVendeur.createTransferBatch)

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

  // Calculer la commission et le net vendeur
  const calculateCommission = (orderTotal) => {
    return (orderTotal * COMMISSION_RATE) / 100
  }

  const calculateNetAmount = (orderTotal) => {
    return orderTotal - calculateCommission(orderTotal)
  }

  // Récupérer les informations d'un vendeur
  const getSellerInfo = (sellerId) => {
    if (!allUsers) return { name: 'Chargement...', email: 'Chargement...' }
    
    const seller = allUsers.find(user => user._id === sellerId)
    if (!seller) return { name: 'Vendeur introuvable', email: 'N/A' }
    
    const name = seller.firstName && seller.lastName 
      ? `${seller.firstName} ${seller.lastName}`
      : seller.firstName || seller.lastName || seller.email
    
    return { name, email: seller.email }
  }

  // Marquer un transfert comme effectué
  const handleTransferComplete = async (sellerId) => {
    try {
      setProcessingTransfers(prev => new Set(prev).add(sellerId))
      
      await markTransferCompleted({
        sellerId,
        transferAmount: sellerSummaries.find(s => s.sellerId === sellerId)?.totalNetAmount,
        transferReference: `TRANSFER_${Date.now()}`
      })
      
      // Optionnel: afficher un message de succès
      console.log('Transfert marqué comme effectué')
      
    } catch (error) {
      console.error('Erreur lors du marquage du transfert:', error)
    } finally {
      setProcessingTransfers(prev => {
        const newSet = new Set(prev)
        newSet.delete(sellerId)
        return newSet
      })
    }
  }

  // Grouper les commandes par vendeur
  const getSellerSummary = () => {
    if (!allOrders) return []
    
    let filteredOrders = allOrders.filter(order => {
      const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.sellerId?.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      filteredOrders = filteredOrders.filter(order => new Date(order.createdAt) >= filterDate)
    }

    // Grouper par vendeur
    const sellerMap = new Map()
    
    filteredOrders.forEach(order => {
      const sellerId = order.sellerId
      const orderTotal = calculateOrderTotal(order)
      const commission = calculateCommission(orderTotal)
      const netAmount = calculateNetAmount(orderTotal)
      
      if (!sellerMap.has(sellerId)) {
        const sellerInfo = getSellerInfo(sellerId)
        sellerMap.set(sellerId, {
          sellerId,
          sellerName: sellerInfo.name,
          sellerEmail: sellerInfo.email,
          totalOrders: 0,
          totalRevenue: 0,
          totalCommissions: 0,
          totalNetAmount: 0,
          orders: [],
          transferStatus: 'pending' // pending, processing, completed
        })
      }
      
      const seller = sellerMap.get(sellerId)
      seller.totalOrders += 1
      seller.totalRevenue += orderTotal
      seller.totalCommissions += commission
      seller.totalNetAmount += netAmount
      seller.orders.push({
        ...order,
        orderTotal,
        commission,
        netAmount
      })
    })

    let sellers = Array.from(sellerMap.values())

    // Filtrer par statut de transfert
    if (filterStatus !== 'all') {
      sellers = sellers.filter(seller => seller.transferStatus === filterStatus)
    }

    return sellers
  }

  const sellerSummaries = getSellerSummary()

  // Calculer les statistiques globales
  const globalStats = {
    totalSellers: sellerSummaries.length,
    totalRevenue: sellerSummaries.reduce((sum, seller) => sum + seller.totalRevenue, 0),
    totalCommissions: sellerSummaries.reduce((sum, seller) => sum + seller.totalCommissions, 0),
    totalNetAmount: sellerSummaries.reduce((sum, seller) => sum + seller.totalNetAmount, 0),
    pendingTransfers: sellerSummaries.filter(s => s.transferStatus === 'pending').length,
    completedTransfers: sellerSummaries.filter(s => s.transferStatus === 'completed').length
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


  const viewTransferDetails = (seller) => {
    setSelectedSeller(seller)
    setShowTransferDetails(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'processing': return '#3b82f6'
      case 'completed': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return '⏳ En attente'
      case 'processing': return '🔄 En cours'
      case 'completed': return '✅ Effectué'
      default: return status
    }
  }

  return (
    <div className="net-vendeur-management">
      <div className="net-vendeur-header">
        <div className="header-content">
          <h2>💸 Gestion Net Vendeur</h2>
          <p>Gérez les versements aux vendeurs après prélèvement des commissions ({COMMISSION_RATE}%)</p>
        </div>
      </div>

      {/* Résumé des versements */}
      <div className="transfer-summary">
        <div className="summary-card">
          <div className="summary-header">
            <h3>📊 Résumé des Versements</h3>
          </div>
          <div className="summary-content">
            <div className="summary-item">
              <label>Total à verser :</label>
              <div className="amount-display">
                <span className="amount-value">{formatPrice(globalStats.totalNetAmount)}</span>
                <span className="amount-info">Montant net après commission</span>
              </div>
            </div>
            <div className="summary-item">
              <label>Commission prélevée :</label>
              <span className="commission-amount">{formatPrice(globalStats.totalCommissions)}</span>
            </div>
            <div className="summary-item">
              <label>Chiffre d'affaires total :</label>
              <span>{formatPrice(globalStats.totalRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="net-vendeur-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Rechercher un vendeur..."
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
        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">⏳ En attente</option>
            <option value="processing">🔄 En cours</option>
            <option value="completed">✅ Effectués</option>
          </select>
        </div>
      </div>

      {/* Statistiques des versements */}
      <div className="net-vendeur-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{globalStats.totalSellers}</h3>
            <p>Vendeurs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{formatPrice(globalStats.totalNetAmount)}</h3>
            <p>Total à verser</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{globalStats.pendingTransfers}</h3>
            <p>En attente</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{globalStats.completedTransfers}</h3>
            <p>Effectués</p>
          </div>
        </div>
      </div>

      {/* Tableau des vendeurs */}
      <div className="net-vendeur-table-container">
        {sellerSummaries.length > 0 ? (
          <div className="table-wrapper">
            <table className="net-vendeur-table">
              <thead>
                <tr>
                  <th>Vendeur</th>
                  <th>Commandes</th>
                  <th>Chiffre d'affaires</th>
                  <th>Commission ({COMMISSION_RATE}%)</th>
                  <th>Montant Net</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellerSummaries.map((seller) => (
                  <tr key={seller.sellerId}>
                    <td className="seller-cell">
                      <div className="seller-info-table">
                        <h4>{seller.sellerName}</h4>
                        <p className="seller-email">{seller.sellerEmail}</p>
                      </div>
                    </td>
                    <td className="orders-cell">
                      <span className="orders-count">
                        📦 {seller.totalOrders} commande(s)
                      </span>
                    </td>
                    <td className="revenue-cell">
                      <span className="revenue-amount">
                        {formatPrice(seller.totalRevenue)}
                      </span>
                    </td>
                    <td className="commission-cell">
                      <span className="commission-amount">
                        - {formatPrice(seller.totalCommissions)}
                      </span>
                    </td>
                    <td className="net-cell">
                      <span className="net-amount">
                        {formatPrice(seller.totalNetAmount)}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span 
                        className="transfer-status-badge"
                        style={{ backgroundColor: getStatusColor(seller.transferStatus) }}
                      >
                        {getStatusLabel(seller.transferStatus)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="table-actions">
                        <button 
                          className="table-btn view"
                          onClick={() => viewTransferDetails(seller)}
                          title="Voir détails"
                        >
                          👁️
                        </button>
                        {seller.transferStatus === 'pending' && (
                          <button 
                            className="table-btn transfer"
                            onClick={() => handleTransferComplete(seller.sellerId)}
                            disabled={processingTransfers.has(seller.sellerId)}
                            title="Marquer comme effectué"
                          >
                            {processingTransfers.has(seller.sellerId) ? '⏳' : '💸'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <h3>Aucun versement trouvé</h3>
            <p>Aucun vendeur ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Modal des détails de versement */}
      {showTransferDetails && selectedSeller && (
        <div className="modal-overlay" onClick={() => setShowTransferDetails(false)}>
          <div className="modal-content transfer-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💸 Détails du versement - {selectedSeller.sellerName}</h3>
              <button className="modal-close" onClick={() => setShowTransferDetails(false)}>×</button>
            </div>
            
            <div className="transfer-details-content">
              {/* Résumé du vendeur */}
              <div className="details-section">
                <h4>👤 Informations du vendeur</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Email :</span>
                    <span>{selectedSeller.sellerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">ID Vendeur :</span>
                    <span>{selectedSeller.sellerId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Nombre de commandes :</span>
                    <span>{selectedSeller.totalOrders}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Statut du versement :</span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedSeller.transferStatus) }}
                    >
                      {getStatusLabel(selectedSeller.transferStatus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calcul du versement */}
              <div className="details-section">
                <h4>💰 Calcul du versement</h4>
                <div className="transfer-calculation">
                  <div className="calc-row">
                    <span className="calc-label">Chiffre d'affaires total :</span>
                    <span className="calc-value">{formatPrice(selectedSeller.totalRevenue)}</span>
                  </div>
                  <div className="calc-row">
                    <span className="calc-label">Commission plateforme ({COMMISSION_RATE}%) :</span>
                    <span className="calc-value commission-amount">
                      - {formatPrice(selectedSeller.totalCommissions)}
                    </span>
                  </div>
                  <div className="calc-row net-row">
                    <span className="calc-label">Montant net à verser :</span>
                    <span className="calc-value net-amount">
                      {formatPrice(selectedSeller.totalNetAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Liste des commandes */}
              <div className="details-section">
                <h4>📋 Détail des commandes</h4>
                <div className="orders-list">
                  {selectedSeller.orders.slice(0, 5).map((order, index) => (
                    <div key={index} className="order-item">
                      <div className="order-info">
                        <h5>#{order.orderNumber}</h5>
                        <p>{order.productName}</p>
                        <p className="order-date">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="order-amounts">
                        <div className="amount-row">
                          <span>Total: {formatPrice(order.orderTotal)}</span>
                        </div>
                        <div className="amount-row commission">
                          <span>Commission: -{formatPrice(order.commission)}</span>
                        </div>
                        <div className="amount-row net">
                          <span>Net: {formatPrice(order.netAmount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedSeller.orders.length > 5 && (
                    <p className="more-orders">
                      ... et {selectedSeller.orders.length - 5} autre(s) commande(s)
                    </p>
                  )}
                </div>
              </div>

              {/* Instructions de versement */}
              <div className="details-section">
                <h4>📝 Instructions de versement</h4>
                <div className="transfer-instructions">
                  <div className="instruction-step">
                    <span className="step-number">1</span>
                    <div className="step-content">
                      <h5>Vérifier les informations</h5>
                      <p>Vérifiez que toutes les commandes sont correctes et que le montant net est exact.</p>
                    </div>
                  </div>
                  <div className="instruction-step">
                    <span className="step-number">2</span>
                    <div className="step-content">
                      <h5>Effectuer le virement</h5>
                      <p>Effectuez le virement de <strong>{formatPrice(selectedSeller.totalNetAmount)}</strong> vers le compte du vendeur.</p>
                    </div>
                  </div>
                  <div className="instruction-step">
                    <span className="step-number">3</span>
                    <div className="step-content">
                      <h5>Marquer comme effectué</h5>
                      <p>Une fois le virement effectué, cliquez sur le bouton "Marquer comme effectué".</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              {selectedSeller.transferStatus === 'pending' && (
                <button 
                  className="transfer-btn"
                  onClick={() => {
                    handleTransferComplete(selectedSeller.sellerId)
                    setShowTransferDetails(false)
                  }}
                  disabled={processingTransfers.has(selectedSeller.sellerId)}
                >
                  {processingTransfers.has(selectedSeller.sellerId) ? '⏳ Traitement...' : '💸 Marquer comme effectué'}
                </button>
              )}
              <button 
                className="cancel-btn" 
                onClick={() => setShowTransferDetails(false)}
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

export default NetVendeurManagement
