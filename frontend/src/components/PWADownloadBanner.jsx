import React, { useState, useEffect } from 'react'
import './PWADownloadBanner.css'

const PWADownloadBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Si pas de prompt natif, afficher les instructions
      alert('Pour installer l\'application:\n\n' +
            '📱 Sur Android: Menu > Installer l\'application\n' +
            '🍎 Sur iOS: Partager > Sur l\'écran d\'accueil')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setIsInstalled(true)
    }
    
    setDeferredPrompt(null)
  }

  // Ne pas afficher si installé
  if (isInstalled) {
    return null
  }

  return (
    <div className="pwa-download-banner">
      <div className="pwa-banner-content">
        <div className="pwa-banner-icon">
          <div className="phone-mockup">
            📱
          </div>
        </div>

        <div className="pwa-banner-text">
          <h3 className="pwa-banner-title">
            <span className="highlight">Téléchargez</span> l'Application EntreCoiffeur
          </h3>
          <p className="pwa-banner-description">
            Accédez rapidement à vos produits favoris, gérez vos commandes et profitez d'une expérience optimisée !
          </p>
          
          <div className="pwa-banner-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Ultra rapide</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📴</span>
              <span className="feature-text">Hors ligne</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔔</span>
              <span className="feature-text">Notifications</span>
            </div>
          </div>
        </div>

        <div className="pwa-banner-action">
          <button 
            className="pwa-install-button" 
            onClick={handleInstall}
          >
            <span className="button-icon">📥</span>
            <span className="button-text">
              <strong>Installer l'App</strong>
              <small>Gratuit • 2 secondes</small>
            </span>
          </button>
        </div>
      </div>

      {/* Décoration */}
      <div className="pwa-banner-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  )
}

export default PWADownloadBanner
