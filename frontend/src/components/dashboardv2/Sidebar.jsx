import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  ShoppingCart, 
  Package, 
  ClipboardList, 
  MessageSquare, 
  Headphones, 
  DollarSign, 
  Frown, 
  BarChart3, 
  Settings, 
  Wrench,
  Ticket,
  Home
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Avatar, AvatarFallback } from '../ui/avatar'

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  userFirstName, 
  userLastName, 
  userEmail, 
  userType, 
  companyName,
  unreadCount,
  isGroupMember 
}) => {
  const navigate = useNavigate()

  const getMenuItems = () => {
    const baseItems = [
      { id: 'profile', name: 'Profil', icon: User },
      { id: 'purchases', name: 'Mes achats', icon: ShoppingCart },
    ]
    
    // Ajouter les onglets de vente uniquement pour professionnels et grossistes
    if (userType === 'professionnel' || userType === 'grossiste') {
      baseItems.push(
        { id: 'products', name: 'Mes Produits', icon: Package },
        { id: 'orders', name: 'Mes ventes', icon: ClipboardList }
      )
    }
    
    // Ajouter Messages
    baseItems.push(
      { id: 'messages', name: 'Messages', icon: MessageSquare, badge: unreadCount }
    )
    
    return baseItems
  }

  const menuItems = getMenuItems()

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'particulier':
        return '👤 Particulier'
      case 'professionnel':
        return '💼 Professionnel'
      case 'grossiste':
        return '🏢 Grossiste'
      default:
        return 'Utilisateur'
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <h2 className="text-lg font-semibold">Dashboard V2</h2>
      </div>

      {/* User Info */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userFirstName ? userFirstName.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">
              {userFirstName ? `${userFirstName} ${userLastName || ''}` : 'Utilisateur'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {getUserTypeLabel()}
          </span>
          {companyName && (
            <p className="mt-2 truncate text-xs text-muted-foreground">{companyName}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeTab === item.id && "bg-secondary"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.name}
              {item.badge > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Button>
          )
        })}
      </nav>

      <Separator />

      {/* Footer Actions */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/dashboard')}
        >
          <Home className="mr-2 h-4 w-4" />
          Dashboard V1
        </Button>
        <Button
          variant="outline"
          className="mt-2 w-full justify-start"
          onClick={() => navigate('/')}
        >
          <Home className="mr-2 h-4 w-4" />
          Marketplace
        </Button>
      </div>
    </aside>
  )
}

export default Sidebar
