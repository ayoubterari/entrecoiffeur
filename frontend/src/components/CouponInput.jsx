import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'
import './CouponInput.css'

const CouponInput = ({ orderAmount, onCouponApplied, onCouponRemoved }) => {
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Mutation pour valider le coupon
  const validateCoupon = useMutation(api.functions.mutations.coupons.validateCoupon)

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    
    if (!couponCode.trim()) {
      setError('Veuillez saisir un code coupon')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await validateCoupon({
        code: couponCode.trim(),
        orderAmount: orderAmount
      })

      if (result.isValid) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          ...result
        })
        setSuccess(`Coupon appliqué ! -${result.discountPercentage}% (${result.discountAmount.toFixed(2)}€)`)
        setCouponCode('')
        
        // Notifier le parent
        if (onCouponApplied) {
          onCouponApplied(result)
        }
      }
    } catch (err) {
      setError(err.message || 'Code coupon invalide')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setSuccess('')
    setError('')
    setCouponCode('')
    
    // Notifier le parent
    if (onCouponRemoved) {
      onCouponRemoved()
    }
  }

  // Clear messages after 3 seconds
  React.useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('')
        setError('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  return (
    <div className="coupon-input-container">
      <div className="coupon-section-header">
        <h3>🎫 Code de réduction</h3>
        <p>Avez-vous un code promo ?</p>
      </div>

      {!appliedCoupon ? (
        <form onSubmit={handleApplyCoupon} className="coupon-form">
          <div className="coupon-input-group">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Entrez votre code promo"
              className="coupon-input"
              disabled={loading}
              maxLength={20}
            />
            <button
              type="submit"
              className="apply-coupon-btn"
              disabled={loading || !couponCode.trim()}
            >
              {loading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                'Appliquer'
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="applied-coupon">
          <div className="coupon-info">
            <div className="coupon-badge">
              <span className="coupon-icon">🎫</span>
              <div className="coupon-details">
                <strong>{appliedCoupon.code}</strong>
                <span className="discount-text">
                  -{appliedCoupon.discountPercentage}% 
                  ({appliedCoupon.discountAmount.toFixed(2)}€)
                </span>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="remove-coupon-btn"
              title="Retirer le coupon"
            >
              ✕
            </button>
          </div>
          {appliedCoupon.description && (
            <p className="coupon-description">{appliedCoupon.description}</p>
          )}
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="coupon-message error">
          <span className="message-icon">❌</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="coupon-message success">
          <span className="message-icon">✅</span>
          {success}
        </div>
      )}

      {/* Coupon suggestions */}
      {!appliedCoupon && !loading && (
        <div className="coupon-suggestions">
          <p className="suggestions-text">💡 Codes populaires : WELCOME10, SUMMER20, FIRST15</p>
        </div>
      )}
    </div>
  )
}

export default CouponInput
