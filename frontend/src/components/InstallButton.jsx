import { Download } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showButton, setShowButton] = useState(false)

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
      setShowButton(true)
      console.log('📱 PWA installable - Bouton affiché')
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Pour debug : afficher le bouton après 2 secondes si pas de prompt
    const debugTimer = setTimeout(() => {
      if (!deferredPrompt) {
        console.log('⚠️ beforeinstallprompt non déclenché après 2s')
        console.log('Vérifiez : Service Worker actif, Manifest valide, Icônes présentes')
      }
    }, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(debugTimer)
    }
  }, [])

  const handleClick = async () => {
    if (!deferredPrompt) {
      console.log('⚠️ Pas de prompt disponible - Vérifiez la console')
      alert('Installation PWA non disponible. Vérifiez que vous êtes sur mobile et que le site est en HTTPS.')
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
      setShowButton(false)
    } catch (error) {
      console.error('❌ Erreur lors de l\'installation:', error)
    }
  }

  // Vérifier si mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  
  if (!isMobile || !showButton) {
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
