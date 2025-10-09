import React, { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'
import './OrderReviewModal.css'

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'medium' }) => {
  const [hoverRating, setHoverRating] = useState(0)

  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue)
    }
  }

  const handleStarHover = (starValue) => {
    if (!readonly) {
      setHoverRating(starValue)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  return (
    <div className={`star-rating ${size} ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${
            star <= (hoverRating || rating) ? 'filled' : 'empty'
          }`}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
        >
          ★
        </button>
      ))}
    </div>
  )
}

const OrderReviewModal = ({ isOpen, onClose, order }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [deliveryRating, setDeliveryRating] = useState(0)
  const [productQualityRating, setProductQualityRating] = useState(0)
  const [sellerServiceRating, setSellerServiceRating] = useState(0)
  const [isRecommended, setIsRecommended] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const createOrderReview = useMutation(api.orderReviews.createOrderReview)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Reset form when modal opens
      setRating(0)
      setComment('')
      setDeliveryRating(0)
      setProductQualityRating(0)
      setSellerServiceRating(0)
      setIsRecommended(null)
      setError('')
      setSuccess(false)
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Veuillez donner une note générale')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createOrderReview({
        orderId: order._id,
        rating,
        comment: comment.trim() || undefined,
        deliveryRating: deliveryRating || undefined,
        productQualityRating: productQualityRating || undefined,
        sellerServiceRating: sellerServiceRating || undefined,
        isRecommended: isRecommended,
      })

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'évaluation')
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !order) return null

  return (
    <div className="review-modal-overlay" onClick={handleOverlayClick}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="review-modal-header">
          <h2>✨ Évaluez votre commande</h2>
          <div className="order-info">
            <div className="order-product">
              {order.productImage && (
                <img src={order.productImage} alt={order.productName} className="product-image" />
              )}
              <div className="product-details">
                <h3>{order.productName}</h3>
                <p>Commande #{order.orderNumber}</p>
                <p>Vendeur : {order.sellerName}</p>
                {order.sellerCompany && <p>{order.sellerCompany}</p>}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          {/* Note générale */}
          <div className="rating-section">
            <label className="rating-label">
              <span className="label-text">Note générale *</span>
              <span className="label-description">Comment évaluez-vous cette commande ?</span>
            </label>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating}
              size="large"
            />
            {rating > 0 && (
              <span className="rating-text">
                {rating === 1 && "😞 Très décevant"}
                {rating === 2 && "😐 Décevant"}
                {rating === 3 && "🙂 Correct"}
                {rating === 4 && "😊 Bien"}
                {rating === 5 && "🤩 Excellent"}
              </span>
            )}
          </div>

          {/* Notes détaillées */}
          <div className="detailed-ratings">
            <h4>Évaluations détaillées (optionnel)</h4>
            
            <div className="rating-item">
              <label>
                <span>🚚 Livraison</span>
                <StarRating 
                  rating={deliveryRating} 
                  onRatingChange={setDeliveryRating}
                />
              </label>
            </div>

            <div className="rating-item">
              <label>
                <span>📦 Qualité du produit</span>
                <StarRating 
                  rating={productQualityRating} 
                  onRatingChange={setProductQualityRating}
                />
              </label>
            </div>

            <div className="rating-item">
              <label>
                <span>👤 Service vendeur</span>
                <StarRating 
                  rating={sellerServiceRating} 
                  onRatingChange={setSellerServiceRating}
                />
              </label>
            </div>
          </div>

          {/* Commentaire */}
          <div className="comment-section">
            <label htmlFor="comment" className="comment-label">
              <span className="label-text">Votre commentaire (optionnel)</span>
              <span className="label-description">Partagez votre expérience avec les autres acheteurs</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez votre expérience avec ce produit et ce vendeur..."
              className="comment-textarea"
              rows="4"
              maxLength="500"
            />
            <div className="character-count">
              {comment.length}/500 caractères
            </div>
          </div>

          {/* Recommandation */}
          <div className="recommendation-section">
            <label className="recommendation-label">
              <span className="label-text">Recommanderiez-vous ce vendeur ?</span>
            </label>
            <div className="recommendation-buttons">
              <button
                type="button"
                className={`recommendation-btn ${isRecommended === true ? 'selected yes' : ''}`}
                onClick={() => setIsRecommended(true)}
              >
                👍 Oui, je recommande
              </button>
              <button
                type="button"
                className={`recommendation-btn ${isRecommended === false ? 'selected no' : ''}`}
                onClick={() => setIsRecommended(false)}
              >
                👎 Non, je ne recommande pas
              </button>
            </div>
          </div>

          {/* Messages d'erreur et succès */}
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ Merci pour votre évaluation ! Elle aidera les autres acheteurs.
            </div>
          )}

          {/* Boutons d'action */}
          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || rating === 0}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Envoi en cours...
                </>
              ) : (
                'Publier l\'évaluation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderReviewModal
