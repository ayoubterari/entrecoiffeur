import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import MessagePopup from '../components/MessagePopup'
import './Messages.css'

const Messages = () => {
  const [currentUserId, setCurrentUserId] = useState(null)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUserId(localStorage.getItem('userId'))
    }
  }, [])

  // Queries
  const conversations = useQuery(
    api.messaging.getUserConversations,
    currentUserId ? { userId: currentUserId } : "skip"
  )

  const unreadCount = useQuery(
    api.messaging.getUnreadMessageCount,
    currentUserId ? { userId: currentUserId } : "skip"
  )

  // Mutations
  const markAsRead = useMutation(api.messaging.markConversationAsRead)

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'À l\'instant'
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `Il y a ${diffInDays}j`
    }
  }

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation)
    setIsMessagePopupOpen(true)
    
    // Mark as read
    if (currentUserId) {
      markAsRead({ 
        conversationId: conversation._id, 
        userId: currentUserId 
      })
    }
  }

  const isUnread = (conversation) => {
    if (!currentUserId) return false
    
    if (conversation.userRole === 'buyer') {
      return !conversation.isReadByBuyer
    } else {
      return !conversation.isReadBySeller
    }
  }

  if (!currentUserId) {
    return (
      <div className="messages-page">
        <div className="auth-required">
          <h2>Connexion requise</h2>
          <p>Vous devez être connecté pour voir vos messages</p>
        </div>
      </div>
    )
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Header */}
        <div className="messages-header">
          <h1>Messages</h1>
          {unreadCount > 0 && (
            <div className="unread-badge">
              {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="conversations-list">
          {!conversations || conversations.length === 0 ? (
            <div className="no-conversations">
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <h3>Aucune conversation</h3>
                <p>Vos conversations avec les clients apparaîtront ici</p>
              </div>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`conversation-item ${isUnread(conversation) ? 'unread' : ''}`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="conversation-avatar">
                  <span className="avatar-letter">
                    {conversation.otherParticipant?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  {isUnread(conversation) && <div className="unread-dot"></div>}
                </div>
                
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4 className="participant-name">
                      {conversation.otherParticipant?.firstName} {conversation.otherParticipant?.lastName}
                    </h4>
                    <span className="conversation-time">
                      {formatTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  
                  <div className="conversation-preview">
                    <p className="last-message">
                      {conversation.lastMessage || 'Nouvelle conversation'}
                    </p>
                    <div className="conversation-meta">
                      <span className="user-role">
                        {conversation.userRole === 'seller' ? '🏪 Vendeur' : '🛒 Acheteur'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="conversation-actions">
                  <button className="reply-btn">
                    <span>💬</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Popup */}
      {selectedConversation && (
        <MessagePopup
          isOpen={isMessagePopupOpen}
          onClose={() => {
            setIsMessagePopupOpen(false)
            setSelectedConversation(null)
          }}
          sellerId={selectedConversation.userRole === 'buyer' ? selectedConversation.sellerId : selectedConversation.buyerId}
          sellerName={`${selectedConversation.otherParticipant?.firstName} ${selectedConversation.otherParticipant?.lastName}`}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}

export default Messages
