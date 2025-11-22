import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../lib/convex'

/**
 * Composant pour gérer les notifications push
 * À utiliser dans le Dashboard des vendeurs (professionnels et grossistes)
 */
export default function PushNotificationManager({ userId, userType }) {
  const [permission, setPermission] = useState(Notification.permission)
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  
  const savePushToken = useMutation(api.functions.mutations.pushNotifications.savePushToken)
  const removePushToken = useMutation(api.functions.mutations.pushNotifications.removePushToken)

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      
      // Vérifier si déjà abonné
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error)
    }
  }

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribeToPush = async () => {
    try {
      // Demander la permission
      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult)

      if (permissionResult !== 'granted') {
        alert('❌ Permission refusée. Vous ne recevrez pas de notifications.')
        return
      }

      // Obtenir le service worker
      const registration = await navigator.serviceWorker.ready

      // Clé publique VAPID (à générer - voir documentation ci-dessous)
      // Pour l'instant, on utilise un token simple
      const applicationServerKey = urlBase64ToUint8Array(
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      )

      // S'abonner aux notifications push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })

      // Convertir la subscription en JSON
      const subscriptionJSON = subscription.toJSON()
      const pushToken = JSON.stringify(subscriptionJSON)

      // Enregistrer le token dans Convex
      await savePushToken({
        userId: userId,
        pushToken: pushToken
      })

      setIsSubscribed(true)
      console.log('✅ Abonné aux notifications push')
      alert('✅ Notifications activées ! Vous recevrez des alertes pour vos nouvelles commandes.')

    } catch (error) {
      console.error('❌ Erreur lors de l\'abonnement:', error)
      alert('❌ Erreur lors de l\'activation des notifications.')
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await removePushToken({ userId: userId })
        setIsSubscribed(false)
        console.log('🔕 Désabonné des notifications push')
        alert('🔕 Notifications désactivées.')
      }
    } catch (error) {
      console.error('❌ Erreur lors du désabonnement:', error)
    }
  }

  // Afficher uniquement pour les professionnels et grossistes
  if (userType !== 'professionnel' && userType !== 'grossiste') {
    return null
  }

  // Ne pas afficher si non supporté
  if (!isSupported) {
    return null
  }

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: '12px',
      border: '2px solid #C0B4A5',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '32px' }}>🔔</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#2d2d2d' }}>
            Notifications de commandes
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
            Recevez une alerte instantanée à chaque nouvelle commande
          </p>
        </div>
      </div>

      {permission === 'denied' && (
        <div style={{
          padding: '12px',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '12px'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
            ⚠️ Les notifications sont bloquées. Veuillez autoriser les notifications dans les paramètres de votre navigateur.
          </p>
        </div>
      )}

      {permission === 'default' && (
        <button
          onClick={subscribeToPush}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #C0B4A5 0%, #D4C9BC 100%)',
            color: '#2d2d2d',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(192, 180, 165, 0.4)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'scale(1.02)'
            e.target.style.boxShadow = '0 6px 16px rgba(192, 180, 165, 0.6)'
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 4px 12px rgba(192, 180, 165, 0.4)'
          }}
        >
          🔔 Activer les notifications
        </button>
      )}

      {permission === 'granted' && isSubscribed && (
        <div>
          <div style={{
            padding: '12px',
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
              ✅ Notifications activées ! Vous recevrez une alerte pour chaque nouvelle commande.
            </p>
          </div>
          <button
            onClick={unsubscribeFromPush}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.target.style.background = '#5a6268'
            }}
            onMouseLeave={e => {
              e.target.style.background = '#6c757d'
            }}
          >
            🔕 Désactiver les notifications
          </button>
        </div>
      )}

      {permission === 'granted' && !isSubscribed && (
        <button
          onClick={subscribeToPush}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #C0B4A5 0%, #D4C9BC 100%)',
            color: '#2d2d2d',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(192, 180, 165, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          🔔 Réactiver les notifications
        </button>
      )}
    </div>
  )
}
