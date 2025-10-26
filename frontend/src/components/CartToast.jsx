import React, { useState, useEffect } from 'react'
import './CartToast.css'

const CartToast = ({ show, product, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className={`cart-toast ${isVisible ? 'cart-toast-visible' : 'cart-toast-hidden'}`}>
      <div className="cart-toast-content">
        <div className="cart-toast-icon">✅</div>
        <div className="cart-toast-details">
          <div className="cart-toast-title">Produit ajouté au panier !</div>
          <div className="cart-toast-price">
            {product?.quantity}x {product?.price}€ = {(product?.quantity * product?.price).toFixed(2)}€
          </div>
        </div>
        <button className="cart-toast-close" onClick={() => setIsVisible(false)}>
          ×
        </button>
      </div>
    </div>
  )
}

export default CartToast
