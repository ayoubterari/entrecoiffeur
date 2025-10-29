import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import Sidebar from '../components/adminv2/Sidebar'
import Header from '../components/adminv2/Header'
import DashboardContent from '../components/adminv2/DashboardContent'
import UsersModule from '../components/adminv2/UsersModule'
import ProductsModule from '../components/adminv2/ProductsModule'
import CategoriesModule from '../components/adminv2/CategoriesModule'
import OrdersModule from '../components/adminv2/OrdersModule'
import CommissionsModule from '../components/adminv2/CommissionsModule'
import NetVendeurModule from '../components/adminv2/NetVendeurModule'
import PaymentModule from '../components/adminv2/PaymentModule'
import BlogModule from '../components/adminv2/BlogModule'
import CouponsModule from '../components/adminv2/CouponsModule'
import SupportModule from '../components/adminv2/SupportModule'
import StatisticsModule from '../components/adminv2/StatisticsModule'
import SettingsModule from '../components/adminv2/SettingsModule'
import AccountChangeRequestsModule from '../components/adminv2/AccountChangeRequestsModule'
import '../styles/adminv2.css'

const AdminV2 = ({ isAuthenticated, userEmail, userFirstName, userLastName, userType, userId, onLogout }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Récupérer les permissions de l'utilisateur
  const userPermissions = useQuery(
    api.functions.queries.adminUsers.getUserPermissions,
    userId ? { userId } : 'skip'
  )

  // Queries pour les données réelles
  const allUsers = useQuery(api.auth.getAllUsers)
  const allProducts = useQuery(api.products.getProducts, { limit: 1000 })
  const allOrders = useQuery(api.orders.getAllOrders)
  const allCategories = useQuery(api.products.getCategories)
  const supportStats = useQuery(api.functions.queries.support.getSupportTicketStats)

  // Fonction pour vérifier l'accès à un module
  const hasAccess = (module) => {
    // Si userType est superadmin (compte principal), accès complet
    if (userType === 'superadmin') {
      return true
    }

    // Si pas de permissions chargées, pas d'accès (sécurité)
    if (!userPermissions) {
      return false
    }

    // Si le compte est désactivé
    if (!userPermissions.isActive) {
      return false
    }

    // Si superadmin role dans adminUsers, accès complet
    if (userPermissions.role === 'superadmin') {
      return true
    }

    // Vérifier la permission spécifique
    return userPermissions.permissions?.[module] || false
  }

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

  useEffect(() => {
    // Récupérer le userType depuis localStorage pour être sûr
    const storedUserType = localStorage.getItem('userType')
    
    console.log('AdminV2 - isAuthenticated:', isAuthenticated)
    console.log('AdminV2 - userEmail:', userEmail)
    console.log('AdminV2 - userType prop:', userType)
    console.log('AdminV2 - storedUserType:', storedUserType)

    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      console.log('AdminV2 - Not authenticated, redirecting to home')
      navigate('/')
      return
    }

    console.log('AdminV2 - Access granted!')
  }, [isAuthenticated, userType, userEmail, navigate])

  // Rediriger vers le premier module accessible si l'utilisateur n'a pas accès au module actuel
  useEffect(() => {
    if (userPermissions && !hasAccess(activeTab)) {
      // Trouver le premier module accessible
      const modules = ['dashboard', 'users', 'products', 'categories', 'orders', 'commissions', 'netvendeur', 'paiement', 'blog', 'coupons', 'support', 'stats', 'settings']
      const firstAccessibleModule = modules.find(module => hasAccess(module))
      
      if (firstAccessibleModule) {
        setActiveTab(firstAccessibleModule)
      }
    }
  }, [userPermissions, activeTab])

  // Si pas authentifié, afficher loading
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold">🔄 Vérification des permissions...</h2>
          <p className="text-muted-foreground mt-2">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  // Si pas superadmin, attendre le chargement des permissions
  if (userType !== 'superadmin' && userPermissions === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold">🔄 Chargement des permissions...</h2>
          <p className="text-muted-foreground mt-2">Veuillez patienter...</p>
        </div>
      </div>
    )
  }

  // Si pas superadmin et pas de permissions trouvées, accès refusé
  if (userType !== 'superadmin' && userPermissions === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold">🚫 Accès refusé</h2>
          <p className="text-muted-foreground mt-2">Vous n'avez pas les permissions nécessaires pour accéder à cette interface.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Drawer sur mobile, fixe sur desktop */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        hasAccess={hasAccess}
      />

      {/* Main Content - Full width sur mobile, offset sur desktop */}
      <div className="flex flex-1 flex-col overflow-hidden md:ml-64">
        {/* Header */}
        <Header 
          userFirstName={userFirstName}
          userLastName={userLastName}
          userEmail={userEmail}
          onLogout={onLogout}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {activeTab === 'dashboard' && hasAccess('dashboard') && (
            <DashboardContent stats={stats} />
          )}

          {activeTab === 'users' && hasAccess('users') && (
            <UsersModule />
          )}

          {activeTab === 'products' && hasAccess('products') && (
            <ProductsModule />
          )}

          {activeTab === 'categories' && hasAccess('categories') && (
            <CategoriesModule />
          )}

          {activeTab === 'orders' && hasAccess('orders') && (
            <OrdersModule />
          )}

          {activeTab === 'commissions' && hasAccess('commissions') && (
            <CommissionsModule />
          )}

          {activeTab === 'netvendeur' && hasAccess('netvendeur') && (
            <NetVendeurModule />
          )}

          {activeTab === 'paiement' && hasAccess('paiement') && (
            <PaymentModule />
          )}

          {activeTab === 'blog' && hasAccess('blog') && (
            <BlogModule userEmail={userEmail} />
          )}

          {activeTab === 'coupons' && hasAccess('coupons') && (
            <CouponsModule />
          )}

          {activeTab === 'support' && hasAccess('support') && (
            <SupportModule userId={userId} />
          )}

          {activeTab === 'stats' && hasAccess('stats') && (
            <StatisticsModule />
          )}

          {activeTab === 'settings' && hasAccess('settings') && (
            <SettingsModule currentUserId={userId} />
          )}

          {activeTab === 'account-change-requests' && hasAccess('settings') && (
            <AccountChangeRequestsModule currentUserId={userId} />
          )}

          {/* Message si pas d'accès */}
          {!hasAccess(activeTab) && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold">🚫 Accès refusé</h2>
                <p className="text-muted-foreground mt-2">
                  Vous n'avez pas la permission d'accéder à ce module.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminV2
