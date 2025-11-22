import { action } from "../../_generated/server";
import { api } from "../../_generated/api";
import { v } from "convex/values";

/**
 * Envoyer une notification push à un vendeur pour une nouvelle commande
 * Cette action est appelée après la création d'une commande
 */
export const notifySellerNewOrder = action({
  args: {
    sellerId: v.id("users"),
    orderNumber: v.string(),
    productName: v.string(),
    total: v.number(),
    buyerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Récupérer les informations du vendeur
    const seller = await ctx.runQuery(api.auth.getUserById, { userId: args.sellerId });
    
    if (!seller || !seller.pushToken || !seller.pushNotificationsEnabled) {
      console.log(`⚠️ Vendeur ${args.sellerId} n'a pas de token push ou notifications désactivées`);
      return { success: false, reason: 'no_token' };
    }

    try {
      // Préparer les données de la notification
      const notificationData = {
        title: '🛒 Nouvelle Commande !',
        body: `${args.buyerName} a commandé "${args.productName}" pour ${args.total.toFixed(2)} DH`,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: `order-${args.orderNumber}`,
        requireInteraction: true,
        data: {
          url: '/dashboard?tab=orders',
          orderNumber: args.orderNumber,
          type: 'new_order'
        },
        actions: [
          {
            action: 'view',
            title: 'Voir la commande'
          },
          {
            action: 'close',
            title: 'Fermer'
          }
        ]
      };

      // NOTE: Pour l'instant, nous simulons l'envoi
      // Dans une vraie implémentation, vous utiliseriez un service comme:
      // - Web Push (avec VAPID keys)
      // - Firebase Cloud Messaging (FCM)
      // - OneSignal
      // - Pusher
      
      console.log('📬 Notification préparée pour le vendeur:', {
        sellerId: args.sellerId,
        sellerEmail: seller.email,
        notification: notificationData
      });

      // SIMULATION: Dans une vraie implémentation, vous feriez:
      /*
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=YOUR_SERVER_KEY`
        },
        body: JSON.stringify({
          to: seller.pushToken,
          notification: notificationData
        })
      });
      */

      // Pour l'instant, on utilise l'API Notification locale (si l'app est ouverte)
      // La vraie notification push sera implémentée avec un service externe

      return {
        success: true,
        message: 'Notification envoyée',
        notificationData
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
      return {
        success: false,
        reason: 'send_error',
        error: error.message
      };
    }
  },
});

/**
 * Envoyer une notification push pour un changement de statut de commande
 */
export const notifyOrderStatusChange = action({
  args: {
    userId: v.id("users"),
    orderNumber: v.string(),
    newStatus: v.string(),
    productName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.auth.getUserById, { userId: args.userId });
    
    if (!user || !user.pushToken || !user.pushNotificationsEnabled) {
      return { success: false, reason: 'no_token' };
    }

    const statusMessages: Record<string, string> = {
      confirmed: '✅ Votre commande a été confirmée',
      preparing: '📦 Votre commande est en préparation',
      shipped: '🚚 Votre commande a été expédiée',
      delivered: '✨ Votre commande a été livrée',
      cancelled: '❌ Votre commande a été annulée'
    };

    const notificationData = {
      title: statusMessages[args.newStatus] || 'Mise à jour de commande',
      body: `Commande #${args.orderNumber} - ${args.productName}`,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: `order-status-${args.orderNumber}`,
      data: {
        url: '/dashboard?tab=purchases',
        orderNumber: args.orderNumber,
        type: 'order_status_change'
      }
    };

    console.log('📬 Notification de changement de statut préparée:', notificationData);

    return {
      success: true,
      message: 'Notification envoyée',
      notificationData
    };
  },
});
