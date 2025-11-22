/**
 * Helper pour envoyer des notifications push
 * Note: Cette implémentation est simplifiée pour la démonstration
 * En production, vous devriez utiliser un service comme Firebase Cloud Messaging (FCM)
 * ou Web Push avec des clés VAPID appropriées
 */

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

/**
 * Envoyer une notification push à un abonnement
 * Note: Cette fonction est un placeholder. En production, vous devriez:
 * 1. Utiliser une bibliothèque comme 'web-push' côté serveur
 * 2. Configurer des clés VAPID appropriées
 * 3. Gérer les erreurs et les abonnements expirés
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    console.log('📤 Envoi notification push:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      title: payload.title,
      body: payload.body
    });

    // En production, vous utiliseriez quelque chose comme:
    // const webpush = require('web-push');
    // webpush.setVapidDetails(
    //   'mailto:your-email@example.com',
    //   process.env.VAPID_PUBLIC_KEY,
    //   process.env.VAPID_PRIVATE_KEY
    // );
    // await webpush.sendNotification(subscription, JSON.stringify(payload));

    // Pour l'instant, on simule l'envoi
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi notification push:', error);
    return false;
  }
}

/**
 * Créer une notification pour une nouvelle commande
 */
export function createNewOrderNotification(
  orderNumber: string,
  productName: string,
  total: number,
  buyerName: string
): NotificationPayload {
  return {
    title: '🛍️ Nouvelle commande !',
    body: `${buyerName} a commandé "${productName}" pour ${total.toFixed(2)} DH`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: `order-${orderNumber}`,
    data: {
      url: '/dashboard?tab=orders',
      orderNumber: orderNumber,
      type: 'new_order'
    },
    actions: [
      {
        action: 'view',
        title: 'Voir la commande'
      }
    ]
  };
}

/**
 * Créer une notification pour un changement de statut de commande
 */
export function createOrderStatusNotification(
  orderNumber: string,
  newStatus: string,
  productName: string
): NotificationPayload {
  const statusMessages: Record<string, string> = {
    confirmed: 'confirmée',
    preparing: 'en préparation',
    shipped: 'expédiée',
    delivered: 'livrée',
    cancelled: 'annulée'
  };

  const statusMessage = statusMessages[newStatus] || newStatus;

  return {
    title: `📦 Commande ${statusMessage}`,
    body: `Votre commande "${productName}" (${orderNumber}) est ${statusMessage}`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: `order-status-${orderNumber}`,
    data: {
      url: '/dashboard?tab=purchases',
      orderNumber: orderNumber,
      type: 'order_status_change',
      status: newStatus
    }
  };
}
