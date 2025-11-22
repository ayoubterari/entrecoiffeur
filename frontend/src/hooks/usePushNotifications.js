import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../lib/convex';

/**
 * Hook personnalisé pour gérer les notifications push PWA
 * Demande la permission et enregistre le service worker pour les notifications
 */
export const usePushNotifications = (userId, userType) => {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  
  // Mutation pour enregistrer l'abonnement dans Convex
  const savePushSubscription = useMutation(api.functions.mutations.pushNotifications.savePushSubscription);

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    const checkSupport = () => {
      const supported = 'Notification' in window && 
                       'serviceWorker' in navigator && 
                       'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Demander la permission pour les notifications
  const requestPermission = async () => {
    if (!isSupported) {
      console.warn('⚠️ Les notifications ne sont pas supportées sur ce navigateur');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        console.log('✅ Permission accordée pour les notifications');
        await subscribeUser();
        return true;
      } else {
        console.log('❌ Permission refusée pour les notifications');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permission:', error);
      return false;
    }
  };

  // S'abonner aux notifications push
  const subscribeUser = async () => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Vérifier si déjà abonné
      let sub = await registration.pushManager.getSubscription();
      
      if (!sub) {
        // Créer un nouvel abonnement
        // Note: En production, vous devrez générer vos propres clés VAPID
        // Pour l'instant, on utilise une clé publique factice
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xYjEB6Z6Oe3qseRuXGeo_BjE__cyV8paQrSrIvoXRdKxBKPxz4Ug4';
        
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }
      
      setSubscription(sub);
      console.log('✅ Abonnement aux notifications push réussi');
      
      // Enregistrer l'abonnement dans Convex
      if (userId) {
        try {
          const subJSON = sub.toJSON();
          await savePushSubscription({
            userId: userId,
            endpoint: subJSON.endpoint,
            keys: {
              p256dh: subJSON.keys.p256dh,
              auth: subJSON.keys.auth
            },
            userAgent: navigator.userAgent
          });
          console.log('✅ Abonnement enregistré dans Convex');
        } catch (error) {
          console.error('❌ Erreur lors de l\'enregistrement dans Convex:', error);
        }
      }
      
      return sub;
    } catch (error) {
      console.error('❌ Erreur lors de l\'abonnement aux notifications:', error);
      return null;
    }
  };

  // Se désabonner des notifications push
  const unsubscribeUser = async () => {
    if (!subscription) {
      return true;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      console.log('✅ Désabonnement des notifications réussi');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du désabonnement:', error);
      return false;
    }
  };

  // Envoyer une notification de test
  const sendTestNotification = async () => {
    if (permission !== 'granted') {
      console.warn('⚠️ Permission non accordée');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification('EntreCoiffeur', {
        body: 'Notification de test - Tout fonctionne ! 🎉',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'test-notification',
        vibrate: [200, 100, 200],
        data: {
          url: '/dashboard'
        }
      });
      
      console.log('✅ Notification de test envoyée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification de test:', error);
    }
  };

  return {
    permission,
    isSupported,
    subscription,
    requestPermission,
    subscribeUser,
    unsubscribeUser,
    sendTestNotification
  };
};

// Fonction utilitaire pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
