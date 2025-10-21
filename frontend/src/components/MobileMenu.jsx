import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MobileMenu.module.css'

const MobileMenu = ({ 
  isOpen, 
  onClose, 
  isAuthenticated, 
  onLogout, 
  onOpenFavorites, 
  onOpenCart, 
  favoritesCount, 
  cartCount,
  userFirstName 
}) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleProfileClick = () => {
    navigate('/dashboard')
    onClose()
  }

  const handleLogout = () => {
    onLogout()
    onClose()
  }

  const handleFavorites = () => {
    onOpenFavorites()
    onClose()
  }

  const handleCart = () => {
    onOpenCart()
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />
      
      {/* Menu Popup */}
      <div className={styles.menuPopup}>
        <div className={styles.menuHeader}>
          <h3>Menu</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.menuContent}>
          {isAuthenticated ? (
            <>
              {/* Profil */}
              <button className={styles.menuItem} onClick={handleProfileClick}>
                <div className={styles.menuIcon}>
                  <div className={styles.userAvatar}>
                    {userFirstName ? userFirstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <span className={styles.menuText}>Profil</span>
                <span className={styles.menuArrow}>›</span>
              </button>

              {/* Favoris */}
              <button className={styles.menuItem} onClick={handleFavorites}>
                <div className={styles.menuIcon}>❤️</div>
                <span className={styles.menuText}>Favoris</span>
                {favoritesCount > 0 && (
                  <span className={styles.menuBadge}>{favoritesCount}</span>
                )}
                <span className={styles.menuArrow}>›</span>
              </button>

              {/* Panier */}
              <button className={styles.menuItem} onClick={handleCart}>
                <div className={styles.menuIcon}>🛒</div>
                <span className={styles.menuText}>Panier</span>
                {cartCount > 0 && (
                  <span className={styles.menuBadge}>{cartCount}</span>
                )}
                <span className={styles.menuArrow}>›</span>
              </button>

              {/* Séparateur */}
              <div className={styles.menuDivider} />

              {/* Déconnexion */}
              <button className={`${styles.menuItem} ${styles.logoutItem}`} onClick={handleLogout}>
                <div className={styles.menuIcon}>🚪</div>
                <span className={styles.menuText}>Déconnexion</span>
                <span className={styles.menuArrow}>›</span>
              </button>
            </>
          ) : (
            <div className={styles.notAuthMessage}>
              <p>Connectez-vous pour accéder à votre profil</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MobileMenu
