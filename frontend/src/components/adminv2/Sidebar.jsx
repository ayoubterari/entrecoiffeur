import React from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Tag, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Ticket, 
  Headphones, 
  BarChart3, 
  Settings,
  Home
} from 'lucide-react'
import { cn } from '../../lib/utils'

const Sidebar = ({ activeTab, setActiveTab }) => {
  const handleLogoutAndGoHome = (e) => {
    e.preventDefault()
    
    // Nettoyer toutes les données de session
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userFirstName')
    localStorage.removeItem('userLastName')
    localStorage.removeItem('userType')
    localStorage.removeItem('companyName')
    
    // Rediriger vers l'accueil
    window.location.href = '/'
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'categories', label: 'Catégories', icon: Tag },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'commissions', label: 'Commissions', icon: DollarSign },
    { id: 'netvendeur', label: 'Net Vendeur', icon: DollarSign },
    { id: 'paiement', label: 'Paiement', icon: CreditCard },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col gap-2">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-xl font-bold">EntreCoiffeur</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t p-4 space-y-2">
          <a 
            href="/"
            onClick={handleLogoutAndGoHome}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-gray-900 transition-colors cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </a>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
