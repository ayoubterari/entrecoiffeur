import React from 'react'
import './MyReviewsTab.css'

export default function MyReviewsTab({ buyerReviews }) {
  if (!buyerReviews || buyerReviews.length === 0) {
    return (
      <div className="my-reviews-empty">
        <div className="empty-state">
          <span className="empty-icon">⭐</span>
          <h3>Aucun avis pour le moment</h3>
          <p>Vos avis sur les commandes livrées apparaîtront ici</p>
        </div>
      </div>
    )
  }

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
            ★
          </span>
        ))}
      </div>
    )
  }

  const getStatusBadge = (review) => {
    const status = review.status || 'approved'
    
    if (status === 'approved') {
      return <span className="review-status-badge approved">✅ Approuvé</span>
    } else if (status === 'rejected') {
      return <span className="review-status-badge rejected">❌ Rejeté</span>
    }
  }

  return (
    <div className="my-reviews-container">
      <div className="my-reviews-header">
        <h2>📝 Mes Avis</h2>
        <p>Consultez tous vos avis sur les commandes livrées</p>
      </div>

      <div className="reviews-list">
        {buyerReviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-card-header">
              <div className="review-product-info">
                <div className="review-product-image-container">
                  {review.productImage ? (
                    <img 
                      src={review.productImage} 
                      alt={review.productName}
                      className="review-product-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="review-product-image-placeholder"
                    style={{ display: review.productImage ? 'none' : 'flex' }}
                  >
                    📦
                  </div>
                </div>
                <div>
                  <h4>{review.productName}</h4>
                  <p className="review-order-number">Commande #{review.orderNumber}</p>
                </div>
              </div>
              {getStatusBadge(review)}
            </div>

            <div className="review-card-body">
              {/* Note globale */}
              <div className="review-rating-section">
                <span className="rating-label">Note globale:</span>
                {renderStars(review.rating)}
                <span className="rating-value">{review.rating}/5</span>
              </div>

              {/* Notes détaillées */}
              {(review.deliveryRating || review.productQualityRating || review.sellerServiceRating) && (
                <div className="detailed-ratings">
                  {review.deliveryRating && (
                    <div className="detail-rating">
                      <span>🚚 Livraison:</span>
                      {renderStars(review.deliveryRating)}
                      <span>{review.deliveryRating}/5</span>
                    </div>
                  )}
                  {review.productQualityRating && (
                    <div className="detail-rating">
                      <span>📦 Qualité:</span>
                      {renderStars(review.productQualityRating)}
                      <span>{review.productQualityRating}/5</span>
                    </div>
                  )}
                  {review.sellerServiceRating && (
                    <div className="detail-rating">
                      <span>👤 Service:</span>
                      {renderStars(review.sellerServiceRating)}
                      <span>{review.sellerServiceRating}/5</span>
                    </div>
                  )}
                </div>
              )}

              {/* Commentaire */}
              {review.comment && (
                <div className="review-comment">
                  <strong>Votre commentaire:</strong>
                  <p>"{review.comment}"</p>
                </div>
              )}

              {/* Recommandation */}
              {review.isRecommended && (
                <div className="review-recommendation">
                  ✓ Vous recommandez ce vendeur/produit
                </div>
              )}

              {/* Raison de rejet (si rejeté) */}
              {review.status === 'rejected' && review.moderationNote && (
                <div className="review-rejection-notice">
                  <div className="rejection-header">
                    <span className="rejection-icon">⚠️</span>
                    <strong>Raison du rejet</strong>
                  </div>
                  <p className="rejection-reason">{review.moderationNote}</p>
                  <p className="rejection-date">
                    Modéré le {new Date(review.moderatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              {/* Vendeur */}
              <div className="review-seller-info">
                <span>Vendeur: {review.sellerName}</span>
                {review.sellerCompany && <span> • {review.sellerCompany}</span>}
              </div>

              {/* Date */}
              <div className="review-date">
                Publié le {new Date(review.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
