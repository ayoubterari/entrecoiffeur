import { action } from "../../_generated/server";
import { api } from "../../_generated/api";
import { v } from "convex/values";

/**
 * Action pour déclencher une vraie notification push via le Service Worker
 * Cette action simule l'envoi d'un événement push au navigateur
 */
export const triggerPushNotification = action({
  args: {
    sellerId: v.id("users"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
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

      console.log(`📬 Préparation de ${subscriptions.length} notification(s) push`);

      // Pour chaque abonnement, nous allons stocker la notification
      // qui sera récupérée par le Service Worker lors du prochain sync
      const notificationPayload = {
        title: args.title,
        body: args.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        data: args.data || {},
        timestamp: Date.now()
      };

      // Stocker la notification en attente dans Convex
      await ctx.runMutation(api.functions.mutations.pendingNotifications.createPendingNotification, {
        userId: args.sellerId,
        payload: notificationPayload
      });

      console.log('✅ Notification en attente créée');
      
      return {
        success: true,
        message: `Notification prepared for ${subscriptions.length} subscription(s)`,
        subscriptionsCount: subscriptions.length
      };
    } catch (error) {
      console.error('❌ Erreur lors de la préparation de la notification:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
});
