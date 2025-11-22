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
import SupportModule from '../components/dashboardv2/SupportModule'
import ComplaintsModule from '../components/dashboardv2/ComplaintsModule'
import CouponsModule from '../components/dashboardv2/CouponsModule'
import BusinessSalesModule from '../components/dashboardv2/BusinessSalesModule'
import AccountChangeRequest from '../components/dashboardv2/AccountChangeRequest'
import TeamModule from '../components/dashboardv2/TeamModule'
import AnnoncesModule from '../components/dashboardv2/AnnoncesModule'
import MyReviewsTab from '../components/MyReviewsTab'
import PushNotificationManager from '../components/PushNotificationManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import '../styles/dashboardv2.css'

const DashboardV2 = ({ userEmail, userFirstName, userLastName, userId, userType, companyName }) => {
  const [activeTab, setActiveTab] = useState('profile')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Get current user data to check group membership
  const currentUser = useQuery(api.auth.getCurrentUser, userId ? { userId } : "skip")
  
  // Get unread message count
  const unreadCount = useQuery(api.messaging.getUnreadMessageCount,
    userId ? { userId } : "skip"
  )

  // Get user permissions if they are a sub-user
  const userPermissions = useQuery(api.functions.queries.sellerUsers.getUserPermissions,
    userId ? { userId } : "skip"
  )

  // Get buyer reviews
  const buyerReviews = useQuery(api.orderReviews.getBuyerReviews,
    userId ? { buyerId: userId, limit: 50 } : "skip"
  )

  // Check if user has access to a module
  const hasAccess = (module) => {
    // If not a sub-user, they have full access
    if (!userPermissions || !userPermissions.isSubUser) {
      return true
    }

    // If account is disabled, no access
    if (!userPermissions.isActive) {
      return false
    }

    // Check specific permission
    return userPermissions.permissions?.[module] || false
  }

  return (
    <div className="dashboard-v2-container flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Drawer sur mobile, fixe sur desktop */}
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
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        userPermissions={userPermissions}
        hasAccess={hasAccess}
      />

      {/* Main Content - Full width sur mobile, offset sur desktop */}
      <div className="flex flex-1 flex-col overflow-hidden md:ml-64">
        {/* Header - Fixed at top */}
        <div className="fixed right-0 top-0 z-30 w-full md:w-[calc(100%-16rem)] bg-background border-b">
          <Header 
            userFirstName={userFirstName} 
            userId={userId}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />
        </div>
        
        {/* Main content with top padding for fixed header */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 mt-16">
          {activeTab === 'profile' && hasAccess('profile') && (
            <>
              {/* Gestionnaire de notifications push pour vendeurs */}
              {(userType === 'professionnel' || userType === 'grossiste') && (
                <PushNotificationManager 
                  userId={userId} 
                  userType={userType} 
                />
              )}
              
              <ProfileModule 
                userId={userId}
                userEmail={userEmail}
                userFirstName={userFirstName}
                userLastName={userLastName}
                userType={userType}
                companyName={companyName}
              />
            </>
          )}

          {activeTab === 'purchases' && hasAccess('purchases') && (
            <PurchasesModule userId={userId} />
          )}

          {activeTab === 'reviews' && (
            <MyReviewsTab buyerReviews={buyerReviews} />
          )}

          {(userType === 'professionnel' || userType === 'grossiste') && activeTab === 'announcements' && hasAccess('announcements') && (
            <AnnoncesModule 
              userId={userId} 
              userType={userType}
            />
          )}

          {(userType === 'professionnel' || userType === 'grossiste') && activeTab === 'orders' && hasAccess('orders') && (
            <OrdersModule userId={userId} />
          )}

          {activeTab === 'messages' && hasAccess('messages') && (
            <MessagesModule userId={userId} />
          )}

          {activeTab === 'support' && hasAccess('support') && (
            <SupportModule userId={userId} userEmail={userEmail} />
          )}

          {(userType === 'professionnel' || userType === 'grossiste') && activeTab === 'complaints' && hasAccess('complaints') && (
            <ComplaintsModule userId={userId} userEmail={userEmail} />
          )}

          {(userType === 'professionnel' || userType === 'grossiste') && activeTab === 'coupons' && hasAccess('coupons') && (
            <CouponsModule userId={userId} userType={userType} />
          )}


          {(userType === 'professionnel' || userType === 'grossiste') && activeTab === 'team' && (!userPermissions || !userPermissions.isSubUser) && (
            <TeamModule userId={userId} userType={userType} />
          )}

          {activeTab === 'account-change' && (!userPermissions || !userPermissions.isSubUser) && (
            <AccountChangeRequest 
              userId={userId}
              currentType={userType}
              firstName={userFirstName}
              lastName={userLastName}
            />
          )}

          {/* Message d'accès refusé si l'utilisateur n'a pas les permissions */}
          {userPermissions && userPermissions.isSubUser && !hasAccess(activeTab) && (
            <Card>
              <CardHeader>
                <CardTitle>Accès refusé</CardTitle>
                <CardDescription>
                  Vous n'avez pas la permission d'accéder à ce module.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Contactez l'administrateur de votre compte pour obtenir l'accès à ce module.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardV2
