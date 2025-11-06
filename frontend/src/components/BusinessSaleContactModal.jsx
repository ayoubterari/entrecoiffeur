import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'
import { X, Send, MessageCircle } from 'lucide-react'
import './BusinessSaleContactModal.css'

const BusinessSaleContactModal = ({ 
  isOpen, 
  onClose, 
  businessSale, 
  buyerId,
  onSuccess 
}) => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const startConversation = useMutation(api.functions.mutations.conversations.startBusinessSaleConversation)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!message.trim()) {
      setError('Veuillez saisir un message')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await startConversation({
        buyerId,
        sellerId: businessSale.sellerId,
        businessSaleId: businessSale._id,
        initialMessage: message.trim(),
      })

      // Succès - fermer le modal et notifier
      setMessage('')
      onSuccess(result.conversationId)
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err)
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="contact-modal-header">
          <div className="contact-modal-title">
            <MessageCircle size={24} />
            <h2>Contacter le vendeur</h2>
          </div>
          <button onClick={onClose} className="contact-modal-close">
            <X size={24} />
          </button>
        </div>

        {/* Business Info */}
        <div className="contact-modal-business-info">
          <div className="business-info-badge">🏢 Fonds de Commerce</div>
          <h3>{businessSale.activityType}</h3>
          <p className="business-info-location">
            📍 {businessSale.city}, {businessSale.district}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="contact-modal-form">
          <div className="form-group">
            <label htmlFor="message">Votre message au vendeur</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bonjour, je suis intéressé par ce fonds de commerce. Pourriez-vous me donner plus d'informations ?"
              rows={6}
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <div className="contact-modal-error">
              ⚠️ {error}
            </div>
          )}

          <div className="contact-modal-info">
            <p>
              💬 Votre message sera envoyé directement au vendeur. 
              Vous pourrez continuer la conversation depuis votre tableau de bord 
              dans la section "Messages".
            </p>
          </div>

          <div className="contact-modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-cancel"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn-send"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                <>
                  <span className="spinner-small"></span>
                  Envoi...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Envoyer le message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BusinessSaleContactModal
