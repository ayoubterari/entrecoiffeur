import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../lib/convex'
import { Bell, Search } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const Header = ({ userFirstName, userId }) => {
  // Get user data for avatar
  const userData = useQuery(api.auth.getUserById, userId ? { userId } : "skip")
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    userData?.avatar ? { storageId: userData.avatar } : "skip"
  )
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">EntreCoiffeur</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="h-9 w-64 rounded-md border border-input bg-background pl-8 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-600" />
        </Button>

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
