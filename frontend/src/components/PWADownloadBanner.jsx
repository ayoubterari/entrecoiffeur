import React, { useState, useEffect } from 'react'
import './PWADownloadBanner.css'

const PWADownloadBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    console.log('🔍 PWA Banner: Component mounted')
    
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ PWA Banner: App déjà installée')
      setIsInstalled(true)
      return
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e) => {
      console.log('✅ PWA Banner: beforeinstallprompt event received!')
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    console.log('👂 PWA Banner: Listening for beforeinstallprompt event...')

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    console.log('🖱️ PWA Banner: Install button clicked')
    console.log('📦 PWA Banner: deferredPrompt =', deferredPrompt)
    
    if (!deferredPrompt) {
      console.log('❌ PWA Banner: Prompt d\'installation non disponible')
      console.log('💡 PWA Banner: Raisons possibles:')
      console.log('   - En mode dev (npm run dev) - Faire npm run build + npm run preview')
      console.log('   - Critères PWA non remplis')
      console.log('   - App déjà installée')
      console.log('   - Navigateur ne supporte pas (Safari iOS)')
      return
    }

    try {
      console.log('🚀 PWA Banner: Lancement du prompt d\'installation...')
      await deferredPrompt.prompt()
      
      console.log('⏳ PWA Banner: Attente de la réponse utilisateur...')
      const { outcome } = await deferredPrompt.userChoice
      console.log('📊 PWA Banner: Résultat =', outcome)
      
      if (outcome === 'accepted') {
        console.log('✅ PWA Banner: Installation acceptée!')
        setIsInstalled(true)
      } else {
        console.log('❌ PWA Banner: Installation refusée par l\'utilisateur')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('❌ PWA Banner: Erreur installation:', error)
    }
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
