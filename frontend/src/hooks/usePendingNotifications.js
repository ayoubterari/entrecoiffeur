import { useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../lib/convex';

/**
 * Hook pour vérifier et afficher les notifications en attente
 * Fonctionne en arrière-plan même quand l'app est fermée (via Service Worker)
 */
export const usePendingNotifications = (userId) => {
  const processedNotifications = useRef(new Set());
  const backgroundCheckStarted = useRef(false);
  
  // Récupérer les notifications en attente
  const pendingNotifications = useQuery(
    api.functions.queries.pendingNotifications.getPendingNotifications,
    userId ? { userId } : 'skip'
  );
  
  // Mutation pour marquer comme livrée
  const markAsDelivered = useMutation(api.functions.mutations.pendingNotifications.markAsDelivered);

  // Démarrer la vérification périodique en arrière-plan
  useEffect(() => {
    if (!userId || backgroundCheckStarted.current) {
      return;
    }

    // Démarrer la vérification périodique dans le Service Worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const convexUrl = import.meta.env.VITE_CONVEX_URL;
      
      navigator.serviceWorker.controller.postMessage({
        type: 'START_NOTIFICATION_CHECK',
        userId: userId,
        convexUrl: convexUrl
      });

      backgroundCheckStarted.current = true;
      console.log('🔄 Vérification périodique démarrée en arrière-plan');
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || !pendingNotifications || pendingNotifications.length === 0) {
      return;
    }

    // Vérifier si les notifications sont supportées
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }

    // Vérifier la permission
    if (Notification.permission !== 'granted') {
      return;
    }

    // Afficher chaque notification en attente
    pendingNotifications.forEach(async (notification) => {
      // Éviter d'afficher deux fois la même notification
      if (processedNotifications.current.has(notification._id)) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Afficher la notification
        await registration.showNotification(
          notification.payload.title || 'EntreCoiffeur',
          {
            body: notification.payload.body,
            icon: notification.payload.icon || '/icon-192x192.png',
            badge: notification.payload.badge || '/icon-192x192.png',
            tag: notification.payload.tag || `notification-${notification._id}`,
            requireInteraction: notification.payload.requireInteraction !== false,
            vibrate: notification.payload.vibrate || [200, 100, 200],
            data: notification.payload.data || {},
            actions: notification.payload.actions || []
          }
        );

        console.log('✅ Notification affichée:', notification._id);
        
        // Marquer comme livrée
        processedNotifications.current.add(notification._id);
        await markAsDelivered({ notificationId: notification._id });
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'affichage de la notification:', error);
      }
    });
  }, [pendingNotifications, userId, markAsDelivered]);

  return {
    pendingCount: pendingNotifications?.length || 0
  };
};
