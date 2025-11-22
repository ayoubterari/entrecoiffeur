import React, { useState, useEffect } from 'react'
import './PWAInstallPrompt.css'

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Écouter l'événement beforeinstallprompt
    const handler = (e) => {
      // Empêcher le mini-infobar par défaut
      e.preventDefault()
      // Stocker l'événement pour l'utiliser plus tard
      setDeferredPrompt(e)
      
      // Vérifier si l'utilisateur n'a pas déjà refusé
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      const dismissedDate = dismissed ? new Date(dismissed) : null
      const now = new Date()
      
      // Afficher le prompt si pas refusé ou si refusé il y a plus de 7 jours
      if (!dismissed || (now - dismissedDate) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Afficher le prompt d'installation
    deferredPrompt.prompt()

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice
    
    console.log(`User response to the install prompt: ${outcome}`)

    // Réinitialiser le prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    // Enregistrer la date de refus
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <button 
          className="pwa-install-close" 
          onClick={handleDismiss}
          aria-label="Fermer"
        >
          ×
        </button>
        
        <div className="pwa-install-icon">
          📱
        </div>
        
        <div className="pwa-install-text">
          <h3>Installer EntreCoiffeur</h3>
          <p>Installez l'application pour un accès rapide et une meilleure expérience !</p>
        </div>
        
        <div className="pwa-install-actions">
          <button 
            className="pwa-install-btn primary" 
            onClick={handleInstall}
          >
            Installer
          </button>
          <button 
            className="pwa-install-btn secondary" 
            onClick={handleDismiss}
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
