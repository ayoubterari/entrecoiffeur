import { Download } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    // Écouter l'événement beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('📱 PWA installable détecté')
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ PWA déjà installée')
      setIsInstallable(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleClick = async () => {
    if (!deferredPrompt) {
      console.log('⚠️ Pas de prompt disponible')
      return
    }

    // Afficher le prompt d'installation
    deferredPrompt.prompt()

    // Attendre le choix de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice
    console.log(`👤 Choix utilisateur: ${outcome}`)

    // Réinitialiser le prompt
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  // Ne montrer que sur mobile et si installable
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  
  if (!isMobile || !isInstallable) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: 'linear-gradient(135deg, #C0B4A5 0%, #D4C9BC 100%)',
        color: '#2d2d2d',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(192, 180, 165, 0.3)',
        transition: 'all 0.3s ease',
        minHeight: '44px', // Touch target iOS
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.05)'
        e.target.style.boxShadow = '0 4px 12px rgba(192, 180, 165, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)'
        e.target.style.boxShadow = '0 2px 8px rgba(192, 180, 165, 0.3)'
      }}
      title="Installer l'application"
    >
      <Download style={{ width: '18px', height: '18px' }} />
      <span>Installer l'app</span>
    </button>
  )
}
