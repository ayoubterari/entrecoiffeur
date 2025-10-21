import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ProductImageDisplay from '../components/ProductImageDisplay'

const OrderSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { paymentResult, orderData, billingInfo } = location.state || {}

  useEffect(() => {
    // Rediriger vers l'accueil si pas de données de commande
    if (!paymentResult || !orderData) {
      navigate('/')
    }
  }, [paymentResult, orderData, navigate])

  if (!paymentResult || !orderData) {
    return (
      <div className="order-loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }

  const orderNumber = paymentResult.id
  const orderDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="order-success-page">
      <div className="success-container">
        {/* Header avec animation */}
        <div className="success-header">
          <div className="success-animation">
            <div className="success-checkmark">
              <div className="check-icon">✅</div>
            </div>
            <h1 className="success-title">Commande confirmée !</h1>
            <p className="success-subtitle">
              Merci pour votre achat. Votre commande a été traitée avec succès.
            </p>
          </div>
        </div>

        {/* Contenu principal en 3 colonnes */}
        <div className="success-content">
          {/* Colonne 1: Détails de la commande */}
          <div className="order-details-card">
            <div className="card-header">
              <h2>📋 Détails de la commande</h2>
            </div>
            <div className="order-meta">
              <div className="meta-item">
                <span className="meta-label">Numéro de commande:</span>
                <span className="meta-value">#{orderNumber}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Date:</span>
                <span className="meta-value">{orderDate}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Statut:</span>
                <span className="status-confirmed">✅ Confirmée</span>
              </div>
            </div>

            {/* Articles commandés */}
            <div className="ordered-items">
              <h3>🛍️ Articles commandés</h3>
              {orderData.items.map((item, index) => (
                <div key={index} className="ordered-item">
                  <div className="item-image">
                    <ProductImageDisplay 
                      images={item.image ? [item.image] : []}
                      productName={item.name}
                      className="order-success-product-image"
                    />
                  </div>
                  <div className="item-info">
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

            {/* Résumé financier */}
            <div className="order-summary">
              <div className="summary-line">
                <span>Sous-total:</span>
                <span>{orderData.subtotal.toFixed(2)}€</span>
              </div>
              <div className="summary-line">
                <span>Livraison:</span>
                <span>{orderData.shipping > 0 ? orderData.shipping.toFixed(2) + '€' : 'Gratuite'}</span>
              </div>
              <div className="summary-line">
                <span>TVA (20%):</span>
                <span>{orderData.tax.toFixed(2)}€</span>
              </div>
              <div className="summary-line total-line">
                <span>Total payé:</span>
                <span>{orderData.total.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          {/* Colonne 2: Informations de livraison */}
          <div className="shipping-card">
            <div className="card-header">
              <h2>🚚 Informations de livraison</h2>
            </div>
            <div className="shipping-address">
              <p><strong>{billingInfo.firstName} {billingInfo.lastName}</strong></p>
              <p>{billingInfo.address}</p>
              <p>{billingInfo.postalCode} {billingInfo.city}</p>
              <p>{billingInfo.country}</p>
            </div>
            <div className="shipping-timeline">
              <div className="timeline-item active">
                <div className="timeline-icon">✅</div>
                <div className="timeline-content">
                  <h4>Commande confirmée</h4>
                  <p>Maintenant</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon">📦</div>
                <div className="timeline-content">
                  <h4>Préparation</h4>
                  <p>Dans les 24h</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon">🚚</div>
                <div className="timeline-content">
                  <h4>Expédition</h4>
                  <p>2-3 jours ouvrés</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon">🏠</div>
                <div className="timeline-content">
                  <h4>Livraison</h4>
                  <p>3-5 jours ouvrés</p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 3: Informations de paiement */}
          <div className="payment-card">
            <div className="card-header">
              <h2>💳 Paiement</h2>
            </div>
            <div className="payment-details">
              <div className="payment-method">
                <span className="payment-icon">
                  {paymentResult.id.startsWith('PAYPAL') ? '💙' : '💳'}
                </span>
                <div className="payment-info">
                  <p><strong>Méthode:</strong> {paymentResult.id.startsWith('PAYPAL') ? 'PayPal' : 'Carte bancaire'}</p>
                  <p><strong>Statut:</strong> <span className="status-paid">✅ Payé</span></p>
                  <p><strong>Référence:</strong> {paymentResult.id}</p>
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="security-info">
              <h4>🔒 Sécurité</h4>
              <div className="security-badges">
                <span className="security-badge">🔒 SSL</span>
                <span className="security-badge">✅ Sécurisé</span>
                <span className="security-badge">🛡️ Crypté</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="success-actions">
          <button 
            className="primary-button"
            onClick={() => navigate('/')}
          >
            🛍️ Continuer mes achats
          </button>
          <button 
            className="secondary-button"
            onClick={() => navigate('/dashboard')}
          >
            📋 Voir mes commandes
          </button>
          <button 
            className="outline-button"
            onClick={() => window.print()}
          >
            📄 Imprimer la facture
          </button>
        </div>

        {/* Informations supplémentaires */}
        <div className="additional-info">
          <div className="info-card">
            <div className="info-icon">📧</div>
            <div className="info-content">
              <h4>Confirmation par email</h4>
              <p>Un email de confirmation a été envoyé à <strong>{billingInfo.email}</strong></p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">📞</div>
            <div className="info-content">
              <h4>Besoin d'aide ?</h4>
              <p>Contactez notre service client au <strong>01 23 45 67 89</strong></p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">🔄</div>
            <div className="info-content">
              <h4>Retours</h4>
              <p>Retours gratuits sous 30 jours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
