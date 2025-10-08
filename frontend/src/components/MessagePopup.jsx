import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import './MessagePopup.css'

const MessagePopup = ({ isOpen, onClose, sellerId, sellerName, currentUserId, existingConversationId }) => {
  const [message, setMessage] = useState('')
  const [conversationId, setConversationId] = useState(existingConversationId || null)
  const messagesEndRef = useRef(null)

  // Mutations
  const startConversation = useMutation(api.messaging.startConversation)
  const sendMessage = useMutation(api.messaging.sendMessage)
  const markAsRead = useMutation(api.messaging.markConversationAsRead)

  // Queries
  const messages = useQuery(
    api.messaging.getConversationMessages,
    conversationId && currentUserId ? { conversationId, userId: currentUserId } : "skip"
  )


  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Set conversation ID when existingConversationId changes or reset when popup closes
  useEffect(() => {
    if (isOpen && existingConversationId) {
      setConversationId(existingConversationId)
    } else if (!isOpen) {
      // Reset conversation ID when popup closes if it was an existing conversation
      if (existingConversationId) {
        setConversationId(null)
      }
    }
  }, [existingConversationId, isOpen])

  // Start conversation when popup opens (only if no existing conversation)
  useEffect(() => {
    if (isOpen && currentUserId && sellerId && !conversationId && !existingConversationId) {
      handleStartConversation()
    }
  }, [isOpen, currentUserId, sellerId, existingConversationId])

  // Mark as read when conversation is opened
  useEffect(() => {
    if (conversationId && currentUserId && isOpen) {
      markAsRead({ conversationId, userId: currentUserId })
    }
  }, [conversationId, currentUserId, isOpen])

  const handleStartConversation = async () => {
    if (!currentUserId || !sellerId) return

    try {
      const newConversationId = await startConversation({
        buyerId: currentUserId,
        sellerId: sellerId
      })
      setConversationId(newConversationId)
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !conversationId || !currentUserId || !sellerId) return

    try {
      await sendMessage({
        conversationId,
        senderId: currentUserId,
        receiverId: sellerId,
        content: message.trim(),
        messageType: "text"
      })
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="message-popup-overlay" onClick={onClose}>
      <div className="message-popup" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="message-popup-header">
          <div className="seller-info">
            <div className="seller-avatar">
              <span className="avatar-letter">
                {sellerName?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>
            <div className="seller-details">
              <h3>{sellerName}</h3>
              <span className="online-status">En ligne</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {!messages || messages.length === 0 ? (
            <div className="no-messages">
              <div className="welcome-message">
                <span className="welcome-icon">💬</span>
                <h4>Commencez la conversation</h4>
                <p>Envoyez votre premier message à {sellerName}</p>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <p>{msg.content}</p>
                    <span className="message-time">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form className="message-input-form" onSubmit={handleSendMessage}>
          <div className="input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="message-input"
              maxLength={500}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!message.trim()}
            >
              <span className="send-icon">➤</span>
            </button>
          </div>
          <div className="input-footer">
            <span className="char-count">{message.length}/500</span>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default MessagePopup
