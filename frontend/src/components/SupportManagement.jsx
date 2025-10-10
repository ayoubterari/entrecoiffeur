import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../lib/convex'
import './SupportManagement.css'

const SupportManagement = ({ adminId }) => {
  const [activeView, setActiveView] = useState('overview')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  // Queries pour récupérer les données
  const allTickets = useQuery(api.functions.queries.support.getAllSupportTickets, {
    status: filterStatus !== 'all' ? filterStatus : undefined,
    category: filterCategory !== 'all' ? filterCategory : undefined,
    priority: filterPriority !== 'all' ? filterPriority : undefined,
    limit: 100
  })

  const supportStats = useQuery(api.functions.queries.support.getSupportTicketStats)

  // Mutations pour gérer les tickets
  const updateTicketStatus = useMutation(api.functions.mutations.support.updateTicketStatus)
  const updateTicketPriority = useMutation(api.functions.mutations.support.updateTicketPriority)
  const assignTicket = useMutation(api.functions.mutations.support.assignTicket)
  const addTicketResponse = useMutation(api.functions.mutations.support.addTicketResponse)

  // Calculer les statistiques par catégorie
  const categoryStats = allTickets ? {
    complaint: allTickets.filter(t => t.category === 'complaint').length,
    clarification: allTickets.filter(t => t.category === 'clarification').length,
    technical: allTickets.filter(t => t.category === 'technical').length,
    billing: allTickets.filter(t => t.category === 'billing').length,
    other: allTickets.filter(t => t.category === 'other').length,
  } : {}

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus({ ticketId, status: newStatus })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await updateTicketPriority({ ticketId, priority: newPriority })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la priorité:', error)
    }
  }

  const handleResponseSubmit = async () => {
    if (!responseText.trim() || !selectedTicket) return

    setIsSubmittingResponse(true)
    try {
      if (!adminId) {
        console.error('Admin ID manquant')
        return
      }
      
      await addTicketResponse({
        ticketId: selectedTicket._id,
        responderId: adminId,
        responderType: 'admin',
        content: responseText.trim(),
        isInternal: false
      })

      // Mettre à jour le statut du ticket si nécessaire
      if (selectedTicket.status === 'open') {
        await updateTicketStatus({ ticketId: selectedTicket._id, status: 'in_progress' })
      }

      setResponseText('')
      setShowResponseModal(false)
      setSelectedTicket(null)
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error)
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  const openResponseModal = (ticket) => {
    setSelectedTicket(ticket)
    setShowResponseModal(true)
    setResponseText('')
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      case 'complaint': return 'Réclamations'
      case 'clarification': return 'Clarifications'
      case 'technical': return 'Technique'
      case 'billing': return 'Facturation'
      case 'other': return 'Autres'
      default: return 'Inconnu'
    }
  }

  const renderOverview = () => (
    <div className="support-overview">
      <div className="support-stats-grid">
        <div className="support-stat-card total">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <h3>{supportStats?.totalTickets || 0}</h3>
            <p>Total des tickets</p>
          </div>
        </div>
        <div className="support-stat-card open">
          <div className="stat-icon">🔓</div>
          <div className="stat-content">
            <h3>{supportStats?.openTickets || 0}</h3>
            <p>Tickets ouverts</p>
          </div>
        </div>
        <div className="support-stat-card progress">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{supportStats?.inProgressTickets || 0}</h3>
            <p>En cours</p>
          </div>
        </div>
        <div className="support-stat-card resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{supportStats?.resolvedTickets || 0}</h3>
            <p>Résolus</p>
          </div>
        </div>
      </div>

      <div className="category-breakdown">
        <h3>📊 Répartition par catégorie</h3>
        <div className="category-grid">
          {Object.entries(categoryStats).map(([category, count]) => (
            <div 
              key={category} 
              className="category-card"
              onClick={() => {
                setFilterCategory(category)
                setActiveView('tickets')
              }}
            >
              <div className="category-icon">{getCategoryIcon(category)}</div>
              <div className="category-content">
                <h4>{count}</h4>
                <p>{getCategoryLabel(category)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-tickets">
        <h3>🕒 Tickets récents</h3>
        <div className="tickets-preview">
          {allTickets?.slice(0, 5).map(ticket => (
            <div key={ticket._id} className="ticket-preview-card">
              <div className="ticket-preview-header">
                <span className="ticket-number">#{ticket.ticketNumber}</span>
                <span 
                  className="ticket-priority"
                  style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                >
                  {ticket.priority}
                </span>
              </div>
              <div className="ticket-preview-content">
                <h4>{ticket.subject}</h4>
                <p>{ticket.email}</p>
                <div className="ticket-preview-meta">
                  <span>{getCategoryIcon(ticket.category)} {getCategoryLabel(ticket.category)}</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTicketsList = () => (
    <div className="support-tickets-list">
      <div className="tickets-header">
        <h2>🎫 Gestion des tickets</h2>
        <div className="tickets-filters">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="open">Ouverts</option>
            <option value="in_progress">En cours</option>
            <option value="waiting_response">En attente</option>
            <option value="resolved">Résolus</option>
            <option value="closed">Fermés</option>
          </select>
          
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes les catégories</option>
            <option value="complaint">😠 Réclamations</option>
            <option value="clarification">❓ Clarifications</option>
            <option value="technical">🔧 Technique</option>
            <option value="billing">💳 Facturation</option>
            <option value="other">💬 Autres</option>
          </select>
          
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes les priorités</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 Élevée</option>
            <option value="medium">🔵 Moyenne</option>
            <option value="low">🟢 Faible</option>
          </select>
        </div>
      </div>

      <div className="tickets-table">
        <div className="table-header">
          <div className="col-ticket">Ticket</div>
          <div className="col-user">Utilisateur</div>
          <div className="col-category">Catégorie</div>
          <div className="col-priority">Priorité</div>
          <div className="col-status">Statut</div>
          <div className="col-date">Date</div>
          <div className="col-actions">Actions</div>
        </div>
        
        <div className="table-body">
          {allTickets?.map(ticket => (
            <div key={ticket._id} className="table-row">
              <div className="col-ticket">
                <div className="ticket-info">
                  <strong>#{ticket.ticketNumber}</strong>
                  <span className="ticket-subject">{ticket.subject}</span>
                  {ticket.voiceRecording && <span className="voice-indicator">🎤</span>}
                </div>
              </div>
              
              <div className="col-user">
                <div className="user-info">
                  <strong>{ticket.firstName} {ticket.lastName}</strong>
                  <span>{ticket.email}</span>
                </div>
              </div>
              
              <div className="col-category">
                <span className="category-badge">
                  {getCategoryIcon(ticket.category)} {getCategoryLabel(ticket.category)}
                </span>
              </div>
              
              <div className="col-priority">
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(ticket._id, e.target.value)}
                  className="priority-select"
                  style={{ borderColor: getPriorityColor(ticket.priority) }}
                >
                  <option value="low">🟢 Faible</option>
                  <option value="medium">🔵 Moyenne</option>
                  <option value="high">🟠 Élevée</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              
              <div className="col-status">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                  className="status-select"
                  style={{ borderColor: getStatusColor(ticket.status) }}
                >
                  <option value="open">🔓 Ouvert</option>
                  <option value="in_progress">⏳ En cours</option>
                  <option value="waiting_response">⏰ En attente</option>
                  <option value="resolved">✅ Résolu</option>
                  <option value="closed">🔒 Fermé</option>
                </select>
              </div>
              
              <div className="col-date">
                {formatDate(ticket.createdAt)}
              </div>
              
              <div className="col-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() => setSelectedTicket(ticket)}
                  title="Voir les détails"
                >
                  👁️
                </button>
                <button
                  className="action-btn response-btn"
                  onClick={() => openResponseModal(ticket)}
                  title="Répondre au ticket"
                >
                  💬
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="support-management">
      <div className="support-nav">
        <button
          className={`nav-btn ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          📊 Vue d'ensemble
        </button>
        <button
          className={`nav-btn ${activeView === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveView('tickets')}
        >
          🎫 Tous les tickets
        </button>
        <button
          className={`nav-btn ${activeView === 'complaints' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('tickets')
            setFilterCategory('complaint')
          }}
        >
          😠 Réclamations
        </button>
        <button
          className={`nav-btn ${activeView === 'clarifications' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('tickets')
            setFilterCategory('clarification')
          }}
        >
          ❓ Clarifications
        </button>
        <button
          className={`nav-btn ${activeView === 'technical' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('tickets')
            setFilterCategory('technical')
          }}
        >
          🔧 Technique
        </button>
        <button
          className={`nav-btn ${activeView === 'billing' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('tickets')
            setFilterCategory('billing')
          }}
        >
          💳 Facturation
        </button>
        <button
          className={`nav-btn ${activeView === 'other' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('tickets')
            setFilterCategory('other')
          }}
        >
          💬 Autres
        </button>
      </div>

      <div className="support-content">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'tickets' && renderTicketsList()}
      </div>

      {/* Modal de détails du ticket */}
      {selectedTicket && (
        <div className="ticket-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-modal-header">
              <h3>Ticket #{selectedTicket.ticketNumber}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedTicket(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="ticket-modal-content">
              <div className="ticket-details">
                <div className="detail-row">
                  <strong>Sujet:</strong> {selectedTicket.subject}
                </div>
                <div className="detail-row">
                  <strong>Utilisateur:</strong> {selectedTicket.firstName} {selectedTicket.lastName} ({selectedTicket.email})
                </div>
                <div className="detail-row">
                  <strong>Catégorie:</strong> {getCategoryIcon(selectedTicket.category)} {getCategoryLabel(selectedTicket.category)}
                </div>
                <div className="detail-row">
                  <strong>Priorité:</strong> 
                  <span style={{ color: getPriorityColor(selectedTicket.priority) }}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Statut:</strong> 
                  <span style={{ color: getStatusColor(selectedTicket.status) }}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Date de création:</strong> {formatDate(selectedTicket.createdAt)}
                </div>
                {selectedTicket.voiceRecording && (
                  <div className="detail-row">
                    <strong>Message vocal:</strong> 🎤 Enregistrement disponible
                  </div>
                )}
              </div>
              
              <div className="ticket-description">
                <h4>Description:</h4>
                <p>{selectedTicket.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réponse */}
      {showResponseModal && selectedTicket && (
        <div className="ticket-modal-overlay" onClick={() => setShowResponseModal(false)}>
          <div className="response-modal" onClick={(e) => e.stopPropagation()}>
            <div className="response-modal-header">
              <h3>Répondre au ticket #{selectedTicket.ticketNumber}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowResponseModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="response-modal-content">
              <div className="ticket-summary">
                <div className="summary-row">
                  <strong>Utilisateur:</strong> {selectedTicket.firstName} {selectedTicket.lastName}
                </div>
                <div className="summary-row">
                  <strong>Sujet:</strong> {selectedTicket.subject}
                </div>
                <div className="summary-row">
                  <strong>Catégorie:</strong> {getCategoryIcon(selectedTicket.category)} {getCategoryLabel(selectedTicket.category)}
                </div>
              </div>
              
              <div className="original-message">
                <h4>Message original:</h4>
                <p>{selectedTicket.description}</p>
              </div>
              
              <div className="response-form">
                <label htmlFor="responseText">Votre réponse:</label>
                <textarea
                  id="responseText"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Tapez votre réponse ici..."
                  rows="6"
                  maxLength="2000"
                  disabled={isSubmittingResponse}
                />
                <div className="char-count">{responseText.length}/2000</div>
              </div>
              
              <div className="response-actions">
                <button
                  className="response-btn cancel-btn"
                  onClick={() => setShowResponseModal(false)}
                  disabled={isSubmittingResponse}
                >
                  Annuler
                </button>
                <button
                  className="response-btn send-btn"
                  onClick={handleResponseSubmit}
                  disabled={!responseText.trim() || isSubmittingResponse}
                >
                  {isSubmittingResponse ? (
                    <>
                      <span className="loading-spinner"></span>
                      Envoi...
                    </>
                  ) : (
                    <>
                      📤 Envoyer la réponse
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportManagement
