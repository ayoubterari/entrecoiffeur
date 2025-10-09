import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import './AffiliateTab.css'

const AffiliateTab = ({ userId }) => {
  const [activeSubTab, setActiveSubTab] = useState('overview') // overview, links, orders, earnings, transactions

  // Récupérer les statistiques d'affiliation
  const affiliateStats = useQuery(api.affiliateSystem.getUserAffiliateStats,
    userId ? { userId } : "skip"
  )

  // Récupérer les liens d'affiliation
  const affiliateLinks = useQuery(api.affiliateSystem.getUserAffiliateLinks,
    userId ? { userId, limit: 10 } : "skip"
  )

  // Récupérer les transactions de points
  const pointTransactions = useQuery(api.affiliateSystem.getUserPointTransactions,
    userId ? { userId, limit: 20 } : "skip"
  )

  // Récupérer les commandes d'affiliation
  const affiliateOrders = useQuery(api.affiliateSystem.getUserAffiliateOrders,
    userId ? { userId, limit: 15 } : "skip"
  )

  // Mutation pour traiter les gains en attente
  const processDeliveredOrdersEarnings = useMutation(api.affiliateSystem.processDeliveredOrdersEarnings)
  const [isProcessing, setIsProcessing] = useState(false)

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // Optionnel: ajouter une notification de succès
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPoints = (points) => {
    return new Intl.NumberFormat('fr-FR').format(points)
  }

  const handleProcessPendingEarnings = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      const result = await processDeliveredOrdersEarnings()
      if (result.success) {
        alert(`✅ ${result.message}`)
        // Recharger les données
        window.location.reload()
      } else {
        alert(`❌ Erreur: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Erreur: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!affiliateStats) {
    return (
      <div className="affiliate-tab-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de vos statistiques d'affiliation...</p>
      </div>
    )
  }

  return (
    <div className="affiliate-tab">
      {/* En-tête avec navigation */}
      <div className="affiliate-header">
        <div className="header-content">
          <div className="header-title">
            <h2>💰 Programme d'Affiliation</h2>
            <p>Partagez et gagnez des points à chaque commande !</p>
          </div>
          
          <div className="points-balance">
            <div className="balance-card">
              <div className="balance-icon">💎</div>
              <div className="balance-info">
                <div className="balance-amount">{formatPoints(affiliateStats.availablePoints)}</div>
                <div className="balance-label">Points disponibles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation des sous-onglets */}
        <div className="affiliate-nav">
          <button 
            className={`nav-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('overview')}
          >
            <span className="nav-icon">📊</span>
            Vue d'ensemble
          </button>
          <button 
            className={`nav-btn ${activeSubTab === 'links' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('links')}
          >
            <span className="nav-icon">🔗</span>
            Mes liens
          </button>
          <button 
            className={`nav-btn ${activeSubTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('orders')}
          >
            <span className="nav-icon">📦</span>
            Commandes
          </button>
          <button 
            className={`nav-btn ${activeSubTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('earnings')}
          >
            <span className="nav-icon">💰</span>
            Gains
          </button>
          <button 
            className={`nav-btn ${activeSubTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('transactions')}
          >
            <span className="nav-icon">📋</span>
            Historique
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="affiliate-content">
        {activeSubTab === 'overview' && (
          <div className="overview-tab">
            {/* Statistiques principales */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🔗</div>
                <div className="stat-info">
                  <div className="stat-number">{affiliateStats.totalLinks}</div>
                  <div className="stat-label">Liens créés</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">👆</div>
                <div className="stat-info">
                  <div className="stat-number">{affiliateStats.totalClicks}</div>
                  <div className="stat-label">Clics totaux</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🛒</div>
                <div className="stat-info">
                  <div className="stat-number">{affiliateStats.totalConversions}</div>
                  <div className="stat-label">Commandes</div>
                </div>
              </div>
              
              <div className="stat-card conversion-rate">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <div className="stat-number">{affiliateStats.conversionRate.toFixed(1)}%</div>
                  <div className="stat-label">Taux de conversion</div>
                </div>
              </div>
            </div>

            {/* Résumé des gains */}
            <div className="earnings-summary">
              <h3>💰 Résumé des gains</h3>
              <div className="earnings-cards">
                <div className="earning-card pending">
                  <div className="earning-icon">⏳</div>
                  <div className="earning-info">
                    <div className="earning-amount">{formatPoints(affiliateStats.pendingEarnings)}</div>
                    <div className="earning-label">Points en attente</div>
                    <div className="earning-desc">Seront crédités à la livraison</div>
                    {affiliateStats.pendingEarnings > 0 && (
                      <button 
                        className="process-earnings-btn"
                        onClick={handleProcessPendingEarnings}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="loading-spinner-small"></div>
                            Traitement...
                          </>
                        ) : (
                          <>
                            🔄 Traiter les gains
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="earning-card confirmed">
                  <div className="earning-icon">✅</div>
                  <div className="earning-info">
                    <div className="earning-amount">{formatPoints(affiliateStats.confirmedEarnings)}</div>
                    <div className="earning-label">Points confirmés</div>
                    <div className="earning-desc">Déjà crédités sur votre compte</div>
                  </div>
                </div>
                
                <div className="earning-card total">
                  <div className="earning-icon">🎯</div>
                  <div className="earning-info">
                    <div className="earning-amount">{formatPoints(affiliateStats.totalPointsEarned)}</div>
                    <div className="earning-label">Total gagné</div>
                    <div className="earning-desc">Depuis le début</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment ça marche */}
            <div className="how-it-works">
              <h3>🎯 Comment maximiser vos gains</h3>
              <div className="tips-grid">
                <div className="tip-card">
                  <div className="tip-icon">🔗</div>
                  <h4>1. Créez vos liens</h4>
                  <p>Visitez les stores de vos vendeurs préférés et cliquez sur "Partager" pour générer votre lien unique.</p>
                </div>
                
                <div className="tip-card">
                  <div className="tip-icon">📱</div>
                  <h4>2. Partagez intelligemment</h4>
                  <p>Partagez sur les réseaux sociaux, dans des groupes, ou directement avec vos amis passionnés de beauté.</p>
                </div>
                
                <div className="tip-card">
                  <div className="tip-icon">💰</div>
                  <h4>3. Gagnez 5% en points</h4>
                  <p>À chaque commande passée via votre lien, vous gagnez 5% du montant en points utilisables sur vos achats.</p>
                </div>
                
                <div className="tip-card">
                  <div className="tip-icon">🎁</div>
                  <h4>4. Utilisez vos points</h4>
                  <p>Vos points sont automatiquement crédités et utilisables pour réduire le coût de vos prochains achats.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'links' && (
          <div className="links-tab">
            <div className="links-header">
              <h3>🔗 Mes liens d'affiliation</h3>
              <p>Gérez et suivez la performance de vos liens de partage</p>
            </div>

            {affiliateLinks && affiliateLinks.length > 0 ? (
              <div className="links-list">
                {affiliateLinks.map((link) => (
                  <div key={link._id} className="link-card">
                    <div className="link-header">
                      <div className="seller-info">
                        <div className="seller-avatar">
                          {link.sellerName?.charAt(0)?.toUpperCase() || 'V'}
                        </div>
                        <div className="seller-details">
                          <h4>{link.sellerName}</h4>
                          {link.sellerCompany && <p>{link.sellerCompany}</p>}
                        </div>
                      </div>
                      
                      <div className="link-stats">
                        <div className="stat">
                          <span className="stat-value">{link.clicksCount}</span>
                          <span className="stat-label">Clics</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{link.conversionsCount}</span>
                          <span className="stat-label">Commandes</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{formatPoints(link.totalEarnings)}</span>
                          <span className="stat-label">Points</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="link-url">
                      <input
                        type="text"
                        value={link.linkUrl}
                        readOnly
                        className="link-input"
                      />
                      <button
                        onClick={() => copyToClipboard(link.linkUrl)}
                        className="copy-link-btn"
                      >
                        📋 Copier
                      </button>
                    </div>
                    
                    <div className="link-footer">
                      <span className="link-date">
                        Créé le {formatDate(link.createdAt)}
                      </span>
                      <span className="link-code">
                        Code: {link.linkCode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-links">
                <div className="empty-icon">🔗</div>
                <h3>Aucun lien créé</h3>
                <p>Visitez un store et cliquez sur "Partager" pour créer votre premier lien d'affiliation !</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'orders' && (
          <div className="orders-tab">
            <div className="orders-header">
              <h3>📦 Commandes via mes liens</h3>
              <p>Toutes les commandes passées grâce à vos liens d'affiliation</p>
            </div>

            {affiliateOrders && affiliateOrders.length > 0 ? (
              <div className="orders-list">
                {affiliateOrders.map((orderData) => (
                  <div key={orderData._id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <div className="order-number">
                          <span className="order-icon">📋</span>
                          <strong>{orderData.order.orderNumber}</strong>
                        </div>
                        <div className="order-date">
                          {formatDate(orderData.order.createdAt)}
                        </div>
                      </div>
                      
                      <div className="order-status">
                        <span className={`status-badge ${orderData.order.status}`}>
                          {orderData.order.status === 'confirmed' && '✅ Confirmée'}
                          {orderData.order.status === 'preparing' && '📦 En préparation'}
                          {orderData.order.status === 'shipped' && '🚚 Expédiée'}
                          {orderData.order.status === 'delivered' && '✅ Livrée'}
                          {orderData.order.status === 'cancelled' && '❌ Annulée'}
                          {orderData.order.status === 'pending' && '⏳ En attente'}
                        </span>
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="product-info">
                        <h4>{orderData.order.productName}</h4>
                        <p>Quantité: {orderData.order.quantity}</p>
                      </div>
                      
                      <div className="buyer-info">
                        <div className="buyer-avatar">
                          {orderData.buyer?.firstName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="buyer-details">
                          <span className="buyer-name">
                            {orderData.buyer?.firstName} {orderData.buyer?.lastName}
                          </span>
                          <span className="buyer-email">{orderData.buyer?.email}</span>
                        </div>
                      </div>

                      <div className="seller-info">
                        <span className="seller-label">Vendeur:</span>
                        <span className="seller-name">
                          {orderData.seller?.firstName} {orderData.seller?.lastName}
                          {orderData.seller?.companyName && ` (${orderData.seller.companyName})`}
                        </span>
                      </div>
                    </div>

                    <div className="order-earnings">
                      <div className="earnings-info">
                        <div className="earning-amount">
                          <span className="earning-icon">💰</span>
                          <span className="points">{formatPoints(orderData.pointsEarned)} points</span>
                        </div>
                        <div className="earning-details">
                          <span className="order-total">Commande: {orderData.orderAmount}€</span>
                          <span className="earning-rate">({(orderData.pointsRate * 100).toFixed(1)}%)</span>
                        </div>
                      </div>
                      
                      <div className="earning-status">
                        <span className={`earning-badge ${orderData.status}`}>
                          {orderData.status === 'pending' && '⏳ En attente'}
                          {orderData.status === 'confirmed' && '✅ Confirmé'}
                          {orderData.status === 'cancelled' && '❌ Annulé'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-orders">
                <div className="empty-icon">📦</div>
                <h3>Aucune commande pour le moment</h3>
                <p>Les commandes passées via vos liens d'affiliation apparaîtront ici</p>
                <div className="empty-tip">
                  <span>💡</span>
                  <span>Partagez vos liens pour commencer à gagner des points !</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'earnings' && (
          <div className="earnings-tab">
            <div className="earnings-header">
              <h3>💰 Détail des gains</h3>
              <p>Suivez vos gains en temps réel</p>
            </div>

            <div className="earnings-overview">
              <div className="earnings-chart-placeholder">
                <div className="chart-icon">📊</div>
                <p>Graphique des gains (à venir)</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'transactions' && (
          <div className="transactions-tab">
            <div className="transactions-header">
              <h3>📋 Historique des transactions</h3>
              <p>Toutes vos transactions de points</p>
            </div>

            {pointTransactions && pointTransactions.length > 0 ? (
              <div className="transactions-list">
                {pointTransactions.map((transaction) => (
                  <div key={transaction._id} className={`transaction-card ${transaction.type}`}>
                    <div className="transaction-icon">
                      {transaction.type === 'earned' && '💰'}
                      {transaction.type === 'spent' && '🛒'}
                      {transaction.type === 'bonus' && '🎁'}
                      {transaction.type === 'refund' && '↩️'}
                    </div>
                    
                    <div className="transaction-info">
                      <div className="transaction-desc">{transaction.description}</div>
                      <div className="transaction-date">{formatDate(transaction.createdAt)}</div>
                    </div>
                    
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                        {transaction.amount > 0 ? '+' : ''}{formatPoints(transaction.amount)}
                      </span>
                      <span className="balance">Solde: {formatPoints(transaction.balanceAfter)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-transactions">
                <div className="empty-icon">📋</div>
                <h3>Aucune transaction</h3>
                <p>Vos transactions de points apparaîtront ici</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AffiliateTab
