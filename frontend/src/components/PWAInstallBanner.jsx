import { Download, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Vérifier si déjà installé
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = window.navigator.standalone === true
    
    if (isStandalone || isIOSStandalone) {
      console.log('✅ PWA déjà installée - Banner masqué')
      return
    }

    // Vérifier si l'utilisateur a fermé le banner
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed')
    if (bannerDismissed === 'true') {
      console.log('ℹ️ Banner déjà fermé par l\'utilisateur')
      return
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
      console.log('📱 PWA installable - Banner affiché avec prompt')
    }

    window.addEventListener('beforeinstallprompt', handler)

    // TOUJOURS afficher le banner après 1 seconde sur mobile (pour guider l'utilisateur)
    const timer = setTimeout(() => {
      setShowBanner(true)
      console.log('📱 Banner affiché pour guider l\'installation')
    }, 1000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Détecter le navigateur
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      const isAndroid = /Android/i.test(navigator.userAgent)
      
      let message = '📱 Pour installer l\'application :\n\n'
      
      if (isIOS) {
        message += '🍎 Sur Safari iOS :\n'
        message += '1. Cliquez sur le bouton Partager (⬆️)\n'
        message += '2. Faites défiler et sélectionnez "Sur l\'écran d\'accueil"\n'
        message += '3. Appuyez sur "Ajouter"\n\n'
        message += '✨ L\'application sera ajoutée à votre écran d\'accueil !'
      } else if (isAndroid) {
        message += '🤖 Sur Chrome Android :\n'
        message += '1. Cliquez sur le menu (⋮) en haut à droite\n'
        message += '2. Sélectionnez "Installer l\'application"\n'
        message += '3. Confirmez l\'installation\n\n'
        message += '✨ L\'application sera ajoutée à votre écran d\'accueil !'
      } else {
        message += '1. Cliquez sur le menu de votre navigateur\n'
        message += '2. Cherchez "Installer l\'application" ou "Ajouter à l\'écran d\'accueil"\n'
        message += '3. Confirmez l\'installation\n\n'
        message += '✨ L\'application sera ajoutée à votre écran d\'accueil !'
      }
      
      alert(message)
      return
    }

    try {
      // Afficher le prompt d'installation
      await deferredPrompt.prompt()

      // Attendre le choix de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice
      console.log(`👤 Installation: ${outcome}`)

      if (outcome === 'accepted') {
        console.log('✅ PWA installée avec succès')
        setShowBanner(false)
      }

      setDeferredPrompt(null)
    } catch (error) {
      console.error('❌ Erreur installation:', error)
    }
  }

  const handleClose = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-banner-dismissed', 'true')
    console.log('ℹ️ Banner fermé par l\'utilisateur')
  }

  // Vérifier si mobile (optionnel - commenté pour afficher sur desktop aussi)
  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  
  // Afficher sur tous les appareils (mobile + desktop)
  if (!showBanner) {
    return null
  }

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'linear-gradient(135deg, #4E4A43 0%, #6B5D56 50%, #8B7D76 100%)',
      padding: '18px 20px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
      animation: 'slideDown 0.4s ease-out',
      borderBottom: '3px solid #C0B4A5'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Icône et Texte */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flex: 1
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #C0B4A5 0%, #D4C9BC 100%)',
            borderRadius: '14px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(192, 180, 165, 0.4)',
            animation: 'pulse 2s infinite'
          }}>
            <Download style={{ width: '26px', height: '26px', color: '#2d2d2d' }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '3px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              📱 Installer l'application
            </div>
            <div style={{
              fontSize: '13px',
              color: '#D4C9BC',
              lineHeight: '1.4',
              fontWeight: '500'
            }}>
              Accès rapide et hors ligne depuis votre écran d'accueil
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {/* Bouton Installer */}
          <button
            onClick={handleInstall}
            style={{
              background: 'linear-gradient(135deg, #C0B4A5 0%, #D4C9BC 100%)',
              color: '#2d2d2d',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(192, 180, 165, 0.4)',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onTouchStart={e => {
              e.currentTarget.style.transform = 'scale(0.95)'
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(192, 180, 165, 0.3)'
            }}
            onTouchEnd={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(192, 180, 165, 0.4)'
            }}
          >
            Installer
          </button>

          {/* Bouton Fermer */}
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onTouchStart={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
            onTouchEnd={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#ffffff' }} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(192, 180, 165, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(192, 180, 165, 0.6);
          }
        }
      `}</style>
    </div>
  )
}
