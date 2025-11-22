import { useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../lib/convex';

/**
 * Hook pour surveiller les nouvelles commandes et afficher des notifications
 * en temps réel pour les vendeurs
 */
export const useOrderNotifications = (userId, userType) => {
  // Récupérer les commandes du vendeur
  const sellerOrders = useQuery(
    api.orders.getSellerOrders,
    userId && (userType === 'professionnel' || userType === 'grossiste')
      ? { sellerId: userId }
      : 'skip'
  );

  // Mutation pour créer une notification en attente
  const createPendingNotification = useMutation(api.functions.mutations.pendingNotifications.createPendingNotification);

  useEffect(() => {
    // Vérifier si c'est un vendeur
    if (!userId || (userType !== 'professionnel' && userType !== 'grossiste')) {
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

    // Stocker le nombre de commandes précédent
    const lastOrderCountKey = `lastOrderCount_${userId}`;
    const lastOrderCount = parseInt(localStorage.getItem(lastOrderCountKey) || '0');

    if (sellerOrders && sellerOrders.length > lastOrderCount) {
      // Nouvelle commande détectée !
      const newOrdersCount = sellerOrders.length - lastOrderCount;
      
      // Récupérer la dernière commande
      const latestOrder = sellerOrders[0]; // Les commandes sont triées par date décroissante
      
      if (latestOrder) {
        // Afficher la notification
        showOrderNotification(latestOrder);
      }

      // Mettre à jour le compteur
      localStorage.setItem(lastOrderCountKey, sellerOrders.length.toString());
    } else if (sellerOrders && lastOrderCount === 0) {
      // Première fois qu'on charge les commandes, initialiser le compteur
      localStorage.setItem(lastOrderCountKey, sellerOrders.length.toString());
    }
  }, [sellerOrders, userId, userType]);
};

/**
 * Afficher une notification pour une nouvelle commande
 */
async function showOrderNotification(order) {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Récupérer les infos de l'acheteur depuis la commande
    const buyerName = order.billingInfo?.firstName 
      ? `${order.billingInfo.firstName} ${order.billingInfo.lastName || ''}`
      : 'Un client';

    await registration.showNotification('🛍️ Nouvelle commande !', {
      body: `${buyerName.trim()} a commandé "${order.productName}" pour ${order.total.toFixed(2)} DH`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: `order-${order.orderNumber}`,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        url: '/dashboard?tab=orders',
        orderNumber: order.orderNumber,
        type: 'new_order'
      },
      actions: [
        {
          action: 'view',
          title: '👁️ Voir la commande'
        }
      ]
    });

    console.log('✅ Notification affichée pour la commande:', order.orderNumber);
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage de la notification:', error);
  }
}
