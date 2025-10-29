import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../lib/convex'
import './SupportModal.css'

const SupportModal = ({ isOpen, onClose, userId, userEmail, userFirstName, userLastName }) => {
  const [formData, setFormData] = useState({
    email: userEmail || '',
    firstName: userFirstName || '',
    lastName: userLastName || '',
    subject: '',
    category: 'clarification',
    description: '',
    relatedSellerId: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [ticketNumber, setTicketNumber] = useState('')
  const [ticketResult, setTicketResult] = useState(null)

  const createTicket = useMutation(api.functions.mutations.support.createSupportTicket)
  
  // Récupérer la liste des vendeurs pour sélection
  const sellersData = useQuery(
    api.functions.queries.support.getSellersForSupport,
    userId ? { userId } : "skip"
  )

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: userEmail || '',
        firstName: userFirstName || '',
        lastName: userLastName || '',
        subject: '',
        category: 'clarification',
        description: '',
        relatedSellerId: '',
      })
      setSubmitSuccess(false)
      setSubmitError('')
      setTicketNumber('')
      setIsSubmitting(false)
      setTicketResult(null)
    }
  }, [isOpen, userEmail, userFirstName, userLastName])

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.email || !formData.subject || !formData.description) {
      setSubmitError('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    if (formData.description.length < 10) {
      setSubmitError('La description doit contenir au moins 10 caractères')
      return
    }
    
    if (formData.description.length > 2000) {
      setSubmitError('La description ne peut pas dépasser 2000 caractères')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const result = await createTicket({
        userId: userId || undefined,
        email: formData.email,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        subject: formData.subject,
        category: formData.category,
        description: formData.description,
        relatedSellerId: formData.relatedSellerId || undefined,
      })

      setTicketNumber(result.ticketNumber)
      setTicketResult(result)
      setSubmitSuccess(true)
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error)
      setSubmitError('Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      complaint: 'Réclamation',
      clarification: 'Demande de clarification',
      technical: 'Problème technique',
      billing: 'Problème de facturation',
      other: 'Autre'
    }
    return labels[category] || category
  }

  const getCategoryIcon = (category) => {
    const icons = {
      complaint: '😠',
      clarification: '❓',
      technical: '🔧',
      billing: '💳',
      other: '💬'
    }
    return icons[category] || '💬'
  }

  if (!isOpen) return null

  return createPortal(
    <div className="support-modal-overlay" onClick={handleClose}>
      <div className="support-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="support-modal-header">
          <div className="support-modal-title">
            <span className="support-icon">🎧</span>
            <h2>Support Client</h2>
          </div>
          <button 
            className="support-modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className="support-modal-content">
          {submitSuccess ? (
            <div className="support-success">
              <div className="success-icon">✅</div>
              <h3>Demande envoyée avec succès !</h3>
              <p>Votre ticket de support a été créé avec le numéro :</p>
              <div className="ticket-number">{ticketNumber}</div>
              <p>
                Nous vous répondrons dans les plus brefs délais à l'adresse : 
                <strong> {formData.email}</strong>
              </p>
              {ticketResult?.notifiedSeller && (
                <div className="seller-notification-info">
                  <div className="notification-icon">🔔</div>
                  <p>
                    <strong>Le vendeur concerné a été automatiquement notifié</strong> de votre réclamation 
                    et pourra suivre le traitement de votre demande.
                  </p>
                </div>
              )}
              <button 
                className="support-btn support-btn-primary"
                onClick={handleClose}
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="support-form">
              <div className="support-form-intro">
                <p>
                  Vous avez une question, une réclamation ou besoin d'aide ? 
                  Nous sommes là pour vous aider ! Décrivez votre problème et nous vous répondrons rapidement.
                </p>
              </div>

              {submitError && (
                <div className="support-error">
                  <span className="error-icon">⚠️</span>
                  {submitError}
                </div>
              )}

              <div className="support-form-grid">
                <div className="support-form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="votre@email.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="support-form-group">
                  <label htmlFor="firstName">Prénom</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Votre prénom"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="support-form-group">
                  <label htmlFor="lastName">Nom</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="support-form-group">
                  <label htmlFor="category">Type de demande *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="clarification">❓ Demande de clarification</option>
                    <option value="complaint">😠 Réclamation</option>
                    <option value="technical">🔧 Problème technique</option>
                    <option value="billing">💳 Problème de facturation</option>
                    <option value="other">💬 Autre</option>
                  </select>
                </div>

                {/* Sélection de boutique si problème avec un vendeur */}
                {(formData.category === 'complaint' || formData.category === 'billing') && sellersData && sellersData.length > 0 && (
                  <div className="support-form-group">
                    <label htmlFor="relatedSellerId">Boutique concernée</label>
                    <select
                      id="relatedSellerId"
                      name="relatedSellerId"
                      value={formData.relatedSellerId}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionner une boutique (optionnel)</option>
                      {sellersData.map((seller) => (
                        <option key={seller._id} value={seller._id}>
                          {seller.hasInteracted ? '⭐ ' : ''}
                          {seller.companyName || `${seller.firstName} ${seller.lastName}`.trim()}
                          {seller.hasInteracted ? ' (Vous avez déjà commandé)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="support-form-group support-form-group-full">
                <label htmlFor="subject">Sujet *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Résumez votre demande en quelques mots"
                  maxLength="200"
                  disabled={isSubmitting}
                />
                <div className="char-count">{formData.subject.length}/200</div>
              </div>

              <div className="support-form-group support-form-group-full">
                <label htmlFor="description">Description détaillée *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Décrivez votre problème ou votre question en détail. Plus vous serez précis, plus nous pourrons vous aider efficacement."
                  rows="6"
                  maxLength="2000"
                  disabled={isSubmitting}
                />
                <div className="char-count">{formData.description.length}/2000</div>
              </div>

              <div className="support-form-actions">
                <button
                  type="button"
                  className="support-btn support-btn-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="support-btn support-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      Envoyer ma demande
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default SupportModal
