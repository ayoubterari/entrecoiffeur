import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import './SellerComplaintsManagement.css'

const SellerComplaintsManagement = ({ sellerId }) => {
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  // Récupérer les tickets de réclamation concernant ce vendeur
  const sellerComplaints = useQuery(
    api.functions.queries.support.getAllSupportTickets,
    sellerId ? { 
      category: 'complaint',
      status: filterStatus !== 'all' ? filterStatus : undefined,
      limit: 50 
    } : "skip"
  )

  // Filtrer les tickets qui concernent ce vendeur
  const filteredComplaints = sellerComplaints?.filter(ticket => 
    ticket.relatedSellerId === sellerId
  ) || []

  // Récupérer les réponses d'un ticket spécifique
  const ticketResponses = useQuery(
    api.functions.queries.support.getSupportTicketById,
    selectedTicket ? { ticketId: selectedTicket._id } : "skip"
  )

  // Mutation pour ajouter une réponse
  const addTicketResponse = useMutation(api.functions.mutations.support.addTicketResponse)

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
      case 'in_progress': return '⏳ En cours de traitement'
      case 'waiting_response': return '⏰ En attente de réponse'
      case 'resolved': return '✅ Résolu'
      case 'closed': return '🔒 Fermé'
      default: return status
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#e74c3c'
      case 'high': return '#f39c12'
      case 'medium': return '#3498db'
      case 'low': return '#27ae60'
      default: return '#95a5a6'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return '🔴 Urgent'
      case 'high': return '🟠 Élevée'
      case 'medium': return '🔵 Moyenne'
      case 'low': return '🟢 Faible'
      default: return priority
    }
  }

  const handleResponseSubmit = async () => {
    if (!responseText.trim() || !selectedTicket) return

    setIsSubmittingResponse(true)
    try {
      await addTicketResponse({
        ticketId: selectedTicket._id,
        responderId: sellerId,
        responderType: 'seller',
        content: responseText.trim(),
        isInternal: false
      })

      setResponseText('')
      setShowResponseModal(false)
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error)
      alert('Erreur lors de l\'envoi de la réponse. Veuillez réessayer.')
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  const openResponseModal = (ticket) => {
    setSelectedTicket(ticket)
    setShowResponseModal(true)
    setResponseText('')
  }

  if (!filteredComplaints || filteredComplaints.length === 0) {
    return (
      <div className="seller-complaints-management">
        <div className="complaints-header">
          <h2>😠 Réclamations reçues</h2>
          <p>Gérez les réclamations concernant votre boutique</p>
        </div>
        <div className="empty-complaints">
          <div className="empty-icon">✨</div>
          <h3>Aucune réclamation</h3>
          <p>Excellente nouvelle ! Vous n'avez reçu aucune réclamation concernant votre boutique.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="seller-complaints-management">
      <div className="complaints-header">
        <h2>😠 Réclamations reçues</h2>
        <p>Suivez le traitement des réclamations concernant votre boutique</p>
        
        <div className="complaints-filters">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="open">🔓 Ouverts</option>
            <option value="in_progress">⏳ En cours</option>
            <option value="waiting_response">⏰ En attente</option>
            <option value="resolved">✅ Résolus</option>
            <option value="closed">🔒 Fermés</option>
          </select>
        </div>
      </div>

      <div className="complaints-stats">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{filteredComplaints.length}</h3>
            <p>Total réclamations</p>
          </div>
        </div>
        <div className="stat-card open">
          <div className="stat-icon">🔓</div>
          <div className="stat-content">
            <h3>{filteredComplaints.filter(t => t.status === 'open').length}</h3>
            <p>Ouvertes</p>
          </div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{filteredComplaints.filter(t => t.status === 'in_progress').length}</h3>
            <p>En cours</p>
          </div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{filteredComplaints.filter(t => t.status === 'resolved').length}</h3>
            <p>Résolues</p>
          </div>
        </div>
      </div>

      <div className="complaints-list">
        {filteredComplaints.map(complaint => (
          <div key={complaint._id} className="complaint-card">
            <div className="complaint-header">
              <div className="complaint-number">#{complaint.ticketNumber}</div>
              <div className="complaint-meta">
                <span 
                  className="complaint-priority"
                  style={{ color: getPriorityColor(complaint.priority) }}
                >
                  {getPriorityLabel(complaint.priority)}
                </span>
                <span 
                  className="complaint-status"
                  style={{ color: getStatusColor(complaint.status) }}
                >
                  {getStatusLabel(complaint.status)}
                </span>
              </div>
            </div>
            
            <div className="complaint-content">
              <h3 className="complaint-subject">{complaint.subject}</h3>
              <p className="complaint-description">
                {complaint.description.length > 150 
                  ? `${complaint.description.substring(0, 150)}...`
                  : complaint.description
                }
              </p>
              
              <div className="complaint-info">
                <div className="customer-info">
                  <strong>Client:</strong> {complaint.firstName} {complaint.lastName}
                  <br />
                  <strong>Email:</strong> {complaint.email}
                </div>
                <div className="complaint-date">
                  <strong>Date:</strong> {formatDate(complaint.createdAt)}
                </div>
              </div>
              
              {complaint.voiceRecording && (
                <div className="voice-attachment">
                  🎤 Message vocal joint à la réclamation
                </div>
              )}
            </div>
            
            <div className="complaint-actions">
              <button
                className="view-details-btn"
                onClick={() => setSelectedTicket(complaint)}
              >
                👁️ Voir les détails et réponses
              </button>
              <button
                className="respond-btn"
                onClick={() => openResponseModal(complaint)}
              >
                💬 Répondre
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détails */}
      {selectedTicket && (
        <div className="complaint-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="complaint-modal" onClick={(e) => e.stopPropagation()}>
            <div className="complaint-modal-header">
              <h3>Réclamation #{selectedTicket.ticketNumber}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedTicket(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="complaint-modal-content">
              <div className="ticket-details">
                <div className="detail-section">
                  <h4>Informations de la réclamation</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Sujet:</strong> {selectedTicket.subject}
                    </div>
                    <div className="detail-item">
                      <strong>Client:</strong> {selectedTicket.firstName} {selectedTicket.lastName}
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong> {selectedTicket.email}
                    </div>
                    <div className="detail-item">
                      <strong>Priorité:</strong> 
                      <span style={{ color: getPriorityColor(selectedTicket.priority) }}>
                        {getPriorityLabel(selectedTicket.priority)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Statut:</strong> 
                      <span style={{ color: getStatusColor(selectedTicket.status) }}>
                        {getStatusLabel(selectedTicket.status)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Date:</strong> {formatDate(selectedTicket.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Description de la réclamation</h4>
                  <div className="complaint-full-description">
                    {selectedTicket.description}
                  </div>
                  {selectedTicket.voiceRecording && (
                    <div className="voice-recording-info">
                      🎤 Un message vocal a été joint à cette réclamation
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Suivi et réponses de l'équipe support</h4>
                  {ticketResponses && ticketResponses.responses && ticketResponses.responses.length > 0 ? (
                    <div className="responses-timeline">
                      {ticketResponses.responses
                        .filter(response => !response.isInternal)
                        .map((response, index) => (
                        <div key={index} className="response-timeline-item">
                          <div className="response-timeline-header">
                            <div className="response-author">
                              {response.responderType === 'admin' ? (
                                <span className="admin-badge">🛡️ Équipe Support</span>
                              ) : response.responderType === 'seller' ? (
                                <span className="seller-badge">🏪 Vous (Vendeur)</span>
                              ) : (
                                <span className="client-badge">👤 Client</span>
                              )}
                            </div>
                            <div className="response-date">
                              {formatDate(response.createdAt)}
                            </div>
                          </div>
                          <div className="response-timeline-content">
                            {response.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-responses">
                      <p>L'équipe support n'a pas encore répondu à cette réclamation.</p>
                    </div>
                  )}
                </div>

                <div className="info-section">
                  <div className="info-card">
                    <h4>💬 Répondre à la réclamation</h4>
                    <p>
                      Vous pouvez maintenant répondre directement aux réclamations concernant votre boutique. 
                      Votre réponse sera visible par le client et l'équipe support pour faciliter la résolution.
                    </p>
                    <button
                      className="respond-from-modal-btn"
                      onClick={() => openResponseModal(selectedTicket)}
                    >
                      💬 Répondre à cette réclamation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réponse */}
      {showResponseModal && selectedTicket && (
        <div className="response-modal-overlay" onClick={() => setShowResponseModal(false)}>
          <div className="response-modal" onClick={(e) => e.stopPropagation()}>
            <div className="response-modal-header">
              <h3>Répondre à la réclamation #{selectedTicket.ticketNumber}</h3>
              <button
                className="close-btn"
                onClick={() => setShowResponseModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="response-modal-content">
              <div className="complaint-summary">
                <div className="summary-row">
                  <strong>Client:</strong> {selectedTicket.firstName} {selectedTicket.lastName}
                </div>
                <div className="summary-row">
                  <strong>Email:</strong> {selectedTicket.email}
                </div>
                <div className="summary-row">
                  <strong>Sujet:</strong> {selectedTicket.subject}
                </div>
                <div className="summary-row">
                  <strong>Priorité:</strong> 
                  <span style={{ color: getPriorityColor(selectedTicket.priority) }}>
                    {getPriorityLabel(selectedTicket.priority)}
                  </span>
                </div>
              </div>

              <div className="original-complaint">
                <h4>Réclamation originale:</h4>
                <p>{selectedTicket.description}</p>
              </div>

              <div className="response-form">
                <label htmlFor="sellerResponseText">Votre réponse:</label>
                <textarea
                  id="sellerResponseText"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Tapez votre réponse au client ici..."
                  rows="6"
                  maxLength="2000"
                  disabled={isSubmittingResponse}
                />
                <div className="char-count">{responseText.length}/2000</div>
              </div>

              <div className="response-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowResponseModal(false)}
                  disabled={isSubmittingResponse}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="submit-response-btn"
                  onClick={handleResponseSubmit}
                  disabled={!responseText.trim() || isSubmittingResponse}
                >
                  {isSubmittingResponse ? 'Envoi...' : 'Envoyer la réponse'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerComplaintsManagement
