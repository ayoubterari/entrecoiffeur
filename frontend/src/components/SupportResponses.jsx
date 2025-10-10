import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import './SupportResponses.css'

const SupportResponses = ({ userId, userEmail }) => {
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Récupérer les tickets de l'utilisateur
  const userTickets = useQuery(
    api.functions.queries.support.getUserSupportTickets,
    userId ? { userId } : userEmail ? { email: userEmail } : "skip"
  )

  // Récupérer les réponses pour le ticket sélectionné
  const ticketResponses = useQuery(
    api.functions.queries.support.getSupportTicketById,
    selectedTicket ? { ticketId: selectedTicket._id } : "skip"
  )

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#e74c3c'
      case 'in_progress': return '#f39c12'
      case 'waiting_response': return '#9b59b6'
      case 'resolved': return '#27ae60'
      case 'closed': return '#95a5a6'
      default: return '#95a5a6'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return '🔓 Ouvert'
      case 'in_progress': return '⏳ En cours'
      case 'waiting_response': return '⏰ En attente de votre réponse'
      case 'resolved': return '✅ Résolu'
      case 'closed': return '🔒 Fermé'
      default: return status
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'complaint': return '😠'
      case 'clarification': return '❓'
      case 'technical': return '🔧'
      case 'billing': return '💳'
      case 'other': return '💬'
      default: return '📝'
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'complaint': return 'Réclamation'
      case 'clarification': return 'Clarification'
      case 'technical': return 'Technique'
      case 'billing': return 'Facturation'
      case 'other': return 'Autre'
      default: return 'Inconnu'
    }
  }

  if (!userTickets || userTickets.length === 0) {
    return (
      <div className="support-responses">
        <div className="support-header">
          <h2>🎧 Mes demandes de support</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <h3>Aucune demande de support</h3>
          <p>Vous n'avez pas encore soumis de demande de support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="support-responses">
      <div className="support-header">
        <h2>🎧 Mes demandes de support</h2>
        <p>Suivez l'état de vos demandes et consultez les réponses de notre équipe</p>
      </div>

      <div className="tickets-grid">
        {userTickets.map(ticket => (
          <div key={ticket._id} className="ticket-card">
            <div className="ticket-card-header">
              <div className="ticket-number">#{ticket.ticketNumber}</div>
              <div 
                className="ticket-status"
                style={{ color: getStatusColor(ticket.status) }}
              >
                {getStatusLabel(ticket.status)}
              </div>
            </div>
            
            <div className="ticket-card-content">
              <div className="ticket-category">
                {getCategoryIcon(ticket.category)} {getCategoryLabel(ticket.category)}
              </div>
              <h3 className="ticket-subject">{ticket.subject}</h3>
              <p className="ticket-description">
                {ticket.description.length > 100 
                  ? `${ticket.description.substring(0, 100)}...`
                  : ticket.description
                }
              </p>
              <div className="ticket-meta">
                <span className="ticket-date">Créé le {formatDate(ticket.createdAt)}</span>
                {ticket.voiceRecording && (
                  <span className="voice-indicator">🎤 Message vocal</span>
                )}
              </div>
            </div>
            
            <div className="ticket-card-actions">
              <button
                className="view-responses-btn"
                onClick={() => setSelectedTicket(ticket)}
              >
                💬 Voir les réponses
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal des réponses */}
      {selectedTicket && (
        <div className="responses-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="responses-modal" onClick={(e) => e.stopPropagation()}>
            <div className="responses-modal-header">
              <h3>Ticket #{selectedTicket.ticketNumber}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedTicket(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="responses-modal-content">
              <div className="ticket-info">
                <div className="info-row">
                  <strong>Sujet:</strong> {selectedTicket.subject}
                </div>
                <div className="info-row">
                  <strong>Catégorie:</strong> {getCategoryIcon(selectedTicket.category)} {getCategoryLabel(selectedTicket.category)}
                </div>
                <div className="info-row">
                  <strong>Statut:</strong> 
                  <span style={{ color: getStatusColor(selectedTicket.status) }}>
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                </div>
                <div className="info-row">
                  <strong>Date de création:</strong> {formatDate(selectedTicket.createdAt)}
                </div>
              </div>

              <div className="original-request">
                <h4>Votre demande initiale:</h4>
                <p>{selectedTicket.description}</p>
                {selectedTicket.voiceRecording && (
                  <div className="voice-attachment">
                    🎤 Message vocal joint à votre demande
                  </div>
                )}
              </div>

              <div className="responses-section">
                <h4>Réponses de notre équipe:</h4>
                {ticketResponses && ticketResponses.responses && ticketResponses.responses.length > 0 ? (
                  <div className="responses-list">
                    {ticketResponses.responses
                      .filter(response => !response.isInternal)
                      .map((response, index) => (
                      <div key={index} className="response-item">
                        <div className="response-header">
                          <div className="response-author">
                            {response.responderType === 'admin' ? (
                              <span className="admin-badge">🛡️ Équipe Support</span>
                            ) : response.responderType === 'seller' ? (
                              <span className="seller-badge">🏪 Vendeur</span>
                            ) : (
                              <span className="user-badge">👤 Vous</span>
                            )}
                          </div>
                          <div className="response-date">
                            {formatDate(response.createdAt)}
                          </div>
                        </div>
                        <div className="response-content">
                          {response.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-responses">
                    <p>Aucune réponse pour le moment. Notre équipe vous répondra bientôt.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportResponses
