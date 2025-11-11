import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../lib/convex'
import { Bell, Search, Menu, Store, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useNavigate } from 'react-router-dom'

const Header = ({ userFirstName, userId, onMenuClick }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  const searchRef = useRef(null)
  const notificationsRef = useRef(null)
  
  // Get user data for avatar
  const userData = useQuery(api.auth.getUserById, userId ? { userId } : "skip")
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    userData?.avatar ? { storageId: userData.avatar } : "skip"
  )

  // Get notifications
  const notifications = useQuery(
    api.functions.queries.notifications.getUserNotifications, 
    userId ? { userId } : "skip"
  )
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0

  // Search in products
  const searchResults = useQuery(
    api.functions.queries.search.searchProducts,
    searchQuery.length >= 2 ? { query: searchQuery, limit: 5 } : "skip"
  )

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSearchResults(value.length >= 2)
  }

  const handleSearchResultClick = (productId) => {
    navigate(`/product/${productId}`)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Menu hamburger pour mobile */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button 
          variant="default" 
          className="flex items-center gap-2"
          onClick={() => navigate('/marketplace')}
        >
          <Store className="h-4 w-4" />
          <span>Marketplace</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div ref={searchRef} className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            className="h-9 w-64 rounded-md border border-input bg-background pl-8 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults && (
            <Card className="absolute top-12 left-0 w-96 max-h-96 overflow-y-auto z-50 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Résultats de recherche</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setShowSearchResults(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucun produit trouvé
                  </div>
                ) : (
                  <div className="divide-y">
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleSearchResultClick(product._id)}
                        className="w-full p-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                        <p className="font-bold text-primary">{product.price}€</p>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="p-2 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full text-sm"
                      onClick={() => {
                        navigate(`/marketplace?search=${searchQuery}`)
                        setShowSearchResults(false)
                        setSearchQuery('')
                      }}
                    >
                      Voir tous les résultats
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notifications */}
        <div ref={notificationsRef} className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <Card className="absolute top-12 right-0 w-96 max-h-96 overflow-y-auto z-50 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {!notifications || notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucune notification
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 hover:bg-muted transition-colors cursor-pointer ${
                          !notification.isRead ? 'bg-primary/5 border-l-2 border-primary' : ''
                        }`}
                        onClick={() => {
                          if (notification.link) {
                            navigate(notification.link)
                            setShowNotifications(false)
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification._creationTime).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {notifications && notifications.length > 0 && (
                  <div className="p-2 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full text-sm"
                      onClick={() => {
                        navigate('/dashboard?tab=notifications')
                        setShowNotifications(false)
                      }}
                    >
                      Voir toutes les notifications
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* User Avatar */}
        <Avatar className="h-8 w-8">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="Photo de profil" />}
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {userFirstName ? userFirstName.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

export default Header
