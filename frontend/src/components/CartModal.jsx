import React from 'react'
import { useNavigate } from 'react-router-dom'
import './CartModal.css'

const CartModal = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, isAuthenticated, onLogin }) => {
  const navigate = useNavigate()
  if (!isOpen) return null

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal >= 50 ? 0 : 5.99
  const tax = (subtotal + shipping) * 0.20
  const total = subtotal + shipping + tax

  const handleCheckout = () => {
    console.log('🛒 Bouton Passer commande cliqué!')
    console.log('Authentifié:', isAuthenticated)
    console.log('Panier:', cart)
    
    // Vérifier l'authentification
    if (!isAuthenticated) {
      console.log('❌ Non authentifié - Ouverture modal de connexion')
      onClose()
      onLogin()
      return
    }

    // Créer les données de commande
    const orderData = {
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: total
    }

    console.log('✅ Navigation vers checkout avec données:', orderData)

    // Fermer la modal
    onClose()
    
    // Naviguer vers la page de checkout avec les données
    navigate('/checkout', {
      state: { orderData }
    })
  }

  return (
    <div className="cart-modal-overlay">
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Mon Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
          <button className="cart-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Votre panier est vide</h3>
              <p>Ajoutez des produits pour commencer vos achats</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.productId} className="cart-item">
                    <div className="item-image">
                      {typeof item.image === 'string' && item.image.startsWith('k') ? (
                        <div className="image-placeholder">📦</div>
                      ) : (
                        <span className="item-emoji">{item.image}</span>
                      )}
                    </div>
                    
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-price">{item.price.toFixed(2)}€</p>
                    </div>
                    
                    <div className="item-quantity">
                      <button 
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-total">
                      {(item.price * item.quantity).toFixed(2)}€
                    </div>
                    
                    <button 
                      className="remove-item-btn"
                      onClick={() => onRemoveItem(item.productId)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-line">
                  <span>Sous-total:</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="summary-line">
                  <span>Livraison:</span>
                  <span>{shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)}€`}</span>
                </div>
                <div className="summary-line">
                  <span>TVA (20%):</span>
                  <span>{tax.toFixed(2)}€</span>
                </div>
                <div className="summary-line total">
                  <span>Total:</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                
                {subtotal < 50 && (
                  <div className="shipping-notice">
                    Ajoutez {(50 - subtotal).toFixed(2)}€ pour la livraison gratuite
                  </div>
                )}
              </div>

              <div className="cart-actions">
                <button className="continue-shopping-btn" onClick={onClose}>
                  Continuer mes achats
                </button>
                <button 
                  className="checkout-btn" 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  {cart.length === 0 ? 'Panier vide' : 'Passer commande'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartModal
