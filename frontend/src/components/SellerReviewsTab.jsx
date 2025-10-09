import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import './SellerReviewsTab.css'

const SellerReviewsTab = ({ sellerId }) => {
  const [sortBy, setSortBy] = useState('recent') // recent, rating, helpful

  // Récupérer les statistiques d'évaluation du vendeur
  const sellerReviewStats = useQuery(api.orderReviews.getSellerReviewStats,
    sellerId ? { sellerId } : "skip"
  )

  // Récupérer les avis du vendeur
  const sellerReviews = useQuery(api.orderReviews.getSellerReviews,
    sellerId ? { sellerId, limit: 20 } : "skip"
  )

  // Fonction pour trier les avis
  const getSortedReviews = () => {
    if (!sellerReviews) return []
    
    const reviews = [...sellerReviews]
    
    switch (sortBy) {
      case 'rating':
        return reviews.sort((a, b) => b.rating - a.rating)
      case 'helpful':
        // Tri par nombre de likes (si implémenté plus tard)
        return reviews
      case 'recent':
      default:
        return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  }

  const sortedReviews = getSortedReviews()

  // Fonction pour formater la date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Il y a quelques minutes'
      return `Il y a ${diffInHours}h`
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24)
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`
    } else {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  if (!sellerReviewStats || !sellerReviews) {
    return (
      <div className="seller-reviews-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des avis...</p>
      </div>
    )
  }

  if (sellerReviewStats.totalReviews === 0) {
    return (
      <div className="seller-reviews-empty">
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>Aucun avis pour le moment</h3>
          <p>Ce vendeur n'a pas encore reçu d'évaluations de ses clients.</p>
          <div className="empty-encouragement">
            <span>🎯 Soyez le premier à commander et laisser un avis !</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="seller-reviews-tab">
      {/* En-tête avec statistiques */}
      <div className="reviews-header">
        <div className="reviews-stats-overview">
          <div className="overall-rating-display">
            <div className="rating-number">{sellerReviewStats.averageRating}</div>
            <div className="rating-details">
              <div className="stars-display">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(sellerReviewStats.averageRating) ? 'filled' : ''}`}>
                    ⭐
                  </span>
                ))}
              </div>
              <div className="rating-subtitle">
                {sellerReviewStats.totalReviews} avis client{sellerReviewStats.totalReviews > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="detailed-stats-grid">
            {sellerReviewStats.averageDeliveryRating > 0 && (
              <div className="stat-card">
                <div className="stat-icon">🚚</div>
                <div className="stat-info">
                  <div className="stat-label">Livraison</div>
                  <div className="stat-value">{sellerReviewStats.averageDeliveryRating}/5</div>
                </div>
              </div>
            )}
            {sellerReviewStats.averageProductQualityRating > 0 && (
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <div className="stat-label">Qualité</div>
                  <div className="stat-value">{sellerReviewStats.averageProductQualityRating}/5</div>
                </div>
              </div>
            )}
            {sellerReviewStats.averageSellerServiceRating > 0 && (
              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-info">
                  <div className="stat-label">Service</div>
                  <div className="stat-value">{sellerReviewStats.averageSellerServiceRating}/5</div>
                </div>
              </div>
            )}
            {sellerReviewStats.recommendationRate > 0 && (
              <div className="stat-card recommendation">
                <div className="stat-icon">👍</div>
                <div className="stat-info">
                  <div className="stat-label">Recommandent</div>
                  <div className="stat-value">{sellerReviewStats.recommendationRate}%</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Distribution des notes */}
        <div className="rating-distribution">
          <h4>Distribution des notes</h4>
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="rating-bar">
              <span className="stars-label">{stars} ⭐</span>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ 
                    width: `${sellerReviewStats.totalReviews > 0 ? 
                      (sellerReviewStats.ratingDistribution[stars] / sellerReviewStats.totalReviews) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <span className="count">({sellerReviewStats.ratingDistribution[stars]})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contrôles de tri */}
      <div className="reviews-controls">
        <div className="sort-controls">
          <label>Trier par :</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Plus récents</option>
            <option value="rating">Note la plus élevée</option>
            <option value="helpful">Plus utiles</option>
          </select>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="reviews-list">
        {sortedReviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.buyerFirstName?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="reviewer-details">
                  <h4 className="reviewer-name">{review.displayName}</h4>
                  <div className="review-meta">
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                    {review.productName && (
                      <span className="product-name">• Produit : {review.productName}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="review-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="rating-text">{review.rating}/5</span>
              </div>
            </div>

            {review.comment && (
              <div className="review-comment">
                <p>{review.comment}</p>
              </div>
            )}

            {/* Notes détaillées */}
            {(review.deliveryRating || review.productQualityRating || review.sellerServiceRating) && (
              <div className="review-detailed-ratings">
                {review.deliveryRating && (
                  <div className="detailed-rating">
                    <span className="rating-label">🚚 Livraison :</span>
                    <div className="mini-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`mini-star ${i < review.deliveryRating ? 'filled' : ''}`}>⭐</span>
                      ))}
                    </div>
                    <span className="rating-value">({review.deliveryRating}/5)</span>
                  </div>
                )}
                {review.productQualityRating && (
                  <div className="detailed-rating">
                    <span className="rating-label">📦 Qualité :</span>
                    <div className="mini-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`mini-star ${i < review.productQualityRating ? 'filled' : ''}`}>⭐</span>
                      ))}
                    </div>
                    <span className="rating-value">({review.productQualityRating}/5)</span>
                  </div>
                )}
                {review.sellerServiceRating && (
                  <div className="detailed-rating">
                    <span className="rating-label">👤 Service :</span>
                    <div className="mini-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`mini-star ${i < review.sellerServiceRating ? 'filled' : ''}`}>⭐</span>
                      ))}
                    </div>
                    <span className="rating-value">({review.sellerServiceRating}/5)</span>
                  </div>
                )}
              </div>
            )}

            {review.isRecommended !== null && (
              <div className="review-recommendation">
                {review.isRecommended ? (
                  <span className="recommendation positive">
                    <span className="rec-icon">👍</span>
                    Recommande ce vendeur
                  </span>
                ) : (
                  <span className="recommendation negative">
                    <span className="rec-icon">👎</span>
                    Ne recommande pas ce vendeur
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SellerReviewsTab
