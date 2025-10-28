import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import Sidebar from '../components/dashboardv2/Sidebar'
import Header from '../components/dashboardv2/Header'
import PurchasesModule from '../components/dashboardv2/PurchasesModule'
import ProductsModule from '../components/dashboardv2/ProductsModule'
import OrdersModule from '../components/dashboardv2/OrdersModule'
import MessagesModule from '../components/dashboardv2/MessagesModule'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import '../styles/dashboardv2.css'

const DashboardV2 = ({ userEmail, userFirstName, userLastName, userId, userType, companyName }) => {
  const [activeTab, setActiveTab] = useState('profile')

  // Get current user data to check group membership
  const currentUser = useQuery(api.auth.getCurrentUser, userId ? { userId } : "skip")
  
  // Get unread message count
  const unreadCount = useQuery(api.messaging.getUnreadMessageCount,
    userId ? { userId } : "skip"
  )

  return (
    <div className="dashboard-v2-container flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userFirstName={userFirstName}
          userLastName={userLastName}
          userEmail={userEmail}
          userType={userType}
          companyName={companyName}
          unreadCount={unreadCount || 0}
          isGroupMember={currentUser?.isGroupMember}
        />
      </div>

      {/* Main Content - Offset by sidebar width on desktop */}
      <div className="flex flex-1 flex-col overflow-hidden md:ml-64">
        {/* Header - Fixed at top */}
        <div className="fixed right-0 top-0 z-30 w-full md:w-[calc(100%-16rem)] bg-background border-b">
          <Header userFirstName={userFirstName} />
        </div>
        
        {/* Main content with top padding for fixed header */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 mt-16">
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Profil</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Gérez vos informations personnelles
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Informations du Profil</CardTitle>
                  <CardDescription>
                    Vos informations personnelles (lecture seule pour le moment)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prénom</label>
                      <input
                        type="text"
                        value={userFirstName || ''}
                        readOnly
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom</label>
                      <input
                        type="text"
                        value={userLastName || ''}
                        readOnly
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={userEmail || ''}
                      readOnly
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type de compte</label>
                    <input
                      type="text"
                      value={
                        userType === 'particulier' ? '👤 Particulier' :
                        userType === 'professionnel' ? '💼 Professionnel' :
                        userType === 'grossiste' ? '🏢 Grossiste' : 'Non défini'
                      }
                      readOnly
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {companyName && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Entreprise</label>
                      <input
                        type="text"
                        value={companyName}
                        readOnly
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'purchases' && (
            <PurchasesModule userId={userId} />
          )}

          {activeTab === 'products' && (
            <ProductsModule userId={userId} userType={userType} />
          )}

          {(userType === 'professionnel' || userType === 'grossiste') && activeTab === 'orders' && (
            <OrdersModule userId={userId} />
          )}

          {activeTab === 'messages' && (
            <MessagesModule userId={userId} />
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardV2
