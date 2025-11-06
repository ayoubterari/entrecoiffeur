import { useEffect, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'

/**
 * Hook personnalisé pour tracker l'activité utilisateur
 * @param {Object} options - Options de configuration
 * @param {string} options.activityType - Type d'activité (product_view, page_view, etc.)
 * @param {string} options.resourceId - ID de la ressource (productId, pageUrl, etc.)
 * @param {string} options.resourceName - Nom de la ressource
 * @param {string} options.userId - ID de l'utilisateur (optionnel)
 * @param {boolean} options.enabled - Activer/désactiver le tracking (défaut: true)
 */
export const useActivityTracking = ({
  activityType,
  resourceId,
  resourceName,
  userId,
  enabled = true
}) => {
  const trackActivity = useMutation(api.functions.mutations.activityTracking.trackActivity)
  const startTimeRef = useRef(Date.now())
  const sessionIdRef = useRef(getOrCreateSessionId())
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    // Réinitialiser le temps de début
    startTimeRef.current = Date.now()
    hasTrackedRef.current = false

    // Log de debug
    console.log('🔍 Activity Tracking Started:', {
      activityType,
      resourceId,
      resourceName,
      userId,
      enabled,
      sessionId: sessionIdRef.current
    })

    // Fonction pour enregistrer l'activité
    const recordActivity = async () => {
      if (hasTrackedRef.current) return

      const endTime = Date.now()
      const timeSpent = Math.floor((endTime - startTimeRef.current) / 1000) // En secondes

      // Ne pas enregistrer si le temps est trop court (moins de 1 seconde)
      if (timeSpent < 1) {
        console.log('⏱️ Temps trop court pour enregistrer:', timeSpent, 's')
        return
      }

      const activityData = {
        userId: userId || undefined,
        sessionId: sessionIdRef.current,
        activityType,
        resourceId: resourceId || undefined,
        resourceName: resourceName || undefined,
        timeSpent,
        startTime: startTimeRef.current,
        endTime,
        pageUrl: window.location.href,
        referrer: document.referrer || undefined,
        deviceType: getDeviceType(),
        userAgent: navigator.userAgent,
      }

      console.log('📊 Recording Activity:', activityData)

      try {
        const result = await trackActivity(activityData)
        console.log('✅ Activity Recorded Successfully:', result)
        hasTrackedRef.current = true
      } catch (error) {
        console.error('❌ Erreur lors du tracking:', error)
      }
    }

    // Enregistrer l'activité quand l'utilisateur quitte la page
    const handleBeforeUnload = () => {
      recordActivity()
    }

    // Enregistrer l'activité quand la page perd le focus
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordActivity()
      } else {
        // Réinitialiser le temps quand la page reprend le focus
        startTimeRef.current = Date.now()
        hasTrackedRef.current = false
      }
    }

    // Enregistrer périodiquement (toutes les 30 secondes)
    const interval = setInterval(() => {
      if (!document.hidden) {
        recordActivity()
        // Réinitialiser pour continuer le tracking
        startTimeRef.current = Date.now()
        hasTrackedRef.current = false
      }
    }, 30000)

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      recordActivity()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [activityType, resourceId, resourceName, userId, enabled, trackActivity])
}

/**
 * Génère ou récupère un ID de session unique
 */
function getOrCreateSessionId() {
  const SESSION_KEY = 'activity_session_id'
  const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

  let sessionData = null
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      sessionData = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Erreur lors de la lecture du sessionId:', e)
  }

  const now = Date.now()

  // Créer une nouvelle session si elle n'existe pas ou a expiré
  if (!sessionData || now - sessionData.timestamp > SESSION_DURATION) {
    sessionData = {
      id: generateUniqueId(),
      timestamp: now
    }
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du sessionId:', e)
    }
  }

  return sessionData.id
}

/**
 * Génère un ID unique
 */
function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Détecte le type d'appareil
 */
function getDeviceType() {
  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}
