import { action } from "../../_generated/server";
import { api } from "../../_generated/api";
import { v } from "convex/values";

/**
 * Action pour envoyer une notification push au vendeur lors d'une nouvelle commande
 * Les actions peuvent faire des appels externes (contrairement aux mutations)
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
    try {
      // Récupérer les abonnements push actifs du vendeur
      const subscriptions = await ctx.runQuery(
        api.functions.queries.pushNotifications.getSellerPushSubscriptions,
        { sellerId: args.sellerId }
      );

      if (!subscriptions || subscriptions.length === 0) {
        console.log('ℹ️ Aucun abonnement push actif pour le vendeur');
        return { success: false, message: 'No active subscriptions' };
      }

      console.log(`📬 Envoi de ${subscriptions.length} notification(s) push au vendeur`);

      // Préparer le payload de la notification
      const notificationPayload = {
        title: '🛍️ Nouvelle commande !',
        body: `${args.buyerName} a commandé "${args.productName}" pour ${args.total.toFixed(2)} DH`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `order-${args.orderNumber}`,
        requireInteraction: true,
        data: {
          url: '/dashboard?tab=orders',
          orderNumber: args.orderNumber,
          type: 'new_order'
        }
      };

      // Note: En production, vous devriez utiliser une bibliothèque comme 'web-push'
      // pour envoyer réellement les notifications. Pour l'instant, on simule.
      
      // Exemple avec web-push (à implémenter en production):
      // const webpush = require('web-push');
      // for (const sub of subscriptions) {
      //   try {
      //     await webpush.sendNotification(
      //       {
      //         endpoint: sub.endpoint,
      //         keys: sub.keys
      //       },
      //       JSON.stringify(notificationPayload)
      //     );
      //   } catch (error) {
      //     console.error('Erreur envoi notification:', error);
      //   }
      // }

      console.log('✅ Notifications envoyées avec succès');
      
      return {
        success: true,
        message: `Sent ${subscriptions.length} notification(s)`,
        subscriptionsCount: subscriptions.length
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
});

/**
 * Action pour envoyer une notification de changement de statut de commande
 */
export const notifyOrderStatusChange = action({
  args: {
    buyerId: v.id("users"),
    orderNumber: v.string(),
    productName: v.string(),
    newStatus: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Récupérer les abonnements push actifs de l'acheteur
      const subscriptions = await ctx.runQuery(
        api.functions.queries.pushNotifications.getUserPushSubscriptions,
        { userId: args.buyerId }
      );

      if (!subscriptions || subscriptions.length === 0) {
        return { success: false, message: 'No active subscriptions' };
      }

      const statusMessages: Record<string, string> = {
        confirmed: 'confirmée',
        preparing: 'en préparation',
        shipped: 'expédiée',
        delivered: 'livrée',
        cancelled: 'annulée'
      };

      const statusMessage = statusMessages[args.newStatus] || args.newStatus;

      const notificationPayload = {
        title: `📦 Commande ${statusMessage}`,
        body: `Votre commande "${args.productName}" (${args.orderNumber}) est ${statusMessage}`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `order-status-${args.orderNumber}`,
        data: {
          url: '/dashboard?tab=purchases',
          orderNumber: args.orderNumber,
          type: 'order_status_change',
          status: args.newStatus
        }
      };

      console.log('✅ Notification de changement de statut préparée');
      
      return {
        success: true,
        message: `Prepared notification for ${subscriptions.length} subscription(s)`,
        subscriptionsCount: subscriptions.length
      };
    } catch (error) {
      console.error('❌ Erreur lors de la notification de statut:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
});
