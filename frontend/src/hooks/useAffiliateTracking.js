import { useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'

// Hook pour gérer le tracking des liens d'affiliation
export const useAffiliateTracking = () => {
  const trackAffiliateClick = useMutation(api.affiliateSystem.trackAffiliateClick)

  useEffect(() => {
    // Vérifier s'il y a un code d'affiliation dans l'URL
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')

    if (refCode) {
      // Stocker le code d'affiliation dans le localStorage pour la session
      localStorage.setItem('affiliateCode', refCode)
      localStorage.setItem('affiliateTimestamp', Date.now().toString())

      // Générer un ID de visiteur unique s'il n'existe pas
      let visitorId = localStorage.getItem('visitorId')
      if (!visitorId) {
        visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
        localStorage.setItem('visitorId', visitorId)
      }

      // Tracker le clic
      trackAffiliateClick({
        linkCode: refCode,
        visitorId: visitorId,
        ipAddress: undefined, // Sera géré côté serveur si nécessaire
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined
      }).catch(error => {
        console.error('Erreur lors du tracking d\'affiliation:', error)
      })

      // Nettoyer l'URL (optionnel, pour éviter de partager l'URL avec le code)
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }, [trackAffiliateClick])

  // Fonction pour récupérer le code d'affiliation actuel
  const getActiveAffiliateCode = () => {
    const code = localStorage.getItem('affiliateCode')
    const timestamp = localStorage.getItem('affiliateTimestamp')
    
    // Expirer le code après 30 jours
    if (code && timestamp) {
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
      if (Date.now() - parseInt(timestamp) > thirtyDaysInMs) {
        localStorage.removeItem('affiliateCode')
        localStorage.removeItem('affiliateTimestamp')
        return null
      }
      return code
    }
    
    return null
  }

  // Fonction pour nettoyer le code d'affiliation
  const clearAffiliateCode = () => {
    localStorage.removeItem('affiliateCode')
    localStorage.removeItem('affiliateTimestamp')
  }

  // Fonction pour préserver le code d'affiliation avant redirection auth
  const preserveAffiliateForAuth = () => {
    const code = getActiveAffiliateCode()
    if (code) {
      // Stocker dans sessionStorage pour survie à la redirection
      sessionStorage.setItem('pendingAffiliateCode', code)
      sessionStorage.setItem('pendingAffiliateTimestamp', localStorage.getItem('affiliateTimestamp'))
      // Stocker aussi l'URL de retour
      sessionStorage.setItem('affiliateReturnUrl', window.location.href)
    }
  }

  // Fonction pour restaurer le code après connexion
  const restoreAffiliateAfterAuth = () => {
    const pendingCode = sessionStorage.getItem('pendingAffiliateCode')
    const pendingTimestamp = sessionStorage.getItem('pendingAffiliateTimestamp')
    
    if (pendingCode && pendingTimestamp) {
      // Restaurer dans localStorage
      localStorage.setItem('affiliateCode', pendingCode)
      localStorage.setItem('affiliateTimestamp', pendingTimestamp)
      
      // Nettoyer sessionStorage
      sessionStorage.removeItem('pendingAffiliateCode')
      sessionStorage.removeItem('pendingAffiliateTimestamp')
      
      return true // Indique qu'un code a été restauré
    }
    
    return false
  }

  // Fonction pour obtenir l'URL de retour après auth
  const getAffiliateReturnUrl = () => {
    const returnUrl = sessionStorage.getItem('affiliateReturnUrl')
    if (returnUrl) {
      sessionStorage.removeItem('affiliateReturnUrl')
      return returnUrl
    }
    return null
  }

  return {
    getActiveAffiliateCode,
    clearAffiliateCode,
    preserveAffiliateForAuth,
    restoreAffiliateAfterAuth,
    getAffiliateReturnUrl
  }
}
