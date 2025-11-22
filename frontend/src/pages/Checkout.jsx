import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../lib/convex'
import CouponInput from '../components/CouponInput'
import { useAffiliateTracking } from '../hooks/useAffiliateTracking'
import ProductImageDisplay from '../components/ProductImageDisplay'
import './Checkout.css'

const Checkout = ({ isAuthenticated, onLogin, userEmail, userFirstName, userLastName }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getActiveAffiliateCode } = useAffiliateTracking()
  const [orderData, setOrderData] = useState(null)
  const [originalOrderData, setOriginalOrderData] = useState(null)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  
  // Convex mutations
  const createOrder = useMutation(api.orders.createOrder)
  const applyCouponMutation = useMutation(api.functions.mutations.coupons.applyCoupon)
  const getProduct = useQuery(api.products.getById, 
    orderData?.items?.[0]?.productId ? { productId: orderData.items[0].productId } : "skip"
  )
  const getCurrentUser = useQuery(api.auth.getCurrentUser, 
    isAuthenticated && localStorage.getItem('userId') ? { userId: localStorage.getItem('userId') } : "skip"
  )
  const [billingInfo, setBillingInfo] = useState({
    firstName: userFirstName || '',
    lastName: userLastName || '',
    email: userEmail || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'FR'
  })

  useEffect(() => {
    // Récupérer les données de commande depuis l'état de navigation
    if (location.state?.orderData) {
      setOrderData(location.state.orderData)
      setOriginalOrderData(location.state.orderData)
    } else {
      // Rediriger vers l'accueil si pas de données de commande
      navigate('/')
    }
  }, [location.state, navigate])

  useEffect(() => {
    // Rediriger vers login si non authentifié
    if (!isAuthenticated) {
      onLogin()
    }
  }, [isAuthenticated, onLogin])

  const handleInputChange = (field, value) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Gestion des coupons
  const handleCouponApplied = (couponData) => {
    setAppliedCoupon(couponData)
    setOrderData(prev => ({
      ...prev,
      discount: couponData.discountAmount,
      couponCode: couponData.code,
      couponId: couponData.couponId,
      total: couponData.finalAmount
    }))
  }

  const handleCouponRemoved = () => {
    setAppliedCoupon(null)
    setOrderData(prev => ({
      ...prev,
      discount: 0,
      couponCode: null,
      couponId: null,
      total: originalOrderData.total
    }))
  }

  const handleCODPayment = async () => {
    setLoading(true)
    
    try {
      // Validation des champs requis
      if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.email || 
          !billingInfo.address || !billingInfo.city || !billingInfo.postalCode) {
        alert('Veuillez remplir tous les champs obligatoires')
        setLoading(false)
        return
      }

      // Appliquer le coupon si présent
      if (orderData.couponId) {
        await applyCouponMutation({ couponId: orderData.couponId })
      }

      // Créer la commande dans Convex avec COD
      if (getProduct && getCurrentUser && getCurrentUser._id) {
        // Récupérer le code d'affiliation actif
        const affiliateCode = getActiveAffiliateCode()
        
        const orderResult = await createOrder({
          buyerId: getCurrentUser._id,
          sellerId: getProduct.sellerId,
          productId: orderData.items[0].productId,
          productName: orderData.items[0].name,
          productPrice: orderData.items[0].price,
          quantity: orderData.items[0].quantity,
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          tax: orderData.tax,
          discount: orderData.discount || 0,
          couponCode: orderData.couponCode || undefined,
          total: orderData.total,
          paymentMethod: 'COD',
          // Ajouter les données d'affiliation
          affiliateCode: affiliateCode || undefined,
          paymentId: undefined, // Pas de paymentId pour COD
          billingInfo: billingInfo,
        })

        console.log('Commande COD créée:', orderResult)
      } else {
        console.error('Impossible de créer la commande:', {
          getProduct: !!getProduct,
          getCurrentUser: !!getCurrentUser,
          userId: getCurrentUser?._id,
          userEmail: localStorage.getItem('userEmail')
        })
        throw new Error('Données utilisateur manquantes pour créer la commande')
      }

      // Rediriger vers la page de succès
      navigate('/order-success', {
        state: {
          paymentResult: {
            id: 'COD_' + Date.now(),
            status: 'PENDING',
            amount: orderData.total,
            currency: 'DH',
            method: 'Cash on Delivery'
          },
          orderData,
          billingInfo
        }
      })
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error)
      alert('Erreur lors de la création de la commande. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }


  if (!orderData) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          Retour
        </button>
        <h1>Finaliser la commande</h1>
      </div>

      <div className="checkout-container">
        {/* Résumé de commande */}
        <div className="order-summary">
          <h2>Résumé de la commande</h2>
          
          <div className="order-items">
            {orderData.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <ProductImageDisplay 
                    images={item.image ? [item.image] : []}
                    productName={item.name}
                    className="checkout-product-image"
                  />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Quantité: {item.quantity}</p>
                  <p className="item-price">{item.price}€ × {item.quantity}</p>
                </div>
                <div className="item-total">
                  {(item.price * item.quantity).toFixed(2)}€
                </div>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-line">
              <span>Sous-total:</span>
              <span>{orderData.subtotal.toFixed(2)}€</span>
            </div>
            <div className="total-line">
              <span>Livraison:</span>
              <span>{orderData.shipping > 0 ? orderData.shipping.toFixed(2) + '€' : 'Gratuite'}</span>
            </div>
            <div className="total-line">
              <span>TVA (20%):</span>
              <span>{orderData.tax.toFixed(2)}€</span>
            </div>
            {orderData.discount > 0 && (
              <div className="total-line discount-line">
                <span>Réduction ({orderData.couponCode}):</span>
                <span className="discount-amount">-{orderData.discount.toFixed(2)}€</span>
              </div>
            )}
            <div className="total-line final-total">
              <span>Total:</span>
              <span>{orderData.total.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* Section Coupon */}
        <CouponInput 
          orderAmount={originalOrderData?.subtotal || 0}
          onCouponApplied={handleCouponApplied}
          onCouponRemoved={handleCouponRemoved}
        />

        {/* Informations de facturation */}
        <div className="billing-section">
          <h2>Informations de facturation</h2>
          
          <div className="billing-form">
            <div className="form-row">
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  value={billingInfo.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={billingInfo.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={billingInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Adresse *</label>
              <input
                type="text"
                value={billingInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 rue de la Paix"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ville *</label>
                <input
                  type="text"
                  value={billingInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Code postal *</label>
                <input
                  type="text"
                  value={billingInfo.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Méthode de paiement COD */}
        <div className="payment-section">
          <h2>Méthode de paiement</h2>
          
          <div className="payment-methods">
            <label className="payment-method active">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="payment-option">
                <div className="payment-icon">💵</div>
                <div className="payment-info">
                  <h4>Paiement à la livraison (COD)</h4>
                  <p>Payez en espèces lors de la réception de votre commande</p>
                </div>
              </div>
            </label>
          </div>

          <div className="cod-info">
            <div className="info-box">
              <h4>ℹ️ Comment ça marche ?</h4>
              <ul>
                <li>✅ Commandez maintenant sans payer en ligne</li>
                <li>📦 Recevez votre colis à l'adresse indiquée</li>
                <li>💵 Payez en espèces au livreur</li>
                <li>🎉 Profitez de votre achat !</li>
              </ul>
            </div>
          </div>

          {/* Bouton de confirmation */}
          <div className="payment-actions">
            <button
              className="cod-button"
              onClick={handleCODPayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  Traitement...
                </>
              ) : (
                <>
                  💵 Confirmer la commande ({orderData.total.toFixed(2)} DH)
                </>
              )}
            </button>
          </div>

          <div className="payment-security">
            <div className="security-badges">
              <span className="security-badge">🔒 Sécurisé</span>
              <span className="security-badge">✅ Sans risque</span>
              <span className="security-badge">💵 Paiement à la livraison</span>
            </div>
            <p>Aucun paiement en ligne requis. Payez uniquement à la réception de votre commande.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
