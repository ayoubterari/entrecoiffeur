import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import UsersManagement from '../components/UsersManagement'
import ProductsManagement from '../components/ProductsManagement'
import OrdersManagement from '../components/OrdersManagement'
import CategoriesManagement from '../components/CategoriesManagement'
import BlogManagement from '../components/BlogManagement'
import CommissionManagement from '../components/CommissionManagement'
import NetVendeurManagement from '../components/NetVendeurManagement'
import PaymentConfig from '../components/PaymentConfig'
import CouponsManagement from '../components/CouponsManagement'
import SupportManagement from '../components/SupportManagement'
import './Admin.css'

const Admin = ({ isAuthenticated, userEmail, userFirstName, userLastName, userType, userId, onLogout }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  // Queries pour les données réelles
  const allUsers = useQuery(api.auth.getAllUsers)
  const allProducts = useQuery(api.products.getProducts, { limit: 1000 })
  const allOrders = useQuery(api.orders.getAllOrders)
  const allCategories = useQuery(api.products.getCategories)
  const supportStats = useQuery(api.functions.queries.support.getSupportTicketStats)

  // Calculer les statistiques
  const stats = {
    users: {
      total: allUsers?.length || 0,
      particuliers: allUsers?.filter(u => u.userType === 'particulier').length || 0,
      professionnels: allUsers?.filter(u => u.userType === 'professionnel').length || 0,
      grossistes: allUsers?.filter(u => u.userType === 'grossiste').length || 0
    },
    products: {
      total: allProducts?.length || 0,
      featured: allProducts?.filter(p => p.isFeatured).length || 0,
      onSale: allProducts?.filter(p => p.isOnSale).length || 0,
      lowStock: allProducts?.filter(p => (p.stock || 0) < 10).length || 0
    },
    orders: {
      total: allOrders?.length || 0,
      pending: allOrders?.filter(o => o.status === 'pending').length || 0,
      confirmed: allOrders?.filter(o => o.status === 'confirmed').length || 0,
      revenue: allOrders?.reduce((total, order) => {
        const orderTotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
        return total + orderTotal
      }, 0) || 0
    },
    categories: {
      total: allCategories?.length || 0,
      withIcons: allCategories?.filter(c => c.icon && c.icon !== '📦').length || 0,
      withDescriptions: allCategories?.filter(c => c.description).length || 0
    },
    support: {
      total: supportStats?.totalTickets || 0,
      open: supportStats?.openTickets || 0,
      inProgress: supportStats?.inProgressTickets || 0,
      resolved: supportStats?.resolvedTickets || 0
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  useEffect(() => {
    // Récupérer le userType depuis localStorage pour être sûr
    const storedUserType = localStorage.getItem('userType')
    
    console.log('Admin - isAuthenticated:', isAuthenticated)
    console.log('Admin - userEmail:', userEmail)
    console.log('Admin - userType prop:', userType)
    console.log('Admin - storedUserType:', storedUserType)

    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      console.log('Admin - Not authenticated, redirecting to home')
      navigate('/')
      return
    }

    // Vérifier si c'est un superadmin
    const isSuperAdmin = storedUserType === 'superadmin'
    
    if (!isSuperAdmin) {
      console.log('Admin - Not superadmin, redirecting to dashboard')
      navigate('/dashboard')
      return
    }

    console.log('Admin - Access granted!')
  }, [isAuthenticated, userType, userEmail, navigate])

  // Récupérer le userType depuis localStorage aussi
  const storedUserType = localStorage.getItem('userType')
  const isSuperAdmin = storedUserType === 'superadmin'

  // Si pas authentifié ou pas superadmin, afficher loading
  if (!isAuthenticated || !isSuperAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
        <h2>🔄 Vérification des permissions...</h2>
        <p>Redirection en cours...</p>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header Admin */}
        <div className="admin-header">
          <div className="admin-welcome">
            <div className="welcome-icon">👑</div>
            <div className="welcome-content">
              <h1>Welcome Admin</h1>
              <p>Panneau d'administration - Entre Coiffeur</p>
            </div>
          </div>
          
          <div className="admin-user-info">
            <div className="admin-avatar">
              <span>{userFirstName?.charAt(0) || 'A'}</span>
            </div>
            <div className="admin-details">
              <h3>{userFirstName} {userLastName}</h3>
              <p>{userEmail}</p>
              <span className="admin-badge">🔒 Super Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation Admin */}
        <div className="admin-nav">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            <span>Utilisateurs</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span className="nav-icon">📦</span>
            <span>Produits</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <span className="nav-icon">🏷️</span>
            <span>Catégories</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon">📋</span>
            <span>Commandes</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'commissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('commissions')}
          >
            <span className="nav-icon">💰</span>
            <span>Commissions</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'netvendeur' ? 'active' : ''}`}
            onClick={() => setActiveTab('netvendeur')}
          >
            <span className="nav-icon">💸</span>
            <span>Net Vendeur</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'paiement' ? 'active' : ''}`}
            onClick={() => setActiveTab('paiement')}
          >
            <span className="nav-icon">💳</span>
            <span>Paiement</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => setActiveTab('blog')}
          >
            <span className="nav-icon">📝</span>
            <span>Blog</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            <span className="nav-icon">🎫</span>
            <span>Coupons</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <span className="nav-icon">🎧</span>
            <span>Support</span>
            {stats.support.open > 0 && (
              <span className="nav-badge">{stats.support.open}</span>
            )}
          </div>
          <div 
            className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <span className="nav-icon">📈</span>
            <span>Statistiques</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span>Paramètres</span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="admin-main">
          {activeTab === 'dashboard' && (
            <div className="admin-welcome-section">
              <div className="welcome-card">
                <div className="welcome-card-header">
                  <h2>🎉 Bienvenue dans l'administration</h2>
                  <p>Gérez votre plateforme Entre Coiffeur</p>
                </div>
                
                <div className="admin-stats-preview">
                  <div className="stat-preview-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <h3>{stats.users.total}</h3>
                      <p>Utilisateurs</p>
                      <div className="stat-breakdown">
                        <span>👤 {stats.users.particuliers} • 💼 {stats.users.professionnels} • 🏢 {stats.users.grossistes}</span>
                      </div>
                    </div>
                  </div>
                  <div className="stat-preview-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                      <h3>{stats.products.total}</h3>
                      <p>Produits</p>
                      <div className="stat-breakdown">
                        <span>✨ {stats.products.featured} • 🏷️ {stats.products.onSale} • ⚠️ {stats.products.lowStock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="stat-preview-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                      <h3>{stats.orders.total}</h3>
                      <p>Commandes</p>
                      <div className="stat-breakdown">
                        <span>⏳ {stats.orders.pending} • ✅ {stats.orders.confirmed}</span>
                      </div>
                    </div>
                  </div>
                  <div className="stat-preview-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                      <h3>{formatPrice(stats.orders.revenue)}</h3>
                      <p>Chiffre d'affaires</p>
                      <div className="stat-breakdown">
                        <span>📈 Total des ventes</span>
                      </div>
                    </div>
                  </div>
                  <div className="stat-preview-card">
                    <div className="stat-icon">🎧</div>
                    <div className="stat-info">
                      <h3>{stats.support.total}</h3>
                      <p>Tickets Support</p>
                      <div className="stat-breakdown">
                        <span>🔓 {stats.support.open} • ⏳ {stats.support.inProgress} • ✅ {stats.support.resolved}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-actions">
                <div className="action-card quick-actions">
                  <div className="card-header">
                    <div className="action-icon">🚀</div>
                    <h3>Actions rapides</h3>
                  </div>
                  <div className="quick-actions-grid">
                    <button 
                      className="quick-action-item users"
                      onClick={() => setActiveTab('users')}
                    >
                      <div className="quick-icon">👥</div>
                      <div className="quick-content">
                        <h4>Utilisateurs</h4>
                        <p>Gérer les comptes</p>
                      </div>
                      <div className="quick-arrow">→</div>
                    </button>
                    
                    <button 
                      className="quick-action-item products"
                      onClick={() => setActiveTab('products')}
                    >
                      <div className="quick-icon">📦</div>
                      <div className="quick-content">
                        <h4>Produits</h4>
                        <p>Catalogue & stock</p>
                      </div>
                      <div className="quick-arrow">→</div>
                    </button>
                    
                    <button 
                      className="quick-action-item orders"
                      onClick={() => setActiveTab('orders')}
                    >
                      <div className="quick-icon">📋</div>
                      <div className="quick-content">
                        <h4>Commandes</h4>
                        <p>Suivi & statuts</p>
                      </div>
                      <div className="quick-arrow">→</div>
                    </button>
                    
                    <button 
                      className="quick-action-item coupons"
                      onClick={() => setActiveTab('coupons')}
                    >
                      <div className="quick-icon">🎫</div>
                      <div className="quick-content">
                        <h4>Coupons</h4>
                        <p>Codes de réduction</p>
                      </div>
                      <div className="quick-arrow">→</div>
                    </button>
                    
                    <button 
                      className="quick-action-item support"
                      onClick={() => setActiveTab('support')}
                    >
                      <div className="quick-icon">🎧</div>
                      <div className="quick-content">
                        <h4>Support</h4>
                        <p>Tickets clients</p>
                        {stats.support.open > 0 && (
                          <span className="urgent-badge">{stats.support.open} ouverts</span>
                        )}
                      </div>
                      <div className="quick-arrow">→</div>
                    </button>
                    
                    <button 
                      className="quick-action-item stats"
                      onClick={() => setActiveTab('stats')}
                    >
                      <div className="quick-icon">📊</div>
                      <div className="quick-content">
                        <h4>Statistiques</h4>
                        <p>Rapports & analytics</p>
                      </div>
                      <div className="quick-arrow">→</div>
                    </button>
                  </div>
                </div>

                <div className="action-card activity-card">
                  <div className="card-header">
                    <div className="action-icon">📈</div>
                    <h3>Activité récente</h3>
                  </div>
                  <div className="activity-list">
                    {stats.orders.pending > 0 && (
                      <div className="activity-item urgent">
                        <span className="activity-icon pending">⏳</span>
                        <div className="activity-content">
                          <span className="activity-text">{stats.orders.pending} commande(s) en attente</span>
                          <span className="activity-action" onClick={() => setActiveTab('orders')}>Traiter →</span>
                        </div>
                      </div>
                    )}
                    
                    {stats.support.open > 0 && (
                      <div className="activity-item urgent">
                        <span className="activity-icon support">🎧</span>
                        <div className="activity-content">
                          <span className="activity-text">{stats.support.open} ticket(s) de support ouverts</span>
                          <span className="activity-action" onClick={() => setActiveTab('support')}>Traiter →</span>
                        </div>
                      </div>
                    )}
                    
                    {stats.products.lowStock > 0 && (
                      <div className="activity-item warning">
                        <span className="activity-icon warning">⚠️</span>
                        <div className="activity-content">
                          <span className="activity-text">{stats.products.lowStock} produit(s) en rupture</span>
                          <span className="activity-action" onClick={() => setActiveTab('products')}>Voir →</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="activity-item info">
                      <span className="activity-icon success">✅</span>
                      <div className="activity-content">
                        <span className="activity-text">Système opérationnel</span>
                        <span className="activity-time">Maintenant</span>
                      </div>
                    </div>
                    
                    <div className="activity-item info">
                      <span className="activity-icon info">📊</span>
                      <div className="activity-content">
                        <span className="activity-text">Données synchronisées</span>
                        <span className="activity-time">Il y a 2 min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UsersManagement />
          )}

          {activeTab === 'products' && (
            <ProductsManagement />
          )}

          {activeTab === 'categories' && (
            <CategoriesManagement />
          )}

          {activeTab === 'orders' && (
            <OrdersManagement />
          )}

          {activeTab === 'commissions' && (
            <CommissionManagement />
          )}

          {activeTab === 'netvendeur' && (
            <NetVendeurManagement />
          )}

          {activeTab === 'paiement' && (
            <PaymentConfig />
          )}

          {activeTab === 'blog' && (
            <BlogManagement userEmail={userEmail} />
          )}

          {activeTab === 'coupons' && (
            <CouponsManagement />
          )}

          {activeTab === 'support' && (
            <SupportManagement adminId={userId} />
          )}

          {activeTab === 'stats' && (
            <div className="admin-section">
              <h2>📈 Statistiques</h2>
              <p>Section en cours de développement...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="admin-section">
              <h2>⚙️ Paramètres</h2>
              <p>Section en cours de développement...</p>
            </div>
          )}
        </div>

        {/* Footer Admin */}
        <div className="admin-footer">
          <p>&copy; 2025 Entre Coiffeur - Administration</p>
          <div className="footer-actions">
            <button 
              className="logout-btn"
              onClick={() => {
                console.log('Admin - Logout clicked')
                // Nettoyage complet du localStorage
                localStorage.removeItem('userId')
                localStorage.removeItem('userEmail')
                localStorage.removeItem('userFirstName')
                localStorage.removeItem('userLastName')
                localStorage.removeItem('userType')
                localStorage.removeItem('companyName')
                
                // Appeler onLogout si fourni
                if (onLogout) {
                  onLogout()
                }
                
                // Redirection forcée
                window.location.href = '/'
              }}
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
