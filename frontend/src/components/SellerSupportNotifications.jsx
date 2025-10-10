import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import './SellerSupportNotifications.css'

const SellerSupportNotifications = ({ sellerId }) => {
  const [selectedNotification, setSelectedNotification] = useState(null)

  // Récupérer les notifications de support pour ce vendeur
  const supportNotifications = useQuery(
    api.functions.queries.notifications.getSellerSupportNotifications,
    sellerId ? { sellerId } : "skip"
  )

  // Mutation pour marquer comme lu
  const markAsRead = useMutation(api.functions.mutations.notifications.markNotificationAsRead)

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification)
    
    // Marquer comme lue si pas encore lu
    if (!notification.isRead) {
      try {
        await markAsRead({ notificationId: notification._id })
      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error)
      }
    }
  }

  if (!supportNotifications || supportNotifications.length === 0) {
    return (
      <div className="seller-support-notifications">
        <div className="notifications-header">
          <h3>🎧 Réclamations clients</h3>
        </div>
        <div className="empty-notifications">
          <div className="empty-icon">✅</div>
          <h4>Aucune réclamation</h4>
          <p>Vous n'avez reçu aucune réclamation concernant votre boutique.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="seller-support-notifications">
      <div className="notifications-header">
        <h3>🎧 Réclamations clients</h3>
        <div className="notifications-count">
          {supportNotifications.filter(n => !n.isRead).length} non lues
        </div>
      </div>

      <div className="notifications-list">
        {supportNotifications.map(notification => (
          <div 
            key={notification._id} 
            className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="notification-header">
              <div className="notification-type">
                <span className="type-icon">😠</span>
                <span className="type-label">Réclamation</span>
              </div>
              <div className="notification-date">
                {formatDate(notification.createdAt)}
              </div>
            </div>
            
            <div className="notification-content">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              
              {notification.data && (
                <div className="notification-meta">
                  <span className="ticket-number">#{notification.data.ticketNumber}</span>
                  <span className="customer-email">{notification.data.customerEmail}</span>
                </div>
              )}
            </div>
            
            {!notification.isRead && (
              <div className="unread-indicator"></div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de détails */}
      {selectedNotification && (
        <div className="notification-modal-overlay" onClick={() => setSelectedNotification(null)}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notification-modal-header">
              <h3>Détails de la réclamation</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedNotification(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="notification-modal-content">
              <div className="modal-notification-info">
                <div className="info-row">
                  <strong>Ticket:</strong> #{selectedNotification.data?.ticketNumber}
                </div>
                <div className="info-row">
                  <strong>Client:</strong> {selectedNotification.data?.customerEmail}
                </div>
                <div className="info-row">
                  <strong>Sujet:</strong> {selectedNotification.data?.subject}
                </div>
                <div className="info-row">
                  <strong>Date:</strong> {formatDate(selectedNotification.createdAt)}
                </div>
              </div>
              
              <div className="modal-notification-message">
                <h4>Message:</h4>
                <p>{selectedNotification.message}</p>
              </div>
              
              <div className="modal-actions">
                <div className="action-info">
                  <p>💡 Cette réclamation a été transmise à l'équipe support qui la traitera avec le client. Vous serez informé des suites données.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerSupportNotifications
