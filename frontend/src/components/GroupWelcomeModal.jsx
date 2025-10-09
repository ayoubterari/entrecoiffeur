import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../lib/convex'
import './GroupWelcomeModal.css'

const GroupWelcomeModal = ({ isOpen, onClose, userId }) => {
  const [isClosing, setIsClosing] = useState(false)
  const [couponCopied, setCouponCopied] = useState(false)

  const markGroupWelcomeSeen = useMutation(api.auth.markGroupWelcomeSeen)
  const fbGroupCoupon = useQuery(api.functions.queries.coupons.getCouponByCode, { code: "FBGROUP" })

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

  const handleClose = async () => {
    setIsClosing(true)
    
    // Marquer que l'utilisateur a vu le modal
    if (userId) {
      try {
        await markGroupWelcomeSeen({ userId })
      } catch (error) {
        console.error('Error marking group welcome as seen:', error)
      }
    }
    
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const copyCouponCode = () => {
    if (fbGroupCoupon?.code) {
      navigator.clipboard.writeText(fbGroupCoupon.code)
      setCouponCopied(true)
      setTimeout(() => setCouponCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className={`group-welcome-overlay ${isClosing ? 'closing' : ''}`} onClick={handleOverlayClick}>
      <div className={`group-welcome-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="group-welcome-close" onClick={handleClose}>
          ×
        </button>
        
        <div className="group-welcome-content">
          {/* Header avec animation */}
          <div className="group-welcome-header">
            <div className="welcome-icon">
              <span className="celebration-emoji">🎉</span>
              <div className="sparkles">
                <span>✨</span>
                <span>💫</span>
                <span>⭐</span>
              </div>
            </div>
            <h2 className="welcome-title">
              Bienvenue dans le groupe !
            </h2>
            <p className="welcome-subtitle">
              Félicitations ! Vous faites maintenant partie de notre communauté exclusive
            </p>
          </div>

          {/* Coupon Section */}
          {fbGroupCoupon ? (
            <div className="coupon-section">
              <div className="coupon-card">
                <div className="coupon-header">
                  <span className="coupon-icon">🎫</span>
                  <h3>Votre cadeau de bienvenue</h3>
                </div>
                
                <div className="coupon-details">
                  <div className="coupon-code-container">
                    <span className="coupon-label">Code promo :</span>
                    <div className="coupon-code-wrapper">
                      <span className="coupon-code">{fbGroupCoupon.code}</span>
                      <button 
                        className={`copy-button ${couponCopied ? 'copied' : ''}`}
                        onClick={copyCouponCode}
                      >
                        {couponCopied ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="coupon-discount">
                    <span className="discount-value">{fbGroupCoupon.discountPercentage}%</span>
                    <span className="discount-label">de réduction</span>
                  </div>
                  
                  {fbGroupCoupon.description && (
                    <p className="coupon-description">
                      {fbGroupCoupon.description}
                    </p>
                  )}
                  
                  {fbGroupCoupon.minimumAmount && (
                    <p className="coupon-minimum">
                      Commande minimum : {fbGroupCoupon.minimumAmount}€
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="coupon-loading">
              <div className="loading-spinner"></div>
              <p>Chargement de votre cadeau...</p>
            </div>
          )}

          {/* Benefits Section */}
          <div className="benefits-section">
            <h4>Avantages membres du groupe :</h4>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">🎁</span>
                Coupons exclusifs réservés aux membres
              </li>
              <li>
                <span className="benefit-icon">⚡</span>
                Accès prioritaire aux nouvelles collections
              </li>
              <li>
                <span className="benefit-icon">💬</span>
                Support client dédié
              </li>
              <li>
                <span className="benefit-icon">🚀</span>
                Offres spéciales et promotions flash
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="welcome-actions">
            <button className="start-shopping-btn" onClick={handleClose}>
              <span>Commencer mes achats</span>
              <span className="btn-icon">🛍️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupWelcomeModal
