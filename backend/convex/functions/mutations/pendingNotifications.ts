import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Créer une notification en attente
 */
export const createPendingNotification = mutation({
  args: {
    userId: v.id("users"),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("pendingNotifications", {
      userId: args.userId,
      payload: args.payload,
      isDelivered: false,
      createdAt: Date.now(),
    });
    
    console.log('📝 Notification en attente créée:', notificationId);
    return notificationId;
  },
});

/**
 * Marquer une notification comme livrée
 */
export const markAsDelivered = mutation({
  args: {
    notificationId: v.id("pendingNotifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isDelivered: true,
      deliveredAt: Date.now(),
    });
    
    return true;
  },
});

/**
 * Marquer toutes les notifications d'un utilisateur comme livrées
 */
export const markAllAsDelivered = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const pendingNotifications = await ctx.db
      .query("pendingNotifications")
      .withIndex("by_user_delivered", (q) => 
        q.eq("userId", args.userId).eq("isDelivered", false)
      )
      .collect();

    for (const notification of pendingNotifications) {
      await ctx.db.patch(notification._id, {
        isDelivered: true,
        deliveredAt: Date.now(),
      });
    }

    console.log(`✅ ${pendingNotifications.length} notification(s) marquée(s) comme livrée(s)`);
    return pendingNotifications.length;
  },
});

/**
 * Nettoyer les anciennes notifications livrées (plus de 24h)
 */
export const cleanupOldNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const oldNotifications = await ctx.db
      .query("pendingNotifications")
      .withIndex("by_delivered", (q) => q.eq("isDelivered", true))
      .filter((q) => q.lt(q.field("deliveredAt"), oneDayAgo))
      .collect();

    for (const notification of oldNotifications) {
      await ctx.db.delete(notification._id);
    }

    console.log(`🗑️ ${oldNotifications.length} ancienne(s) notification(s) supprimée(s)`);
    return oldNotifications.length;
  },
});
