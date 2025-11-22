import { Download } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    // Vérifier si déjà installé
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = window.navigator.standalone === true
    
    if (isStandalone || isIOSStandalone) {
      console.log('✅ PWA déjà installée')
      return
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      console.log('📱 PWA installable - Prompt disponible')
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleClick = async () => {
    if (!deferredPrompt) {
      console.log('⚠️ Pas de prompt disponible - Redirection vers installation manuelle')
      alert('Installation automatique non disponible.\n\nPour installer l\'application :\n1. Menu Chrome (⋮)\n2. "Installer l\'application"\n\nOu visitez le site 2-3 fois pour activer l\'installation automatique.')
      return
    }

    try {
      // Afficher le prompt d'installation
      await deferredPrompt.prompt()

      // Attendre le choix de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice
      console.log(`👤 Choix utilisateur: ${outcome}`)

      if (outcome === 'accepted') {
        console.log('✅ PWA installée avec succès')
      }

      // Réinitialiser
      setDeferredPrompt(null)
    } catch (error) {
      console.error('❌ Erreur lors de l\'installation:', error)
    }
  }

  // Vérifier si mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  
  // Vérifier si déjà installé
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isIOSStandalone = window.navigator.standalone === true
  
  // Ne pas afficher si pas mobile ou déjà installé
  if (!isMobile || isStandalone || isIOSStandalone) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 20px',
        background: 'linear-gradient(135deg, #C0B4A5 0%, #D4C9BC 100%)',
        color: '#2d2d2d',
        border: 'none',
        borderRadius: '50px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        minHeight: '56px',
        whiteSpace: 'nowrap'
      }}
      onTouchStart={e => {
        e.currentTarget.style.transform = 'scale(0.95)'
      }}
      onTouchEnd={e => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
      title="Installer l'application"
    >
      <Download style={{ width: '24px', height: '24px' }} />
      <span>Installer l'app</span>
    </button>
  )
}
