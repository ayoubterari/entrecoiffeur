import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import Sidebar from '../components/dashboardv2/Sidebar'
import Header from '../components/dashboardv2/Header'
import ProfileModule from '../components/dashboardv2/ProfileModule'
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
          <Header userFirstName={userFirstName} userId={userId} />
        </div>
        
        {/* Main content with top padding for fixed header */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 mt-16">
          {activeTab === 'profile' && (
            <ProfileModule 
              userId={userId}
              userEmail={userEmail}
              userFirstName={userFirstName}
              userLastName={userLastName}
              userType={userType}
              companyName={companyName}
            />
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
